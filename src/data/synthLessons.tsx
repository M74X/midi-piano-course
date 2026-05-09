export interface SynthLesson {
  id: number;
  name: string;
  description: string;
  pattern: number[];
  genre: 'darkwave' | 'synthwave' | 'darkphonk';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bpm: number;
  tip: string;
}

export const lessons: SynthLesson[] = [
  {
    id: 1,
    name: '🎹 Intro - Nota Sola',
    description: 'Empieza con una nota sostenida',
    pattern: [60],
    genre: 'darkwave',
    difficulty: 'Easy',
    bpm: 80,
    tip: 'Sostén la nota Do central por 4 segundos',
  },
  {
    id: 2,
    name: '🌊 Wave Intro',
    description: 'Explora las ondas: sine suave, sawtooth rica',
    pattern: [60, 64, 67],
    genre: 'synthwave',
    difficulty: 'Easy',
    bpm: 100,
    tip: 'Cambia entre waveforms para sentir la diferencia',
  },
  {
    id: 3,
    name: '🎸 Bass Pattern I',
    description: 'Patrón de bajo synthwave básico',
    pattern: [36, 36, 43, 43, 48, 48, 43],
    genre: 'synthwave',
    difficulty: 'Easy',
    bpm: 120,
    tip: 'Usa waveform sawtooth para ese sonido de bajo analógico',
  },
  {
    id: 4,
    name: '🌙 Dark Arpeggio',
    description: 'Arpegio menor con reverb',
    pattern: [57, 60, 63, 67, 63, 60, 57, 55],
    genre: 'darkwave',
    difficulty: 'Medium',
    bpm: 110,
    tip: 'Agrega reverb al 50% para ambiente oscuro',
  },
  {
    id: 5,
    name: '💀 Phonk Stab',
    description: 'Stab de Dark Phonk con filtro',
    pattern: [48, 48, 55, 60, 55, 48],
    genre: 'darkphonk',
    difficulty: 'Medium',
    bpm: 140,
    tip: 'Usa filtro bajo y distortion para ese sonido grim',
  },
  {
    id: 6,
    name: '🔊 Octave Riser',
    description: 'Riser de octava ascendente',
    pattern: [36, 48, 48, 48, 48, 60, 60, 60, 60, 72, 72, 84],
    genre: 'synthwave',
    difficulty: 'Hard',
    bpm: 130,
    tip: 'Automatiza el filtro de abierto a cerrado',
  },
  {
    id: 7,
    name: '🖤 Dark Pad',
    description: 'Pad atmosférico con chorus',
    pattern: [48, 52, 55, 60, 55, 52, 48, 48, 52, 55, 60, 64],
    genre: 'darkwave',
    difficulty: 'Hard',
    bpm: 70,
    tip: 'Sustain alto, attack lento, chorus al máximo',
  },
  {
    id: 8,
    name: '⚡ Phonk Lead',
    description: 'Lead principal de Dark Phonk',
    pattern: [60, 65, 67, 72, 67, 65, 60, 55, 60],
    genre: 'darkphonk',
    difficulty: 'Hard',
    bpm: 150,
    tip: 'Distortion alto, delay corto, attack instantáneo',
  },
  {
    id: 9,
    name: '🌌 Ambient Texture',
    description: 'Textura ambiental para capas',
    pattern: [48, 55, 60, 67, 72, 67, 60, 55],
    genre: 'darkwave',
    difficulty: 'Medium',
    bpm: 60,
    tip: 'Reverb máximo, volumen bajo, layering',
  },
  {
    id: 10,
    name: '🔥 Synthwave Chord Stab',
    description: 'Stab de acorde synthwave clásico',
    pattern: [60, 64, 67, 72, 67, 64],
    genre: 'synthwave',
    difficulty: 'Medium',
    bpm: 125,
    tip: 'Delay syncopado, reverb medio, attack rápido',
  },
  {
    id: 11,
    name: '💀 Slide Phonk',
    description: 'Glide/slide característico del phonk',
    pattern: [48, 50, 52, 55, 57, 60],
    genre: 'darkphonk',
    difficulty: 'Hard',
    bpm: 160,
    tip: 'Portamento alto + filter envelope',
  },
  {
    id: 12,
    name: '🌙 Dream Sequence',
    description: 'Secuencia dreamwave etérea',
    pattern: [60, 62, 64, 67, 71, 72, 71, 67, 64, 62, 60],
    genre: 'darkwave',
    difficulty: 'Medium',
    bpm: 90,
    tip: 'Triangle wave + chorus + reverb espacial',
  },
];

export const genreColors = {
  darkwave: { bg: 'from-purple-900 to-black', text: 'text-purple-400', border: 'border-purple-500' },
  synthwave: { bg: 'from-pink-900 to-black', text: 'text-pink-400', border: 'border-pink-500' },
  darkphonk: { bg: 'from-red-900 to-black', text: 'text-red-400', border: 'border-red-500' },
};

export const waveformPresets = {
  bass: { waveform: 'sawtooth' as const, filterCutoff: 400, attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.3 },
  lead: { waveform: 'square' as const, filterCutoff: 2000, attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.4 },
  pad: { waveform: 'sine' as const, filterCutoff: 6000, attack: 0.5, decay: 0.3, sustain: 0.8, release: 1.0 },
  pluck: { waveform: 'triangle' as const, filterCutoff: 3000, attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.2 },
  phonk: { waveform: 'sawtooth' as const, filterCutoff: 800, attack: 0.02, decay: 0.4, sustain: 0.7, release: 0.2 },
};