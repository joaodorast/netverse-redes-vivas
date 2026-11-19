import Block from "./Block";
import { Label } from "../../scenes/NetworkScene";
import { useSimulation } from "../../stores/useSimulation";
const accent = "#84e5d0";
export default function Zone() {
  const { state } = useSimulation();
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
}
