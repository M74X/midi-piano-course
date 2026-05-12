import { create } from 'zustand';

interface PlayheadState {
  currentBeat: number;
  isPlaying: boolean;
  setCurrentBeat: (beat: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const usePlayheadStore = create<PlayheadState>((set) => ({
  currentBeat: 0,
  isPlaying: false,
  setCurrentBeat: (beat) => set({ currentBeat: beat }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
