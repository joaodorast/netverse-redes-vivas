import { Matrix4, type InstancedMesh } from "three";
import { useContext } from "react";
import { WorldMode } from "../world/mode";
import {
  Component,
  Suspense,
  useRef,
  useState,
  useMemo,
  useEffect,
  memo,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Grid,
  Line,
  OrbitControls,
  RoundedBox,
  Stars,
} from "@react-three/drei";
import { Vector3, CanvasTexture, SRGBColorSpace, type Group } from "three";
import { Crosshair, Expand, Layers, RotateCcw } from "lucide-react";
import { engine, useSimulation } from "../stores/useSimulation";
import type { NetworkDevice, NetworkPacket } from "../engine/types";
import { protocolColors } from "../data/content";
const deviceColors: Record<string, string> = {
  pc: "#78b7dc",
  server: "#b49bfa",
  switch: "#52e4c1",
  router: "#68a7ff",
  firewall: "#ffa67b",
  hub: "#d9bc77",
  sensor: "#75dcd5",
  controller: "#d09bea",
};
function Label({
  title,
  subtitle = "",
  color,
  position,
}: {
  title: string;
  subtitle?: string;
  color: string;
  position: [number, number, number];
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#091321e8";
    ctx.roundRect(0, 0, 512, 128, 12);
    ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.font = "600 28px Segoe UI";
    ctx.fillText(title, 256, subtitle ? 48 : 76, 490);
    if (subtitle) {
      ctx.fillStyle = "#a0b7cc";
      ctx.font = "23px Consolas";
      ctx.fillText(subtitle, 256, 91, 490);
    }
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [title, subtitle, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={position} scale={[2.25, 0.56, 1]}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}
function InstanceBoxes({
  positions,
  size,
  color,
}: {
  positions: [number, number, number][];
  size: [number, number, number];
  color: string;
}) {
  const ref = useRef<InstancedMesh>(null);
  useEffect(() => {
    if (!ref.current) return;
    const m = new Matrix4();
    positions.forEach((p, i) => {
      m.makeTranslation(...p);
      ref.current!.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [positions]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, positions.length]}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={0.35} roughness={0.5} />
    </instancedMesh>
  );
}
const Device = memo(
  function Device({ d }: { d: NetworkDevice }) {
    const model = useRef<Group>(null);
    const [hovered, setHovered] = useState(false);
    const selected = useSimulation((s) => s.selected === d.id),
      select = useSimulation((s) => s.select);
    const receiving = useSimulation((s) =>
      s.state.packets.some((p) => p.status === "transit" && p.to === d.id),
    );
    const color = d.active ? deviceColors[d.type] : "#6b4655";
    useFrame((_, delta) => {
      if (!model.current) return;
      const target = selected ? 1.07 : hovered ? 1.035 : 1;
      const scale =
        model.current.scale.x +
        (target - model.current.scale.x) * Math.min(1, delta * 10);
      if (Math.abs(scale - model.current.scale.x) > 0.0001)
        model.current.scale.setScalar(scale);
    });
    return (
      <group
        ref={model}
        position={d.position}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          select(d.id);
        }}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <ringGeometry args={[0.72, 0.75, 48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={selected || receiving ? 0.9 : 0.25}
          />
        </mesh>
        <RoundedBox
          args={[1.35, 0.16, 1.1]}
          radius={0.06}
          position={[0, 0.16, 0]}
        >
          <meshStandardMaterial
            color="#172739"
            metalness={0.65}
            roughness={0.35}
          />
        </RoundedBox>
        {d.type === "pc" ? (
          <>
            <RoundedBox
              args={[1.1, 0.75, 0.12]}
              radius={0.04}
              position={[0, 0.82, 0]}
            >
              <meshStandardMaterial
                color="#26364a"
                metalness={0.6}
                roughness={0.3}
              />
            </RoundedBox>
            <mesh position={[0, 0.83, 0.07]}>
              <planeGeometry args={[0.92, 0.57]} />
              <meshStandardMaterial
                color="#0b293b"
                emissive={color}
                emissiveIntensity={d.active ? 0.32 : 0}
              />
            </mesh>
            <mesh position={[0, 0.42, 0]}>
              <boxGeometry args={[0.12, 0.4, 0.12]} />
              <meshStandardMaterial color="#345066" />
            </mesh>
            <RoundedBox
              args={[0.75, 0.04, 0.3]}
              radius={0.02}
              position={[0, 0.27, 0.33]}
            >
              <meshStandardMaterial color="#344a60" />
            </RoundedBox>
          </>
        ) : d.type === "server" ? (
          <>
            <RoundedBox
              args={[0.8, 1.6, 0.85]}
              radius={0.06}
              position={[0, 1, 0]}
            >
              <meshStandardMaterial
                color="#1e263e"
                metalness={0.65}
                roughness={0.28}
              />
            </RoundedBox>
            {[0.5, 0.8, 1.1, 1.4].map((y) => (
              <group key={y}>
                <mesh position={[0, y, 0.44]}>
                  <boxGeometry args={[0.65, 0.18, 0.03]} />
                  <meshStandardMaterial color="#35405b" />
                </mesh>
                <mesh position={[-0.22, y, 0.46]}>
                  <boxGeometry args={[0.05, 0.04, 0.02]} />
                  <meshBasicMaterial color={color} />
                </mesh>
                <mesh position={[0.12, y, 0.46]}>
                  <boxGeometry args={[0.23, 0.025, 0.02]} />
                  <meshBasicMaterial color={color} />
                </mesh>
              </group>
            ))}
          </>
        ) : d.type === "firewall" ? (
          <>
            <RoundedBox
              args={[0.3, 1.4, 1]}
              radius={0.04}
              position={[0, 0.9, 0]}
            >
              <meshStandardMaterial color="#50372c" metalness={0.5} />
            </RoundedBox>
            {[0.45, 0.75, 1.05, 1.35].map((y) => (
              <mesh key={y} position={[0.17, y, 0]}>
                <boxGeometry args={[0.02, 0.025, 0.85]} />
                <meshBasicMaterial color={color} />
              </mesh>
            ))}
          </>
        ) : (
          <>
            <RoundedBox
              args={[1.12, 0.4, 0.8]}
              radius={0.07}
              position={[0, 0.5, 0]}
            >
              <meshStandardMaterial
                color="#213044"
                metalness={0.7}
                roughness={0.3}
              />
            </RoundedBox>
            {[-0.38, -0.13, 0.13, 0.38].map((x) => (
              <mesh key={x} position={[x, 0.5, 0.41]}>
                <boxGeometry args={[0.12, 0.08, 0.025]} />
                <meshBasicMaterial color={color} />
              </mesh>
            ))}
            <mesh position={[0, 0.715, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.13, 0.18, 4]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </>
        )}
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.94, 1.04, 0.12, 64]} />
          <meshStandardMaterial
            color="#102334"
            metalness={0.85}
            roughness={0.22}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
          <ringGeometry args={[0.94, 0.96, 80]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
        {d.type === "router" &&
          [-0.44, 0.44].map((x) => (
            <group
              key={x}
              position={[x, 0.8, -0.25]}
              rotation={[0, 0, x * -0.3]}
            >
              <RoundedBox
                args={[0.07, 0.85, 0.07]}
                radius={0.025}
                position={[0, 0.22, 0]}
              >
                <meshStandardMaterial
                  color="#24344b"
                  metalness={0.8}
                  roughness={0.2}
                />
              </RoundedBox>
              <mesh position={[0, 0.63, 0]}>
                <sphereGeometry args={[0.045, 12, 8]} />
                <meshBasicMaterial color={color} />
              </mesh>
            </group>
          ))}
        {d.type === "server" && (
          <InstanceBoxes
            positions={Array.from({ length: 12 }, (_, i) => [
              0.405,
              0.42 + i * 0.105,
              0,
            ])}
            size={[0.015, 0.025, 0.6]}
            color="#080f1e"
          />
        )}
        {d.type === "pc" && (
          <InstanceBoxes
            positions={Array.from({ length: 24 }, (_, i) => [
              -0.29 + (i % 8) * 0.083,
              0.298,
              0.24 + Math.floor(i / 8) * 0.065,
            ])}
            size={[0.06, 0.009, 0.045]}
            color="#81bdcf"
          />
        )}
        {(selected || receiving) && (
          <pointLight
            position={[0, 1, 0]}
            color={color}
            intensity={2}
            distance={3}
          />
        )}
        <Label
          title={d.name}
          subtitle={d.ip}
          color={color}
          position={[0, -0.2, 1]}
        />
      </group>
    );
  },
  (a, b) =>
    a.d.id === b.d.id &&
    a.d.active === b.d.active &&
    a.d.name === b.d.name &&
    a.d.ip === b.d.ip &&
    a.d.type === b.d.type &&
    a.d.position.every((v, i) => v === b.d.position[i]),
);
function Packet({ p }: { p: NetworkPacket }) {
  const ref = useRef<Group>(null);
  const select = useSimulation((s) => s.select);
  const failed = p.status === "lost" || p.status === "blocked";
  const color = failed ? "#f17887" : protocolColors[p.protocol];
  useFrame(() => {
    const current = engine.state.packets.find((v) => v.id === p.id);
    if (!ref.current || !current) return;
    const a = engine.state.devices.find((d) => d.id === current.from),
      b = engine.state.devices.find((d) => d.id === current.to);
    ref.current.visible =
      current.status === "transit" ||
      ((current.status === "lost" || current.status === "blocked") &&
        engine.state.time - current.end < 450);
    if (a && b) {
      const t = failed
        ? 0.7
        : Math.min(
            1,
            Math.max(
              0,
              (engine.state.time - current.start) /
                (current.end - current.start || 1),
            ),
          );
      ref.current.position.set(
        a.position[0] + (b.position[0] - a.position[0]) * t,
        0.4 + Math.sin(t * Math.PI) * 0.25,
        a.position[2] + (b.position[2] - a.position[2]) * t,
      );
      ref.current.rotation.y = Math.atan2(
        b.position[0] - a.position[0],
        b.position[2] - a.position[2],
      );
    }
  });
  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        select(p.id);
      }}
    >
      <mesh>
        {p.label === "PULSO ÓPTICO" ? (
          <sphereGeometry args={[0.14, 12, 8]} />
        ) : (
          <octahedronGeometry args={[0.16, 0]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
        />
      </mesh>
      {[1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 0, -i * 0.12]}>
          <sphereGeometry args={[0.075 / i, 8, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.5 / i} />
        </mesh>
      ))}
      {p.label === "RÁDIO" &&
        [0.25, 0.4, 0.55].map((r) => (
          <mesh key={r} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r, r + 0.02, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} />
          </mesh>
        ))}
      {p.label === "SINAL ELÉTRICO" && (
        <Line
          points={[
            [-0.5, 0, 0],
            [-0.3, 0.12, 0],
            [-0.1, -0.12, 0],
            [0.1, 0.12, 0],
            [0.3, -0.12, 0],
            [0.5, 0, 0],
          ]}
          color={color}
          lineWidth={2}
        />
      )}
      <Label
        title={
          failed
            ? `${p.status === "blocked" ? "BLOQUEADO" : "PERDIDO"} · ${p.label}`
            : p.label
        }
        color={color}
        position={[0, 0.5, 0]}
      />
    </group>
  );
}
function CameraFollow() {
  const { camera, controls } = useThree();
  const follow = useSimulation((s) => s.follow),
    selected = useSimulation((s) => s.selected);
  useFrame(() => {
    if (!follow || !selected) return;
    const p = engine.state.packets.find((p) => p.id === selected);
    if (!p || p.status !== "transit") return;
    const d = engine.state.devices.find((d) => d.id === p.to);
    if (d) {
      camera.position.lerp(
        new Vector3(d.position[0] + 4, 6, d.position[2] + 7),
        0.025,
      );
      camera.lookAt(d.position[0], 0, d.position[2]);
      const orbit = controls as unknown as {
        target: Vector3;
        update: () => void;
      } | null;
      if (orbit) {
        orbit.target.lerp(new Vector3(d.position[0], 0, d.position[2]), 0.025);
        orbit.update();
      }
    }
  });
  return null;
}
function AdaptiveQuality() {
  const { setDpr } = useThree();
  const quality = useSimulation((s) => s.quality);
  const stats = useRef({ elapsed: 0, frames: 0 });
  useFrame((_, delta) => {
    if (quality !== "Automático") return;
    stats.current.elapsed += delta;
    stats.current.frames++;
    if (stats.current.elapsed > 2) {
      const fps = stats.current.frames / stats.current.elapsed;
      setDpr(fps < 35 ? 1 : Math.min(1.5, window.devicePixelRatio));
      stats.current = { elapsed: 0, frames: 0 };
    }
  });
  return null;
}
function OpeningCamera({ active }: { active: boolean }) {
  const { camera } = useThree();
  const elapsed = useRef(0);
  useEffect(() => {
    if (active) {
      elapsed.current = 0;
      camera.position.set(14, 13, 20);
    }
  }, [active, camera]);
  useFrame((_, delta) => {
    if (!active) return;
    elapsed.current += delta;
    const t = Math.min(1, elapsed.current / 1.8),
      ease = 1 - (1 - t) ** 3;
    camera.position.set(14 - 8 * ease, 13 - 7 * ease, 20 - 11 * ease);
    camera.lookAt(0, 0, 0);
  });
  return null;
}
function LaboratoryRoom() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <planeGeometry args={[24, 26]} />
        <meshStandardMaterial
          color="#101f2c"
          metalness={0.6}
          roughness={0.38}
        />
      </mesh>
      <mesh position={[0, 3, -9]}>
        <boxGeometry args={[22, 6, 0.2]} />
        <meshStandardMaterial
          color="#172735"
          metalness={0.65}
          roughness={0.4}
        />
      </mesh>
      {[-8, -4, 0, 4, 8].map((x) => (
        <group key={x} position={[x, 0, -8.85]}>
          <mesh position={[0, 2.8, 0]}>
            <boxGeometry args={[3.4, 4.8, 0.08]} />
            <meshStandardMaterial
              color="#0b1725"
              metalness={0.75}
              roughness={0.25}
            />
          </mesh>
          <mesh position={[0, 5.25, 0.06]}>
            <boxGeometry args={[3.2, 0.035, 0.02]} />
            <meshBasicMaterial color="#65dfd5" />
          </mesh>
          {[1.4, 1.7, 2, 2.3].map((y) => (
            <mesh key={y} position={[-0.7, y, 0.06]}>
              <boxGeometry args={[1.2, 0.018, 0.02]} />
              <meshBasicMaterial color="#3c8499" />
            </mesh>
          ))}
        </group>
      ))}
      {[-7, 0, 7].map((z) => (
        <group key={z}>
          {[-9, 9].map((x) => (
            <group key={x} position={[x, 2.7, z]}>
              <mesh>
                <boxGeometry args={[0.16, 5.6, 0.2]} />
                <meshStandardMaterial
                  color="#2d4052"
                  metalness={0.8}
                  roughness={0.3}
                />
              </mesh>
              <mesh position={[x < 0 ? 0.09 : -0.09, 0, 0.12]}>
                <boxGeometry args={[0.025, 5.1, 0.03]} />
                <meshBasicMaterial color="#5da9ba" />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 5.5, z]}>
            <boxGeometry args={[18, 0.12, 0.2]} />
            <meshStandardMaterial
              color="#243c4f"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 5.42, z]}>
            <boxGeometry args={[13, 0.025, 0.1]} />
            <meshBasicMaterial color="#b3e8f0" />
          </mesh>
        </group>
      ))}
      <Label
        title="N E T V E R S E  /  N E T W O R K  L A B"
        subtitle="EXPLORE · CONNECT · DISCOVER"
        color="#91e5df"
        position={[0, 4.2, -8.5]}
      />
    </group>
  );
}
function World({
  opening,
  onOrbit,
  immersive = false,
}: {
  opening: boolean;
  onOrbit: () => void;
  immersive?: boolean;
}) {
  const state = useSimulation((s) => s.state);
  return (
    <>
      <color attach="background" args={["#080e19"]} />
      <fog attach="fog" args={["#080e19", 20, 45]} />
      {immersive && <LaboratoryRoom />}
      <Stars
        radius={65}
        depth={30}
        count={350}
        factor={2}
        saturation={0}
        fade
        speed={0}
      />
      <ambientLight intensity={1.35} />
      <directionalLight position={[3, 9, 4]} intensity={2.5} color="#b7d7ff" />
      <pointLight position={[-5, 5, -3]} intensity={18} color="#00aaff" />
      <pointLight position={[6, 4, 2]} intensity={14} color="#8458ff" />
      <Grid
        position={[0, -0.02, 0]}
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1a3046"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#234158"
        fadeDistance={23}
        infiniteGrid
      />
      {state.links.map((l) => {
        const a = state.devices.find((d) => d.id === l.from),
          b = state.devices.find((d) => d.id === l.to);
        return a && b ? (
          <Line
            key={l.id}
            points={[
              [a.position[0], 0.22, a.position[2]],
              [b.position[0], 0.22, b.position[2]],
            ]}
            color={
              l.active && state.config.cable
                ? l.medium === "wifi"
                  ? "#8e74bc"
                  : "#2d7890"
                : "#813a49"
            }
            lineWidth={l.active ? 1.5 : 1}
            dashed={!l.active || l.medium === "wifi"}
            dashSize={0.2}
            gapSize={0.15}
          />
        ) : null;
      })}
      {state.devices.map((d) => (
        <Device key={d.id} d={d} />
      ))}
      {state.packets
        .filter(
          (p) =>
            p.status === "transit" ||
            ((p.status === "lost" || p.status === "blocked") &&
              state.time - p.end < 450),
        )
        .map((p) => (
          <Packet key={p.id} p={p} />
        ))}
      <OrbitControls
        autoRotate={
          !immersive &&
          state.scenario === "home" &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        }
        autoRotateSpeed={0.3}
        makeDefault
        minDistance={6}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
        enableDamping
        onStart={() => {
          useSimulation.getState().setFollow(false);
          onOrbit();
        }}
      />
      <CameraFollow />
      {immersive && <WalkCamera />}
      <AdaptiveQuality />
      <OpeningCamera active={opening} />
    </>
  );
}
function Fallback() {
  const { state, select } = useSimulation();
  const point = (id: string) => {
    const d = state.devices.find((d) => d.id === id);
    return d
      ? { x: 400 + d.position[0] * 45, y: 220 + d.position[2] * 35 }
      : { x: 0, y: 0 };
  };
  return (
    <svg
      className="fallback"
      viewBox="0 0 800 440"
      role="img"
      aria-label="Mapa 2D interativo da rede"
    >
      {state.links.map((l) => {
        const a = point(l.from),
          b = point(l.to);
        return (
          <line
            key={l.id}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={l.active && state.config.cable ? "#328da7" : "#e36479"}
            strokeWidth="2"
            strokeDasharray={l.active ? undefined : "6 5"}
          />
        );
      })}
      {state.devices.map((d) => {
        const p = point(d.id);
        return (
          <g
            key={d.id}
            onClick={() => select(d.id)}
            onKeyDown={(e) => e.key === "Enter" && select(d.id)}
            tabIndex={0}
            role="button"
            aria-label={`Inspecionar ${d.name}`}
          >
            <rect
              x={p.x - 28}
              y={p.y - 22}
              width="56"
              height="44"
              rx="8"
              fill="#152c42"
              stroke={deviceColors[d.type]}
            />
            <text
              x={p.x}
              y={p.y + 4}
              fill={deviceColors[d.type]}
              textAnchor="middle"
              fontSize="10"
            >
              {d.type.toUpperCase()}
            </text>
            <text
              x={p.x}
              y={p.y + 40}
              fill="#adbed1"
              textAnchor="middle"
              fontSize="11"
            >
              {d.name}
            </text>
          </g>
        );
      })}
      {state.packets
        .filter((p) => p.status === "transit")
        .map((p) => {
          const a = point(p.from),
            b = point(p.to),
            t = Math.max(
              0,
              Math.min(1, (state.time - p.start) / (p.end - p.start || 1)),
            );
          return (
            <g key={p.id} onClick={() => select(p.id)}>
              <circle
                cx={a.x + (b.x - a.x) * t}
                cy={a.y + (b.y - a.y) * t}
                r="8"
                fill={protocolColors[p.protocol]}
              />
              <text
                x={a.x + (b.x - a.x) * t}
                y={a.y + (b.y - a.y) * t - 14}
                fill={protocolColors[p.protocol]}
                fontSize="11"
              >
                {p.label}
              </text>
            </g>
          );
        })}
    </svg>
  );
}
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}
function WalkCamera() {
  const { camera, controls } = useThree();
  const keys = useRef(new Set<string>());
  const direction = useRef(new Vector3());
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        !(e.target instanceof HTMLInputElement) &&
        ["KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code)
      ) {
        e.preventDefault();
        keys.current.add(e.code);
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const clear = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);
  useFrame((_, delta) => {
    if (!keys.current.size) return;
    camera.getWorldDirection(direction.current);
    direction.current.y = 0;
    direction.current.normalize();
    const forward =
      Number(keys.current.has("KeyW")) - Number(keys.current.has("KeyS"));
    const right =
      Number(keys.current.has("KeyD")) - Number(keys.current.has("KeyA"));
    const amount = Math.min(delta, 0.05) * 3;
    const dx =
      (direction.current.x * forward - direction.current.z * right) * amount;
    const dz =
      (direction.current.z * forward + direction.current.x * right) * amount;
    if (
      Math.abs(camera.position.x + dx) > 18 ||
      Math.abs(camera.position.z + dz) > 18
    )
      return;
    camera.position.x += dx;
    camera.position.z += dz;
    const orbit = controls as unknown as { target: Vector3 } | null;
    if (orbit) {
      orbit.target.x += dx;
      orbit.target.z += dz;
    }
  });
  return null;
}
function LegacyNetworkScene({
  hero = false,
  immersive = false,
}: {
  hero?: boolean;
  immersive?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let intersecting = true;
    const update = () =>
      setVisible(
        intersecting &&
          !document.hidden &&
          (immersive || document.documentElement.dataset.immersive !== "true"),
      );
    const observer = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        update();
      },
      { rootMargin: "80px" },
    );
    if (container.current) observer.observe(container.current);
    document.addEventListener("visibilitychange", update);
    document.addEventListener("netverse-immersion", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      document.removeEventListener("netverse-immersion", update);
    };
  }, [immersive]);
  const [flat, setFlat] = useState(false),
    [cameraKey, setCameraKey] = useState(0);
  const [opening, setOpening] = useState(
    hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    if (!opening) return;
    const timeout = setTimeout(() => setOpening(false), 2200);
    return () => clearTimeout(timeout);
  }, [opening]);
  const { quality, follow, setFollow, selected, state } = useSimulation();
  return (
    <div
      ref={container}
      className={`network-scene ${hero ? "hero-scene" : ""}`}
    >
      <div className="scene-heading">
        <span>
          <i className="status-dot" /> REDE VIRTUAL AO VIVO
        </span>
        <span className="mono">
          SEED {state.config.seed} · {state.devices.length} NÓS
        </span>
      </div>
      <SceneBoundary fallback={<Fallback />}>
        {flat ? (
          <Fallback />
        ) : (
          <Suspense
            fallback={
              <div className="scene-loading">Construindo seu universo…</div>
            }
          >
            <Canvas
              frameloop={visible ? "always" : "never"}
              key={cameraKey}
              camera={{
                position: immersive ? [0, 3.2, 11] : [8, 8, 12],
                fov: immersive ? 62 : hero ? 60 : 42,
              }}
              dpr={
                quality === "Baixo" ? 1 : quality === "Alto" ? [1, 2] : [1, 1.5]
              }
              gl={{
                antialias: quality !== "Baixo",
                powerPreference: "high-performance",
              }}
              fallback={<Fallback />}
            >
              <World
                immersive={immersive}
                opening={opening}
                onOrbit={() => setOpening(false)}
              />
            </Canvas>
          </Suspense>
        )}
      </SceneBoundary>
      {opening && (
        <button
          className="skip-opening"
          onClick={() => {
            setOpening(false);
            setCameraKey((k) => k + 1);
          }}
        >
          Pular abertura →
        </button>
      )}
      <div className="scene-tools">
        <button
          title="Restaurar câmera"
          aria-label="Restaurar câmera"
          onClick={() => {
            setFollow(false);
            setCameraKey((k) => k + 1);
          }}
        >
          <RotateCcw size={15} />
        </button>
        <button
          title="Alternar mapa 2D"
          aria-label="Alternar mapa 2D"
          className={flat ? "active" : ""}
          onClick={() => setFlat(!flat)}
        >
          <Layers size={15} />
        </button>
        <button
          title="Acompanhar pacote selecionado"
          aria-label="Acompanhar pacote selecionado"
          disabled={!selected?.startsWith("P")}
          className={follow ? "active" : ""}
          onClick={() => setFollow(!follow)}
        >
          <Crosshair size={15} />
        </button>
        <button
          title="Tela cheia"
          aria-label="Tela cheia"
          onClick={(e) => {
            const el = e.currentTarget.closest(".network-scene");
            if (document.fullscreenElement) void document.exitFullscreen();
            else void el?.requestFullscreen();
          }}
        >
          <Expand size={15} />
        </button>
      </div>
      <div className="scene-bottom">
        <span>ARRASTE PARA ORBITAR · SCROLL PARA APROXIMAR</span>
        <span>
          CLIQUE PARA INSPECIONAR <span className="cyan">↗</span>
        </span>
      </div>
    </div>
  );
}

export { Device, Packet, Label, Fallback, SceneBoundary };
export default function NetworkScene(props: {
  hero?: boolean;
  immersive?: boolean;
}) {
  const world = useContext(WorldMode);
  return world ? <Fallback /> : <LegacyNetworkScene {...props} />;
}
