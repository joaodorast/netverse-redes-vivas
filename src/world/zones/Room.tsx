import { useEffect, useRef } from "react";
import Architecture from "./Architecture";
import { type InstancedMesh, Matrix4 } from "three";
import { Label } from "../../scenes/NetworkScene";
const identities: Record<string, [string, string]> = {
  home: ["SAGUÃO / CONEXÕES", "#84e5d0"],
  osi: ["ANATOMIA / CAMADAS", "#aaa5ff"],
  tcp: ["TRANSPORTE / FLUXOS", "#84e5d0"],
  web: ["NAVEGAÇÃO / REQUISIÇÕES", "#84e5d0"],
  routing: ["ENCAMINHAMENTO / DECISÕES", "#aaa5ff"],
  topology: ["TOPOLOGIAS / CAMINHOS", "#84e5d0"],
  media: ["SINAIS / MEIOS FÍSICOS", "#aaa5ff"],
  diagnostics: ["DIAGNÓSTICO / EVIDÊNCIAS", "#84e5d0"],
  security: ["SEGURANÇA / FRONTEIRA", "#ffc48a"],
  performance: ["OBSERVATÓRIO / CAPACIDADE", "#84e5d0"],
  trends: ["ARQUITETURAS / FUTURO", "#aaa5ff"],
  glossary: ["BIBLIOTECA / CONHECIMENTO", "#aaa5ff"],
};
export default function Room({ id }: { id: string }) {
  const [name, color] = identities[id] ?? identities.home;
  const beams = useRef<InstancedMesh>(null);
  useEffect(() => {
    if (!beams.current) return;
    const m = new Matrix4();
    for (let i = 0; i < 8; i++) {
      const x = i % 2 ? -11 : 11,
        z = -8 + Math.floor(i / 2) * 5;
      m.makeScale(0.14, 5, 0.16).setPosition(x, 2.5, z);
      beams.current.setMatrixAt(i, m);
    }
    beams.current.instanceMatrix.needsUpdate = true;
    beams.current.computeBoundingSphere();
  }, []);
  return (
    <>
      <Architecture id={id} color={color} />
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[29, 0.3, 22]} />
        <meshPhysicalMaterial
          color="#0b1420"
          metalness={0.72}
          roughness={0.3}
          clearcoat={0.35}
          clearcoatRoughness={0.3}
        />
      </mesh>
      <mesh position={[0, 2.5, -9]}>
        <boxGeometry args={[22, 5, 0.25]} />
        <meshStandardMaterial color="#111c2d" metalness={0.7} roughness={0.4} />
      </mesh>
      <instancedMesh ref={beams} args={[undefined, undefined, 8]}>
        <boxGeometry />
        <meshStandardMaterial
          color="#304557"
          metalness={0.8}
          roughness={0.35}
        />
      </instancedMesh>
      {[-7, 0].map((z) => (
        <mesh key={z} position={[0, 5, z]}>
          <boxGeometry args={[12, 0.025, 0.05]} />
          <meshBasicMaterial color="#416674" />
        </mesh>
      ))}
      <mesh position={[0, 3.7, -8.8]}>
        <boxGeometry args={[14, 0.02, 0.03]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Label
        title={name}
        subtitle="NETVERSE / LABORATÓRIO DE REDES"
        color={color}
        position={[0, 4.2, -8.5]}
      />
    </>
  );
}
