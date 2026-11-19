import { useEffect, useRef, type RefObject } from "react";
import { engine, useSimulation } from "../stores/useSimulation";
import { listenerPose } from "../world/runtime";
export default function SimulationAudio({
  sound,
  volume,
  world,
  audio,
  onAchievement,
}: {
  sound: boolean;
  volume: number;
  world: boolean;
  audio: RefObject<AudioContext | null>;
  onAchievement: (message: string) => void;
}) {
  const eventId = useSimulation((s) => s.state.events.at(-1)?.id);
  const resilient = useSimulation(
    (s) => s.state.pageReady && s.state.metrics.retransmitted > 0,
  );
  const lastEvent = useRef(0);
  useEffect(() => {
    const state = engine.state;
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
      const panner = context.createPanner();
      panner.panningModel = "HRTF";
      panner.distanceModel = "inverse";
      panner.refDistance = 6;
      panner.maxDistance = 40;
      const packet = state.packets.find((p) => p.id === event.packetId);
      const emitter = state.devices.find(
        (d) => d.id === (event.deviceId ?? packet?.to),
      );
      panner.positionX.value = emitter?.position[0] ?? 0;
      panner.positionY.value = 1;
      panner.positionZ.value = emitter?.position[2] ?? 0;
      const listener = context.listener;
      if (listener.positionX) {
        listener.positionX.value = world ? listenerPose.x : 0;
        listener.positionY.value = world ? listenerPose.y : 3;
        listener.positionZ.value = world ? listenerPose.z : 8;
        listener.forwardX.value = world ? listenerPose.fx : 0;
        listener.forwardY.value = world ? listenerPose.fy : 0;
        listener.forwardZ.value = world ? listenerPose.fz : -1;
        listener.upY.value = 1;
      }
      gain.connect(panner);
      panner.connect(context.destination);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
        panner.disconnect();
      };
      osc.frequency.value = event.type === "ENTREGA" ? 680 : 220;
      gain.gain.setValueAtTime(volume * 0.2, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.09);
      osc.start();
      osc.stop(context.currentTime + 0.1);
    }
    if (state.pageReady && state.metrics.retransmitted > 0)
      onAchievement(
        "Conexão resiliente: a página chegou mesmo após uma perda.",
      );
  }, [eventId, resilient, sound, volume, world, audio, onAchievement]);
  return null;
}
