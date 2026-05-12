import { create } from 'zustand';
import type { NoteData } from './channelStore';

export interface ClipData {
  name: string;
  hasNotes: boolean;
  notes: NoteData[];
}

interface SessionState {
  clips: Record<string, ClipData>;
  currentScene: number;
  setClip: (scene: number, channel: string, data: ClipData) => void;
  setCurrentScene: (scene: number) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  clips: {},
  currentScene: 0,
  setClip: (scene, channel, data) =>
    set((s) => ({
      clips: { ...s.clips, [`${scene}-${channel}`]: data },
    })),
  setCurrentScene: (scene) => set({ currentScene: Math.max(0, Math.min(7, scene)) }),
}));

const SCENE_NAMES = ['Intro', 'Verse', 'Chorus', 'Bridge', 'Drop', 'Break', 'Outro', 'Fill'];

export function getSceneName(scene: number): string {
  return SCENE_NAMES[scene] ?? `Scene ${scene + 1}`;
}
