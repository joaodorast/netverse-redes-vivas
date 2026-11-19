import { listenerPose } from "./runtime";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Vector3 } from "three";
export default function Navigation({
  enabled,
  index,
}: {
  enabled: boolean;
  index: number;
}) {
  const { camera, controls, gl, invalidate } = useThree();
  const keys = useRef(new Set<string>());
  const euler = useRef(new Euler(0, 0, 0, "YXZ"));
  const direction = useRef(new Vector3());
  const destination = useRef(new Vector3());
  const velocity = useRef(new Vector3());
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        (e.target instanceof HTMLElement &&
          Boolean(
            e.target.closest(".zone-station,select,[contenteditable=true]"),
          )) ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.code)
      ) {
        e.preventDefault();
        document.dispatchEvent(new Event("world-manual-camera"));
        keys.current.add(e.code);
        invalidate();
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const clear = () => keys.current.clear();
    const touch = (e: Event) => {
      const d = (e as CustomEvent<{ key: string; pressed: boolean }>).detail;
      if (d.pressed) {
        document.dispatchEvent(new Event("world-manual-camera"));
        keys.current.add(d.key);
        invalidate();
      } else keys.current.delete(d.key);
    };
    const mouse = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement || !enabled) return;
      invalidate();
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= e.movementX * 0.002;
      euler.current.x = Math.max(
        -1.2,
        Math.min(1.2, euler.current.x - e.movementY * 0.002),
      );
      camera.quaternion.setFromEuler(euler.current);
      camera.getWorldDirection(direction.current);
      const orbit = controls as unknown as { target: Vector3 } | null;
      if (orbit)
        orbit.target
          .copy(camera.position)
          .addScaledVector(direction.current, 8);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    window.addEventListener("world-move", touch);
    window.addEventListener("mousemove", mouse);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      window.removeEventListener("world-move", touch);
      window.removeEventListener("mousemove", mouse);
    };
  }, [camera, controls, enabled, gl]);
  useEffect(() => {
    keys.current.clear();
    velocity.current.set(0, 0, 0);
    if (!enabled && document.pointerLockElement) document.exitPointerLock();
  }, [enabled, index]);
  useFrame((_, delta) => {
    listenerPose.x = camera.position.x - index * 30;
    listenerPose.y = camera.position.y;
    listenerPose.z = camera.position.z;
    camera.getWorldDirection(direction.current);
    listenerPose.fx = direction.current.x;
    listenerPose.fy = direction.current.y;
    listenerPose.fz = direction.current.z;
    if (!enabled) return;
    const dt = Math.min(delta, 0.05);
    const f =
      Number(keys.current.has("KeyW") || keys.current.has("ArrowUp")) -
      Number(keys.current.has("KeyS") || keys.current.has("ArrowDown"));
    const r =
      Number(keys.current.has("KeyD") || keys.current.has("ArrowRight")) -
      Number(keys.current.has("KeyA") || keys.current.has("ArrowLeft"));
    camera.getWorldDirection(direction.current);
    direction.current.y = 0;
    direction.current.normalize();
    destination.current.set(
      direction.current.x * f - direction.current.z * r,
      0,
      direction.current.z * f + direction.current.x * r,
    );
    if (destination.current.lengthSq() > 1) destination.current.normalize();
    destination.current.multiplyScalar(3);
    velocity.current.lerp(destination.current, Math.min(1, dt * 8));
    if (velocity.current.lengthSq() > 0.00001) invalidate();
    const dx = velocity.current.x * dt,
      dz = velocity.current.z * dt;
    if (
      (Math.abs(camera.position.x + dx - index * 30) > 12 &&
        Math.abs(camera.position.x + dx - index * 30) >
          Math.abs(camera.position.x - index * 30)) ||
      (Math.abs(camera.position.z + dz) > 42 &&
        Math.abs(camera.position.z + dz) > Math.abs(camera.position.z))
    )
      return;
    camera.position.x += dx;
    camera.position.z += dz;
    const orbit = controls as unknown as { target: Vector3 } | null;
    if (orbit) {
      orbit.target.x += dx;
      orbit.target.z += dz;
    }
  });
  return null;
}
