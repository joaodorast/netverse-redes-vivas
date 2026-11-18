import WorldFallback from "./WorldFallback";
import Hologram, { signalTime } from "./Hologram";
import PacketField from "./PacketField";
import Navigation from "./Navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, Line, OrbitControls, RoundedBox } from "@react-three/drei";
import { Vector3 } from "three";
import { engine, useSimulation } from "../stores/useSimulation";
import { sections, layers } from "../data/content";
import { Device, Label, SceneBoundary } from "../scenes/NetworkScene";
const accent = "#84e5d0";
function Block({
  position,
  size,
  color = accent,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <RoundedBox args={size} radius={0.04} position={position}>
      <meshStandardMaterial
        color="#172b3b"
        metalness={0.65}
        roughness={0.4}
        emissive={color}
        emissiveIntensity={0.08}
      />
    </RoundedBox>
  );
}
function Zone({ id }: { id: string }) {
  const { state, select } = useSimulation();
  if (id === "osi")
    return (
      <>
        {[-3, 3].map((x, side) => (
          <group key={x}>
            {layers.map((l) => (
              <group
                key={l.n}
                position={[x, l.n * 0.62, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  select(`layer-${l.n}`);
                }}
              >
                <Block
                  position={[0, 0, 0]}
                  size={[3, 0.35, 1.7]}
                  color={state.osiLayer === l.n ? accent : "#aaa5ff"}
                />
                <mesh position={[0, 0, 0.88]}>
                  <planeGeometry args={[3, 0.35]} />
                  <Hologram
                    color={state.osiLayer === l.n ? accent : "#aaa5ff"}
                    active={state.osiLayer === l.n}
                  />
                </mesh>
                <Label
                  title={`${l.n} · ${l.name}`}
                  color={state.osiLayer === l.n ? accent : "#b8b6da"}
                  position={[0, 0.12, 1]}
                />
                {state.osiLayer === l.n &&
                  (state.osiDirection === "down") === (side === 0) && (
                    <mesh position={[0, 0.4, 0]}>
                      <octahedronGeometry args={[0.2]} />
                      <meshBasicMaterial color="#ffc48a" />
                    </mesh>
                  )}
              </group>
            ))}
          </group>
        ))}
      </>
    );
  if (id === "tcp")
    return (
      <>
        {[-3, 3].map((x, i) => (
          <group key={x}>
            <Label
              title={i ? "UDP / DATAGRAMAS" : "TCP / CONFIRMAÇÃO"}
              color={i ? "#aaa5ff" : accent}
              position={[x, 3, 0]}
            />
            {Array.from({ length: 6 }, (_, n) => (
              <mesh key={n} position={[x, 1, -n * 1.2]}>
                <torusGeometry args={[1.1, 0.025, 6, 32]} />
                <meshStandardMaterial
                  color={i ? "#aaa5ff" : accent}
                  emissive={i ? "#aaa5ff" : accent}
                  emissiveIntensity={0.5}
                />
              </mesh>
            ))}
            {state.packets
              .filter((p) => p.protocol === (i ? "UDP" : "TCP"))
              .slice(-12)
              .map((p, n) => (
                <mesh key={p.id} position={[x, 1, -n * 0.5]}>
                  <octahedronGeometry args={[0.13]} />
                  <meshBasicMaterial
                    color={
                      p.status === "lost" ? "#ffc48a" : i ? "#aaa5ff" : accent
                    }
                  />
                </mesh>
              ))}
          </group>
        ))}
      </>
    );
  if (id === "media")
    return (
      <>
        {["COBRE", "FIBRA", "RÁDIO"].map((t, i) => (
          <group key={t} position={[(i - 1) * 4, 0, 0]}>
            <Block position={[0, 0.3, 0]} size={[3, 0.5, 3]} />
            <Label title={t} color={accent} position={[0, 2, 0]} />
            {[0, 1, 2, 3, 4].map((n) => (
              <mesh
                key={n}
                position={[0, 0.9 + n * 0.08, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                {i === 2 ? (
                  <torusGeometry args={[0.3 + n * 0.18, 0.015, 6, 32]} />
                ) : (
                  <cylinderGeometry args={[0.035, 0.035, 2.6, 8]} />
                )}
                <meshStandardMaterial
                  color={i === 0 ? "#ffc48a" : i === 1 ? accent : "#aaa5ff"}
                  emissive={i === 1 ? accent : "#000000"}
                  emissiveIntensity={state.running ? 0.7 : 0}
                />
              </mesh>
            ))}
          </group>
        ))}
      </>
    );
  if (id === "performance")
    return (
      <>
        {state.samples.slice(-30).map((s, i) => (
          <Block
            key={i}
            position={[-6 + i * 0.4, Math.max(0.03, s.throughput) * 2, 0]}
            size={[0.25, Math.max(0.06, s.throughput) * 4, 0.5]}
          />
        ))}
        <Label
          title="VAZÃO / AMOSTRAS DO MOTOR"
          subtitle="Altura proporcional a Mbit/s"
          color={accent}
          position={[0, 4, -1]}
        />
      </>
    );
  if (id === "web")
    return (
      <>
        {["DNS", "TCP", "HTTP"].map((s, i) => (
          <group key={s} position={[(i - 1) * 4, 0, 0]}>
            <Block position={[0, 1, 0]} size={[2.8, 1.8, 0.5]} />
            <Label
              title={s}
              subtitle={
                i === 2
                  ? state.pageReady
                    ? "PÁGINA ENTREGUE"
                    : "AGUARDANDO DADOS"
                  : s === "DNS"
                    ? "RESOLUÇÃO DE NOME"
                    : "TRANSPORTE"
              }
              color={accent}
              position={[0, 2.5, 0]}
            />
          </group>
        ))}
        <Line
          points={[
            [-4, 0.2, 0],
            [4, 0.2, 0],
          ]}
          color={accent}
        />
      </>
    );
  if (id === "routing")
    return (
      <>
        <Block position={[0, 0.5, 0]} size={[10, 0.3, 5]} />
        {state.devices
          .filter((d) => d.type === "switch" || d.type === "router")
          .map((d, i) => (
            <Label
              key={d.id}
              title={d.type === "switch" ? "TABELA MAC" : "MAIOR PREFIXO"}
              subtitle={
                d.type === "switch"
                  ? `${Object.keys(d.macTable).length} entradas aprendidas`
                  : `${d.routes.length} rotas`
              }
              color={accent}
              position={[(i - 0.5) * 5, 2, 0]}
            />
          ))}
      </>
    );
  if (id === "security")
    return (
      <>
        <Block position={[0, 1.8, 0]} size={[0.15, 3.6, 8]} color="#aaa5ff" />
        <Label
          title="FRONTEIRA DE ACESSO"
          subtitle={`${state.metrics.blocked} bloqueios reais · ${state.rules.length} regras`}
          color="#ffc48a"
          position={[0, 4, 0]}
        />
        {state.rules.map((r, i) => (
          <Label
            key={r.id}
            title={`${r.action.toUpperCase()} / ${r.protocol}:${r.port}`}
            color={r.action === "deny" ? "#ffc48a" : accent}
            position={[3, 3 - i * 0.7, 0]}
          />
        ))}
      </>
    );
  if (id === "diagnostics")
    return (
      <>
        <Block position={[0, 1.5, 0]} size={[8, 3, 0.4]} />
        {state.terminal.slice(-4).map((t, i) => (
          <Label
            key={i}
            title={t.slice(0, 70)}
            color={accent}
            position={[0, 2.5 - i * 0.55, 0.3]}
          />
        ))}
        <Label
          title="CONSOLE DE DIAGNÓSTICO"
          color="#aaa5ff"
          position={[0, 3.7, 0]}
        />
      </>
    );
  if (id === "trends")
    return (
      <>
        {["IoT", "NUVEM", "SDN"].map((t, i) => (
          <group key={t} position={[(i - 1) * 4, 0, 0]}>
            <Block
              position={[0, 1, 0]}
              size={[2, 2, 2]}
              color={
                state.config.trend === t.toLowerCase() ? accent : "#aaa5ff"
              }
            />
            <Label
              title={t}
              subtitle={
                state.config.trend === t.toLowerCase()
                  ? "EXPERIÊNCIA ATIVA"
                  : "ABRA O TERMINAL PARA EXPLORAR"
              }
              color={accent}
              position={[0, 2.8, 0]}
            />
          </group>
        ))}
      </>
    );
  if (id === "glossary")
    return (
      <>
        {["CONCEITOS", "QUIZ", "MISSÕES"].map((t, i) => (
          <group key={t} position={[(i - 1) * 4, 0, 0]}>
            <Block position={[0, 1, 0]} size={[2.5, 2, 1]} />
            <Label
              title={t}
              subtitle="TERMINAL INTERATIVO"
              color={accent}
              position={[0, 2.5, 0]}
            />
          </group>
        ))}
      </>
    );
  return (
    <>
      {state.links.map((l) => {
        const a = state.devices.find((d) => d.id === l.from),
          b = state.devices.find((d) => d.id === l.to);
        return a && b ? (
          <Line
            key={l.id}
            points={[
              [a.position[0], 0.2, a.position[2]],
              [b.position[0], 0.2, b.position[2]],
            ]}
            color={l.active ? accent : "#ffc48a"}
          />
        ) : null;
      })}
      {state.devices.map((d) => (
        <Device key={d.id} d={d} />
      ))}
    </>
  );
}
function Clock() {
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    signalTime.value = engine.state.time / 1000;
    elapsed.current += Math.min(delta, 0.1) * 1000;
    if (elapsed.current >= 45) {
      if (engine.state.running) {
        engine.tick(elapsed.current * 0.18);
        useSimulation.getState().refresh();
      }
      elapsed.current = 0;
    }
  });
  return null;
}
function Camera({ index }: { index: number }) {
  const { camera, controls } = useThree();
  const target = useRef(new Vector3());
  const eye = useRef(new Vector3());
  const active = useRef(-1);
  const remaining = useRef(0);
  useFrame((_, delta) => {
    const x = index * 30;
    if (active.current !== index) {
      target.current.set(x, 1, 0);
      eye.current.set(x + 1, 6, 12);
      active.current = index;
      remaining.current = 1.5;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const orbit = controls as unknown as {
      target: Vector3;
      update: () => void;
    } | null;
    if (remaining.current > 0) {
      remaining.current -= delta;
      camera.position.lerp(eye.current, reduced ? 1 : Math.min(1, delta * 3));
      orbit?.target.lerp(target.current, reduced ? 1 : Math.min(1, delta * 3));
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
  const stats = useRef({ time: 0, frames: 0 });
  useFrame((_, delta) => {
    stats.current.time += delta;
    stats.current.frames++;
    if (stats.current.time >= 1) {
      const fps = stats.current.frames / stats.current.time;
      if (output.current)
        output.current.textContent = `${fps.toFixed(0)} FPS · ${(1000 / fps).toFixed(1)} ms\n${gl.info.render.calls} draw calls · ${gl.info.render.triangles} triângulos\n${gl.info.memory.geometries} geometrias · ${gl.info.memory.textures} texturas\nMemória GPU: indisponível pela API`;
      if (useSimulation.getState().quality === "Automático" && fps < 28)
        setDpr(1);
      stats.current = { time: 0, frames: 0 };
    }
  });
  return null;
}
export default function LabCanvas({
  debug,
  onDebug,
  active,
}: {
  debug: boolean;
  onDebug: () => void;
  active: boolean;
}) {
  const scenario = useSimulation((s) => s.state.scenario);
  const index = Math.max(
    0,
    sections.findIndex((s) => s.id === scenario),
  );
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
      <SceneBoundary fallback={<WorldFallback />}>
        <Canvas
          camera={{ position: [1, 6, 12], fov: 55 }}
          dpr={[1, 1.5]}
          frameloop={visible ? "always" : "never"}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          fallback={<WorldFallback />}
        >
          <color attach="background" args={["#05070d"]} />
          <fog attach="fog" args={["#05070d", 18, 55]} />
          <ambientLight intensity={1.4} />
          <directionalLight position={[index * 30, 8, 6]} intensity={3} />
          <Suspense fallback={null}>
            {sections.map(
              (s, i) =>
                Math.abs(i - index) <= 1 && (
                  <group visible={active} key={s.id} position={[i * 30, 0, 0]}>
                    <Grid
                      args={[25, 25]}
                      cellColor="#193340"
                      sectionColor="#355a66"
                      fadeDistance={23}
                    />
                    <mesh position={[0, -0.25, 0]}>
                      <boxGeometry args={[23, 0.3, 21]} />
                      <meshStandardMaterial
                        color="#111923"
                        metalness={0.7}
                        roughness={0.45}
                      />
                    </mesh>
                    <Label
                      title={s.short.toUpperCase()}
                      color={accent}
                      position={[0, 5, -7]}
                    />
                    {i === index && (
                      <group
                        onDoubleClick={() =>
                          document.dispatchEvent(new Event("world-terminal"))
                        }
                      >
                        <Zone id={scenario} />
                        <PacketField zone={scenario} />
                      </group>
                    )}
                  </group>
                ),
            )}
          </Suspense>
          <OrbitControls
            makeDefault
            minDistance={5}
            maxDistance={22}
            maxPolarAngle={Math.PI / 2.1}
          />
          <Camera index={index} />
          <Navigation enabled={active} index={index} />
          <Profiler output={output} />
          <Clock />
        </Canvas>
      </SceneBoundary>
      <pre className="world-profiler" ref={output} hidden={!debug}>
        Aguardando amostra real do renderer…
      </pre>
    </>
  );
}

