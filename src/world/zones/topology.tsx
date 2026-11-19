import { useEffect, useRef, useState } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import Cable from "./Cable";
import { Plane, Vector3 } from "three";
import { Device } from "../../scenes/NetworkScene";
import { act, useSimulation } from "../../stores/useSimulation";
import type { NetworkDevice } from "../../engine/types";
function Draggable({ device }: { device: NetworkDevice }) {
  const { controls } = useThree();
  const dragging = useRef(false);
  const plane = useRef(new Plane(new Vector3(0, 1, 0), 0));
  const point = useRef(new Vector3());
  const last = useRef(0);
  const offset = useRef(0);
  const move = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return;
    e.stopPropagation();
    if (performance.now() - last.current < 30) return;
    last.current = performance.now();
    if (e.ray.intersectPlane(plane.current, point.current)) {
      const x = Math.max(-9, Math.min(9, point.current.x - offset.current)),
        z = Math.max(-7, Math.min(7, point.current.z));
      act((s) => {
        const d = s.state.devices.find((n) => n.id === device.id);
        if (d) d.position = [x, 0, z];
      });
    }
  };
  const stop = () => {
    dragging.current = false;
    if (controls) (controls as unknown as { enabled: boolean }).enabled = true;
  };
  useEffect(() => () => stop(), [controls]);
  return (
    <group
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        dragging.current = true;
        offset.current = Math.round((e.point.x - device.position[0]) / 30) * 30;
        if (controls)
          (controls as unknown as { enabled: boolean }).enabled = false;
        (
          e.target as unknown as { setPointerCapture: (id: number) => void }
        ).setPointerCapture(e.pointerId);
      }}
      onPointerMove={move}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      <Device d={device} />
    </group>
  );
}
export default function Topology() {
  const { state } = useSimulation();
  const worker = useRef<Worker | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const arrange = () => {
      worker.current?.terminate();
      setBusy(true);
      const w = new Worker(new URL("./layout.worker.ts", import.meta.url), {
        type: "module",
      });
      worker.current = w;
      w.onmessage = (
        event: MessageEvent<
          { id: string; position: [number, number, number] }[]
        >,
      ) => {
        act((e) => {
          for (const node of event.data) {
            const d = e.state.devices.find((d) => d.id === node.id);
            if (d) d.position = node.position;
          }
        });
        setBusy(false);
        document.dispatchEvent(new Event("world-layout-done"));
        w.terminate();
      };
      w.onerror = () => {
        setBusy(false);
        document.dispatchEvent(new Event("world-layout-failed"));
        w.terminate();
      };
      w.postMessage({
        nodes: useSimulation.getState().state.devices,
        links: useSimulation.getState().state.links,
      });
    };
    document.addEventListener("world-arrange", arrange);
    return () => {
      document.removeEventListener("world-arrange", arrange);
      worker.current?.terminate();
    };
  }, []);
  return (
    <group userData={{ layoutBusy: busy }}>
      {state.links.map((l) => {
        const a = state.devices.find((d) => d.id === l.from),
          b = state.devices.find((d) => d.id === l.to);
        if (!a || !b) return null;
        return (
          <Cable
            key={l.id}
            id={l.id}
            curved
            from={a.position}
            to={b.position}
            active={l.active}
          />
        );
      })}
      {state.devices.map((d) => (
        <Draggable key={d.id} device={d} />
      ))}
    </group>
  );
}
