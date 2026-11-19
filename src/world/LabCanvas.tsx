import StudioLighting from "../scenes/StudioLighting";
import Room from "./zones/Room";
import Station from "./zones/Station";
import Zone, { preloadZone } from "./zones";
import WorldFallback from "./WorldFallback";
import { signalTime } from "./Hologram";
import PacketField from "./PacketField";
import Navigation from "./Navigation";
import { Suspense, useEffect, useRef, useState, memo } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import { engine, useSimulation } from "../stores/useSimulation";
import { sections } from "../data/content";
import { SceneBoundary } from "../scenes/NetworkScene";

function Ready() {
  const sent = useRef(false);
  useFrame(() => {
    if (!sent.current) {
      sent.current = true;
      document.dispatchEvent(new Event("world-renderer-ready"));
    }
  });
  return null;
}
function Clock() {
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1) * 1000;
    const wasRunning = engine.state.running;
    if (wasRunning) engine.tick(dt * 0.18);
    signalTime.value = engine.state.time / 1000;
    elapsed.current += dt;
    if (
      (wasRunning && elapsed.current >= 100) ||
      (wasRunning && !engine.state.running)
    ) {
      useSimulation.getState().refresh();
      elapsed.current = 0;
    }
  });
  return null;
}
const cameraPresets: Record<string, [number, number, number]> = {
  home: [1, 6, 12],
  security: [8, 6, 11],
  topology: [2, 9, 13],
  routing: [4, 7, 12],
  media: [5, 6, 12],
  performance: [3, 7, 14],
  diagnostics: [0.4, 4.5, 12],
  tcp: [4, 7, 13],
  trends: [4, 6, 12],
};

