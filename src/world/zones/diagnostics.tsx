import Block from "./Block";
import { Label } from "../../scenes/NetworkScene";
import { useSimulation } from "../../stores/useSimulation";
const accent = "#84e5d0";
export default function Zone() {
  const { state } = useSimulation();
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
}
