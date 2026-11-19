import { act } from "../../stores/useSimulation";
import Block from "./Block";
import { Label } from "../../scenes/NetworkScene";
import { useSimulation } from "../../stores/useSimulation";
const accent = "#84e5d0";
export default function Zone() {
  const { state } = useSimulation();
  return (
    <>
      {["IoT", "NUVEM", "SDN"].map((t, i) => (
        <group
          key={t}
          position={[(i - 1) * 4, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            act((s) =>
              s.reset("trends", {
                ...s.state.config,
                trend: (["iot", "cloud", "sdn"] as const)[i],
              }),
            );
          }}
        >
          <Block
            position={[0, 1, 0]}
            size={[2, 2, 2]}
            color={
              state.config.trend === (["iot", "cloud", "sdn"] as const)[i]
                ? accent
                : "#aaa5ff"
            }
          />
          <Label
            title={t}
            subtitle={
              state.config.trend === (["iot", "cloud", "sdn"] as const)[i]
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
}
