import { useEffect, useState } from "react";
export default function Boot() {
  const [ready, setReady] = useState(false);
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const start = () => {
      setReady(true);
      timer = setTimeout(
        () => setClosed(true),
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 0
          : 1000,
      );
    };
    document.addEventListener("world-renderer-ready", start);
    return () => {
      document.removeEventListener("world-renderer-ready", start);
      clearTimeout(timer);
    };
  }, []);
  if (closed) return null;
  return (
    <div
      className={`world-entry ${ready ? "is-ready" : ""}`}
      aria-label="Entrada do laboratório"
    >
      <div className="entry-door left" />
      <div className="entry-door right" />
      <div className="entry-console">
        <span>NETVERSE / SISTEMAS DE REDE</span>
        <h1>Entre no invisível.</h1>
        <p role="status">
          {ready
            ? "Renderizador ativo. Portas liberadas."
            : "Carregando o ambiente e preparando o renderizador…"}
        </p>
        <div>
          <b>01</b> Interface carregada <span>{ready ? "✓" : "·"}</span>
        </div>
        <div>
          <b>02</b> Primeiro quadro 3D <span>{ready ? "✓" : "aguardando"}</span>
        </div>
        <button onClick={() => setClosed(true)}>
          Pular entrada e explorar →
        </button>
      </div>
    </div>
  );
}
