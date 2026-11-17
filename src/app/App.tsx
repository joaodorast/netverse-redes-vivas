import CinematicNetwork from "../scenes/CinematicNetwork";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  FlaskConical,
  Flag,
  Globe2,
  GraduationCap,
  Layers3,
  Menu,
  Monitor,
  Network,
  Play,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Volume2,
  VolumeX,
  Waypoints,
  Wifi,
  X,
} from "lucide-react";
import { act, engine, useSimulation } from "../stores/useSimulation";
import { sections } from "../data/content";
import { defaults } from "../engine/network";
import type { Mission } from "../features/missions";
import { MissionPicker, MissionBar } from "../components/Missions";
import type { Scenario } from "../engine/types";
import {
  Controls,
  Explanation,
  Experiments,
  Inspector,
  Legend,
  Logs,
  Metrics,
  PacketTray,
} from "../components/Panels";
import {
  DiagnosticLesson,
  GlossaryLesson,
  Laboratory,
  MediaLesson,
  OsiLesson,
  PerformanceLesson,
  RoutingLesson,
  SecurityLesson,
  TcpLesson,
  TopologyLesson,
  TrendsLesson,
  WebLesson,
} from "../features/Lessons";
const NetworkScene = lazy(() => import("../scenes/NetworkScene"));
const icons = [
  Compass,
  Layers3,
  Waypoints,
  Globe2,
  Network,
  Boxes,
  Wifi,
  Terminal,
  ShieldCheck,
  Activity,
  Sparkles,
  BookOpen,
];
const tour: Scenario[] = [
  "home",
  "osi",
  "tcp",
  "web",
  "routing",
  "topology",
  "security",
  "diagnostics",
  "glossary",
];
const tourNotes = [
  "Apresente o grupo e a ideia: tornar visível o que acontece na rede.",
  "Edite a mensagem e avance pelas camadas. Explique o encapsulamento.",
  "Mostre SYN, SYN-ACK e ACK. Teste a perda com TCP e UDP.",
  "Acesse a página e provoque a perda de um fragmento HTTP.",
  "Observe aprendizado MAC e a consulta de rota entre redes.",
  "Mude para malha, desligue um enlace e envie novamente.",
  "Teste Telnet e HTTPS. Mostre a regra que decidiu cada resultado.",
  "Execute ping, ipconfig e nslookup. Provoque e corrija uma falha DNS.",
  "Convide a turma para uma questão e encerre com o aprendizado.",
];
const readSaved = (key: string, fallback: string) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Private browsing can disable persistence. */
  }
};
function Home({
  navigate,
  startTour,
  onMissions,
}: {
  navigate: (id: Scenario) => void;
  startTour: () => void;
  onMissions: () => void;
}) {
  const [members, setMembers] = useState(readSaved("netverse-members", "")),
    [editing, setEditing] = useState(false);
  return (
    <>
      <section className="home-hero">
        <div className="hero-art" />
        <div className="hero-copy">
          <span className="eyebrow">
            <i className="status-dot" /> UM LABORATÓRIO. INFINITAS CONEXÕES.
          </span>
          <h1>
            O universo vivo
            <br />
            das <span>redes.</span>
          </h1>
          <p>
            O invisível ganha forma. Entre na rede,
            <br className="desktop-break" /> acompanhe cada pacote e descubra
            <br className="desktop-break" /> como tudo se conecta.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => navigate("web")}>
              Explorar o universo
              <ArrowRight size={17} />
            </button>
            <button className="text-button" onClick={startTour}>
              <Play size={14} /> Iniciar demonstração
            </button>
          </div>
          <div className="hero-caption">
            <span className="tiny-network">◇—◇—◇</span>
            <span>Explore. Conecte. Transmita. Descubra.</span>
          </div>
          <div
            className="experience-facts"
            aria-label="Recursos do laboratório"
          >
            <div>
              <b>12</b>
              <span>áreas de conhecimento</span>
            </div>
            <div>
              <b>06</b>
              <span>missões para resolver</span>
            </div>
            <div>
              <b>3D</b>
              <span>exploração em tempo real</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <Suspense
            fallback={<div className="scene-loading">Preparando a rede…</div>}
          >
            <CinematicNetwork />
          </Suspense>
          <div className="hero-visual-caption">
            <span>
              <i className="status-dot" /> SUA PRIMEIRA CONEXÃO
            </span>
            <b>De um clique a um universo de possibilidades.</b>
          </div>
        </div>
      </section>
      <div className="home-control-wrap">
        <Controls />
        <PacketTray />
        <Legend />
      </div>
      <section className="discovery-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">ESCOLHA O SEU PRÓXIMO PASSO</span>
            <h2>Todo caminho ensina algo novo.</h2>
          </div>
          <span className="micro">
            12 áreas para explorar <ArrowRight size={15} />
          </span>
        </div>
        <div className="discovery-grid">
          <button className="discovery-card" onClick={() => navigate("osi")}>
            <div className="discovery-icon cyan-bg">
              <Layers3 size={23} />
            </div>
            <span className="card-index">01 / ENTENDA</span>
            <h3>Por dentro da mensagem</h3>
            <p>Desmonte os protocolos e descubra o que faz cada camada.</p>
            <span className="card-action">
              Aprender conceitos <ArrowRight size={16} />
            </span>
          </button>
          <button
            className="discovery-card"
            onClick={() => navigate("topology")}
          >
            <div className="discovery-icon violet-bg">
              <Network size={23} />
            </div>
            <span className="card-index">02 / EXPERIMENTE</span>
            <h3>Conexões que ganham vida</h3>
            <p>Explore topologias. Mude caminhos. Veja a rede se adaptar.</p>
            <span className="card-action">
              Explorar topologias <ArrowRight size={16} />
            </span>
          </button>
          <button className="discovery-card" onClick={onMissions}>
            <div className="discovery-icon amber-bg">
              <Terminal size={23} />
            </div>
            <span className="card-index">03 / DESCUBRA</span>
            <h3>Uma falha. Sua investigação.</h3>
            <p>Encontre pistas, teste hipóteses e restaure a comunicação.</p>
            <span className="card-action">
              Resolver desafios <ArrowRight size={16} />
            </span>
          </button>
        </div>
      </section>
      <div className="home-bottom">
        <section className="guide">
          <span className="eyebrow">SEU GUIA DE EXPLORAÇÃO</span>
          <div>
            <span>
              <b>01</b> Escolha uma experiência
            </span>
            <span>
              <b>02</b> Inicie ou avance um passo
            </span>
            <span>
              <b>03</b> Clique, inspecione e experimente
            </span>
          </div>
        </section>
        <section className="team">
          <Users size={20} />
          <div>
            <span className="eyebrow">REDES VIVAS · O NOSSO GRUPO</span>
            {editing ? (
              <form
                onSubmit={(ev) => {
                  ev.preventDefault();
                  save("netverse-members", members);
                  setEditing(false);
                }}
              >
                <input
                  aria-label="Integrantes do grupo"
                  placeholder="Nomes dos integrantes"
                  value={members}
                  onChange={(ev) => setMembers(ev.target.value)}
                />
                <button aria-label="Salvar integrantes">
                  <Check size={16} />
                </button>
              </form>
            ) : (
              <button onClick={() => setEditing(true)}>
                {members || "Adicionar os integrantes do grupo"} <span>↗</span>
              </button>
            )}
          </div>
        </section>
      </div>
      <div className="home-live">
        <Explanation />
        <Logs />
      </div>
    </>
  );
}
function Lesson() {
  const scenario = useSimulation((s) => s.state.scenario);
  switch (scenario) {
    case "osi":
      return <OsiLesson />;
    case "tcp":
      return <TcpLesson />;
    case "web":
      return <WebLesson />;
    case "routing":
      return <RoutingLesson />;
    case "topology":
      return <TopologyLesson />;
    case "media":
      return <MediaLesson />;
    case "diagnostics":
      return <DiagnosticLesson />;
    case "security":
      return <SecurityLesson />;
    case "performance":
      return <PerformanceLesson />;
    case "trends":
      return <TrendsLesson />;
    case "lab":
      return <Laboratory />;
    default:
      return null;
  }
}
export default function App() {
  const { state, technical, setTechnical, quality, setQuality, select } =
    useSimulation();
  const [menu, setMenu] = useState(false),
    [settings, setSettings] = useState(false),
    [presentation, setPresentation] = useState(false),
    [tourIndex, setTourIndex] = useState(0),
    [sound, setSound] = useState(false),
    [volume, setVolume] = useState(0.15),
    [reduced, setReduced] = useState(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [achievement, setAchievement] = useState("");
  const audio = useRef<AudioContext | null>(null),
    lastEvent = useRef(0);
  const active = sections.find((s) => s.id === state.scenario);
  const [missionPicker, setMissionPicker] = useState(false),
    [mission, setMission] = useState<Mission | null>(null),
    [hint, setHint] = useState(0),
    [completed, setCompleted] = useState<string[]>([]);
  const missionComplete = Boolean(
    mission && state.scenario === mission.scenario && mission.complete(state),
  );
  useEffect(() => {
    if (mission && missionComplete)
      setCompleted((previous) =>
        previous.includes(mission.id) ? previous : [...previous, mission.id],
      );
  }, [mission, missionComplete]);
  const chooseMission = (m: Mission) => {
    act((e) => {
      e.reset(m.scenario, { ...defaults });
      if (m.id === "loss") e.loseNext(true);
      if (m.id === "cable") e.setLink(e.state.links[0].id, false);
      if (m.id === "dns") e.configure({ dns: false });
      if (m.id === "route")
        e.state.devices.find((d) => d.type === "router")!.routes[1].network =
          "192.168.30.0/24";
    });
    select(null);
    setMission(m);
    setHint(0);
    setMissionPicker(false);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const navigate = (id: Scenario) => {
    act((e) => e.reset(id));
    select(null);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const startTour = () => {
    setPresentation(true);
    setMission(null);
    goTour(0);
  };
  const goTour = (index: number) => {
    setTourIndex(index);
    act((e) => {
      e.reset(tour[index], {
        ...defaults,
        topology: tour[index] === "topology" ? "mesh" : "star",
      });
      if (tour[index] === "web") e.loseNext(true);
      if (tour[index] === "topology") e.setLink(e.state.links[0].id, false);
      if (tour[index] === "diagnostics") e.configure({ dns: false });
    });
    select(null);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  useEffect(() => {
    let frame = 0,
      previous = performance.now(),
      accumulator = 0;
    const animate = (now: number) => {
      const delta = Math.min(100, now - previous);
      previous = now;
      accumulator += delta;
      if (accumulator >= 45) {
        if (engine.state.running) {
          engine.tick(accumulator * 0.18);
          useSimulation.getState().refresh();
        }
        accumulator = 0;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.reduced = String(reduced);
  }, [reduced]);
  useEffect(() => {
    const event = state.events.at(-1);
    if (!event || event.id === lastEvent.current) return;
    lastEvent.current = event.id;
    if (
      sound &&
      audio.current &&
      ["ENTREGA", "PERDA", "BLOQUEADO"].includes(event.type)
    ) {
      const context = audio.current,
        osc = context.createOscillator(),
        gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.frequency.value = event.type === "ENTREGA" ? 680 : 220;
      gain.gain.setValueAtTime(volume * 0.2, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.09);
      osc.start();
      osc.stop(context.currentTime + 0.1);
    }
    if (state.pageReady && state.metrics.retransmitted > 0)
      setAchievement(
        "Conexão resiliente: a página chegou mesmo após uma perda.",
      );
  }, [
    state.events,
    state.pageReady,
    state.metrics.retransmitted,
    sound,
    volume,
  ]);
  return (
    <div className={`app ${presentation ? "presentation" : ""}`}>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      {menu && (
        <button
          className="nav-backdrop"
          aria-label="Fechar navegação"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <button
          className="brand"
          onClick={() => navigate("home")}
          aria-label="NETVERSE início"
        >
          <span className="brand-symbol">
            <Network size={27} />
          </span>
          <span>
            NETVERSE<small>O UNIVERSO VIVO DAS REDES</small>
          </span>
        </button>
        <div className="workspace-label">
          <span className="status-dot" /> LABORATÓRIO INTERATIVO{" "}
          <span>v1.0</span>
        </div>
        <nav aria-label="Áreas do simulador">
          {sections.map((s, i) => {
            const Icon = icons[i];
            return (
              <button
                key={s.id}
                className={
                  state.scenario === s.id ? "nav-item active" : "nav-item"
                }
                onClick={() => navigate(s.id)}
                aria-current={state.scenario === s.id ? "page" : undefined}
              >
                <Icon size={17} />
                <span>{s.short}</span>
                <small>{String(i).padStart(2, "0")}</small>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-extra">
          <span className="nav-group-label">VÁ ALÉM</span>
          <button
            className="nav-item"
            onClick={() => {
              setMissionPicker(true);
              setMenu(false);
            }}
          >
            <Flag size={17} />
            <span>Desafios de rede</span>
            <span className="new-tag">6</span>
          </button>
          <button
            className={`nav-item ${state.scenario === "lab" ? "active" : ""}`}
            onClick={() => navigate("lab")}
          >
            <FlaskConical size={17} />
            <span>Laboratório livre</span>
            <span className="new-tag">LAB</span>
          </button>
          <button className="nav-item" onClick={startTour}>
            <Monitor size={17} />
            <span>Modo apresentação</span>
            <ChevronRight size={13} />
          </button>
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-orbit">✳</div>
          <div>
            <b>Aprenda explorando.</b>
            <span>Uma conexão de cada vez.</span>
          </div>
          <span className="local-badge">
            <i className="status-dot" /> EXECUÇÃO LOCAL · OFFLINE
          </span>
        </div>
      </aside>
      <div className="app-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir navegação"
              onClick={() => setMenu(true)}
            >
              <Menu size={20} />
            </button>
            <span>Universo NETVERSE</span>
            <ChevronRight size={13} />
            <b>{active?.short ?? "Laboratório livre"}</b>
          </div>
          <div className="topbar-actions">
            <div className="level-switch">
              <button
                className={!technical ? "active" : ""}
                onClick={() => setTechnical(false)}
              >
                <GraduationCap size={14} />
                Iniciante
              </button>
              <button
                className={technical ? "active" : ""}
                onClick={() => setTechnical(true)}
              >
                Técnico
              </button>
            </div>
            <span className="top-divider" />
            <button
              className="icon-button"
              aria-label={sound ? "Desativar áudio" : "Ativar áudio"}
              onClick={() => {
                if (!audio.current) audio.current = new AudioContext();
                void audio.current.resume();
                setSound(!sound);
              }}
            >
              {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <button
              className="icon-button"
              aria-label="Preferências"
              onClick={() => setSettings(!settings)}
            >
              <Settings2 size={17} />
            </button>
          </div>
        </header>
        {settings && (
          <section className="settings panel">
            <div className="panel-header">
              <h3>Seu jeito de explorar</h3>
              <button
                className="icon-button"
                aria-label="Fechar preferências"
                onClick={() => setSettings(false)}
              >
                <X size={16} />
              </button>
            </div>
            <label className="field">
              Qualidade visual
              <select
                value={quality}
                onChange={(ev) => setQuality(ev.target.value)}
              >
                {["Automático", "Baixo", "Médio", "Alto"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="toggle-label">
              <span>Reduzir movimento da interface</span>
              <input
                type="checkbox"
                checked={reduced}
                onChange={(ev) => setReduced(ev.target.checked)}
              />
              <span className="toggle-track" />
            </label>
            <label className="slider-label">
              <span>
                Volume do áudio <b>{Math.round(volume * 100)}%</b>
              </span>
              <input
                aria-label="Volume"
                type="range"
                min="0"
                max="1"
                step=".05"
                value={volume}
                onChange={(ev) => setVolume(Number(ev.target.value))}
              />
            </label>
            <p className="micro">
              Sem WebGL? O mapa 2D mantém a simulação e a inspeção disponíveis.
              O tempo virtual avança a 180 ms/s em 1× para tornar os eventos
              visíveis.
            </p>
          </section>
        )}
        {presentation && (
          <div className="presentation-bar">
            <span>
              <Monitor size={16} /> DEMONSTRAÇÃO · {tourIndex + 1}/{tour.length}
            </span>
            <p>{tourNotes[tourIndex]}</p>
            <div>
              <button
                aria-label="Cenário anterior"
                disabled={tourIndex === 0}
                onClick={() => {
                  goTour(tourIndex - 1);
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => {
                  const next = (tourIndex + 1) % tour.length;
                  goTour(next);
                }}
              >
                Próximo cenário <ChevronRight size={17} />
              </button>
              <button
                aria-label="Sair da apresentação"
                onClick={() => setPresentation(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        <main id="main-content">
          {mission && (
            <MissionBar
              mission={mission}
              complete={missionComplete}
              hint={hint}
              onHint={() => setHint((h) => Math.min(3, h + 1))}
              onClose={() => setMission(null)}
            />
          )}
          {state.scenario === "home" ? (
            <Home
              navigate={navigate}
              startTour={startTour}
              onMissions={() => setMissionPicker(true)}
            />
          ) : (
            <>
              <div className="page-heading">
                <span className="eyebrow">
                  {active?.tag ?? "LAB / SEU ESPAÇO DE DESCOBERTAS"}
                </span>
                <div>
                  <h1>{active?.label ?? "Laboratório livre"}</h1>
                  <span className="simulation-label">
                    <i className="status-dot" />
                    {state.running ? "SIMULAÇÃO EM ANDAMENTO" : "REDE PRONTA"}
                  </span>
                </div>
                <p>
                  {active?.description ??
                    "Crie equipamentos, desenhe conexões e transforme uma hipótese em um experimento."}
                </p>
              </div>
              {state.scenario === "glossary" ? (
                <GlossaryLesson />
              ) : (
                <>
                  <div className="simulation-layout">
                    <div className="simulation-main">
                      <div className="scene-container">
                        <Suspense
                          fallback={
                            <div className="scene-loading">
                              Preparando visualização…
                            </div>
                          }
                        >
                          <NetworkScene />
                        </Suspense>
                        <Legend />
                        <Controls />
                        <PacketTray />
                      </div>
                      <Metrics />
                    </div>
                    <div className="simulation-aside">
                      <Explanation />
                      <Experiments />
                    </div>
                  </div>
                  <Lesson />
                  <Logs />
                </>
              )}
            </>
          )}
          <footer className="page-footer">
            <span>
              <Network size={13} /> NETVERSE <span className="muted">/</span>{" "}
              Redes Vivas
            </span>
            <span>Feito para entender. Construído para explorar.</span>
            <span>SIMULAÇÃO EDUCACIONAL</span>
          </footer>
        </main>
        <Inspector />
        {missionPicker && (
          <MissionPicker
            onChoose={chooseMission}
            onClose={() => setMissionPicker(false)}
            completed={completed}
          />
        )}
        {achievement && (
          <div className="achievement">
            <Check size={20} />
            <span>{achievement}</span>
            <button
              className="icon-button"
              aria-label="Fechar conquista"
              onClick={() => setAchievement("")}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="mobile-status">
        <i className="status-dot" /> NETVERSE · REDE VIRTUAL{" "}
        <Search size={12} />
      </div>
    </div>
  );
}
