import { useMemo, useEffect } from "react";
import { Color, AdditiveBlending } from "three";
export const signalTime = { value: 0 };
export default function Hologram({
  color,
  active,
}: {
  color: string;
  active: boolean;
}) {
  const uniforms = useMemo(
    () => ({
      uTime: signalTime,
      uColor: { value: new Color(color) },
      uActive: { value: active ? 1 : 0 },
    }),
    [],
  );
  useEffect(() => {
    uniforms.uColor.value.set(color);
    uniforms.uActive.value = active ? 1 : 0;
  }, [active, color, uniforms]);
  return (
    <shaderMaterial
      transparent
      depthWrite={false}
      blending={AdditiveBlending}
      uniforms={uniforms}
      vertexShader={`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
      fragmentShader={`uniform vec3 uColor;uniform float uTime;uniform float uActive;varying vec2 vUv;void main(){float edge=pow(abs(vUv.y-.5)*2.,5.);float scan=pow(max(0.,sin(vUv.y*80.-uTime*3.)),12.)*uActive;float alpha=.08+edge*.3+scan*.16;gl_FragColor=vec4(uColor,alpha);}`}
    />
  );
}
