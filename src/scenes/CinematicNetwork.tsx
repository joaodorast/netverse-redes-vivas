import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { act, engine, useSimulation } from "../stores/useSimulation";
import { protocolColors } from "../data/content";
const positions: Record<string, [number, number]> = {
  pc: [130, 275],
  peer: [110, 120],
  switch: [370, 275],
  router: [620, 275],
  server: [890, 275],
  dns: [620, 100],
};
export default function CinematicNetwork() {
  const { state, select } = useSimulation();
  const reduced = useReducedMotion();
  const [automatic, setAutomatic] = useState(true);
  useEffect(() => {
    if (!automatic) return;
    act((e) => {
      e.state.speed = 1;
      e.start();
    });
    const interval = setInterval(() => {
      if (engine.state.complete && engine.state.scenario === "home")
        act((e) => e.start());
    }, 1800);
    return () => clearInterval(interval);
  }, [automatic]);
  return (
    <div className="cinematic-stage">
      <div className="cinematic-stars" />
      <div className="orbital orbital-one" />
      <div className="orbital orbital-two" />
      <div className="cinematic-status">
        <span>
          <i className="status-dot" />{" "}
          {state.running ? "TRANSMISSÃO EM TEMPO REAL" : "REDE EM OBSERVAÇÃO"}
        </span>
        <button
          onClick={() => {
            setAutomatic(!automatic);
            if (automatic) act((e) => e.pause());
          }}
        >
          {automatic ? "Pausar ambiente" : "Ativar ambiente"}
        </button>
      </div>
      <svg
        viewBox="0 0 1020 440"
        className="cinematic-wires"
        aria-label="Conexões e pacotes da rede"
      >
        <defs>
          <filter id="packetGlow">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        {state.links.map((l) => {
          const a = positions[l.from],
            b = positions[l.to];
          return a && b ? (
            <g key={l.id}>
              <path
                d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`}
                stroke="#17354f"
                strokeWidth="7"
              />
              <motion.path
                d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`}
                stroke={l.active ? "#38bce0" : "#f16f82"}
                strokeWidth="1.5"
                strokeDasharray="4 12"
                animate={
                  state.running && !reduced
                    ? { strokeDashoffset: [0, -64] }
                    : {}
                }
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </g>
          ) : null;
        })}
        {state.packets
          .filter((p) => p.status === "transit")
          .map((p) => {
            const a = positions[p.from],
              b = positions[p.to];
            if (!a || !b) return null;
            const t = Math.max(
                0,
                Math.min(1, (state.time - p.start) / (p.end - p.start || 1)),
              ),
              x = a[0] + (b[0] - a[0]) * t,
              y = a[1] + (b[1] - a[1]) * t;
            return (
              <g
                key={p.id}
                onClick={() => select(p.id)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r="12"
                  fill={protocolColors[p.protocol]}
                  filter="url(#packetGlow)"
                />
                <rect
                  x={x - 9}
                  y={y - 4}
                  width="18"
                  height="8"
                  rx="4"
                  fill={protocolColors[p.protocol]}
                />
                <rect
                  x={x - 51}
                  y={y - 35}
                  width="102"
                  height="22"
                  rx="5"
                  fill="#0a1527"
                  stroke={protocolColors[p.protocol]}
                />
                <text
                  x={x}
                  y={y - 20}
                  textAnchor="middle"
                  fill="#e2f4ff"
                  fontSize="10"
                >
                  {p.label}
                </text>
              </g>
            );
          })}
      </svg>
      {state.devices.map((d) => {
        const point = positions[d.id];
        if (!point) return null;
        const index =
            d.type === "pc"
              ? 0
              : d.type === "switch"
                ? 1
                : d.type === "router"
                  ? 2
                  : 3,
          color = ["#3ba9ff", "#2ae0db", "#a27afa", "#63dd8a"][index];
        return (
          <motion.button
            key={d.id}
            className={`cinematic-device device-${d.id}`}
            style={
              {
                left: `${point[0] / 10.2}%`,
                top: `${point[1] / 4.4}%`,
                "--device-color": color,
              } as React.CSSProperties
            }
            onClick={() => select(d.id)}
            aria-label={`Inspecionar ${d.name}`}
            animate={!reduced && state.running ? { y: [0, -8, 0] } : { y: 0 }}
            transition={{
              duration: 4 + index * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span className="device-orbit" />
            <span
              className="device-render"
              style={{ backgroundPosition: `${(index / 3) * 100}% center` }}
            />
            <span className="cinematic-device-name">
              {d.name}
              <small>{d.ip}</small>
            </span>
          </motion.button>
        );
      })}
      <div className="cinematic-caption">
        <span>
          DNS <i /> TCP <i /> HTTP
        </span>
        <p>{state.explanation}</p>
        <b>
          {String(state.metrics.delivered).padStart(2, "0")}{" "}
          <small>UNIDADES ENTREGUES</small>
        </b>
      </div>
    </div>
  );
}
