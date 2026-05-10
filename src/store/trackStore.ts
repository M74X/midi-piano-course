import { create } from 'zustand';
import type { TrackData, MidiEvent, MidiTrackData } from './types';

function generateId(): string {
  return crypto.randomUUID();
}

function isMidiTrack(t: TrackData): t is MidiTrackData {
  return t.type === 'midi';
}

interface TrackState {
  tracks: TrackData[];
  activeTrackId: string | null;

  isRecording: boolean;
  recordingStartTime: number;
  activeNotes: Record<number, { velocity: number; startTime: number }>;

  addTrack: (track: Omit<TrackData, 'id'> & { id?: string }) => string;
  removeTrack: (id: string) => void;
  setActiveTrack: (id: string) => void;
  toggleMute: (id: string) => void;
  toggleSolo: (id: string) => void;
  setTrackVolume: (id: string, volume: number) => void;

  startRecording: (transportTime: number) => void;
  stopRecording: (transportTime: number) => void;
  noteOn: (note: number, velocity: number, transportTime: number) => void;
  noteOff: (note: number, transportTime: number) => void;
  clearTrack: (id: string) => void;
}

export const useTrackStore = create<TrackState>((set, get) => ({
  tracks: [
    {
      id: 'backing',
      name: 'Backing Track',
      type: 'audio' as const,
      src: '',
      color: '#7c3aed',
      muted: false,
      soloed: false,
      volume: 0.8,
      readonly: true,
    },
  ],
  activeTrackId: null,

  isRecording: false,
  recordingStartTime: 0,
  activeNotes: {},

  addTrack: (partial) => {
    const id = partial.id ?? generateId();
    set({ tracks: [...get().tracks, { ...partial, id } as TrackData] });
    return id;
  },

  removeTrack: (id) => {
    set({
      tracks: get().tracks.filter((t) => t.id !== id),
      activeTrackId: get().activeTrackId === id ? null : get().activeTrackId,
    });
  },

  setActiveTrack: (id) => set({ activeTrackId: id }),

  toggleMute: (id) => {
    set({
      tracks: get().tracks.map((t) =>
        t.id === id ? { ...t, muted: !t.muted } : t,
      ),
    });
  },

  toggleSolo: (id) => {
    set({
      tracks: get().tracks.map((t) =>
        t.id === id ? { ...t, soloed: !t.soloed } : t,
      ),
    });
  },

  setTrackVolume: (id, volume) => {
    set({
      tracks: get().tracks.map((t) =>
        t.id === id ? { ...t, volume: Math.max(0, Math.min(1, volume)) } : t,
      ),
    });
  },

  startRecording: (transportTime) => {
    set({
      isRecording: true,
      recordingStartTime: transportTime,
      activeNotes: {},
    });
  },

  stopRecording: (transportTime) => {
    const state = get();
    const remaining = Object.entries(state.activeNotes);

    if (remaining.length > 0 && state.activeTrackId) {
      const tail: MidiEvent[] = remaining.map(([noteStr, n]) => ({
        note: Number(noteStr),
        velocity: n.velocity,
        time: n.startTime,
        duration: Math.max(transportTime - state.recordingStartTime - n.startTime, 0.05),
      }));

      set({
        isRecording: false,
        activeNotes: {},
        tracks: state.tracks.map((t) =>
          t.id === state.activeTrackId && isMidiTrack(t) && !t.readonly
            ? { ...t, events: [...t.events, ...tail] }
            : t,
        ),
      });
    } else {
      set({ isRecording: false, activeNotes: {} });
    }
  },

  noteOn: (note, velocity, transportTime) => {
    const state = get();
    if (!state.isRecording) return;
    if (state.activeNotes[note] !== undefined) return;

    set({
      activeNotes: {
        ...state.activeNotes,
        [note]: { velocity, startTime: transportTime - state.recordingStartTime },
      },
    });
  },

  noteOff: (note, transportTime) => {
    const state = get();
    if (!state.isRecording) return;

    const active = state.activeNotes[note];
    if (!active) return;

    const { [note]: _, ...rest } = state.activeNotes;
    const eventTime = active.startTime;
    const duration = transportTime - state.recordingStartTime - eventTime;

    const event: MidiEvent = {
      note,
      velocity: active.velocity,
      time: eventTime,
      duration: Math.max(duration, 0.05),
    };

    set({
      activeNotes: rest,
      tracks: state.tracks.map((t) =>
        t.id === state.activeTrackId && isMidiTrack(t) && !t.readonly
          ? { ...t, events: [...t.events, event] }
          : t,
      ),
    });
  },

  clearTrack: (id) => {
    set({
      tracks: get().tracks.map((t) =>
        t.id === id && isMidiTrack(t) && !t.readonly
          ? { ...t, events: [] }
          : t,
      ),
    });
  },
}));
