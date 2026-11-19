import { RoundedBox } from "@react-three/drei";
const accent = "#84e5d0";
export default function Block({
  position,
  size,
  color = accent,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <RoundedBox args={size} radius={0.04} position={position}>
      <meshStandardMaterial
        color="#172b3b"
        metalness={0.65}
        roughness={0.4}
        emissive={color}
        emissiveIntensity={0.08}
      />
    </RoundedBox>
  );
}
