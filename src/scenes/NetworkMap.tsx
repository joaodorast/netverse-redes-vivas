import { useSimulation } from "../stores/useSimulation";
import { protocolColors } from "../data/content";
import { deviceColors } from "../data/visual";
export default function Fallback() {
  const { state, select } = useSimulation();
  const point = (id: string) => {
    const d = state.devices.find((d) => d.id === id);
    return d
      ? { x: 400 + d.position[0] * 45, y: 220 + d.position[2] * 35 }
      : { x: 0, y: 0 };
  };
  return (
    <svg
      className="fallback"
      viewBox="0 0 800 440"
      role="group"
      aria-label="Mapa 2D interativo da rede"
    >
      {state.links.map((l) => {
        const a = point(l.from),
          b = point(l.to);
        return (
          <line
            key={l.id}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={l.active && state.config.cable ? "#328da7" : "#e36479"}
            strokeWidth="2"
            strokeDasharray={l.active ? undefined : "6 5"}
          />
        );
      })}
      {state.devices.map((d) => {
        const p = point(d.id);
        return (
          <g
            key={d.id}
            onClick={() => select(d.id)}
            onKeyDown={(e) => e.key === "Enter" && select(d.id)}
            tabIndex={0}
            role="button"
            aria-label={`Inspecionar ${d.name}`}
          >
            <rect
              x={p.x - 28}
              y={p.y - 22}
              width="56"
              height="44"
              rx="8"
              fill="#152c42"
              stroke={deviceColors[d.type]}
            />
            <text
              x={p.x}
              y={p.y + 4}
              fill={deviceColors[d.type]}
              textAnchor="middle"
              fontSize="10"
            >
              {d.type.toUpperCase()}
            </text>
            <text
              x={p.x}
              y={p.y + 40}
              fill="#adbed1"
              textAnchor="middle"
              fontSize="11"
            >
              {d.name}
            </text>
          </g>
        );
      })}
      {state.packets
        .filter((p) => p.status === "transit")
        .map((p) => {
          const a = point(p.from),
            b = point(p.to),
            t = Math.max(
              0,
              Math.min(1, (state.time - p.start) / (p.end - p.start || 1)),
            );
          return (
            <g key={p.id} onClick={() => select(p.id)}>
              <circle
                cx={a.x + (b.x - a.x) * t}
                cy={a.y + (b.y - a.y) * t}
                r="8"
                fill={protocolColors[p.protocol]}
              />
              <text
                x={a.x + (b.x - a.x) * t}
                y={a.y + (b.y - a.y) * t - 14}
                fill={protocolColors[p.protocol]}
                fontSize="11"
              >
                {p.label}
              </text>
            </g>
          );
        })}
    </svg>
  );
}
