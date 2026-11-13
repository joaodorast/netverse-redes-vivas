import { create } from "zustand";
import { Simulation } from "../engine/Simulation";
import type { SimulationState } from "../engine/types";
export const engine = new Simulation();
export const useSimulation = create<{
  state: SimulationState;
  selected: string | null;
  technical: boolean;
  quality: string;
  follow: boolean;
  refresh: () => void;
  select: (id: string | null) => void;
  setTechnical: (v: boolean) => void;
  setQuality: (v: string) => void;
  setFollow: (v: boolean) => void;
}>((set) => ({
  state: engine.snapshot(),
  selected: null,
  technical: false,
  quality: "Automático",
  follow: false,
  refresh: () => set({ state: engine.snapshot() }),
  select: (selected) => set({ selected }),
  setTechnical: (technical) => set({ technical }),
  setQuality: (quality) => set({ quality }),
  setFollow: (follow) => set({ follow }),
}));
export function act(fn: (e: Simulation) => void) {
  fn(engine);
  useSimulation.getState().refresh();
}
