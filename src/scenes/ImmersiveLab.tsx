import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Box,
  Check,
  Crosshair,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { act, useSimulation } from "../stores/useSimulation";
const NetworkScene = lazy(() => import("../scenes/NetworkScene"));
export default function ImmersiveLab({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { state, selected, select } = useSimulation();
  const [visited, setVisited] = useState<string[]>([]);
  const [help, setHelp] = useState(true);
  const device = state.devices.find((d) => d.id === selected);
  useEffect(() => {
    dialog.current?.showModal();
    document.documentElement.dataset.immersive = "true";
    document.dispatchEvent(new Event("netverse-immersion"));
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.dataset.immersive = "false";
      document.dispatchEvent(new Event("netverse-immersion"));
      document.body.style.overflow = old;
    };
  }, []);
  useEffect(() => {
    if (selected && state.devices.some((d) => d.id === selected))
      setVisited((v) => (v.includes(selected) ? v : [...v, selected]));
  }, [selected, state.devices]);
  return (
    <dialog
      ref={dialog}
      className="immersive-lab"
      aria-label="Laboratório imersivo"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="immersive-world">
        <Suspense
          fallback={
            <div className="scene-loading">
              Abrindo as portas do laboratório…
            </div>
          }
        >
          <NetworkScene immersive />
        </Suspense>
      </div>
      <div className="immersive-vignette" />
      <header className="immersive-header">
        <div>
          <Box size={22} />
          <span>
            <b>
              NETVERSE <em>LAB</em>
            </b>
            <small>EXPLORAÇÃO IMERSIVA</small>
          </span>
          <i className="status-dot" />
        </div>
        <div>
          <button className="immersive-help" onClick={() => setHelp(!help)}>
            Como explorar
          </button>
          <button
            className="immersive-close"
            aria-label="Sair do laboratório imersivo"
            onClick={onClose}
          >
            <X size={19} />
            <span>Sair do laboratório</span>
            <kbd>Esc</kbd>
          </button>
        </div>
      </header>
      <section className="immersive-mission">
        <span className="eyebrow">SUA MISSÃO DE EXPLORAÇÃO</span>
        <h2>Entre. Observe. Descubra.</h2>
        <p>
          Selecione os equipamentos no ambiente e acompanhe o caminho da
          mensagem.
        </p>
        <div>
          <span className={visited.length >= 3 ? "done" : ""}>
            {visited.length >= 3 ? (
              <Check size={13} />
            ) : (
              <Crosshair size={13} />
            )}{" "}
            Inspecione 3 dispositivos <b>{Math.min(visited.length, 3)}/3</b>
          </span>
          <span className={state.metrics.delivered > 0 ? "done" : ""}>
            {state.metrics.delivered > 0 ? (
              <Check size={13} />
            ) : (
              <ArrowRight size={13} />
            )}{" "}
            Observe uma entrega <b>{state.metrics.delivered > 0 ? "✓" : "—"}</b>
          </span>
        </div>
      </section>
      {device && (
        <aside
          className="immersive-inspector"
          aria-label="Equipamento selecionado"
        >
          <span className="eyebrow">CONEXÃO ESTABELECIDA</span>
          <div>
            <h2>{device.name}</h2>
            <button
              aria-label="Fechar equipamento"
              onClick={() => select(null)}
            >
              <X size={16} />
            </button>
          </div>
          <p>
            {device.type === "router"
              ? "Encaminha pacotes entre redes usando endereços IP."
              : device.type === "switch"
                ? "Conecta equipamentos locais e aprende por qual porta alcançar cada MAC."
                : device.type === "server"
                  ? "Oferece serviços e responde às solicitações da rede."
                  : "Origina solicitações e recebe as respostas que tornam a rede útil."}
          </p>
          <dl>
            <div>
              <dt>ENDEREÇO IP</dt>
              <dd>{device.ip}</dd>
            </div>
            <div>
              <dt>MAC</dt>
              <dd>{device.mac}</dd>
            </div>
            <div>
              <dt>ESTADO</dt>
              <dd>{device.active ? "Conectado" : "Desativado"}</dd>
            </div>
          </dl>
          <span className="immersive-tip">
            Agora selecione outro dispositivo para comparar sua função.
          </span>
        </aside>
      )}
      {help && (
        <div className="immersive-instructions">
          <button
            aria-label="Fechar instruções de exploração"
            onClick={() => setHelp(false)}
          >
            <X size={13} />
          </button>
          <span>
            <kbd>W</kbd>
            <kbd>A</kbd>
            <kbd>S</kbd>
            <kbd>D</kbd> caminhar
          </span>
          <span>
            <Maximize2 size={13} /> Arraste para olhar · role para aproximar
          </span>
          <span>
            <Crosshair size={13} /> Clique em um equipamento para inspecionar
          </span>
        </div>
      )}
      <footer className="immersive-dock">
        <div
          className="immersive-device-list"
          aria-label="Equipamentos do laboratório"
        >
          {state.devices.map((d) => (
            <button
              key={d.id}
              aria-pressed={selected === d.id}
              onClick={() => select(d.id)}
            >
              <span className={visited.includes(d.id) ? "visited" : ""}>
                {visited.includes(d.id) ? (
                  <Check size={12} />
                ) : (
                  <Box size={12} />
                )}
              </span>
              {d.name}
            </button>
          ))}
        </div>
        <div className="immersive-playback">
          <button
            className="primary"
            onClick={() => act((e) => (state.running ? e.pause() : e.start()))}
          >
            {state.running ? <Pause size={15} /> : <Play size={15} />}{" "}
            {state.running ? "Pausar fluxo" : "Transmitir mensagem"}
          </button>
          <button
            className="outline"
            aria-label="Reiniciar fluxo imersivo"
            onClick={() => act((e) => e.reset(state.scenario))}
          >
            <RotateCcw size={15} />
          </button>
          <div className="immersive-stream">
            <span>
              <i className={state.running ? "status-dot" : ""} />
              {state.running ? "FLUXO AO VIVO" : "REDE EM OBSERVAÇÃO"}
            </span>
            <p>{state.explanation}</p>
          </div>
          <strong>
            {state.metrics.delivered}
            <small>ENTREGAS</small>
          </strong>
        </div>
      </footer>
    </dialog>
  );
}
