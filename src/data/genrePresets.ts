// Genre preset definitions for Trip Under the Night
// Each preset defines the synth/FX chain parameters for a dark music genre.

export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export type Genre =
  | 'darkambient'
  | 'darkwave'
  | 'synthwave'
  | 'darksynth'
  | 'darkphonk'
  | 'darkeuphoric'
  | 'industrial';

export interface GenrePreset {
  label: string;
  waveform: Waveform;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filterCutoff: number;
  reverbMix: number;
  delayTime: number;
  delayMix: number;
  distortion: number;
  chorusRate: number;
}

export const genrePresets: Record<Genre, GenrePreset> = {
  darkambient: {
    label: 'VOID',
    waveform: 'sine',
    attack: 3.0,
    decay: 2.0,
    sustain: 0.9,
    release: 5,
    filterCutoff: 350,
    reverbMix: 0.8,
    delayTime: 1.0,
    delayMix: 0.35,
    distortion: 0,
    chorusRate: 0.25,
  },
  darkwave: {
    label: 'PAD',
    waveform: 'sawtooth',
    attack: 0.4,
    decay: 0.6,
    sustain: 0.75,
    release: 1.8,
    filterCutoff: 1400,
    reverbMix: 0.5,
    delayTime: 0.4,
    delayMix: 0.3,
    distortion: 0.08,
    chorusRate: 0.45,
  },
  synthwave: {
    label: 'LEAD',
    waveform: 'square',
    attack: 0.005,
    decay: 0.15,
    sustain: 0.55,
    release: 0.25,
    filterCutoff: 2200,
    reverbMix: 0.22,
    delayTime: 0.3,
    delayMix: 0.4,
    distortion: 0.03,
    chorusRate: 0.35,
  },
  darksynth: {
    label: 'AGGR',
    waveform: 'sawtooth',
    attack: 0.002,
    decay: 0.08,
    sustain: 0.35,
    release: 0.15,
    filterCutoff: 3500,
    reverbMix: 0.15,
    delayTime: 0.15,
    delayMix: 0.12,
    distortion: 0.55,
    chorusRate: 0.05,
  },
  darkphonk: {
    label: 'BASS',
    waveform: 'square',
    attack: 0.003,
    decay: 0.12,
    sustain: 0.28,
    release: 0.12,
    filterCutoff: 650,
    reverbMix: 0.12,
    delayTime: 0.2,
    delayMix: 0.18,
    distortion: 0.35,
    chorusRate: 0,
  },
  darkeuphoric: {
    label: 'HAUNT',
    waveform: 'triangle',
    attack: 0.5,
    decay: 1.0,
    sustain: 0.65,
    release: 2.5,
    filterCutoff: 550,
    reverbMix: 0.65,
    delayTime: 0.6,
    delayMix: 0.35,
    distortion: 0.12,
    chorusRate: 0.55,
  },
  industrial: {
    label: 'MECH',
    waveform: 'sawtooth',
    attack: 0.001,
    decay: 0.04,
    sustain: 0.15,
    release: 0.08,
    filterCutoff: 1800,
    reverbMix: 0.08,
    delayTime: 0.1,
    delayMix: 0.03,
    distortion: 0.6,
    chorusRate: 0,
  },
};

export const genreIcons: Record<Genre, string> = {
  darkambient:  '🌫',
  darkwave:     '🌙',
  synthwave:    '⚡',
  darksynth:    '🔥',
  darkphonk:    '💀',
  darkeuphoric: '🕸',
  industrial:   '⚙️',
};
