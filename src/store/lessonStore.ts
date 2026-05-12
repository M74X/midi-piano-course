import { create } from 'zustand';
import type { Genre, GenrePreset } from '@/data/genrePresets';
import { genrePresets } from '@/data/genrePresets';
import { audioEngine } from '@/audio/audioEngine';

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
    audioEngine.setBPM(bpm);
  },
}));
