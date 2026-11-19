import Block from "./Block";
import { Label } from "../../scenes/NetworkScene";
import Hologram from "../Hologram";
import { layers } from "../../data/content";
import { useSimulation } from "../../stores/useSimulation";
const accent = "#84e5d0";
export default function Zone() {
  const { state, select } = useSimulation();
  return (
    <>
      {[-3, 3].map((x, side) => (
        <group key={x}>
          {layers.map((l) => (
            <group
              key={l.n}
              position={[x, l.n * 0.62, 0]}
              onClick={(e) => {
                e.stopPropagation();
                select(`layer-${l.n}`);
              }}
            >
              <Block
                position={[0, 0, 0]}
                size={[3, 0.35, 1.7]}
                color={state.osiLayer === l.n ? accent : "#aaa5ff"}
              />
              <mesh position={[0, 0, 0.88]}>
                <planeGeometry args={[3, 0.35]} />
                <Hologram
                  color={state.osiLayer === l.n ? accent : "#aaa5ff"}
                  active={state.osiLayer === l.n}
                />
              </mesh>
              <Label
                title={`${l.n} · ${l.name}`}
                color={state.osiLayer === l.n ? accent : "#b8b6da"}
                position={[0, 0.12, 1]}
              />
              {state.osiLayer === l.n &&
                (state.osiDirection === "down") === (side === 0) && (
                  <mesh position={[0, 0.4, 0]}>
                    <octahedronGeometry args={[0.2]} />
                    <meshBasicMaterial color="#ffc48a" />
                  </mesh>
                )}
            </group>
          ))}
        </group>
      ))}
    </>
  );
}
