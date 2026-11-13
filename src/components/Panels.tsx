import { useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ChevronRight,
  Search,
  X,
  Activity,
  ArrowDownToLine,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { act, useSimulation } from "../stores/useSimulation";
import { protocolColors } from "../data/content";
import type { Config, Protocol, NetworkDevice } from "../engine/types";
export function Controls() {
  const { state } = useSimulation();
  return (
    <div className="controls">
      <div className="playback">
        <button
          className="primary compact"
          onClick={() => act((e) => (state.running ? e.pause() : e.start()))}
        >
          {state.running ? <Pause size={16} /> : <Play size={16} />}
          <span>
            {state.running
              ? "Pausar"
              : state.complete
                ? "Reproduzir"
                : "Iniciar"}
          </span>
        </button>
        <button
          className="control-button"
          onClick={() => act((e) => e.step())}
          title="Próximo passo"
        >
          <SkipForward size={17} />
          <span>Próximo passo</span>
        </button>
        <button
          className="control-button"
          onClick={() => act((e) => e.reset())}
          title="Reiniciar"
        >
          <RotateCcw size={16} />
          <span>Reiniciar</span>
        </button>
      </div>
      <div className="time-controls">
        <span className="mono">
          {(state.time / 1000).toFixed(2)} <small>s virtuais</small>
        </span>
        <label className="speed">
          Velocidade{" "}
          <select
            aria-label="Velocidade"
            value={state.speed}
            onChange={(ev) =>
              act((e) => {
                e.state.speed = Number(ev.target.value);
              })
            }
          >
            {[0.25, 0.5, 1, 2, 4].map((v) => (
              <option key={v} value={v}>
                {v}×
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
export function Explanation() {
  const { state, technical } = useSimulation();
  const analogies: Record<string, string> = {
    DNS: "O DNS funciona como uma agenda: procuramos o nome para descobrir o endereço.",
    ENVIO: "A mensagem ganhou um envelope e começou sua viagem pela rede.",
    ENTREGA: "O envelope chegou. O destinatário pode interpretar o conteúdo.",
    MAC: "O switch anota por qual porta cada remetente aparece, como uma lista de salas.",
    FLOOD:
      "Sem saber a porta do destino, o switch mostra uma cópia às outras portas elegíveis.",
    ROTEAMENTO:
      "O roteador consulta o mapa de redes para escolher a próxima saída.",
    PERDA: "Um envelope não chegou. O resultado depende do protocolo usado.",
    TIMEOUT:
      "O remetente espera uma confirmação; sem resposta no prazo, pode tentar novamente.",
    RETRANSMISSÃO: "Uma nova cópia dos mesmos dados está fazendo a viagem.",
    BLOQUEADO: "A portaria da rede conferiu as regras e barrou esta mensagem.",
    FIREWALL: "A portaria encontrou uma regra que permite a passagem.",
    CONEXÃO: "Os dois lados combinaram que estão prontos para conversar.",
    ENCAPSULAMENTO:
      "A mensagem recebe as informações necessárias para cada parte da viagem.",
    DESENCAPSULAMENTO:
      "O destino interpreta as informações das camadas até recuperar a mensagem.",
    SDN: "Um controlador fornece as instruções; os equipamentos encaminham conforme a política.",
  };
  return (
    <section className="explanation panel">
      <div className="panel-kicker">
        <Radio size={15} />
        <span>O QUE ESTÁ ACONTECENDO?</span>
        <i className="status-dot" />
      </div>
      <span className="event-phase">{state.phase}</span>
      <h3 aria-live="polite">{state.explanation}</h3>
      <p>
        {technical
          ? state.detail
          : analogies[state.phase] ||
            state.detail ||
            "Avance um passo para ver a próxima decisão da rede."}
      </p>
      <div className="event-counter">
        <span>EVENTO {String(state.events.length).padStart(3, "0")}</span>
        <span className="mono">{(state.time / 1000).toFixed(3)} s</span>
      </div>
    </section>
  );
}
export function Slider({
  label,
  name,
  min,
  max,
  step = 1,
  unit = "",
}: {
  label: string;
  name: keyof Config;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  const value = useSimulation((s) => s.state.config[name]);
  return (
    <label className="slider-label">
      <span>
        {label}
        <b>
          {String(value)} {unit}
        </b>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={Number(value)}
        onChange={(ev) =>
          act((e) => e.configure({ [name]: Number(ev.target.value) }))
        }
      />
    </label>
  );
}
export function Toggle({ name, label }: { name: keyof Config; label: string }) {
  const value = Boolean(useSimulation((s) => s.state.config[name]));
  return (
    <label className="toggle-label">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(ev) =>
          act((e) => e.configure({ [name]: ev.target.checked }))
        }
      />
      <span className="toggle-track" />
    </label>
  );
}
export function Experiments() {
  const { state } = useSimulation();
  const c = state.config;
  const resetConfig = (value: Partial<Config>) =>
    act((e) => e.reset(state.scenario, { ...c, ...value }));
  return (
    <section className="panel experiments">
      <div className="panel-kicker">
        <SlidersHorizontal size={15} />
        <span>EXPERIMENTE</span>
      </div>
      {state.scenario === "osi" ? (
        <label className="field">
          Sua mensagem
          <input
            value={c.message}
            maxLength={120}
            onChange={(ev) =>
              act((e) => e.configure({ message: ev.target.value }))
            }
          />
        </label>
      ) : null}
      {state.scenario === "topology" ? (
        <>
          <label className="field">
            Desenho da rede
            <select
              value={c.topology}
              onChange={(ev) =>
                resetConfig({ topology: ev.target.value as Config["topology"] })
              }
            >
              <option value="star">Estrela</option>
              <option value="bus">Barramento</option>
              <option value="ring">Anel</option>
              <option value="mesh">Malha</option>
            </select>
          </label>
          <label className="field">
            Quantidade de nós
            <select
              value={c.count}
              onChange={(ev) => resetConfig({ count: Number(ev.target.value) })}
            >
              {[4, 5, 6, 7, 8].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Equipamento central
            <select
              value={c.central}
              onChange={(ev) =>
                resetConfig({ central: ev.target.value as Config["central"] })
              }
            >
              <option value="switch">Switch</option>
              <option value="hub">Hub</option>
            </select>
          </label>
          <label className="field">
            Origem
            <select
              value={c.source}
              onChange={(ev) =>
                act((e) => e.configure({ source: ev.target.value }))
              }
            >
              {state.devices
                .filter((d) => d.id !== "center")
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="field">
            Destino
            <select
              value={c.target}
              onChange={(ev) =>
                act((e) => e.configure({ target: ev.target.value }))
              }
            >
              {state.devices
                .filter((d) => d.id !== "center")
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </label>
          <button
            className="outline full"
            onClick={() =>
              act((e) => e.setLink(state.links[0].id, !state.links[0].active))
            }
          >
            {state.links[0]?.active
              ? "Desconectar primeiro enlace"
              : "Reconectar primeiro enlace"}
          </button>
        </>
      ) : null}
      {state.scenario === "media" ? (
        <>
          <div className="segmented">
            {[
              ["copper", "Cobre"],
              ["fiber", "Fibra"],
              ["wifi", "Wi-Fi"],
            ].map(([v, l]) => (
              <button
                key={v}
                className={c.medium === v ? "active" : ""}
                onClick={() =>
                  act((e) => e.configure({ medium: v as Config["medium"] }))
                }
              >
                {l}
              </button>
            ))}
          </div>
          <Slider
            label="Distância"
            name="distance"
            min={1}
            max={500}
            unit="m"
          />
          <Slider
            label="Interferência"
            name="interference"
            min={0}
            max={100}
            unit="%"
          />
        </>
      ) : null}
      {state.scenario === "security" ? (
        <>
          <label className="field">
            Porta de destino
            <input
              type="number"
              min={1}
              max={65535}
              value={c.port}
              onChange={(ev) =>
                act((e) =>
                  e.configure({
                    port: Math.max(1, Math.min(65535, Number(ev.target.value))),
                  }),
                )
              }
            />
          </label>
          <Toggle name="encrypted" label="Conteúdo protegido por TLS" />
          <Toggle name="ddos" label="Simular sobrecarga DDoS" />
          <p className="micro">
            Carga 100% virtual. Nenhuma requisição é enviada a serviços reais.
          </p>
        </>
      ) : null}
      {state.scenario === "trends" ? (
        <>
          <label className="field">
            Experiência
            <select
              value={c.trend}
              onChange={(ev) =>
                resetConfig({ trend: ev.target.value as Config["trend"] })
              }
            >
              <option value="iot">Internet das Coisas</option>
              <option value="cloud">Nuvem</option>
              <option value="sdn">SDN</option>
            </select>
          </label>
          {c.trend === "cloud" ? (
            <label className="field">
              Modelo de serviço
              <select
                value={c.cloud}
                onChange={(ev) =>
                  act((e) =>
                    e.configure({ cloud: ev.target.value as Config["cloud"] }),
                  )
                }
              >
                {["IaaS", "PaaS", "SaaS"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          ) : c.trend === "sdn" ? (
            <Toggle name="sdnAllowed" label="Controlador permite o fluxo" />
          ) : (
            <p className="micro">
              Quatro sensores publicam leituras fictícias. Clique nos pacotes
              para inspecionar os dados.
            </p>
          )}
        </>
      ) : null}
      {!["topology", "trends"].includes(state.scenario) && (
        <>
          <Slider
            label="Latência por enlace"
            name="latency"
            min={10}
            max={600}
            step={10}
            unit="ms"
          />
          {["media", "performance", "security"].includes(state.scenario) && (
            <Slider
              label="Largura de banda"
              name="bandwidth"
              min={1}
              max={100}
              unit="Mbit/s"
            />
          )}
          {["performance", "tcp", "media"].includes(state.scenario) && (
            <Slider
              label="Perda configurada"
              name="loss"
              min={0}
              max={50}
              unit="%"
            />
          )}
          {state.scenario === "performance" && (
            <>
              <Slider
                label="Tamanho da unidade"
                name="size"
                min={500}
                max={100000}
                step={500}
                unit="bytes"
              />
              <Slider
                label="Transmissões simultâneas"
                name="simultaneous"
                min={1}
                max={40}
              />
            </>
          )}
          {["home", "tcp", "web", "routing", "diagnostics", "lab"].includes(
            state.scenario,
          ) && <Toggle name="cable" label="Cabo conectado" />}
          {["web", "diagnostics"].includes(state.scenario) && (
            <Toggle name="dns" label="DNS disponível" />
          )}
          {["routing", "diagnostics"].includes(state.scenario) && (
            <>
              <Toggle name="gateway" label="Gateway configurado" />
              <Toggle name="route" label="Rota disponível" />
            </>
          )}
          {["home", "tcp", "web", "osi", "performance"].includes(
            state.scenario,
          ) && (
            <button
              className="danger-outline full"
              onClick={() =>
                act((e) =>
                  e.loseNext(
                    state.scenario === "web" || state.scenario === "home",
                  ),
                )
              }
            >
              ✧ Perder{" "}
              {state.scenario === "web" ? "fragmento HTTP" : "próximo pacote"}
            </button>
          )}
          {state.scenario === "routing" && (
            <button
              className="outline full"
              onClick={() => act((e) => e.clearMac())}
            >
              Limpar tabela MAC
            </button>
          )}
        </>
      )}
      <div className="experiment-note">
        <span>↳</span> Mude uma condição e observe a consequência.
      </div>
    </section>
  );
}
export function Metrics() {
  const m = useSimulation((s) => s.state.metrics);
  return (
    <div className="metric-strip">
      {[
        [Activity, "ENVIADOS", m.sent],
        [ArrowDownToLine, "ENTREGUES", m.delivered],
        [Radio, "PERDIDOS", m.lost + m.blocked],
        [RotateCcw, "RETRANSMISSÕES", m.retransmitted],
      ].map(([Icon, label, value]) => {
        const I = Icon as typeof Activity;
        return (
          <div key={String(label)}>
            <I size={16} />
            <span>
              <small>{String(label)}</small>
              <strong>{String(value)}</strong>
            </span>
          </div>
        );
      })}
    </div>
  );
}
export function Logs() {
  const { state, select } = useSimulation();
  const [filter, setFilter] = useState("");
  const events = state.events.filter((e) =>
    `${e.type} ${e.message}`.toLowerCase().includes(filter.toLowerCase()),
  );
  return (
    <section className="panel logs">
      <div className="panel-header">
        <div className="panel-kicker">
          <Activity size={15} />
          <span>REGISTRO DE EVENTOS</span>
          <b>{state.events.length}</b>
        </div>
        <label className="search compact">
          <Search size={14} />
          <input
            aria-label="Filtrar eventos"
            placeholder="Filtrar eventos…"
            value={filter}
            onChange={(ev) => setFilter(ev.target.value)}
          />
        </label>
      </div>
      <div className="log-scroll">
        {!events.length ? (
          <div className="empty-log">
            <span>●</span> Aguardando o primeiro sinal da rede…
          </div>
        ) : (
          events
            .slice()
            .reverse()
            .map((ev) => (
              <button
                className="log-line"
                key={ev.id}
                onClick={() => select(ev.packetId ?? ev.deviceId ?? null)}
              >
                <time>{(ev.time / 1000).toFixed(3)}s</time>
                <span
                  className={`log-type ${ev.type === "PERDA" || ev.type === "BLOQUEADO" ? "error" : ""}`}
                >
                  {ev.type}
                </span>
                <span>{ev.message}</span>
                <ChevronRight size={13} />
              </button>
            ))
        )}
      </div>
    </section>
  );
}
export function PacketTray() {
  const { state, select } = useSimulation();
  const packets = state.packets
    .filter((p) => !["FLOOD", "REPETIÇÃO"].includes(p.label))
    .slice(-6);
  if (!packets.length) return null;
  return (
    <div className="packet-tray" aria-label="Pacotes inspecionáveis">
      <span>INSPECIONAR</span>
      {packets.map((p) => (
        <button
          key={p.id}
          style={{
            color:
              p.status === "lost" || p.status === "blocked"
                ? "#f38d9a"
                : protocolColors[p.protocol],
          }}
          onClick={() => select(p.id)}
        >
          {p.id} · {p.label} ·{" "}
          {p.status === "transit"
            ? "em trânsito"
            : p.status === "delivered"
              ? "entregue"
              : p.status === "lost"
                ? "perdido"
                : p.status === "blocked"
                  ? "bloqueado"
                  : "na fila"}
        </button>
      ))}
    </div>
  );
}
export function Legend() {
  return (
    <div className="legend">
      {Object.entries(protocolColors)
        .filter(([k]) => !["ARP", "SDN"].includes(k))
        .map(([key, color]) => (
          <span key={key}>
            <i style={{ background: color }} />
            {key}
          </span>
        ))}
      <span>
        <i style={{ background: "#f17887" }} />
        Bloqueio / perda
      </span>
    </div>
  );
}
export function Inspector() {
  const { selected, select, state, follow, setFollow } = useSimulation();
  const p = state.packets.find((p) => p.id === selected),
    d = state.devices.find((d) => d.id === selected);
  if (!p && !d) return null;
  return (
    <aside className="inspector panel" aria-label="Inspeção">
      <div className="panel-header">
        <div className="panel-kicker">
          <Search size={15} />
          INSPECIONAR {p ? "PACOTE" : "EQUIPAMENTO"}
        </div>
        <button
          className="icon-button"
          aria-label="Fechar inspeção"
          onClick={() => select(null)}
        >
          <X size={18} />
        </button>
      </div>
      {p ? (
        <>
          <span
            className="packet-badge"
            style={{ color: protocolColors[p.protocol] }}
          >
            {p.id} · {p.protocol}
          </span>
          <h2>{p.label}</h2>
          <dl>
            {Object.entries({
              Estado: p.status,
              "IP origem": p.sourceIP,
              "IP destino": p.destinationIP,
              "MAC origem (salto atual)": p.sourceMAC,
              "MAC destino (salto atual)": p.destinationMAC,
              Portas: `${p.sourcePort} → ${p.destinationPort}`,
              Tamanho: `${p.size} bytes`,
              Tentativa: p.attempt + 1,
              ...p.headers,
            }).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <h4>Conteúdo didático</h4>
          <code className="payload">{p.payload}</code>
          <h4>Trajetória e decisões</h4>
          <ol className="history">
            {p.history.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ol>
          <button className="outline full" onClick={() => setFollow(!follow)}>
            {follow ? "Parar acompanhamento" : "Acompanhar na câmera"}
          </button>
        </>
      ) : d ? (
        <>
          <span className="packet-badge">{d.type.toUpperCase()}</span>
          <h2>{d.name}</h2>
          <dl>
            {Object.entries({
              IPv4: d.ip,
              MAC: d.mac,
              Gateway: d.gateway,
              Estado: d.active ? "Ligado" : "Desligado",
            }).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <button
            className="outline full"
            onClick={() => act((e) => e.setDevice(d.id, !d.active))}
          >
            {d.active ? "Desligar equipamento" : "Ligar equipamento"}
          </button>
          {d.type === "switch" && (
            <>
              <h4>Tabela MAC</h4>
              <MacTable d={d} />
            </>
          )}
          {d.routes.length > 0 && (
            <>
              <h4>Tabela de rotas</h4>
              {d.routes.map((r) => (
                <p className="mono micro" key={r.network}>
                  {r.network} → {r.interface} ({r.nextHop})
                </p>
              ))}
            </>
          )}
          {d.type === "firewall" && (
            <>
              <h4>Regras ativas</h4>
              {state.rules.map((r) => (
                <p className="mono micro" key={r.id}>
                  {r.action} {r.protocol}/{r.port || "*"}
                </p>
              ))}
            </>
          )}
          <h4>Enlaces</h4>
          {state.links
            .filter((l) => l.from === d.id || l.to === d.id)
            .map((l) => (
              <button
                key={l.id}
                className="link-switch"
                onClick={() => act((e) => e.setLink(l.id, !l.active))}
              >
                <span>
                  {l.from} ↔ {l.to}
                </span>
                <b className={l.active ? "green" : "red"}>
                  {l.active ? "ON" : "OFF"}
                </b>
              </button>
            ))}
        </>
      ) : null}
    </aside>
  );
}
export function MacTable({ d }: { d: NetworkDevice }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>MAC aprendido</th>
          <th>Porta</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(d.macTable).length ? (
          Object.entries(d.macTable).map(([mac, port]) => (
            <tr key={mac}>
              <td>{mac}</td>
              <td>{port}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={2}>Tabela vazia. Envie um quadro.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
export function ProtocolSelect({
  value,
  onChange,
}: {
  value: Protocol;
  onChange: (p: Protocol) => void;
}) {
  return (
    <select
      aria-label="Protocolo"
      value={value}
      onChange={(e) => onChange(e.target.value as Protocol)}
    >
      {["TCP", "UDP", "ICMP", "HTTP", "HTTPS"].map((p) => (
        <option key={p}>{p}</option>
      ))}
    </select>
  );
}
