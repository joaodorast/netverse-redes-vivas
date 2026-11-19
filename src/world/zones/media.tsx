import { act } from "../../stores/useSimulation";
import Block from "./Block";
import { Label } from "../../scenes/NetworkScene";
import { useSimulation } from "../../stores/useSimulation";
const accent = "#84e5d0";
export default function Zone() {
  const { state } = useSimulation();
  return (
    <>
      {["COBRE", "FIBRA", "RÁDIO"].map((t, i) => (
        <group
          key={t}
          position={[(i - 1) * 4, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            act((s) =>
              s.configure({
                medium: (["copper", "fiber", "wifi"] as const)[i],
              }),
            );
          }}
        >
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
}
