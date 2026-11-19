import { memo } from "react";
import { Expand } from "lucide-react";
import NetworkMap from "./NetworkMap";
import { useSimulation } from "../stores/useSimulation";
function SimpleScene({ hero = false }: { hero?: boolean }) {
  const running = useSimulation((s) => s.state.running);
  return (
    <div className={`network-scene simple-scene ${hero ? "hero-scene" : ""}`}>
      <div className="scene-heading">
        <span>
          <i className={running ? "status-dot" : ""} />
          REDE SIMULADA / VISÃO LEVE
        </span>
      </div>
      <NetworkMap />
      <div className="simple-scene-actions">
        <button
          onClick={() => document.dispatchEvent(new Event("enter-world"))}
        >
          Explorar no mundo 3D →
        </button>
        <button
          aria-label="Tela cheia"
          title="Expandir mapa"
          onClick={(e) => {
            const root = e.currentTarget.closest<HTMLElement>(".network-scene");
            if (root?.requestFullscreen) void root.requestFullscreen();
          }}
        >
          <Expand size={15} />
        </button>
      </div>
    </div>
  );
}

export default memo(SimpleScene);
