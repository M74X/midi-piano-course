import { create } from 'zustand';
import type { MidiEvent } from './types';
import type { ChannelPreset } from './synthStore';

export type ChannelType = 'drums' | 'lead' | 'bass' | 'pads' | 'fx';

export interface NoteData {
  id: string;
  pitch: number;
  startBeat: number;
  durationBeats: number;
  velocity: number;
}

export interface ChannelData {
  id: ChannelType;
  name: string;
  muted: boolean;
  soloed: boolean;
  volume: number;       // 0..1
  pan: number;          // -1..1 (0 = center)
  referenceEvents: MidiEvent[];
  recordedEvents: MidiEvent[];
  notes: NoteData[];
  color: string;
  audioSrc?: string;
  refEnabled: boolean;
  preset: ChannelPreset;
}

interface ChannelState {
  channels: ChannelData[];
  activeChannelId: ChannelType;

  // Recording state — latched at startRecording time so changing the active
  // channel mid-recording does not redirect notes.
  isRecording: boolean;
  recordingChannelId: ChannelType | null;
  recordingStartTime: number;
  activeNotes: Record<number, { velocity: number; startTime: number }>;

  setActiveChannel: (id: ChannelType) => void;
  toggleMute: (id: ChannelType) => void;
  toggleSolo: (id: ChannelType) => void;
  toggleRef: (id: ChannelType) => void;
  setVolume: (id: ChannelType, volume: number) => void;
  setPan: (id: ChannelType, pan: number) => void;
  updatePreset: (id: ChannelType, updates: Partial<ChannelPreset>) => void;
  setReferenceEvents: (id: ChannelType, events: MidiEvent[]) => void;
  setRecordedEvents: (id: ChannelType, events: MidiEvent[]) => void;
  setNotes: (id: ChannelType, notes: NoteData[]) => void;
  addNote: (id: ChannelType, note: NoteData) => void;
  deleteNote: (id: ChannelType, noteId: string) => void;
  updateNote: (id: ChannelType, noteId: string, updates: Partial<NoteData>) => void;

  startRecording: (transportTime: number) => void;
  stopRecording: (transportTime: number) => void;
  noteOn: (note: number, velocity: number, transportTime: number) => void;
  noteOff: (note: number, transportTime: number) => void;
}

const CHANNEL_PRESETS: Record<ChannelType, ChannelPreset> = {
  drums:  { waveform: 'square',  attack: 0.001, decay: 0.1,  sustain: 0,   release: 0.05, filterCutoff: 2000, filterType: 'highpass', distortion: 0.4, reverbMix: 0.1,  delayTime: 0.1,  delayMix: 0,   chorusRate: 0,  detune: 0 },
  lead:   { waveform: 'sawtooth',attack: 0.01,  decay: 0.15, sustain: 0.6, release: 0.2,  filterCutoff: 3000, filterType: 'lowpass',  distortion: 0,   reverbMix: 0.3,  delayTime: 0.4,  delayMix: 0.2,  chorusRate: 0.3, detune: 5 },
  bass:   { waveform: 'sawtooth',attack: 0.01,  decay: 0.3,  sustain: 0.8, release: 0.3,  filterCutoff: 800,  filterType: 'lowpass',  distortion: 0.2, reverbMix: 0.05, delayTime: 0.15, delayMix: 0.1,  chorusRate: 0,  detune: 0 },
  pads:   { waveform: 'sine',    attack: 0.3,   decay: 0.2,  sustain: 0.7, release: 0.5,  filterCutoff: 1200, filterType: 'lowpass',  distortion: 0,   reverbMix: 0.6,  delayTime: 0.5,  delayMix: 0.3,  chorusRate: 0.5, detune: 0 },
  fx:     { waveform: 'triangle',attack: 0.05,  decay: 0.2,  sustain: 0.4, release: 0.4,  filterCutoff: 5000, filterType: 'bandpass', distortion: 0,   reverbMix: 0.8,  delayTime: 0.3,  delayMix: 0.4,  chorusRate: 0,  detune: 0 },
};

const INITIAL_CHANNELS: ChannelData[] = [
  { id: 'drums', name: 'Drums', muted: false, soloed: false, volume: 0.8, pan: 0, referenceEvents: [], recordedEvents: [], notes: [], color: '#f59e0b', audioSrc: '/audio/blacktop-mirage/drums.wav', refEnabled: false, preset: CHANNEL_PRESETS.drums },
  { id: 'lead',  name: 'Lead',  muted: false, soloed: false, volume: 0.8, pan: 0, referenceEvents: [], recordedEvents: [], notes: [], color: '#ec4899', audioSrc: '/audio/blacktop-mirage/other.wav', refEnabled: false, preset: CHANNEL_PRESETS.lead },
  { id: 'bass',  name: 'Bass',  muted: false, soloed: false, volume: 0.8, pan: 0, referenceEvents: [], recordedEvents: [], notes: [], color: '#22d3ee', audioSrc: '/audio/blacktop-mirage/bass.wav', refEnabled: false, preset: CHANNEL_PRESETS.bass },
  { id: 'pads',  name: 'Pads',  muted: false, soloed: false, volume: 0.7, pan: 0, referenceEvents: [], recordedEvents: [], notes: [], color: '#a855f7', refEnabled: false, preset: CHANNEL_PRESETS.pads },
  { id: 'fx',    name: 'FX',    muted: false, soloed: false, volume: 0.6, pan: 0, referenceEvents: [], recordedEvents: [], notes: [], color: '#10b981', refEnabled: false, preset: CHANNEL_PRESETS.fx },
];

