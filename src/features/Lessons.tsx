import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Check,
  ChevronRight,
  Terminal,
  Shield,
  Plus,
  Trash2,
  Search,
  Download,
  Upload,
  Move,
} from "lucide-react";
import { act, engine, useSimulation } from "../stores/useSimulation";
import { glossary, questions } from "../data/content";
import { MacTable, ProtocolSelect } from "../components/Panels";
import { device } from "../engine/network";
import type { DeviceType, FirewallRule } from "../engine/types";
export { OsiWorkbench as OsiLesson } from "./OsiWorkbench";
export function TcpLesson() {
  const { state, select } = useSimulation();
  return (
    <div className="compare-grid">
      {["TCP", "UDP"].map((protocol) => {
        const packets = state.packets.filter(
          (p) =>
            p.protocol === protocol &&
            !["FLOOD", "REPETIÇÃO"].includes(p.label),
        );
        return (
          <section key={protocol} className="panel protocol-card">
            <span
              className={`protocol-title ${protocol === "UDP" ? "violet" : "blue"}`}
            >
              {protocol}
              <small>
                {protocol === "TCP"
                  ? "Uma conversa com confirmação"
                  : "Datagramas independentes"}
              </small>
            </span>
            <svg
              className="compare-lane"
              viewBox="0 0 300 75"
              aria-label={`Linha do tempo ${protocol}`}
            >
              <line
                x1="25"
                y1="35"
                x2="275"
                y2="35"
                stroke="#38516c"
                strokeWidth="2"
              />
              <text x="10" y="68" fill="#8ca4bc" fontSize="10">
                Cliente
              </text>
              <text x="250" y="68" fill="#8ca4bc" fontSize="10">
                Servidor
              </text>
              {packets.slice(-1).map((p) => {
                const progress =
                  p.status === "delivered"
                    ? 1
                    : p.status === "lost"
                      ? 0.55
                      : Math.max(
                          0,
                          Math.min(
                            1,
                            (state.time - p.start) / (p.end - p.start || 1),
                          ),
                        );
                const x =
                  p.source === "server"
                    ? 275 - 250 * progress
                    : 25 + 250 * progress;
                return (
                  <g
                    key={p.id}
                    onClick={() => select(p.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle
                      cx={x}
                      cy="35"
                      r="7"
                      fill={
                        p.status === "lost"
                          ? "#ed8292"
                          : protocol === "TCP"
                            ? "#79acff"
                            : "#bb9aee"
                      }
                    />
                    <text
                      x="150"
                      y="17"
                      textAnchor="middle"
                      fill="#acc4d9"
                      fontSize="10"
                    >
                      {p.label} · {p.status}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="handshake">
              {(protocol === "TCP"
                ? ["SYN", "SYN-ACK", "ACK", "TCP dados", "ACK dados"]
                : ["UDP dados"]
              ).map((label) => (
                <span
                  key={label}
                  className={
                    packets.some(
                      (p) => p.label === label && p.status === "delivered",
                    )
                      ? "done"
                      : ""
                  }
                >
                  {label}
                  <ChevronRight size={12} />
                </span>
              ))}
            </div>
            <div className="compare-metrics">
              <span>
                <b>{packets.length}</b>unidades enviadas
              </span>
              <span>
                <b>{packets.filter((p) => p.status === "delivered").length}</b>
                recebidas
              </span>
              <span>
                <b>{packets.filter((p) => p.status === "lost").length}</b>
                perdidas
              </span>
            </div>
            <p>
              {protocol === "TCP"
                ? "Abre conexão, confirma e reenvia dados que não chegaram. Ainda pode falhar quando a rede permanece indisponível."
                : "Não abre conexão nem confirma no transporte. Recuperação e ordenação podem ser implementadas pela aplicação."}
            </p>
            <button
              className="outline"
              onClick={() => {
                act((e) => {
                  e.loseNext();
                  e.send({
                    protocol: protocol as "TCP" | "UDP",
                    label: `${protocol} experimento`,
                    data: true,
                    reliable: protocol === "TCP",
                  });
                  e.state.running = true;
                });
              }}
            >
              Testar perda com {protocol}
            </button>
          </section>
        );
      })}
    </div>
  );
}
export function WebLesson() {
  const { state } = useSimulation();
  return (
    <section className="panel web-browser">
      <div className="browser-toolbar">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            act((e) => {
              if (
                e.state.running ||
                (e.state.packets.length > 0 && !e.state.complete)
              )
                e.restartTraffic();
              e.start();
            });
          }}
        >
          <span>◎</span>
          <input
            aria-label="Endereço da página"
            value={state.config.domain}
            onChange={(ev) =>
              act((e) => e.configure({ domain: ev.target.value }))
            }
          />
          <button type="submit">
            Acessar página <ChevronRight size={14} />
          </button>
        </form>
      </div>
      {state.pageReady ? (
        <div className="loaded-page">
          <span className="success-icon">
            <Check size={25} />
          </span>
          <div>
            <span className="eyebrow">HTTP 200 · OK</span>
            <h2>Olá, universo!</h2>
            <p>
              Esta página atravessou a sua rede. Os três fragmentos foram
              recebidos e confirmados.
            </p>
          </div>
          <span className="loaded-grid">✳</span>
        </div>
      ) : (
        <div className="page-progress">
          {["DNS", "SYN", "SYN-ACK", "ACK", "HTTP GET", "HTTP 200"].map(
            (label, i) => (
              <span
                key={label}
                className={
                  state.packets.some(
                    (p) =>
                      p.label.startsWith(label) && p.status === "delivered",
                  )
                    ? "done"
                    : ""
                }
              >
                <b>{String(i + 1).padStart(2, "0")}</b>
                {label}
              </span>
            ),
          )}
          <p>O conteúdo aparece quando o motor termina de entregar a página.</p>
        </div>
      )}
      <p className="browser-note">
        Modelo: HTTP/1.1 sobre TCP. HTTPS acrescenta TLS; HTTP/3 usa QUIC sobre
        UDP e segue outro fluxo.
      </p>
    </section>
  );
}
export function RoutingLesson() {
  const { state } = useSimulation();
  return (
    <div className="compare-grid">
      <section className="panel lesson">
        <h3>Switch · decisões de enlace</h3>
        {state.devices
          .filter((d) => d.type === "switch")
          .map((d) => (
            <MacTable key={d.id} d={d} />
          ))}
        <p className="micro">
          Aprende pela origem. Consulta o destino. Sem correspondência, faz
          flooding dentro do domínio local.
        </p>
      </section>
      <section className="panel lesson">
        <h3>Roteador · decisões de rede</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Rede</th>
              <th>Próximo salto</th>
              <th>Saída</th>
            </tr>
          </thead>
          <tbody>
            {state.config.route &&
              state.devices
                .find((d) => d.type === "router")
                ?.routes.map((r, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        className="route-input"
                        aria-label={`Prefixo da rota ${index + 1}`}
                        value={r.network}
                        onChange={(ev) =>
                          act((e) => {
                            e.state.devices.find(
                              (d) => d.type === "router",
                            )!.routes[index].network = ev.target.value;
                          })
                        }
                      />
                    </td>
                    <td>{r.nextHop}</td>
                    <td>{r.interface}</td>
                  </tr>
                ))}
          </tbody>
        </table>
        <p className="micro">
          192.168.10.0/24 → gateway 192.168.10.1 → 192.168.20.0/24. Os enlaces
          já têm resolução MAC simplificada.
        </p>
      </section>
    </div>
  );
}
export function TopologyLesson() {
  const { state } = useSimulation();
  const descriptions = {
    star: "Cada dispositivo usa um enlace até o centro. Um cabo afeta seu nó; o centro desligado afeta todos.",
    bus: "Modelo de meio compartilhado representado por um repetidor. Não há cálculo de colisões CSMA/CD; todos recebem o sinal.",
    ring: "Neste modelo o anel é bidirecional e usa busca de caminho. Uma quebra pode usar o sentido restante; não representa Token Ring.",
    mesh: "Há múltiplas conexões. A busca de caminho recalcula o trajeto entre enlaces ativos antes de cada envio.",
  };
  return (
    <section className="panel lesson">
      <h3>A forma muda o caminho</h3>
      <p>{descriptions[state.config.topology]}</p>
      <div className="link-grid">
        {state.links.map((l) => (
          <button
            key={l.id}
            className={l.active ? "" : "broken"}
            onClick={() => act((e) => e.setLink(l.id, !l.active))}
          >
            <i className={l.active ? "status-dot" : "status-dot red-bg"} />
            {l.from} ↔ {l.to}
            <span>{l.active ? "Conectado" : "Interrompido"}</span>
          </button>
        ))}
      </div>
      <p className="micro">
        Selecione o equipamento na cena para desligá-lo. Após uma alteração,
        envie uma nova mensagem para descobrir o caminho disponível.
      </p>
    </section>
  );
}
export function MediaLesson() {
  return (
    <div className="media-cards">
      {[
        [
          "copper",
          "↯",
          "Par trançado",
          "Sinal elétrico",
          "Econômico em redes locais. Sujeito a interferência; alcance depende da categoria e da instalação.",
        ],
        [
          "fiber",
          "⌁",
          "Fibra óptica",
          "Pulso de luz",
          "Adequada a longas distâncias e grandes capacidades. O sinal óptico não sofre interferência eletromagnética.",
        ],
        [
          "wifi",
          "◉",
          "Wi-Fi",
          "Onda de rádio",
          "Mobilidade e meio compartilhado. Distância, obstáculos e interferência podem prejudicar a comunicação.",
        ],
      ].map(([id, icon, title, subtitle, text]) => (
        <button
          className={`panel media-card ${engine.state.config.medium === id ? "chosen" : ""}`}
          key={id}
          onClick={() =>
            act((e) =>
              e.configure({ medium: id as "copper" | "fiber" | "wifi" }),
            )
          }
        >
          <span className="media-icon">{icon}</span>
          <h3>{title}</h3>
          <span className="eyebrow">{subtitle}</span>
          <p>{text}</p>
        </button>
      ))}
    </div>
  );
}
export function DiagnosticLesson() {
  const { state } = useSimulation();
  const [command, setCommand] = useState("ping 203.0.113.10"),
    [hint, setHint] = useState(0);
  return (
    <div className="diagnostic-layout">
      <section className="panel terminal">
        <div className="panel-kicker">
          <Terminal size={16} />
          NETVERSE OS <span className="terminal-tag">SIMULADO</span>
        </div>
        <pre aria-live="polite">{state.terminal.join("\n")}</pre>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            act((e) => e.command(command));
            setCommand("");
          }}
        >
          <span>❯</span>
          <input
            aria-label="Comando do terminal"
            value={command}
            onChange={(ev) => setCommand(ev.target.value)}
            autoComplete="off"
            placeholder="Digite um comando…"
          />
          <button type="submit" aria-label="Executar comando">
            <ChevronRight size={18} />
          </button>
        </form>
        <div className="terminal-examples">
          {[
            "ipconfig",
            "nslookup www.exemplo.com.br",
            "tracert 203.0.113.10",
          ].map((c) => (
            <button
              key={c}
              onClick={() => {
                setCommand(c);
                act((e) => e.command(c));
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </section>
      <section className="panel lesson">
        <span className="eyebrow">MISSÃO · DETETIVE DA REDE</span>
        <h3>O nome não resolve.</h3>
        <p>
          Descubra por que o computador alcança um IP, mas não consegue
          consultar o nome da página.
        </p>
        <button
          className="outline full"
          onClick={() =>
            act((e) => {
              e.reset("diagnostics");
              e.configure({ dns: false });
            })
          }
        >
          Preparar falha DNS
        </button>
        <button
          className="text-button"
          onClick={() => setHint(Math.min(3, hint + 1))}
        >
          Revelar dica {hint}/3 →
        </button>
        {hint > 0 && (
          <p className="micro">
            {
              [
                "",
                "Compare ping por IP com nslookup por nome.",
                "Confira a disponibilidade do servidor DNS no painel Experimente.",
                "Ative DNS disponível e execute nslookup www.exemplo.com.br novamente.",
              ][hint]
            }
          </p>
        )}
        {state.config.dns &&
          state.terminal.some((l) => l.includes("Address:")) && (
            <p className="success-message">
              <Check size={15} /> Resolução restaurada e verificada.
            </p>
          )}
      </section>
    </div>
  );
}
export function SecurityLesson() {
  const { state } = useSimulation();
  const update = (id: string, change: Partial<FirewallRule>) =>
    act((e) =>
      e.setRules(
        state.rules.map((r) => (r.id === id ? { ...r, ...change } : r)),
      ),
    );
  return (
    <section className="panel lesson">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">
            <Shield size={15} />
            POLÍTICA DO FIREWALL
          </div>
          <h3>Cada regra tem uma consequência.</h3>
        </div>
        <button
          className="outline"
          onClick={() =>
            act((e) =>
              e.setRules([
                ...state.rules,
                {
                  id: `regra-${state.rules.length + 1}-${state.events.length}`,
                  action: "allow",
                  protocol: "TCP",
                  port: 80,
                  source: "*",
                  destination: "*",
                },
              ]),
            )
          }
        >
          <Plus size={15} /> Nova regra
        </button>
      </div>
      <div className="rules-scroll">
        <table className="data-table rules">
          <thead>
            <tr>
              <th>Ação</th>
              <th>Protocolo</th>
              <th>Porta (0 = todas)</th>
              <th>IP origem (* = todos)</th>
              <th>IP destino</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {state.rules.map((r) => (
              <tr key={r.id}>
                <td>
                  <select
                    aria-label={`Ação ${r.id}`}
                    value={r.action}
                    onChange={(ev) =>
                      update(r.id, {
                        action: ev.target.value as "allow" | "deny",
                      })
                    }
                  >
                    <option value="allow">Permitir</option>
                    <option value="deny">Bloquear</option>
                  </select>
                </td>
                <td>
                  <select
                    aria-label={`Protocolo ${r.id}`}
                    value={r.protocol}
                    onChange={(ev) =>
                      update(r.id, {
                        protocol: ev.target.value as FirewallRule["protocol"],
                      })
                    }
                  >
                    {["any", "TCP", "UDP", "ICMP", "HTTP", "HTTPS"].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    aria-label={`Porta ${r.id}`}
                    type="number"
                    min="0"
                    max="65535"
                    value={r.port}
                    onChange={(ev) =>
                      update(r.id, {
                        port: Math.max(
                          0,
                          Math.min(65535, Number(ev.target.value)),
                        ),
                      })
                    }
                  />
                </td>
                <td>
                  <input
                    aria-label={`Origem ${r.id}`}
                    value={r.source}
                    onChange={(ev) => update(r.id, { source: ev.target.value })}
                  />
                </td>
                <td>
                  <input
                    aria-label={`Destino ${r.id}`}
                    value={r.destination}
                    onChange={(ev) =>
                      update(r.id, { destination: ev.target.value })
                    }
                  />
                </td>
                <td>
                  <button
                    aria-label={`Excluir ${r.id}`}
                    onClick={() =>
                      act((e) =>
                        e.setRules(state.rules.filter((v) => v.id !== r.id)),
                      )
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="micro">
        Primeira correspondência vence. Sem regra correspondente, bloquear.
        Filtro didático sem estado; HTTPS e HTTP são reconhecidos como
        aplicações sobre TCP.
      </p>
      <div className="security-comparison">
        <div>
          <span className="eyebrow">HTTP · OBSERVADOR</span>
          <code>mensagem=Olá, rede!</code>
          <p>Conteúdo legível no trajeto.</p>
        </div>
        <div>
          <span className="eyebrow">HTTPS · OBSERVADOR</span>
          <code>•••• ••••• •••• ••••</code>
          <p>
            Conteúdo protegido; IP, tamanhos e tempos continuam observáveis.
          </p>
        </div>
      </div>
      <div className="mission-tests">
        <button
          className="outline"
          onClick={() =>
            act((e) => {
              e.send({
                protocol: "TCP",
                label: "TESTE TELNET",
                port: 23,
                data: true,
              });
              e.state.running = true;
            })
          }
        >
          Testar Telnet / 23
        </button>
        <button
          className="outline"
          onClick={() =>
            act((e) => {
              e.send({
                protocol: "TCP",
                label: "TESTE HTTPS",
                port: 443,
                data: true,
              });
              e.state.running = true;
            })
          }
        >
          Testar HTTPS / 443
        </button>
        {state.packets.some(
          (p) => p.label === "TESTE TELNET" && p.status === "blocked",
        ) &&
          state.packets.some(
            (p) => p.label === "TESTE HTTPS" && p.status === "delivered",
          ) && (
            <span className="success-message">
              <Check size={15} /> Missão verificada: 100 pontos
            </span>
          )}
      </div>
    </section>
  );
}
export function PerformanceLesson() {
  const { state } = useSimulation();
  const [metric, setMetric] = useState("throughput");
  const metricNames: Record<string, string> = {
    throughput: "Vazão · Mbit/s",
    latency: "Latência média · ms",
    delivered: "Unidades entregues",
    lost: "Unidades perdidas",
    utilization: "Vazão / capacidade · %",
  };
  const last = state.samples.at(-1);
  return (
    <section className="panel lesson performance">
      <div className="panel-header">
        <div>
          <span className="eyebrow">VAZÃO EFETIVA · EVENTOS DO MOTOR</span>
          <h3>O caminho só é tão livre quanto seu gargalo.</h3>
        </div>
        <strong className="throughput">
          {last?.throughput.toFixed(3) ?? "0.000"}
          <small>Mbit/s</small>
        </strong>
      </div>
      <label className="chart-picker">
        Visualizar
        <select
          aria-label="Métrica do gráfico"
          value={metric}
          onChange={(ev) => setMetric(ev.target.value)}
        >
          {Object.entries(metricNames).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={state.samples}>
            <defs>
              <linearGradient id="fillThroughput" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#50dec7" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#50dec7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1c2a3e" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#7890a8"
              tick={{ fontSize: 11 }}
              unit="s"
            />
            <YAxis stroke="#7890a8" tick={{ fontSize: 11 }} width={55} />
            <Tooltip
              contentStyle={{
                background: "#101d2e",
                border: "1px solid #304158",
                borderRadius: 8,
              }}
              labelFormatter={(v) => `${v} s virtuais`}
            />
            <Area
              type="stepAfter"
              dataKey={metric}
              name={metricNames[metric]}
              stroke="#50dec7"
              fill="url(#fillThroughput)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="performance-stats">
        <span>
          <b>{state.config.bandwidth} Mbit/s</b>capacidade dos enlaces
        </span>
        <span>
          <b>{state.config.bandwidth / 4} Mbit/s</b>gargalo até o servidor
        </span>
        <span>
          <b>{(last?.latency ?? 0).toFixed(1)} ms</b>latência média de entrega
        </span>
        <span>
          <b>{(last?.utilization ?? 0).toFixed(1)}%</b>vazão / banda configurada
        </span>
      </div>
      <p className="micro">
        Vazão acumulada = bits entregues ÷ tempo virtual. Transmissão = 8 ×
        bytes ÷ bit/s. Cada enlace tem fila de serialização. Unidades acima de
        MTU são blocos agregados didáticos, sem fragmentação IP.
      </p>
    </section>
  );
}
export function TrendsLesson() {
  const { state } = useSimulation();
  return (
    <section className="panel lesson">
      <div className="panel-header">
        <h3>Infraestrutura, plataforma ou aplicação?</h3>
        <span className="chip">{state.config.trend.toUpperCase()}</span>
      </div>
      <table className="data-table cloud-table">
        <thead>
          <tr>
            <th>Responsabilidade</th>
            <th>IaaS</th>
            <th>PaaS</th>
            <th>SaaS</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Infraestrutura", "Provedor", "Provedor", "Provedor"],
            ["Sistema e runtime", "Usuário", "Provedor", "Provedor"],
            ["Aplicação", "Usuário", "Usuário", "Provedor"],
            [
              "Dados e configurações",
              "Compartilhada",
              "Compartilhada",
              "Compartilhada",
            ],
          ].map((row) => (
            <tr key={row[0]}>
              {row.map((v, i) => (
                <td key={i}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Em IoT, os sensores publicam leituras na plataforma. Em SDN, um pacote
        de controle instala a política antes do envio de dados. Troque a
        experiência no painel e execute novamente.
      </p>
    </section>
  );
}
export function GlossaryLesson() {
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("Todos"),
    [index, setIndex] = useState(0),
    [answers, setAnswers] = useState<number[]>([]);
  const current = questions[index],
    answered = answers[index] !== undefined,
    finished = index >= questions.length,
    score = answers.filter((a, i) => a === questions[i].answer).length;
  return (
    <div className="knowledge-layout">
      <section className="panel lesson quiz">
        <div className="panel-kicker">
          ✧ DESAFIO DE CONHECIMENTO{" "}
          <span>
            {Math.min(index + 1, questions.length)}/{questions.length}
          </span>
        </div>
        <div className="quiz-progress">
          <span
            style={{ width: `${(answers.length / questions.length) * 100}%` }}
          />
        </div>
        {finished ? (
          <>
            <span className="quiz-trophy">✳</span>
            <h2>{score} conexões corretas.</h2>
            <p>
              Você acertou {score} de {questions.length} questões. Revise os
              conceitos no glossário e explore novamente os experimentos.
            </p>
            <button
              className="primary"
              onClick={() => {
                setIndex(0);
                setAnswers([]);
              }}
            >
              Recomeçar quiz
            </button>
          </>
        ) : (
          <>
            <span className="eyebrow">
              QUESTÃO {String(index + 1).padStart(2, "0")}
            </span>
            <h2>{current.question}</h2>
            <div className="quiz-options">
              {current.options.map((o, i) => (
                <button
                  disabled={answered}
                  key={o}
                  className={
                    answered
                      ? i === current.answer
                        ? "correct"
                        : i === answers[index]
                          ? "incorrect"
                          : ""
                      : ""
                  }
                  onClick={() => setAnswers([...answers, i])}
                >
                  <span>{String.fromCharCode(65 + i)}</span>
                  {o}
                  {answered && i === current.answer && <Check size={17} />}
                </button>
              ))}
            </div>
            {answered && (
              <div className="quiz-feedback">
                <b>
                  {answers[index] === current.answer
                    ? "Conexão estabelecida!"
                    : "Vamos reconectar esse conceito."}
                </b>
                <p>{current.explanation}</p>
                <button className="primary" onClick={() => setIndex(index + 1)}>
                  {index === questions.length - 1
                    ? "Ver resultado"
                    : "Próxima questão"}
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            <div className="quiz-score">
              {score} acertos · {answers.length} respondidas
            </div>
          </>
        )}
      </section>
      <section className="panel lesson glossary">
        <div className="panel-header">
          <h3>Dicionário da rede</h3>
          <span className="chip">{glossary.length} conceitos</span>
        </div>
        <label className="search">
          <Search size={16} />
          <input
            placeholder="Busque IP, DNS, latência…"
            aria-label="Buscar no glossário"
            value={search}
            onChange={(ev) => setSearch(ev.target.value)}
          />
        </label>
        <div className="glossary-categories">
          <select
            aria-label="Categoria do glossário"
            value={category}
            onChange={(ev) => setCategory(ev.target.value)}
          >
            {["Todos", ...new Set(glossary.map((g) => g.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="glossary-list">
          {glossary
            .filter(
              (g) =>
                (category === "Todos" || g.category === category) &&
                `${g.term} ${g.meaning} ${g.definition}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
            )
            .map((g) => (
              <details key={g.term}>
                <summary>
                  <b>{g.term}</b>
                  <span>{g.meaning}</span>
                  <Plus size={14} />
                </summary>
                <p>{g.definition}</p>
                <div className="glossary-example">
                  EXEMPLO <span>{g.example}</span>
                </div>
              </details>
            ))}
        </div>
      </section>
    </div>
  );
}
export function Laboratory() {
  const { state, selected, select } = useSimulation();
  const [kind, setKind] = useState<DeviceType>("pc"),
    [from, setFrom] = useState("pc"),
    [to, setTo] = useState("server"),
    [error, setError] = useState("");
  const selectedDevice = state.devices.find((d) => d.id === selected);
  const exportFile = () => {
    try {
      const url = URL.createObjectURL(
        new Blob([engine.exportLab()], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "netverse-laboratorio.json";
      a.click();
      URL.revokeObjectURL(url);
      setError("");
    } catch (err) {
      setError(String(err));
    }
  };
  return (
    <section className="panel lesson lab">
      <div className="panel-header">
        <h3>Construa sua própria conexão.</h3>
        <div className="button-row">
          <button className="outline" onClick={exportFile}>
            <Download size={15} />
            Salvar JSON
          </button>
          <label className="outline upload">
            <Upload size={15} />
            Carregar
            <input
              type="file"
              aria-label="Carregar topologia JSON"
              accept=".json"
              onChange={async (ev) => {
                const file = ev.target.files?.[0];
                if (!file) return;
                try {
                  if (file.size > 100000)
                    throw Error("Arquivo maior que 100 KB");
                  const raw = await file.text();
                  act((e) => e.importLab(raw));
                  setError("");
                } catch (err) {
                  setError(String(err));
                }
              }}
            />
          </label>
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="lab-controls">
        <select
          aria-label="Tipo de equipamento"
          value={kind}
          onChange={(ev) => setKind(ev.target.value as DeviceType)}
        >
          {["pc", "switch", "router", "server", "firewall"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <button
          className="outline"
          disabled={state.devices.length >= 30}
          onClick={() => {
            const id = `device${state.devices.length + 1}`;
            act((e) =>
              e.addDevice(
                device(
                  id,
                  `${kind.toUpperCase()} ${state.devices.length + 1}`,
                  kind,
                  [(state.devices.length % 5) * 2 - 4, 0, 4],
                  `192.168.10.${state.devices.length + 10}`,
                ),
              ),
            );
            select(id);
          }}
        >
          <Plus size={15} />
          Adicionar
        </button>
        <select
          aria-label="Conectar origem"
          value={from}
          onChange={(ev) => setFrom(ev.target.value)}
        >
          {state.devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <span>↔</span>
        <select
          aria-label="Conectar destino"
          value={to}
          onChange={(ev) => setTo(ev.target.value)}
        >
          {state.devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <button
          className="outline"
          onClick={() => act((e) => e.addLink(from, to))}
        >
          Conectar
        </button>
      </div>
      <div className="lab-map">
        <svg
          viewBox="0 0 800 320"
          onPointerMove={(ev) => {
            if (ev.buttons !== 1 || !selectedDevice) return;
            const rect = ev.currentTarget.getBoundingClientRect();
            act((e) => {
              const d = e.state.devices.find((d) => d.id === selected)!;
              d.position = [
                Math.max(
                  -8,
                  Math.min(
                    8,
                    (((ev.clientX - rect.left) / rect.width) * 800 - 400) / 40,
                  ),
                ),
                0,
                Math.max(
                  -4,
                  Math.min(
                    4,
                    (((ev.clientY - rect.top) / rect.height) * 320 - 160) / 30,
                  ),
                ),
              ];
            });
          }}
        >
          {state.links.map((l) => {
            const a = state.devices.find((d) => d.id === l.from)!,
              b = state.devices.find((d) => d.id === l.to)!;
            return (
              <line
                key={l.id}
                x1={400 + a.position[0] * 40}
                y1={160 + a.position[2] * 30}
                x2={400 + b.position[0] * 40}
                y2={160 + b.position[2] * 30}
                stroke={l.active ? "#315b74" : "#a44757"}
                strokeWidth="2"
              />
            );
          })}
          {state.devices.map((d) => (
            <g
              key={d.id}
              transform={`translate(${400 + d.position[0] * 40},${160 + d.position[2] * 30})`}
              onPointerDown={(ev) => {
                ev.currentTarget.setPointerCapture(ev.pointerId);
                select(d.id);
              }}
            >
              <rect
                x="-25"
                y="-18"
                width="50"
                height="36"
                rx="6"
                fill={selected === d.id ? "#17475b" : "#142437"}
                stroke="#4daab5"
              />
              <text textAnchor="middle" y="4" fill="#d4f4f7" fontSize="10">
                {d.type}
              </text>
              <text textAnchor="middle" y="32" fill="#9caec2" fontSize="10">
                {d.id}
              </text>
            </g>
          ))}
        </svg>
        <span>
          <Move size={14} />
          Arraste os equipamentos para posicionar
        </span>
      </div>
      {selectedDevice && (
        <div className="lab-device-config">
          <label className="field">
            IP do equipamento
            <input
              aria-label="IP do equipamento"
              value={selectedDevice.ip}
              onChange={(ev) => {
                const ip = ev.target.value;
                act((e) => {
                  e.state.devices.find((d) => d.id === selected)!.ip = ip;
                });
              }}
            />
          </label>
          <p className="micro">
            Selecione enlaces na inspeção para desconectar. Os endereços devem
            ser IPv4 válidos antes de salvar.
          </p>
        </div>
      )}
      <div className="lab-controls">
        <span>Enviar</span>
        <select
          aria-label="Origem do pacote"
          value={state.config.source}
          onChange={(ev) =>
            act((e) => e.configure({ source: ev.target.value }))
          }
        >
          {state.devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <span>→</span>
        <select
          aria-label="Destino do pacote"
          value={state.config.target}
          onChange={(ev) =>
            act((e) => e.configure({ target: ev.target.value }))
          }
        >
          {state.devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <ProtocolSelect
          value={state.config.protocol}
          onChange={(protocol) => act((e) => e.configure({ protocol }))}
        />
        <button
          className="primary"
          onClick={() =>
            act((e) => {
              e.send({
                source: state.config.source,
                destination: state.config.target,
                protocol: state.config.protocol,
                label: "LAB · DADOS",
                data: true,
              });
              e.state.running = true;
            })
          }
        >
          Enviar pacote
        </button>
      </div>
    </section>
  );
}
