import { Label } from "../../scenes/NetworkScene";
import { useSimulation } from "../../stores/useSimulation";
const accent = "#84e5d0";
export default function Zone() {
  const { state } = useSimulation();
  return (
    <>
      {["SYN", "SYN-ACK", "ACK"].map((name, i) => {
        const p = state.packets.find((p) => p.label === name);
        return (
          <group key={name} position={[-5 + i * 2, 3, -3]}>
            <mesh>
              <sphereGeometry args={[0.2, 12, 8]} />
              <meshStandardMaterial
                color={p?.status === "delivered" ? "#84e5d0" : "#34475e"}
                emissive={p?.status === "transit" ? "#aaa5ff" : "#000000"}
              />
            </mesh>
            <Label
              title={name}
              subtitle={p?.status ?? "AINDA NÃO ENVIADO"}
              color="#aabfda"
              position={[0, 0.6, 0]}
            />
          </group>
        );
      })}

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
}
