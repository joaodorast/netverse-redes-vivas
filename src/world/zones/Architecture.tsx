import { useSimulation } from "../../stores/useSimulation";

type Point = [number, number, number];
function Plinth({
  at,
  width = 3,
  depth = 3,
  color,
  round = false,
}: {
  at: Point;
  width?: number;
  depth?: number;
  color: string;
  round?: boolean;
}) {
  return (
    <group position={at}>
      <mesh position={[0, -0.02, 0]}>
        {round ? (
          <cylinderGeometry args={[width / 2, width / 2 + 0.15, 0.24, 32]} />
        ) : (
          <boxGeometry args={[width, 0.24, depth]} />
        )}
        <meshStandardMaterial
          color="#213747"
          metalness={0.8}
          roughness={0.28}
        />
      </mesh>
      <mesh
        position={[0, 0.11, 0]}
        rotation={round ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
      >
        {round ? (
          <torusGeometry args={[width / 2 - 0.07, 0.018, 4, 48]} />
        ) : (
          <boxGeometry args={[width + 0.02, 0.025, depth + 0.02]} />
        )}
        <meshBasicMaterial color={color} />
      </mesh>
      {!round && (
        <mesh position={[0, 0.13, 0]}>
          <boxGeometry args={[width - 0.08, 0.02, depth - 0.08]} />
          <meshStandardMaterial
            color="#10202e"
            metalness={0.6}
            roughness={0.45}
          />
        </mesh>
      )}
    </group>
  );
}
/** Static architecture; moving traffic comes exclusively from simulation events. */
export default function Architecture({
  id,
  color,
}: {
  id: string;
  color: string;
}) {
  const low = useSimulation((s) => s.quality) === "Baixo";
  if (id === "home" || id === "topology")
    return (
      <>
        <Plinth
          at={[0, -0.12, 0]}
          width={id === "home" ? 15 : 18}
          color={color}
          round
        />
        {!low &&
          [-7, 7].map((x) => (
            <mesh key={x} position={[x, 0.45, -5]}>
              <boxGeometry args={[0.25, 1.1, 0.25]} />
              <meshStandardMaterial
                color="#385a69"
                metalness={0.8}
                roughness={0.25}
              />
            </mesh>
          ))}
      </>
    );
  if (id === "osi")
    return (
      <>
        {[-3, 3].map((x) => (
          <Plinth
            key={x}
            at={[x, 0, 0]}
            width={3.6}
            depth={2.6}
            color={color}
          />
        ))}
        {!low && (
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[2.4, 0.04, 0.09]} />
            <meshBasicMaterial color="#567489" />
          </mesh>
        )}
      </>
    );
  if (id === "tcp")
    return (
      <>
        {[-3, 3].map((x, i) => (
          <group key={x}>
            <Plinth
              at={[x, -0.05, -3]}
              width={2.8}
              depth={9}
              color={i ? "#b2a2ff" : color}
            />
            {!low &&
              [-1, 1].map((side) => (
                <mesh key={side} position={[x + side * 1.45, 0.25, -3]}>
                  <boxGeometry args={[0.045, 0.35, 9]} />
                  <meshStandardMaterial color="#3b5268" metalness={0.65} />
                </mesh>
              ))}
          </group>
        ))}
      </>
    );
  if (id === "web" || id === "media" || id === "trends")
    return (
      <>
        {[-4, 0, 4].map((x, i) => (
          <Plinth
            key={x}
            at={[x, -0.1, 0]}
            width={3.4}
            depth={3.8}
            color={[color, "#b2a2ff", "#ffd09d"][i]}
            round={id === "trends"}
          />
        ))}
      </>
    );
  if (id === "security")
    return (
      <>
        <Plinth at={[0, -0.1, 0]} width={1.1} depth={9} color="#ffc48a" />
        {[-4.2, 4.2].map((z) => (
          <group key={z}>
            <mesh position={[0, 2, z]}>
              <boxGeometry args={[0.7, 4, 0.7]} />
              <meshStandardMaterial
                color="#263c4e"
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 2, z + 0.37]}>
              <boxGeometry args={[0.08, 3.5, 0.025]} />
              <meshBasicMaterial color="#ffc48a" />
            </mesh>
          </group>
        ))}
      </>
    );
  if (id === "performance")
    return (
      <>
        <Plinth at={[0, -0.1, 0]} width={13} depth={4.5} color={color} />
        {!low &&
          [1, 2, 3].map((y) => (
            <mesh key={y} position={[0, y, -2.2]}>
              <boxGeometry args={[12, 0.015, 0.015]} />
              <meshBasicMaterial color="#335366" />
            </mesh>
          ))}
      </>
    );
  if (id === "glossary")
    return (
      <>
        {[-4, 0, 4].map((x) => (
          <group key={x}>
            <Plinth at={[x, -0.1, 0]} width={3} depth={3} color={color} />
            {!low && (
              <mesh position={[x, 0.5, -0.7]}>
                <boxGeometry args={[2.3, 1, 0.3]} />
                <meshStandardMaterial
                  color="#243e50"
                  metalness={0.75}
                  roughness={0.3}
                />
              </mesh>
            )}
          </group>
        ))}
      </>
    );
  return (
    <>
      <Plinth
        at={[0, -0.1, 0]}
        width={id === "routing" ? 12 : 10}
        depth={4}
        color={color}
      />
      {!low &&
        [-5, 5].map((x) => (
          <mesh key={x} position={[x, 1, -2]}>
            <cylinderGeometry args={[0.07, 0.12, 2, 8]} />
            <meshStandardMaterial color="#4a6879" metalness={0.8} />
          </mesh>
        ))}
    </>
  );
}
