import Block from "./Block";
import { Label } from "../../scenes/NetworkScene";
import { useSimulation } from "../../stores/useSimulation";
const accent = "#84e5d0";
export default function Zone() {
  const { state } = useSimulation();
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
}
