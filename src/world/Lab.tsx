import ExpandPanel from "../components/ExpandPanel";
import Boot from "./Boot";
import type { Scenario } from "../engine/types";
import {
  lazy,
  Suspense,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Pause,
  Play,
  SlidersHorizontal,
  X,
  Expand,
  Minimize,
} from "lucide-react";
import { sections, layers } from "../data/content";
import { act, engine, useSimulation } from "../stores/useSimulation";
const LabCanvas = lazy(() => import("./LabCanvas"));
export default function Lab({
  onTerminal,
  active,
  onNavigate,
  onExitWorld,
}: {
  onTerminal: () => void;
  active: boolean;
  onNavigate: (id: Scenario) => void;
  onExitWorld: () => void;
}) {
  const { state, selected, select } = useSimulation();
  const root = useRef<HTMLElement>(null);
  const [full, setFull] = useState(false);
  useEffect(() => {
    const change = () =>
      setFull(
        document.fullscreenElement === root.current ||
          Boolean(root.current?.classList.contains("world-screen-fallback")),
      );
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);
  const openTerminal = () => {
    if (document.fullscreenElement)
      void document.exitFullscreen().then(onTerminal);
    else onTerminal();
  };
  const exitWorld = () => {
    if (document.fullscreenElement)
      void document.exitFullscreen().then(onExitWorld);
    else onExitWorld();
  };

  const [help, setHelp] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [stationOpen, setStationOpen] = useState(false);
  useEffect(() => {
    setStationOpen(false);
    setInfoOpen(false);
  }, [state.scenario]);
  const [debug, setDebug] = useState(false);
  const toggleDebug = useCallback(() => setDebug((v) => !v), []);
  useEffect(() => {
    if (state.scenario !== "home") return;
    act((e) => e.start());
    const timer = setInterval(() => {
      if (engine.state.complete && !document.hidden) act((e) => e.start());
    }, 1800);
    return () => clearInterval(timer);
  }, [state.scenario]);

  useEffect(() => {
    const open = () => {
      if (document.fullscreenElement)
        void document.exitFullscreen().then(onTerminal);
      else onTerminal();
    };
    document.addEventListener("world-terminal", open);
    return () => document.removeEventListener("world-terminal", open);
  }, [onTerminal]);
  const area = sections.find((s) => s.id === state.scenario);
  const layer = selected?.startsWith("layer-")
    ? layers.find((l) => l.n === Number(selected.slice(6)))
    : undefined;
  const device = state.devices.find((d) => d.id === selected);
  const [visited, setVisited] = useState<string[]>([]);
  useEffect(() => {
    if (device)
      setVisited((v) => (v.includes(device.id) ? v : [...v, device.id]));
  }, [device?.id]);

  return (
    <section ref={root} className="world-lab" aria-label="Mundo NETVERSE">
      <Boot />
      <Suspense
        fallback={
          <div className="world-boot" role="status">
            Carregando o módulo do laboratório…
          </div>
        }
      >
        <LabCanvas
          stationOpen={stationOpen}
          active={active}
          debug={debug}
          onDebug={toggleDebug}
        />
      </Suspense>
      <div className="world-shade" />
      <div className="world-viewbar">
        <button onClick={exitWorld}>← Ver telas</button>
        <button
          className="world-fullscreen"
          aria-label={
            full ? "Sair da tela cheia do mundo" : "Tela cheia do mundo 3D"
          }
          onClick={async () => {
            const panel = root.current;
            if (!panel) return;
            if (panel.classList.contains("world-screen-fallback")) {
              panel.classList.remove("world-screen-fallback");
              setFull(false);
              return;
            }
            if (document.fullscreenElement === panel) {
              await document.exitFullscreen();
              return;
            }
            try {
              if (!panel.requestFullscreen) throw Error("unsupported");
              await panel.requestFullscreen();
            } catch {
              panel.classList.add("world-screen-fallback");
              setFull(true);
            }
          }}
        >
          {full ? <Minimize size={17} /> : <Expand size={17} />}{" "}
          {full ? "Sair da tela cheia" : "Tela cheia"} <kbd>F11</kbd>
        </button>
      </div>
      <details className="world-minimap">
        <summary>Mapa do laboratório</summary>
        <div>
          {sections.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Viajar para ${s.short}`}
              aria-current={state.scenario === s.id ? "location" : undefined}
              onClick={() => onNavigate(s.id)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {s.short}
            </button>
          ))}
        </div>
      </details>
      <header className="world-zone">
        <span>{area?.tag ?? "LABORATÓRIO LIVRE"}</span>
        <h1>{area?.label ?? "Laboratório livre"}</h1>
        <p>{area?.description ?? "Crie e teste sua própria rede."}</p>
      </header>
      <aside
        className="world-task compact-explanation"
        data-expandable
        data-open={infoOpen}
      >
        <div className="explanation-toolbar">
          <button
            aria-expanded={infoOpen}
            onClick={() => setInfoOpen(!infoOpen)}
          >
            O que está acontecendo?
          </button>
          <ExpandPanel />
        </div>
        <div className="world-explanation-content">
          <small>{state.phase}</small>
          <h2>{state.explanation}</h2>
          <p>{state.detail}</p>
          <button onClick={openTerminal}>Ver detalhes da experiência</button>
        </div>
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
          <button onClick={openTerminal}>Explorar encapsulamento</button>
        </aside>
      )}
      {device && (
        <aside className="world-inspect" aria-label="Equipamento selecionado">
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
      <details className="world-equipment">
        <summary>
          Equipamentos <span>{Math.min(visited.length, 3)}/3 explorados</span>
        </summary>
        <div>
          {state.devices.map((d) => (
            <button
              key={d.id}
              aria-label={`Inspecionar no mundo ${d.name}`}
              aria-pressed={selected === d.id}
              onClick={() => select(d.id)}
            >
              {visited.includes(d.id) ? "✓ " : ""}
              {d.name}
            </button>
          ))}
        </div>
      </details>
      <footer className="world-dock">
        <time className="world-time" aria-label="Tempo virtual da simulação">
          {(state.time / 1000).toFixed(2)} s virtuais
        </time>
        <button
          className="outline"
          aria-pressed={stationOpen}
          onClick={() => setStationOpen(!stationOpen)}
        >
          <SlidersHorizontal size={15} />{" "}
          {stationOpen ? "Ocultar controles" : "Controles da cena"}
        </button>
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