function Camera({ index }: { index: number }) {
  const { camera, controls, size, invalidate } = useThree();
  const target = useRef(new Vector3());
  const eye = useRef(new Vector3());
  const active = useRef(-1);
  const viewport = useRef("");
  const remaining = useRef(0);
  useEffect(() => {
    const stop = () => {
      remaining.current = 0;
    };
    document.addEventListener("world-manual-camera", stop);
    return () => document.removeEventListener("world-manual-camera", stop);
  }, []);
  useFrame((_, delta) => {
    const x = index * 30;
    const view = `${Math.round(size.width / 100)}:${Math.round(size.height / 100)}`;
    if (active.current !== index || viewport.current !== view) {
      const id = sections[index]?.id ?? "home";
      const [dx, dy, dz] = cameraPresets[id] ?? cameraPresets.home;
      const fit =
        size.width < 760
          ? Math.max(1, Math.min(3, (1.2 * size.height) / size.width))
          : 1;
      target.current.set(x, id === "osi" ? 2 : 1, 0);
      eye.current.set(x + dx * fit, dy * Math.max(1, fit * 0.7), dz * fit);
      active.current = index;
      viewport.current = view;
      remaining.current = 0.85;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const orbit = controls as unknown as {
      target: Vector3;
      update: () => void;
    } | null;
    if (remaining.current > 0) {
      invalidate();
      remaining.current -= delta;
      camera.position.lerp(eye.current, reduced ? 1 : Math.min(1, delta * 6));
      orbit?.target.lerp(target.current, reduced ? 1 : Math.min(1, delta * 6));
      orbit?.update();
    }
  });
  return null;
}
function Profiler({
  output,
}: {
  output: React.RefObject<HTMLPreElement | null>;
}) {
  const { gl, setDpr } = useThree();
  const stats = useRef({ time: 0, frames: 0, low: 0, high: 0, ratio: 1.25 });
  useFrame((_, delta) => {
    if ((!engine.state.running && output.current?.hidden) || delta > 0.5) {
      stats.current.time = 0;
      stats.current.frames = 0;
      return;
    }
    stats.current.time += delta;
    stats.current.frames++;
    if (stats.current.time >= 1) {
      const fps = stats.current.frames / stats.current.time;
      if (output.current)
        output.current.textContent = `${fps.toFixed(0)} FPS · ${(1000 / fps).toFixed(1)} ms\n${gl.info.render.calls} draw calls · ${gl.info.render.triangles} triângulos\n${gl.info.memory.geometries} geometrias · ${gl.info.memory.textures} texturas\nMemória GPU: indisponível pela API`;
      if (useSimulation.getState().quality === "Automático") {
        stats.current.ratio = gl.getPixelRatio();
        stats.current.low = fps < 38 ? stats.current.low + 1 : 0;
        stats.current.high = fps > 57 ? stats.current.high + 1 : 0;
        if (stats.current.low >= 3 && stats.current.ratio > 0.75) {
          stats.current.ratio = Math.max(0.75, stats.current.ratio - 0.25);
          setDpr(stats.current.ratio);
          stats.current.low = 0;
        } else if (stats.current.high >= 6 && stats.current.ratio < 1.5) {
          stats.current.ratio = Math.min(1.5, stats.current.ratio + 0.125);
          setDpr(stats.current.ratio);
          stats.current.high = 0;
        }
      }
      stats.current.time = 0;
      stats.current.frames = 0;
    }
  });
  return null;
}
const LabCanvas = memo(function LabCanvas({
  debug,
  onDebug,
  active,
  stationOpen,
}: {
  debug: boolean;
  onDebug: () => void;
  active: boolean;
  stationOpen: boolean;
}) {
  const scenario = useSimulation((s) => s.state.scenario);
  const quality = useSimulation((s) => s.quality);
  const running = useSimulation((s) => s.state.running);
  const index = Math.max(
    0,
    sections.findIndex((s) => s.id === scenario),
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      for (const offset of [-1, 1]) {
        const next = sections[index + offset];
        if (next) preloadZone(next.id);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [index]);
  const [visible, setVisible] = useState(!document.hidden);
  const output = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const v = () => setVisible(!document.hidden);
    const k = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "p" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      )
        onDebug();
    };
    document.addEventListener("visibilitychange", v);
    window.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("visibilitychange", v);
      window.removeEventListener("keydown", k);
    };
  }, [onDebug]);
  return (
    <>
      <div
        id="world-label-layer"
        className="world-label-layer"
        aria-hidden="true"
      />
      <SceneBoundary fallback={<WorldFallback />}>
        <Canvas
          camera={{ position: [1, 6, 12], fov: 55 }}
          dpr={
            quality === "Baixo"
              ? 0.75
              : quality === "Alto"
                ? 2
                : quality === "Médio"
                  ? 1
                  : 1.25
          }
          frameloop={
            visible ? (running || debug ? "always" : "demand") : "never"
          }
          gl={{ antialias: false, powerPreference: "high-performance" }}
          fallback={<WorldFallback />}
        >
          <color attach="background" args={["#05070d"]} />
          <fog attach="fog" args={["#05070d", 18, 55]} />
          <ambientLight intensity={1.4} />
          <StudioLighting />
          <directionalLight position={[index * 30, 8, 6]} intensity={3} />
          <Suspense fallback={null}>
            {sections.map(
              (s, i) =>
                Math.abs(i - index) <= 1 && (
                  <group visible={active} key={s.id} position={[i * 30, 0, 0]}>
                    <Room id={s.id} />
                    <Grid
                      args={[25, 25]}
                      cellColor="#193340"
                      sectionColor="#355a66"
                      fadeDistance={23}
                    />
                    {i === index && (
                      <group
                        onDoubleClick={() =>
                          document.dispatchEvent(new Event("world-terminal"))
                        }
                      >
                        <Zone id={scenario} />
                        {active && stationOpen && (
                          <Station key={scenario} id={scenario} />
                        )}
                        <PacketField zone={scenario} />
                      </group>
                    )}
                  </group>
                ),
            )}
          </Suspense>
          <OrbitControls
            onStart={() =>
              document.dispatchEvent(new Event("world-manual-camera"))
            }
            makeDefault
            minDistance={5}
            maxDistance={48}
            maxPolarAngle={Math.PI / 2.1}
          />
          <Camera index={index} />
          <Navigation enabled={active} index={index} />
          <Profiler output={output} />
          <Clock />
          <Ready />
        </Canvas>
      </SceneBoundary>
      <pre className="world-profiler" ref={output} hidden={!debug}>
        Aguardando amostra real do renderer…
      </pre>
    </>
  );
});
export default LabCanvas;
