import Block from "./Block";
import { Label } from "../../scenes/NetworkScene";
const accent = "#84e5d0";
export default function Zone() {
  return (
    <>
      {["CONCEITOS", "QUIZ", "MISSÕES"].map((t, i) => (
        <group
          key={t}
          position={[(i - 1) * 4, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            document.dispatchEvent(
              new Event(i === 2 ? "world-missions" : "world-terminal"),
            );
          }}
        >
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
}
