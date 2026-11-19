import { memo } from "react";
import { Line, QuadraticBezierLine } from "@react-three/drei";
import { act } from "../../stores/useSimulation";
type Point = [number, number, number];
type Props = {
  from: Point;
  to: Point;
  active?: boolean;
  curved?: boolean;
  id?: string;
};
/** Snapshot identity changes every tick; cable geometry changes only with its endpoints. */
export default memo(
  function Cable({ from, to, active = true, curved = false, id }: Props) {
    const start: Point = [from[0], 0.2, from[2]];
    const end: Point = [to[0], 0.2, to[2]];
    const color = active ? "#84e5d0" : "#ffc48a";
    if (!curved) return <Line points={[start, end]} color={color} />;
    return (
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={[(from[0] + to[0]) / 2, 1, (from[2] + to[2]) / 2]}
        color={color}
        lineWidth={active ? 2 : 1}
        dashed={!active}
        onClick={(e) => {
          if (!id) return;
          e.stopPropagation();
          act((s) => s.setLink(id, !active));
        }}
      />
    );
  },
  (a, b) =>
    a.id === b.id &&
    a.active === b.active &&
    a.curved === b.curved &&
    a.from.every((v, i) => v === b.from[i]) &&
    a.to.every((v, i) => v === b.to[i]),
);
