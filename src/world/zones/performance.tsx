import { useEffect, useRef } from "react";
import { Matrix4, Color, type InstancedMesh } from "three";
import { Label } from "../../scenes/NetworkScene";
import { useSimulation } from "../../stores/useSimulation";
export default function Performance() {
  const all = useSimulation((s) => s.state.samples);
  const samples = all.slice(-30);
  const max = Math.max(0.001, ...samples.map((s) => s.throughput));
  const bars = useRef<InstancedMesh>(null);
  useEffect(() => {
    if (!bars.current) return;
    const m = new Matrix4(),
      c = new Color();
    samples.forEach((s, i) => {
      const height = Math.max(0.04, (s.throughput / max) * 4);
      m.makeScale(0.26, height, 0.8).setPosition(
        -6 + i * 0.4,
        0.35 + height / 2,
        0,
      );
      bars.current!.setMatrixAt(i, m);
      const previous = all[all.length - samples.length + i - 1]?.lost ?? 0;
      c.set(s.lost > previous ? "#ffc48a" : "#84e5d0");
      bars.current!.setColorAt(i, c);
    });
    bars.current.count = samples.length;
    bars.current.instanceMatrix.needsUpdate = true;
    if (bars.current.instanceColor)
      bars.current.instanceColor.needsUpdate = true;
    bars.current.computeBoundingSphere();
  }, [all, max]);
  return (
    <>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[14, 0.3, 5]} />
        <meshStandardMaterial color="#142a35" metalness={0.6} roughness={0.4} />
      </mesh>
      <instancedMesh ref={bars} args={[undefined, undefined, 30]}>
        <boxGeometry />
        <meshStandardMaterial metalness={0.35} roughness={0.5} />
      </instancedMesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <Label
          key={i}
          title={`${((max * i) / 4).toFixed(3)} Mbit/s`}
          color="#a8c5d5"
          position={[-7, i + 0.4, 0]}
        />
      ))}
      <Label
        title="VAZÃO ACUMULADA / TEMPO VIRTUAL"
        subtitle="Escala adaptativa · âmbar: amostra com novas perdas"
        color="#84e5d0"
        position={[0, 5.2, -1]}
      />
    </>
  );
}
