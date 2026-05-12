import { create } from 'zustand';

type Quantize = 'off' | '1/4' | '1/8' | '1/16';

interface TransportState {
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  stopAtLoopEnd: boolean;
  metronomeEnabled: boolean;
  quantize: Quantize;
  setLoopEnabled: (v: boolean) => void;
  setLoopStart: (v: number) => void;
  setLoopEnd: (v: number) => void;
  toggleStopAtLoopEnd: () => void;
  toggleMetronome: () => void;
  setQuantize: (v: Quantize) => void;
}

export const useTransportStore = create<TransportState>((set) => ({
  loopEnabled: false,
  loopStart: 0,
  loopEnd: 8,
  stopAtLoopEnd: false,
  metronomeEnabled: false,
  quantize: '1/8',
  setLoopEnabled: (v) => set({ loopEnabled: v }),
  setLoopStart: (v) => set({ loopStart: v }),
  setLoopEnd: (v) => set({ loopEnd: v }),
  toggleStopAtLoopEnd: () => set((s) => ({ stopAtLoopEnd: !s.stopAtLoopEnd })),
  toggleMetronome: () => set((s) => ({ metronomeEnabled: !s.metronomeEnabled })),
  setQuantize: (v) => set({ quantize: v }),
}));

export function snapBeat(raw: number, quantize: Quantize): number {
  if (quantize === 'off') return raw;
  const grid = quantize === '1/4' ? 1 : quantize === '1/8' ? 0.5 : 0.25;
  return Math.round(raw / grid) * grid;
}
