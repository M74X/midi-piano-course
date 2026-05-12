import { create } from 'zustand';
import type { Genre } from '@/data/genrePresets';
import { genrePresets } from '@/data/genrePresets';

export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface ChannelPreset {
  waveform: Waveform;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filterCutoff: number;
  filterType: BiquadFilterType;
  distortion: number;
  reverbMix: number;
  delayTime: number;
  delayMix: number;
  chorusRate: number;
  detune: number;
}

export interface SynthState {
  // Oscillator
  waveform: Waveform;
  detune: number;          // cents, range -50..50

  // ADSR
  attack: number;          // seconds
  decay: number;           // seconds
  sustain: number;         // 0..1
  release: number;         // seconds

  // Output
  volume: number;          // 0..1

  // FX
  reverbMix: number;       // 0..1
  delayTime: number;       // seconds, 0.1..0.8
  delayMix: number;        // 0..1 (feedback)
  distortion: number;      // 0..1
  filterCutoff: number;    // Hz, 200..12000
  chorusRate: number;      // 0..1

  // Actions
  setWaveform: (v: Waveform) => void;
  setDetune: (v: number) => void;
  setAttack: (v: number) => void;
  setDecay: (v: number) => void;
  setSustain: (v: number) => void;
  setRelease: (v: number) => void;
  setVolume: (v: number) => void;
  setReverbMix: (v: number) => void;
  setDelayTime: (v: number) => void;
  setDelayMix: (v: number) => void;
  setDistortion: (v: number) => void;
  setFilterCutoff: (v: number) => void;
  setChorusRate: (v: number) => void;

  /** Applies all 13 values from a GenrePreset in one set() call */
  applyGenrePreset: (genre: Genre) => void;
  /** Applies channel-specific synth preset */
  applyChannelPreset: (preset: ChannelPreset) => void;
}

export const useSynthStore = create<SynthState>((set) => ({
  // Initial values (matching the removed useState defaults exactly)
  waveform: 'sawtooth',
  detune: 0,
  attack: 0.05,
  decay: 0.3,
  sustain: 0.4,
  release: 0.5,
  volume: 0.75,
  reverbMix: 0.3,
  delayTime: 0.4,
  delayMix: 0.2,
  distortion: 0,
  filterCutoff: 8000,
  chorusRate: 0,

  // Actions
  setWaveform: (v) => set({ waveform: v }),
  setDetune: (v) => set({ detune: v }),
  setAttack: (v) => set({ attack: v }),
  setDecay: (v) => set({ decay: v }),
  setSustain: (v) => set({ sustain: v }),
  setRelease: (v) => set({ release: v }),
  setVolume: (v) => set({ volume: v }),
  setReverbMix: (v) => set({ reverbMix: v }),
  setDelayTime: (v) => set({ delayTime: v }),
  setDelayMix: (v) => set({ delayMix: v }),
  setDistortion: (v) => set({ distortion: v }),
  setFilterCutoff: (v) => set({ filterCutoff: v }),
  setChorusRate: (v) => set({ chorusRate: v }),

  applyGenrePreset: (genre) => {
    const p = genrePresets[genre];
    set({
      waveform: p.waveform,
      attack: p.attack,
      decay: p.decay,
      sustain: p.sustain,
      release: p.release,
      filterCutoff: p.filterCutoff,
      reverbMix: p.reverbMix,
      delayTime: p.delayTime,
      delayMix: p.delayMix,
      distortion: p.distortion,
      chorusRate: p.chorusRate,
      // NOTE: detune and volume are NOT in GenrePreset — do not reset them
    });
  },

  applyChannelPreset: (preset) => {
    set({
      waveform: preset.waveform,
      attack: preset.attack,
      decay: preset.decay,
      sustain: preset.sustain,
      release: preset.release,
      filterCutoff: preset.filterCutoff,
      distortion: preset.distortion,
      reverbMix: preset.reverbMix,
      delayTime: preset.delayTime,
      delayMix: preset.delayMix,
      chorusRate: preset.chorusRate,
      detune: preset.detune,
    });
  },
}));
