import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Compass, Search, Sparkles, X } from "lucide-react";
import { sections } from "../data/content";
import type { Scenario } from "../engine/types";
const paths = [
  {
    title: "Entender o invisível",
    label: "COMECE PELOS FUNDAMENTOS",
    text: "Desmonte uma mensagem, descubra os protocolos e acompanhe uma página nascer.",
    ids: ["osi", "tcp", "web"],
    color: "#a4a4ff",
  },
  {
    title: "Construir conexões",
    label: "PENSE COMO UMA REDE",
    text: "Escolha caminhos, conecte equipamentos e descubra o efeito de cada meio físico.",
    ids: ["routing", "topology", "media"],
    color: "#7de3d4",
  },
  {
    title: "Resolver um mistério",
    label: "TESTE SEU RACIOCÍNIO",
    text: "Investigue falhas, controle o acesso e observe os resultados das suas decisões.",
    ids: ["diagnostics", "security", "performance"],
    color: "#ffc394",
  },
] as const;
export function PathExplorer({
  navigate,
  onMissions,
}: {
  navigate: (id: Scenario) => void;
  onMissions: () => void;
}) {
  const [selected, setSelected] = useState(0);
  const path = paths[selected];
  return (
    <section className="path-explorer" aria-label="Escolha sua jornada">
      <div className="section-title">
        <div>
          <span className="eyebrow">APRENDA FAZENDO</span>
          <h2>O que você quer descobrir?</h2>
        </div>
        <span className="micro">Seu próximo experimento começa aqui.</span>
      </div>
      <div className="path-layout">
        <div
          className="path-choices"
          role="tablist"
          aria-label="Jornadas de exploração"
        >
          {paths.map((p, i) => (
            <button
              key={p.title}
              role="tab"
              id={`path-tab-${i}`}
              aria-selected={selected === i}
              aria-controls="path-preview"
              tabIndex={selected === i ? 0 : -1}
              onKeyDown={(e) => {
                if (
                  e.key === "ArrowDown" ||
                  e.key === "ArrowRight" ||
                  e.key === "ArrowUp" ||
                  e.key === "ArrowLeft"
                ) {
                  e.preventDefault();
                  const next =
                    (selected +
                      (e.key === "ArrowDown" || e.key === "ArrowRight"
                        ? 1
                        : 2)) %
                    3;
                  setSelected(next);
                  document.getElementById(`path-tab-${next}`)?.focus();
                }
              }}
              onClick={() => setSelected(i)}
            >
              <span className="path-number">0{i + 1}</span>
              <span>
                <small>{p.label}</small>
                <b>{p.title}</b>
              </span>
              <ArrowRight size={17} />
            </button>
          ))}
        </div>
        <div
          className="path-preview"
          role="tabpanel"
          id="path-preview"
          aria-labelledby={`path-tab-${selected}`}
          style={{ "--path-color": path.color } as React.CSSProperties}
        >
          <div className="path-map" aria-label="Áreas desta jornada">
            {path.ids.map((id, i) => (
              <button key={id} onClick={() => navigate(id)}>
                <span className="path-orbit">
                  <span>
                    {i === 0 ? (
                      <Compass size={26} />
                    ) : i === 1 ? (
                      <Sparkles size={26} />
                    ) : (
                      <Check size={26} />
                    )}
                  </span>
                </span>
                <b>{sections.find((s) => s.id === id)?.short}</b>
                <small>0{i + 1} / EXPLORAR</small>
              </button>
            ))}
          </div>
          <div className="path-preview-footer">
            <p>{path.text}</p>
            <button className="primary" onClick={() => navigate(path.ids[0])}>
              Começar esta jornada <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
      <button className="path-mission" onClick={onMissions}>
        <Sparkles size={17} />
        <span>
          Prefere um desafio? <b>Escolha uma das seis missões.</b>
        </span>
        <ArrowRight size={16} />
      </button>
    </section>
  );
}
export function QuickSearch({
  navigate,
}: {
  navigate: (id: Scenario) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const open = () => {
    setQuery("");
    dialog.current?.showModal();
    requestAnimationFrame(() => input.current?.focus());
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else {
          setQuery("");
          dialog.current?.showModal();
          input.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  const results = sections.filter((s) =>
    (s.short + " " + s.description)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(
        query
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase(),
      ),
  );
  return (
    <>
      <button
        ref={trigger}
        className="quick-search-trigger"
        onClick={open}
        aria-label="Buscar experiência"
      >
        <Search size={15} />
        <span>Explorar áreas</span>
        <kbd>Ctrl K</kbd>
      </button>
      <dialog
        ref={dialog}
        className="quick-search-dialog"
        aria-label="Buscar experiência"
        onClose={() => trigger.current?.focus()}
        onClick={(e) => {
          if (e.target === dialog.current) {
            const r = dialog.current.getBoundingClientRect();
            if (
              e.clientX < r.left ||
              e.clientX > r.right ||
              e.clientY < r.top ||
              e.clientY > r.bottom
            )
              dialog.current.close();
          }
        }}
      >
        <div className="quick-search-input">
          <Search size={20} />
          <input
            ref={input}
            placeholder="O que você quer explorar?"
            aria-label="Pesquisar áreas"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) {
                e.preventDefault();
                navigate(results[0].id);
                dialog.current?.close();
              }
            }}
          />
          <button
            aria-label="Fechar busca"
            onClick={() => dialog.current?.close()}
          >
            <X size={18} />
          </button>
        </div>
        <div className="quick-search-results">
          {results.length ? (
            results.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  navigate(s.id);
                  dialog.current?.close();
                }}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <b>{s.short}</b>
                  <small>{s.description}</small>
                </div>
                <ArrowRight size={15} />
              </button>
            ))
          ) : (
            <p>
              Nenhuma área encontrada. Tente “DNS”, “camadas” ou “segurança”.
            </p>
          )}
        </div>
        <footer>
          Enter abre o primeiro resultado <span>Esc para fechar</span>
        </footer>
      </dialog>
    </>
  );
}
