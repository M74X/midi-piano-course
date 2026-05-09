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

// MIDI reference (3-octave keyboard: C3=48 → B5=83)
// C3=48 D3=50 E3=52 F3=53 G3=55 A3=57 B3=59
// C4=60 D4=62 E4=64 F4=65 G4=67 A4=69 B4=71
// C5=72 D5=74 E5=76 F5=77 G5=79 A5=81 B5=83

export const lessons: SynthLesson[] = [
  // ── BEGINNER ──────────────────────────────────────────────────────────────
  {
    id: 1,
    name: '🎹 Nota Sola',
    description: 'Una sola nota sostenida — empieza aquí',
    pattern: [60],
    genre: 'darkwave',
    difficulty: 'Easy',
    bpm: 80,
    tip: 'Mantén pulsado Do (C4). Experimenta con sine wave y reverb alto.',
  },
  {
    id: 2,
    name: '🌊 Triada Mayor',
    description: 'Do – Mi – Sol: tu primera triada',
    pattern: [60, 64, 67],
    genre: 'synthwave',
    difficulty: 'Easy',
    bpm: 90,
    tip: 'Cambia entre waveforms y escucha cómo cambia el timbre.',
  },
  {
    id: 3,
    name: '🎸 Bass Walk',
    description: 'Línea de bajo synthwave básica',
    pattern: [48, 48, 55, 55, 60, 60, 55],
    genre: 'synthwave',
    difficulty: 'Easy',
    bpm: 120,
    tip: 'Sawtooth wave para ese sonido de bajo analógico clásico.',
  },
  {
    id: 4,
    name: '🌙 Minor Steps',
    description: 'Escala menor natural de La',
    pattern: [57, 59, 60, 62, 64, 65, 67],
    genre: 'darkwave',
    difficulty: 'Easy',
    bpm: 80,
    tip: 'La escala menor da ese tono oscuro esencial del darkwave.',
  },

  // ── INTERMEDIATE ──────────────────────────────────────────────────────────
  {
    id: 5,
    name: '🌙 Dark Arpeggio',
    description: 'Arpegio menor ascendente y descendente',
    pattern: [57, 60, 64, 67, 64, 60, 57, 55],
    genre: 'darkwave',
    difficulty: 'Medium',
    bpm: 110,
    tip: 'Reverb al 50%, delay suave. Deja que las notas se superpongan.',
  },
  {
    id: 6,
    name: '💀 Phonk Stab',
    description: 'Stab de dark phonk con acento sincopado',
    pattern: [48, 48, 55, 60, 55, 48, 55, 48],
    genre: 'darkphonk',
    difficulty: 'Medium',
    bpm: 140,
    tip: 'Filtro bajo (400 Hz) y distortion para ese sonido grim.',
  },
  {
    id: 7,
    name: '🔊 Octave Jump',
    description: 'Saltos de octava ascendentes',
    pattern: [48, 60, 60, 60, 60, 72, 72, 72, 79, 79, 79],
    genre: 'synthwave',
    difficulty: 'Medium',
    bpm: 130,
    tip: 'Square wave + delay a tempo para efecto de riser.',
  },
  {
    id: 8,
    name: '🖤 Dark Pad',
    description: 'Pad atmosférico con movimiento interno',
    pattern: [48, 52, 55, 60, 55, 52, 48, 52, 55, 60, 64],
    genre: 'darkwave',
    difficulty: 'Medium',
    bpm: 70,
    tip: 'Sine wave, ataque lento (0.5s), chorus activo. Muy atmosférico.',
  },
  {
    id: 9,
    name: '🌌 Ambient Walk',
    description: 'Textura ambiental ascendente',
    pattern: [48, 55, 60, 67, 72, 67, 60, 55],
    genre: 'darkwave',
    difficulty: 'Medium',
    bpm: 60,
    tip: 'Reverb máximo, volumen moderado. Perfecto para layering.',
  },
  {
    id: 10,
    name: '🔥 Chord Stab',
    description: 'Stab de acorde synthwave clásico',
    pattern: [60, 64, 67, 72, 67, 64, 60],
    genre: 'synthwave',
    difficulty: 'Medium',
    bpm: 125,
    tip: 'Delay sincopado, reverb medio, ataque rápido. Puro 80s.',
  },

  // ── ADVANCED ──────────────────────────────────────────────────────────────
  {
    id: 11,
    name: '⚡ Phonk Lead',
    description: 'Lead de dark phonk veloz',
    pattern: [60, 65, 67, 72, 67, 65, 60, 55, 60],
    genre: 'darkphonk',
    difficulty: 'Hard',
    bpm: 150,
    tip: 'Distortion alto, delay corto, ataque instantáneo.',
  },
  {
    id: 12,
    name: '🌙 Dream Sequence',
    description: 'Secuencia dreamwave etérea',
    pattern: [60, 62, 64, 67, 71, 72, 71, 67, 64, 62, 60],
    genre: 'darkwave',
    difficulty: 'Hard',
    bpm: 90,
    tip: 'Triangle wave, chorus máximo, reverb espacial.',
  },

  // ── MELODIES ──────────────────────────────────────────────────────────────
  // Based on genre archetypes; not actual song transcriptions
  {
    id: 13,
    name: '🕷 Darkwave Elegy',
    description: 'Melodía menor atmosférica lenta — estilo Clan of Xymox',
    pattern: [69, 67, 64, 62, 60, 62, 64, 67, 69],
    genre: 'darkwave',
    difficulty: 'Easy',
    bpm: 70,
    tip: 'La menor descendente. Sine wave + reverb máximo. Oscuro y romántico.',
  },
  {
    id: 14,
    name: '🌆 Neon Drive',
    description: 'Arpegio C menor al estilo Kavinsky / Perturbator',
    pattern: [60, 63, 67, 70, 67, 63, 60, 58, 60, 63, 67, 72],
    genre: 'synthwave',
    difficulty: 'Medium',
    bpm: 120,
    tip: 'Sawtooth wave, delay al tempo. Arpegio C menor — corazón del synthwave.',
  },
  {
    id: 15,
    name: '🐍 Phrygian Trap',
    description: 'Riff frigio oscuro — escala característica del dark phonk',
    pattern: [64, 65, 67, 69, 67, 65, 64, 63, 64, 64, 63, 64],
    genre: 'darkphonk',
    difficulty: 'Medium',
    bpm: 140,
    tip: 'E frigio: la segunda bemol (F) da sabor árabe oscuro. Square + distortion.',
  },
  {
    id: 16,
    name: '⚔ Electric Warfare',
    description: 'Riff metal-synth agresivo — estilo Carpenter Brut',
    pattern: [67, 69, 70, 69, 67, 66, 67, 64, 67, 66, 64, 67],
    genre: 'synthwave',
    difficulty: 'Hard',
    bpm: 165,
    tip: 'Sawtooth distorsionado, rápido y agresivo. Filtro abierto, delay seco.',
  },
  {
    id: 17,
    name: '🌃 Night Terror',
    description: 'Secuencia C menor veloz — estilo Perturbator',
    pattern: [60, 62, 63, 67, 65, 63, 62, 60, 59, 60, 63, 62, 60],
    genre: 'darkwave',
    difficulty: 'Hard',
    bpm: 150,
    tip: 'C menor con cromatismo. Alta velocidad, sawtooth, filtro abierto al 100%.',
  },
];

