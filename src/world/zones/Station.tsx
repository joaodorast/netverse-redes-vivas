import { Html } from "@react-three/drei";
import { useState, useEffect, type ReactNode } from "react";
import { act, useSimulation } from "../../stores/useSimulation";
import { questions, glossary, layers } from "../../data/content";
import type { Config } from "../../engine/types";
function Surface({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Html
      transform
      position={[0, 1.35, 4]}
      rotation={[-0.12, 0, 0]}
      distanceFactor={7}
      zIndexRange={[6, 2]}
    >
      <section
        className="zone-station"
        aria-label={title}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <header>
          <span className="station-led" />
          {title}
          <small>TERMINAL LOCAL</small>
        </header>
        {children}
      </section>
    </Html>
  );
}
function Run() {
  const running = useSimulation((s) => s.state.running);
  return (
    <button
      className="station-primary"
      onClick={() => act((e) => (running ? e.pause() : e.start()))}
    >
      {running ? "Pausar experiência" : "Executar e observar"}
    </button>
  );
}
function Select({
  field,
  options,
}: {
  field: keyof Config;
  options: readonly string[];
}) {
  const value = useSimulation((s) => s.state.config[field]);
  return (
    <select
      aria-label={`Configurar ${field}`}
      value={String(value)}
      onChange={(ev) =>
        act((e) =>
          e.reset(e.state.scenario, {
            ...e.state.config,
            [field]: ev.target.value,
          }),
        )
      }
    >
      {options.map((v) => (
        <option key={v}>{v}</option>
      ))}
    </select>
  );
}
export default function Station({ id }: { id: string }) {
  const { state } = useSimulation();
  const [layoutStatus, setLayoutStatus] = useState("");
  useEffect(() => {
    const done = () =>
      setLayoutStatus("Mapa organizado. As conexões foram preservadas.");
    const failed = () =>
      setLayoutStatus(
        "Não foi possível organizar. Você pode arrastar os equipamentos.",
      );
    document.addEventListener("world-layout-done", done);
    document.addEventListener("world-layout-failed", failed);
    return () => {
      document.removeEventListener("world-layout-done", done);
      document.removeEventListener("world-layout-failed", failed);
    };
  }, []);
  const [command, setCommand] = useState("ping 203.0.113.10");
  const [search, setSearch] = useState("");
  const [question, setQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const q = questions[question];
  if (id === "home")
    return (
      <Surface title="Mesa de missões">
        <h2>Restaure a rede do laboratório.</h2>
        <p>
          Escolha um problema, provoque uma mudança e veja o resultado real.
        </p>
        <button
          className="station-primary"
          onClick={() => document.dispatchEvent(new Event("world-missions"))}
        >
          Escolher missão guiada
        </button>
        <button
          onClick={() => document.dispatchEvent(new Event("world-terminal"))}
        >
          Conhecer as jornadas
        </button>
      </Surface>
    );
  if (id === "osi")
    return (
      <Surface title="Anatomia do pacote">
        <div className="station-step">
          <b>{state.osiLayer}</b>
          <span>
            {layers.find((l) => l.n === state.osiLayer)?.name}
            <small>
              {state.osiDirection === "down"
                ? "Origem / encapsulamento"
                : "Destino / desencapsulamento"}
            </small>
          </span>
        </div>
        <label>
          Mensagem
          <input
            aria-label="Mensagem no terminal OSI"
            value={state.config.message}
            maxLength={100}
            onChange={(ev) =>
              act((e) => e.configure({ message: ev.target.value }))
            }
          />
        </label>
        <div className="station-pdu">
          {state.osiLayer <= 2 && <span>Ethernet</span>}
          {state.osiLayer <= 3 && <span>IP</span>}
          {state.osiLayer <= 4 && <span>{state.config.protocol}</span>}
          <b>{state.config.message}</b>
        </div>
        {state.osiLayer === 1 && (
          <p>Na camada Física, o quadro é transmitido como sinais no meio.</p>
        )}
        <Run />
      </Surface>
    );
  if (id === "tcp")
    return (
      <Surface title="Bancada de transporte">
        <h2>Perder não é o fim da conversa.</h2>
        <div className="station-stats">
          <span>
            TCP reenvios <b>{state.metrics.retransmitted}</b>
          </span>
          <span>
            Perdas <b>{state.metrics.lost}</b>
          </span>
        </div>
        <button onClick={() => act((e) => e.loseNext())}>
          Preparar perda do próximo pacote
        </button>
        <p>
          TCP confirma e pode retransmitir; UDP não faz isso automaticamente.
        </p>
        <Run />
      </Surface>
    );
  if (id === "web")
    return (
      <Surface title="Navegador do laboratório">
        <label>
          Destino
          <input
            aria-label="Domínio na estação web"
            value={state.config.domain}
            onChange={(ev) =>
              act((e) => e.configure({ domain: ev.target.value }))
            }
          />
        </label>
        <div className="station-stats">
          <span>
            Fragmentos confirmados <b>{state.metrics.acknowledged}/3</b>
          </span>
          <span>
            Estado <b>{state.pageReady ? "HTTP 200" : "Aguardando"}</b>
          </span>
        </div>
        <button onClick={() => act((e) => e.loseNext(true))}>
          Perder um fragmento HTTP
        </button>
        <Run />
      </Surface>
    );
  if (id === "routing")
    return (
      <Surface title="Mesa de encaminhamento">
        <table>
          <thead>
            <tr>
              <th>Prefixo</th>
              <th>Interface</th>
            </tr>
          </thead>
          <tbody>
            {state.devices
              .find((d) => d.type === "router")
              ?.routes.map((r, i) => (
                <tr key={i}>
                  <td>
                    <input
                      aria-label={`Prefixo espacial ${i + 1}`}
                      value={r.network}
                      onChange={(ev) =>
                        act((e) => {
                          const route = e.state.devices.find(
                            (d) => d.type === "router",
                          )?.routes[i];
                          if (route) route.network = ev.target.value;
                        })
                      }
                    />
                  </td>
                  <td>{r.interface}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <p>
          {
            Object.keys(
              state.devices.find((d) => d.type === "switch")?.macTable ?? {},
            ).length
          }{" "}
          endereços MAC aprendidos.
        </p>
        <button onClick={() => act((e) => e.clearMac())}>
          Limpar tabela MAC e observar flooding
        </button>
        <Run />
      </Surface>
    );
  if (id === "topology")
    return (
      <Surface title="Mesa de topologias">
        <label>
          Topologia
          <Select field="topology" options={["star", "bus", "ring", "mesh"]} />
        </label>
        <button
          onClick={() => {
            setLayoutStatus("Organizando o mapa…");
            document.dispatchEvent(new Event("world-arrange"));
          }}
        >
          Organizar grafo automaticamente
        </button>
        {layoutStatus && <p role="status">{layoutStatus}</p>}
        <p>
          Arraste um equipamento para reorganizar o mapa. Clique em um cabo para
          interromper ou reconectar.
        </p>
        <div className="station-stats">
          <span>
            Nós <b>{state.devices.length}</b>
          </span>
          <span>
            Enlaces ativos{" "}
            <b>
              {state.links.filter((l) => l.active).length}/{state.links.length}
            </b>
          </span>
        </div>
        <Run />
      </Surface>
    );
  if (id === "media")
    return (
      <Surface title="Bancada dos sinais">
        <label>
          Meio físico
          <Select field="medium" options={["copper", "fiber", "wifi"]} />
        </label>
        <label>
          Distância: {state.config.distance} m
          <input
            type="range"
            aria-label="Distância na bancada"
            min={1}
            max={500}
            value={state.config.distance}
            onChange={(ev) =>
              act((e) => e.configure({ distance: Number(ev.target.value) }))
            }
          />
        </label>
        <label>
          Interferência: {state.config.interference}
          <input
            type="range"
            aria-label="Interferência na bancada"
            min={0}
            max={80}
            value={state.config.interference}
            onChange={(ev) =>
              act((e) => e.configure({ interference: Number(ev.target.value) }))
            }
          />
        </label>
        <p>
          Modelo didático de perda; não é um orçamento óptico ou de rádio
          calibrado.
        </p>
        <Run />
      </Surface>
    );
  if (id === "diagnostics")
    return (
      <Surface title="Console de diagnóstico">
        <pre className="station-console">
          {state.terminal.slice(-4).join("\n")}
        </pre>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            act((e) => {
              e.command(command);
              e.state.running = true;
            });
          }}
        >
          <label>
            Comando
            <input
              aria-label="Comando no console espacial"
              value={command}
              onChange={(ev) => setCommand(ev.target.value)}
            />
          </label>
          <button className="station-primary">Executar diagnóstico</button>
        </form>
      </Surface>
    );
  if (id === "security")
    return (
      <Surface title="Inspeção da fronteira">
        <div className="station-rules">
          {state.rules.map((r) => (
            <label key={r.id}>
              {r.protocol} / {r.port}
              <select
                aria-label={`Regra espacial ${r.id}`}
                value={r.action}
                onChange={(ev) =>
                  act((e) =>
                    e.setRules(
                      e.state.rules.map((rule) =>
                        rule.id === r.id
                          ? {
                              ...rule,
                              action: ev.target.value as "allow" | "deny",
                            }
                          : rule,
                      ),
                    ),
                  )
                }
              >
                <option value="allow">Permitir</option>
                <option value="deny">Bloquear</option>
              </select>
            </label>
          ))}
        </div>
        <div className="station-buttons">
          {[23, 443].map((port) => (
            <button
              key={port}
              onClick={() =>
                act((e) => {
                  e.send({
                    protocol: "TCP",
                    label: port === 23 ? "TESTE TELNET" : "TESTE HTTPS",
                    port,
                    data: true,
                  });
                  e.state.running = true;
                })
              }
            >
              Testar {port}
            </button>
          ))}
        </div>
        <p>{state.metrics.blocked} bloqueios decididos pelo motor.</p>
      </Surface>
    );
  if (id === "performance")
    return (
      <Surface title="Observatório de desempenho">
        <div className="station-stats">
          <span>
            Vazão acumulada{" "}
            <b>{state.samples.at(-1)?.throughput.toFixed(3) ?? "0"} Mbit/s</b>
          </span>
          <span>
            Unidades perdidas <b>{state.metrics.lost}</b>
          </span>
        </div>
        <label>
          Banda: {state.config.bandwidth} Mbit/s
          <input
            type="range"
            aria-label="Banda no observatório"
            min={1}
            max={100}
            value={state.config.bandwidth}
            onChange={(ev) =>
              act((e) => e.configure({ bandwidth: Number(ev.target.value) }))
            }
          />
        </label>
        <Run />
      </Surface>
    );
  if (id === "trends")
    return (
      <Surface title="Laboratório de arquiteturas">
        <label>
          Instalação
          <Select field="trend" options={["iot", "cloud", "sdn"]} />
        </label>
        {state.config.trend === "cloud" ? (
          <label>
            Serviço
            <Select field="cloud" options={["IaaS", "PaaS", "SaaS"]} />
          </label>
        ) : state.config.trend === "sdn" ? (
          <button
            aria-pressed={state.config.sdnAllowed}
            onClick={() =>
              act((e) =>
                e.configure({ sdnAllowed: !e.state.config.sdnAllowed }),
              )
            }
          >
            {state.config.sdnAllowed
              ? "Controlador permite dados"
              : "Controlador bloqueia dados"}
          </button>
        ) : (
          <p>Quatro sensores publicam leituras fictícias pela rede simulada.</p>
        )}
        <Run />
      </Surface>
    );
  return (
    <Surface title="Biblioteca de conhecimento">
      <label>
        Encontrar conceito
        <input
          aria-label="Buscar conceito no terminal espacial"
          value={search}
          onChange={(ev) => setSearch(ev.target.value)}
        />
      </label>
      {search ? (
        <div className="station-concepts">
          {glossary
            .filter((g) =>
              (g.term + " " + g.definition)
                .toLowerCase()
                .includes(search.toLowerCase()),
            )
            .slice(0, 3)
            .map((g) => (
              <p key={g.term}>
                <b>{g.term}</b> {g.definition}
              </p>
            ))}
        </div>
      ) : (
        <>
          <small>
            QUESTÃO {question + 1}/{questions.length}
          </small>
          <h2>{q.question}</h2>
          {q.options.map((o, i) => (
            <button
              key={o}
              disabled={answers[question] !== undefined}
              onClick={() => setAnswers([...answers, i])}
            >
              {o}
            </button>
          ))}
          {answers[question] !== undefined && (
            <div className="station-feedback" role="status">
              <b>
                {answers[question] === q.answer ? "Correto." : "Vamos revisar."}
              </b>
              <p>{q.explanation}</p>
              <button
                onClick={() => {
                  if (question === questions.length - 1) {
                    setQuestion(0);
                    setAnswers([]);
                  } else setQuestion(question + 1);
                }}
              >
                {question === questions.length - 1 ? "Recomeçar" : "Continuar"}
              </button>
            </div>
          )}
        </>
      )}
    </Surface>
  );
}
