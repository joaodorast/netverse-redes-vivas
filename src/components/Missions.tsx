import { Check, ChevronRight, Flag, X } from "lucide-react";
import { missions, type Mission } from "../features/missions";
export function MissionPicker({
  onChoose,
  onClose,
  completed,
}: {
  onChoose: (m: Mission) => void;
  onClose: () => void;
  completed: string[];
}) {
  return (
    <div className="mission-modal-backdrop">
      <section
        className="mission-modal panel"
        role="dialog"
        aria-modal="true"
        aria-label="Escolher desafio"
      >
        <div className="panel-header">
          <div>
            <span className="eyebrow">APRENDA RESOLVENDO</span>
            <h2>Seis desafios. Uma rede viva.</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Fechar desafios"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <p>Cada missão só é concluída quando o motor confirma o resultado.</p>
        <div className="mission-picker-grid">
          {missions.map((m, i) => (
            <button key={m.id} onClick={() => onChoose(m)}>
              <span className="eyebrow">
                {String(i + 1).padStart(2, "0")} · 100 PONTOS{" "}
                {completed.includes(m.id) && <Check size={14} />}
              </span>
              <h3>{m.title}</h3>
              <p>{m.objective}</p>
              <span>
                Começar desafio <ChevronRight size={14} />
              </span>
            </button>
          ))}
        </div>
        <div className="mission-total">
          {completed.length}/6 concluídos · {completed.length * 100} pontos
          verificados
        </div>
      </section>
    </div>
  );
}
export function MissionBar({
  mission,
  complete,
  hint,
  onHint,
  onClose,
}: {
  mission: Mission;
  complete: boolean;
  hint: number;
  onHint: () => void;
  onClose: () => void;
}) {
  return (
    <section
      className={`mission-bar ${complete ? "complete" : ""}`}
      aria-label="Missão ativa"
    >
      <Flag size={20} />
      <div>
        <span className="eyebrow">
          {complete ? "MISSÃO VERIFICADA · 100 PONTOS" : "MISSÃO EM ANDAMENTO"}
        </span>
        <h3>{mission.title}</h3>
        <p>{mission.objective}</p>
        {hint > 0 && (
          <p className="mission-hint">
            Dica {hint}: {mission.hints[hint - 1]}
          </p>
        )}
      </div>
      <button
        className="outline"
        onClick={onHint}
        disabled={hint >= mission.hints.length}
      >
        Dica {hint}/{mission.hints.length}
      </button>
      <button
        className="icon-button"
        aria-label="Encerrar missão"
        onClick={onClose}
      >
        <X size={16} />
      </button>
    </section>
  );
}