export const genreColors = {
  darkwave: { bg: 'from-purple-900 to-black', text: 'text-purple-400', border: 'border-purple-500' },
  synthwave: { bg: 'from-pink-900 to-black', text: 'text-pink-400', border: 'border-pink-500' },
  darkphonk: { bg: 'from-red-900 to-black', text: 'text-red-400', border: 'border-red-500' },
};

export const genreIcons: Record<string, string> = {
  darkwave: '🌙',
  synthwave: '⚡',
  darkphonk: '💀',
};

export interface GenrePreset {
  label: string;
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
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

export const genrePresets: Record<'darkwave' | 'synthwave' | 'darkphonk', GenrePreset> = {
  darkwave: {
    // PAD — sine, high reverb, slow attack
    label: 'PAD',
    waveform: 'sine',
    attack: 0.5,
    decay: 0.3,
    sustain: 0.8,
    release: 1.2,
    filterCutoff: 6000,
    reverbMix: 0.7,
    delayTime: 0.4,
    delayMix: 0.15,
    distortion: 0,
    chorusRate: 0.4,
  },
  synthwave: {
    // LEAD — sawtooth, delay, medium attack
    label: 'LEAD',
    waveform: 'sawtooth',
    attack: 0.05,
    decay: 0.3,
    sustain: 0.5,
    release: 0.5,
    filterCutoff: 4000,
    reverbMix: 0.25,
    delayTime: 0.4,
    delayMix: 0.35,
    distortion: 0,
    chorusRate: 0.2,
  },
  darkphonk: {
    // BASS — square, distortion, fast attack
    label: 'BASS',
    waveform: 'square',
    attack: 0.01,
    decay: 0.25,
    sustain: 0.6,
    release: 0.2,
    filterCutoff: 1200,
    reverbMix: 0.1,
    delayTime: 0.2,
    delayMix: 0.1,
    distortion: 0.6,
    chorusRate: 0,
  },
};

export const waveformPresets = {
  bass:  { waveform: 'sawtooth'  as const, filterCutoff: 400,  attack: 0.01,  decay: 0.2, sustain: 0.6, release: 0.3 },
  lead:  { waveform: 'square'    as const, filterCutoff: 2000, attack: 0.05,  decay: 0.2, sustain: 0.4, release: 0.4 },
  pad:   { waveform: 'sine'      as const, filterCutoff: 6000, attack: 0.5,   decay: 0.3, sustain: 0.8, release: 1.0 },
  pluck: { waveform: 'triangle'  as const, filterCutoff: 3000, attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.2 },
  phonk: { waveform: 'sawtooth'  as const, filterCutoff: 800,  attack: 0.02,  decay: 0.4, sustain: 0.7, release: 0.2 },
};