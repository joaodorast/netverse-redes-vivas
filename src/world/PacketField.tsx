import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Matrix4, type InstancedMesh } from "three";
import type { NetworkDevice } from "../engine/types";
import { engine } from "../stores/useSimulation";
import { protocolColors } from "../data/content";
export default function PacketField({ zone }: { zone: string }) {
  const mesh = useRef<InstancedMesh>(null);
  const matrix = useRef(new Matrix4());
  const color = useRef(new Color());
  const indexed = useRef<{
    source: NetworkDevice[] | null;
    map: Map<string, NetworkDevice>;
  }>({ source: null, map: new Map() });
  useFrame(() => {
    if (!mesh.current) return;
    const state = engine.state;
    if (indexed.current.source !== state.devices) {
      indexed.current.source = state.devices;
      indexed.current.map = new Map(state.devices.map((d) => [d.id, d]));
    }
    let count = 0;
    for (const p of state.packets) {
      if (p.status !== "transit" || count >= 400) continue;
      const a = indexed.current.map.get(p.from),
        b = indexed.current.map.get(p.to);
      if (!a || !b) continue;
      const t = Math.max(
        0,
        Math.min(1, (state.time - p.start) / (p.end - p.start || 1)),
      );
      let x = a.position[0] + (b.position[0] - a.position[0]) * t;
      let y = zone === "topology" ? 0.2 + 1.6 * t * (1 - t) : 0.5;
      let z = a.position[2] + (b.position[2] - a.position[2]) * t;
      if (zone === "tcp") {
        x = p.protocol === "UDP" ? 3 : -3;
        y = 1;
        z = -t * 6;
      }
      matrix.current.makeScale(0.15, 0.15, 0.15).setPosition(x, y, z);
      mesh.current.setMatrixAt(count, matrix.current);
      color.current.set(protocolColors[p.protocol]);
      mesh.current.setColorAt(count, color.current);
      count++;
    }
    mesh.current.count = count;
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor)
      mesh.current.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, 400]}
      frustumCulled={false}
    >
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
