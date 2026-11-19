import { Device } from "../../scenes/NetworkScene";
import Cable from "./Cable";
import { useSimulation } from "../../stores/useSimulation";
export default function Zone() {
  const { state } = useSimulation();
  return (
    <>
      {state.links.map((l) => {
        const a = state.devices.find((d) => d.id === l.from),
          b = state.devices.find((d) => d.id === l.to);
        return a && b ? (
          <Cable
            key={l.id}
            from={a.position}
            to={b.position}
            active={l.active}
          />
        ) : null;
      })}
      {state.devices.map((d) => (
        <Device key={d.id} d={d} />
      ))}
    </>
  );
}
