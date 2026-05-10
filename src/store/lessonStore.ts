import { create } from 'zustand';
import type { Genre } from '@/data/synthLessons';
import { genrePresets } from '@/data/synthLessons';
import type { GenrePreset } from '@/data/synthLessons';

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
  setBpm: (bpm) => set({ currentBpm: bpm }),
}));