export const useChannelStore = create<ChannelState>((set, get) => ({
  channels: INITIAL_CHANNELS,
  activeChannelId: 'drums',

  isRecording: false,
  recordingChannelId: null,
  recordingStartTime: 0,
  activeNotes: {},

  setActiveChannel: (id) => {
    set({ activeChannelId: id });
  },

  toggleMute: (id) =>
    set({
      channels: get().channels.map((c) =>
        c.id === id ? { ...c, muted: !c.muted } : c,
      ),
    }),

  toggleSolo: (id) =>
    set({
      channels: get().channels.map((c) =>
        c.id === id ? { ...c, soloed: !c.soloed } : c,
      ),
    }),

  toggleRef: (id) =>
    set({
      channels: get().channels.map((c) =>
        c.id === id ? { ...c, refEnabled: !c.refEnabled } : c,
      ),
    }),

  setVolume: (id, volume) =>
    set({
      channels: get().channels.map((c) =>
        c.id === id ? { ...c, volume: Math.max(0, Math.min(1, volume)) } : c,
      ),
    }),

  setPan: (id, pan) =>
    set({
      channels: get().channels.map((c) =>
        c.id === id ? { ...c, pan: Math.max(-1, Math.min(1, pan)) } : c,
      ),
    }),

  updatePreset: (id, updates) =>
    set({
      channels: get().channels.map((c) =>
        c.id === id ? { ...c, preset: { ...c.preset, ...updates } } : c,
      ),
    }),

  setReferenceEvents: (id, events) =>
    set({
      channels: get().channels.map((c) =>
        c.id === id ? { ...c, referenceEvents: events } : c,
      ),
    }),

  setRecordedEvents: (id, events) =>
    set({
      channels: get().channels.map((c) =>
        c.id === id ? { ...c, recordedEvents: events } : c,
      ),
    }),

  setNotes: (id, notes) =>
    set({
      channels: get().channels.map((c) =>
        c.id === id ? { ...c, notes } : c,
      ),
    }),

  addNote: (id, note) =>
    set({
      channels: get().channels.map((c) =>
        c.id === id ? { ...c, notes: [...c.notes, note] } : c,
      ),
    }),

  deleteNote: (id, noteId) =>
    set({
      channels: get().channels.map((c) =>
        c.id === id ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) } : c,
      ),
    }),

  updateNote: (id, noteId, updates) =>
    set({
      channels: get().channels.map((c) =>
        c.id === id
          ? { ...c, notes: c.notes.map((n) => (n.id === noteId ? { ...n, ...updates } : n)) }
          : c,
      ),
    }),

  startRecording: (transportTime) => {
    const target = get().activeChannelId;
    set({
      isRecording: true,
      recordingChannelId: target,
      recordingStartTime: transportTime,
      activeNotes: {},
      // Fresh take: replace any prior recorded events on this channel.
      channels: get().channels.map((c) =>
        c.id === target ? { ...c, recordedEvents: [] } : c,
      ),
    });
  },

  stopRecording: (transportTime) => {
    const state = get();
    const target = state.recordingChannelId;
    const remaining = Object.entries(state.activeNotes);

    if (target && remaining.length > 0) {
      const tail: MidiEvent[] = remaining.map(([noteStr, n]) => ({
        note: Number(noteStr),
        velocity: n.velocity,
        time: n.startTime,
        duration: Math.max(
          transportTime - state.recordingStartTime - n.startTime,
          0.05,
        ),
      }));
      set({
        isRecording: false,
        recordingChannelId: null,
        activeNotes: {},
        channels: state.channels.map((c) =>
          c.id === target ? { ...c, recordedEvents: [...c.recordedEvents, ...tail] } : c,
        ),
      });
    } else {
      set({ isRecording: false, recordingChannelId: null, activeNotes: {} });
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
    const target = state.recordingChannelId;
    if (!target) return;

    const { [note]: _omit, ...rest } = state.activeNotes;
    const event: MidiEvent = {
      note,
      velocity: active.velocity,
      time: active.startTime,
      duration: Math.max(
        transportTime - state.recordingStartTime - active.startTime,
        0.05,
      ),
    };

    set({
      activeNotes: rest,
      channels: state.channels.map((c) =>
        c.id === target ? { ...c, recordedEvents: [...c.recordedEvents, event] } : c,
      ),
    });
  },
}));
