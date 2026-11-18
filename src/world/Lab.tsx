import { lazy, Suspense, useState, useEffect } from "react";
import { ArrowRight, Pause, Play, SlidersHorizontal, X } from "lucide-react";
import { sections, layers } from "../data/content";
import { act, useSimulation } from "../stores/useSimulation";
const LabCanvas = lazy(() => import("./LabCanvas"));
export default function Lab({
  onTerminal,
  active,
}: {
  onTerminal: () => void;
  active: boolean;
}) {
  const { state, selected, select } = useSimulation();
  const [help, setHelp] = useState(true);
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    document.addEventListener("world-terminal", onTerminal);
    return () => document.removeEventListener("world-terminal", onTerminal);
  }, [onTerminal]);
  const area = sections.find((s) => s.id === state.scenario);
  const layer = selected?.startsWith("layer-")
    ? layers.find((l) => l.n === Number(selected.slice(6)))
    : undefined;
  const device = state.devices.find((d) => d.id === selected);
  return (
    <section className="world-lab" aria-label="Mundo NETVERSE">
      <Suspense
        fallback={
          <div className="world-boot" role="status">
            Carregando o módulo do laboratório…
          </div>
        }
      >
        <LabCanvas
          active={active}
          debug={debug}
          onDebug={() => setDebug((v) => !v)}
        />
      </Suspense>
      <div className="world-shade" />
      <header className="world-zone">
        <span>{area?.tag ?? "LABORATÓRIO LIVRE"}</span>
        <h1>{area?.label ?? "Laboratório livre"}</h1>
        <p>{area?.description ?? "Crie e teste sua própria rede."}</p>
      </header>
      <aside className="world-task">
        <span>EXPLORE COM UM OBJETIVO</span>
        <h2>
          {state.scenario === "home"
            ? "O invisível está em movimento."
            : "Observe. Experimente. Entenda."}
        </h2>
        <p>{state.explanation}</p>
        <button onClick={onTerminal}>
          Abrir terminal da zona <ArrowRight size={15} />
        </button>
      </aside>
      {layer && (
        <aside className="world-inspect">
          <button aria-label="Fechar camada" onClick={() => select(null)}>
            <X size={14} />
          </button>
          <small>CAMADA {layer.n} / OSI</small>
          <h2>{layer.name}</h2>
          <p>{layer.text}</p>
          <dl>
            <dt>UNIDADE</dt>
            <dd>{layer.pdu}</dd>
            <dt>PROTOCOLOS</dt>
            <dd>{layer.protocol}</dd>
          </dl>
          <button onClick={onTerminal}>Explorar encapsulamento</button>
        </aside>
      )}
      {device && (
        <aside className="world-inspect">
          <button
            aria-label="Fechar inspeção no mundo"
            onClick={() => select(null)}
          >
            <X size={14} />
          </button>
          <small>EQUIPAMENTO SELECIONADO</small>
          <h2>{device.name}</h2>
          <dl>
            <dt>IP</dt>
            <dd>{device.ip}</dd>
            <dt>MAC</dt>
            <dd>{device.mac}</dd>
          </dl>
          <button
            onClick={() => act((e) => e.setDevice(device.id, !device.active))}
          >
            {device.active ? "Desligar equipamento" : "Ligar equipamento"}
          </button>
        </aside>
      )}
      {help && (
        <div className="world-help">
          <button
            aria-label="Fechar ajuda do mundo"
            onClick={() => setHelp(false)}
          >
            <X size={12} />
          </button>
          <b>Você está no laboratório.</b>
          <p>
            Arraste para explorar · role para aproximar · clique para
            inspecionar.
          </p>
          <small>
            Use as zonas à esquerda para viajar. O terminal preserva todos os
            experimentos.
          </small>
        </div>
      )}
      <div className="world-touch" aria-label="Mover no laboratório">
        {[
          ["KeyW", "↑"],
          ["KeyA", "←"],
          ["KeyS", "↓"],
          ["KeyD", "→"],
        ].map(([key, label]) => (
          <button
            key={key}
            aria-label={`Mover ${label}`}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              window.dispatchEvent(
                new CustomEvent("world-move", {
                  detail: { key, pressed: true },
                }),
              );
            }}
            onPointerUp={() =>
              window.dispatchEvent(
                new CustomEvent("world-move", {
                  detail: { key, pressed: false },
                }),
              )
            }
            onPointerCancel={() =>
              window.dispatchEvent(
                new CustomEvent("world-move", {
                  detail: { key, pressed: false },
                }),
              )
            }
          >
            {label}
          </button>
        ))}
      </div>
      <footer className="world-dock">
        <button
          className="outline world-lock"
          onClick={() => {
            const canvas =
              document.querySelector<HTMLCanvasElement>(".world-lab canvas");
            const request = canvas?.requestPointerLock();
            request?.catch(() => setHelp(true));
          }}
        >
          Olhar com mouse
        </button>
        <button
          className="primary"
          onClick={() => act((e) => (state.running ? e.pause() : e.start()))}
        >
          {state.running ? <Pause size={15} /> : <Play size={15} />}{" "}
          {state.running ? "Pausar simulação" : "Executar experiência"}
        </button>
        <button className="outline" onClick={() => act((e) => e.step())}>
          Avançar evento
        </button>
        <div>
          <b>{state.metrics.delivered}</b>
          <small>ENTREGAS</small>
        </div>
        <button className="outline" onClick={onTerminal}>
          <SlidersHorizontal size={15} /> Experimentos
        </button>
        <button
          className="world-debug-toggle"
          aria-pressed={debug}
          onClick={() => setDebug(!debug)}
        >
          P / Métricas 3D
        </button>
      </footer>
    </section>
  );
}
