import Block from "./Block";
import { Label } from "../../scenes/NetworkScene";
import Cable from "./Cable";
import { useSimulation } from "../../stores/useSimulation";
const accent = "#84e5d0";
export default function Zone() {
  const { state } = useSimulation();
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
      <Cable from={[-4, 0, 0]} to={[4, 0, 0]} />
    </>
  );
}
