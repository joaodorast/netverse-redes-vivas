import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
export default function StudioLighting() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const room = new RoomEnvironment();
    const generator = new PMREMGenerator(gl);
    const target = generator.fromScene(room, 0.06, 0.1, 100, { size: 64 });
    const previous = scene.environment;
    const intensity = scene.environmentIntensity;
    scene.environment = target.texture;
    scene.environmentIntensity = 0.45;
    room.dispose();
    generator.dispose();
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = intensity;
      target.dispose();
    };
  }, [gl, scene]);
  return null;
}
