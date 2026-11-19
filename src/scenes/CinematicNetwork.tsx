import { Suspense, useEffect, useState } from "react";
import NetworkScene from "./SimpleScene";
import { act, engine, useSimulation } from "../stores/useSimulation";
export default function CinematicNetwork() {
  const [automatic, setAutomatic] = useState(true);
  const { state } = useSimulation();
  useEffect(() => {
    if (!automatic) return;
    act((e) => {
      e.state.speed = 1;
      e.start();
    });
    const timer = setInterval(() => {
      if (engine.state.complete && engine.state.scenario === "home")
        act((e) => e.start());
    }, 1800);
    return () => clearInterval(timer);
  }, [automatic]);
  return (
    <div className="cinematic-stage spatial-stage">
      <Suspense
        fallback={
          <div className="scene-loading">Preparando o laboratório 3D…</div>
        }
      >
        <NetworkScene hero />
      </Suspense>
      <div className="scene-telemetry" aria-label="Estado atual da rede">
        <span>
          <i className={state.running ? "status-dot" : ""} />
          {state.running ? "AO VIVO" : "EM OBSERVAÇÃO"}
        </span>
        <span>
          <b>{state.devices.length.toString().padStart(2, "0")}</b> dispositivos
        </span>
        <span>
          <b>{state.metrics.delivered.toString().padStart(2, "0")}</b> entregas
        </span>
      </div>
      <button
        className="spatial-pause"
        onClick={() => {
          setAutomatic(!automatic);
          if (automatic) act((e) => e.pause());
        }}
      >
        {automatic ? "Pausar ambiente" : "Ativar ambiente"}
      </button>
      <div className="spatial-caption">
        <span>UMA REDE EM MOVIMENTO</span>
        <p>
          {state.complete
            ? "A página chegou. Uma rede inteira tornou isso possível."
            : "Acompanhe DNS, TCP e HTTP atravessando a rede."}
        </p>
        <small>
          Selecione um equipamento para inspecionar · entre no mundo 3D para
          explorar o laboratório
        </small>
      </div>
    </div>
  );
}
