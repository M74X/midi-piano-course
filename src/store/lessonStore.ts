import { create } from 'zustand';
import * as Tone from 'tone';
import type { Genre, GenrePreset } from '@/data/genrePresets';
import { genrePresets } from '@/data/genrePresets';

interface LessonState {
  currentGenre: Genre;
  currentPreset: GenrePreset;
  currentBpm: number;
  setGenre: (genre: Genre) => void;
  setBpm: (bpm: number) => void;
}

export const useLessonStore = create<LessonState>((set) => ({
  currentGenre: 'darkwave',
  currentPreset: genrePresets.darkwave,
  currentBpm: 120,
  setGenre: (genre) => set({ currentGenre: genre, currentPreset: genrePresets[genre] }),
  setBpm: (bpm) => {
    set({ currentBpm: bpm });
    Tone.Transport.bpm.value = bpm;
  },
}));
