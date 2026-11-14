import { useEffect, useState } from "react";
import NetworkScene from "./NetworkScene";
import { act, engine, useSimulation } from "../stores/useSimulation";
export default function CinematicNetwork() {
  const [automatic, setAutomatic] = useState(true);
  const { state } = useSimulation();
  useEffect(() => {
    if (!automatic) return;
    act(e => { e.state.speed = 1; e.start(); });
    const timer = setInterval(() => {
      if (engine.state.complete && engine.state.scenario === "home") act(e => e.start());
    }, 1800);
    return () => clearInterval(timer);
  }, [automatic]);
  return <div className="cinematic-stage spatial-stage">
    <NetworkScene hero />
    <button className="spatial-pause" onClick={() => { setAutomatic(!automatic); if (automatic) act(e => e.pause()); }}>{automatic ? "Pausar ambiente" : "Ativar ambiente"}</button>
    <div className="spatial-caption"><span>UMA REDE EM MOVIMENTO</span><p>{state.complete ? "A página chegou. Uma rede inteira tornou isso possível." : "Acompanhe DNS, TCP e HTTP atravessando a rede."}</p><small>Arraste para explorar a profundidade · aproxime para ver os equipamentos</small></div>
  </div>;
}
