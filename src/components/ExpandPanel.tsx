import { useEffect, useRef, useState } from "react";
import { Expand, Minimize } from "lucide-react";
export default function ExpandPanel({
  label = "explicação",
}: {
  label?: string;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const change = () => {
      const panel = button.current?.closest<HTMLElement>("[data-expandable]");
      setExpanded(document.fullscreenElement === panel);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        button.current
          ?.closest("[data-expandable]")
          ?.classList.remove("panel-screen-fallback");
        setExpanded(false);
      }
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("fullscreenchange", change);
    return () => {
      document.removeEventListener("fullscreenchange", change);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <button
      ref={button}
      className="expand-panel"
      title={expanded ? "Sair da tela cheia" : "Abrir explicação em tela cheia"}
      aria-label={
        expanded
          ? label === "explicação"
            ? "Sair da tela cheia da explicação"
            : `Sair da tela cheia de ${label}`
          : `Expandir ${label} em tela cheia`
      }
      onClick={async () => {
        const panel = button.current?.closest<HTMLElement>("[data-expandable]");
        if (!panel) return;
        if (panel.classList.contains("panel-screen-fallback")) {
          panel.classList.remove("panel-screen-fallback");
          setExpanded(false);
          return;
        }
        if (document.fullscreenElement === panel) {
          await document.exitFullscreen();
          return;
        }
        if (panel.requestFullscreen) {
          try {
            await panel.requestFullscreen();
          } catch {
            panel.classList.toggle("panel-screen-fallback");
            setExpanded(panel.classList.contains("panel-screen-fallback"));
          }
        } else {
          panel.classList.toggle("panel-screen-fallback");
          setExpanded(panel.classList.contains("panel-screen-fallback"));
        }
      }}
    >
      {expanded ? <Minimize size={16} /> : <Expand size={16} />}
    </button>
  );
}
