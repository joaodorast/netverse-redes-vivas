import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Crosshair,
  Layers3,
  Monitor,
  Server,
} from "lucide-react";
import { layers } from "../data/content";
import { useSimulation } from "../stores/useSimulation";
const predictions = [
  {
    q: "A mensagem precisa atravessar redes diferentes. Quem cuida do endereçamento IP?",
    options: ["Transporte", "Rede", "Aplicação"],
    correct: 1,
    layer: 3,
    why: "A camada de Rede usa endereços IP para levar o pacote entre redes. O roteador decide o próximo salto.",
  },
  {
    q: "Qual camada representa o quadro como sinais no cabo ou no ar?",
    options: ["Física", "Sessão", "Enlace"],
    correct: 0,
    layer: 1,
    why: "A camada Física transmite sinais elétricos, ópticos ou de rádio. O quadro pertence ao Enlace; no meio ele vira sinais.",
  },
  {
    q: "Onde o TCP oferece confirmações e retransmissões?",
    options: ["Apresentação", "Rede", "Transporte"],
    correct: 2,
    layer: 4,
    why: "TCP atua no Transporte. Confirmações e retransmissões ajudam a entregar o fluxo de bytes em ordem.",
  },
];
const colors = [
  "#74dddf",
  "#7db7ff",
  "#9ba5ff",
  "#bba0ff",
  "#d29be8",
  "#eea5c8",
  "#ffc49b",
];
export function OsiWorkbench() {
  const { state, technical } = useSimulation();
  const [predictionIndex, setPredictionIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const prediction = predictions[predictionIndex];
  const [chosen, setChosen] = useState<number | null>(null);
  const layer = layers.find((l) => l.n === (chosen ?? state.osiLayer))!;
  const travelling = state.packets.some((p) => p.status === "transit");
  const side = state.osiDirection === "down" ? "source" : "destination";
  const stack = (destination: boolean) => (
    <section
      className={`osi-tower ${destination ? "destination" : "source"}`}
      aria-label={destination ? "Camadas no destino" : "Camadas na origem"}
    >
      <header>
        <span className="tower-device">
          {destination ? <Server size={22} /> : <Monitor size={22} />}
        </span>
        <div>
          <small>{destination ? "02 / DESTINO" : "01 / ORIGEM"}</small>
          <h3>{destination ? "Servidor" : "Seu computador"}</h3>
        </div>
        {destination ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
      </header>
      <div className="osi-stack-3d">
        {layers.map((l) => {
          const active =
            state.osiLayer === l.n &&
            side === (destination ? "destination" : "source");
          return (
            <button
              key={l.n}
              style={
                { "--layer-color": colors[l.n - 1] } as React.CSSProperties
              }
              aria-label={`${destination ? "Destino" : "Origem"}: camada ${l.n} ${l.name}`}
              aria-pressed={layer.n === l.n}
              className={`osi-slab ${active ? "is-active" : ""} ${layer.n === l.n ? "is-selected" : ""}`}
              onClick={() => setChosen(l.n)}
            >
              <b>{String(l.n).padStart(2, "0")}</b>
              <span>
                {l.name}
                <small>{l.protocol}</small>
              </span>
              <em>{l.pdu}</em>
              {active && <i className="slab-packet" />}
            </button>
          );
        })}
      </div>
      <footer>
        {destination
          ? "Reconstrói a mensagem"
          : "Adiciona estrutura à mensagem"}
        <span>{destination ? "Desencapsulamento" : "Encapsulamento"}</span>
      </footer>
    </section>
  );
  return (
    <section
      className="osi-workbench"
      aria-label="Jornada da mensagem pelas camadas OSI"
    >
      <div className="osi-workbench-heading">
        <div>
          <span className="eyebrow">ANATOMIA DE UMA CONEXÃO</span>
          <h2>Sete camadas. Uma mensagem.</h2>
          <p>
            Explore cada nível ou execute a simulação e acompanhe o percurso.
          </p>
        </div>
        <span className="osi-live-phase">
          <i className={state.running ? "status-dot" : ""} />
          {travelling
            ? "Atravessando a rede"
            : state.osiDirection === "down"
              ? "Origem → rede"
              : "Rede → destino"}
        </span>
      </div>
      <div className="osi-dual-stage">
        {stack(false)}
        <div className={`osi-bridge ${travelling ? "transmitting" : ""}`}>
          <Layers3 size={26} />
          <span>MEIO FÍSICO</span>
          <div className="bridge-wire">
            <i />
          </div>
          <b>
            {travelling ? "Mensagem em trânsito" : "Pronto para transmitir"}
          </b>
          <small>Cabos · switch · roteador</small>
          <ArrowRight size={20} />
        </div>
        {stack(true)}
      </div>
      <section className="prediction-card" aria-label="Teste sua intuição">
        <div className="prediction-question">
          <span className="eyebrow">SUA VEZ / {predictionIndex + 1} DE 3</span>
          <h3>{prediction.q}</h3>
          <p>Faça uma escolha e descubra o motivo.</p>
        </div>
        <div className="prediction-answers">
          {prediction.options.map((option, i) => (
            <button
              key={option}
              disabled={answer !== null}
              className={
                answer !== null && i === prediction.correct
                  ? "correct"
                  : answer === i
                    ? "incorrect"
                    : ""
              }
              onClick={() => setAnswer(i)}
            >
              <span>{String.fromCharCode(65 + i)}</span>
              {option}
            </button>
          ))}
        </div>
        {answer !== null && (
          <div className="prediction-feedback" role="status">
            <div>
              <b>
                {answer === prediction.correct
                  ? "Isso! Agora veja o porquê."
                  : "Boa hipótese. Vamos ajustar o raciocínio."}
              </b>
              <p>{prediction.why}</p>
            </div>
            <button
              className="outline"
              onClick={() => {
                setChosen(prediction.layer);
                document
                  .querySelector(".osi-inspection")
                  ?.scrollIntoView({
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "instant"
                      : "smooth",
                    block: "center",
                  });
              }}
            >
              Mostrar na pilha
            </button>
            <button
              className="primary"
              onClick={() => {
                setPredictionIndex((predictionIndex + 1) % predictions.length);
                setAnswer(null);
              }}
            >
              Próxima pergunta <ArrowRight size={14} />
            </button>
          </div>
        )}
      </section>
      <div className="osi-inspection">
        <section className="osi-inspector">
          <div className="osi-inspector-top">
            <span className="eyebrow">
              {chosen === null
                ? "ACOMPANHANDO A SIMULAÇÃO"
                : "EXPLORANDO A CAMADA"}
            </span>
            <button
              className="outline"
              onClick={() => setChosen(null)}
              disabled={chosen === null}
            >
              <Crosshair size={13} /> Seguir mensagem
            </button>
          </div>
          <div className="osi-detail-title">
            <b style={{ color: colors[layer.n - 1] }}>
              {String(layer.n).padStart(2, "0")}
            </b>
            <div>
              <small>CAMADA OSI</small>
              <h3>{layer.name}</h3>
            </div>
          </div>
          <p>{technical ? layer.text : layer.analogy}</p>
          <div className="osi-protocol-tag">{layer.protocol}</div>
          <small className="osi-detail-foot">{layer.text}</small>
        </section>
        <section className="osi-pdu">
          <span className="eyebrow">POR DENTRO DA MENSAGEM</span>
          <h3>A estrutura acompanha o percurso.</h3>
          <div className="pdu-assembly">
            {state.osiLayer <= 2 && (
              <span className="pdu-ethernet">Ethernet</span>
            )}
            {state.osiLayer <= 3 && <span className="pdu-ip">IP</span>}
            {state.osiLayer <= 4 && <span className="pdu-tcp">TCP</span>}
            <b>{state.config.message}</b>
          </div>
          {state.osiLayer === 1 ? (
            <code className="osi-bits">
              01001111 01101100 11000011 10100001
            </code>
          ) : (
            <div className="osi-pdu-state">
              <span>Camada ativa</span>
              <strong>{state.osiLayer} / 7</strong>
              <span>
                {state.osiDirection === "down"
                  ? "↓ Encapsulamento"
                  : "↑ Desencapsulamento"}
              </span>
            </div>
          )}
          <p>
            Estrutura didática. Nem toda camada acrescenta cabeçalhos; o meio
            físico representa o quadro como sinais.
          </p>
          <div className="tcpip-mapping">
            <span>TCP/IP</span>
            <b>
              Aplicação <small>5–7</small>
            </b>
            <b>
              Transporte <small>4</small>
            </b>
            <b>
              Internet <small>3</small>
            </b>
            <b>
              Acesso <small>1–2</small>
            </b>
          </div>
        </section>
      </div>
    </section>
  );
}
