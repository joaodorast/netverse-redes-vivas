import { useEffect } from "react";
import { engine, useSimulation } from "../stores/useSimulation";
import { Fallback } from "../scenes/NetworkScene";
export default function WorldFallback() {
  useEffect(() => {
    let frame = 0,
      previous = performance.now(),
      elapsed = 0;
    const animate = (now: number) => {
      elapsed += Math.min(100, now - previous);
      previous = now;
      if (elapsed >= 45) {
        if (!document.hidden && engine.state.running) {
          engine.tick(elapsed * 0.18);
          useSimulation.getState().refresh();
        }
        elapsed = 0;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div className="world-fallback">
      <p>Visão simplificada ativa: o motor continua funcionando sem WebGL.</p>
      <Fallback />
    </div>
  );
}
