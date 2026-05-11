import { create } from 'zustand';
import type { MidiEvent } from './types';
import { useSynthStore, type ChannelPreset } from './synthStore';

export type ChannelType = 'drums' | 'lead' | 'bass' | 'pads' | 'fx';

export interface ChannelData {
  id: ChannelType;
  name: string;
  muted: boolean;
  soloed: boolean;
  volume: number;       // 0..1
  pan: number;          // -1..1 (0 = center)
  referenceEvents: MidiEvent[];
  recordedEvents: MidiEvent[];
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
  setReferenceEvents: (id: ChannelType, events: MidiEvent[]) => void;
  setRecordedEvents: (id: ChannelType, events: MidiEvent[]) => void;

  startRecording: (transportTime: number) => void;
  stopRecording: (transportTime: number) => void;
  noteOn: (note: number, velocity: number, transportTime: number) => void;
  noteOff: (note: number, transportTime: number) => void;
}

const CHANNEL_PRESETS: Record<ChannelType, ChannelPreset> = {
  drums:  { waveform: 'square',  attack: 0.001, decay: 0.1,  sustain: 0,   release: 0.1,  filterCutoff: 8000,  distortion: 0.4, reverbMix: 0.1,  chorusRate: 0 },
  lead:   { waveform: 'sawtooth',attack: 0.02,  decay: 0.3,  sustain: 0.6, release: 0.4,  filterCutoff: 3000,  distortion: 0,   reverbMix: 0.3,  chorusRate: 0.3 },
  bass:   { waveform: 'sawtooth',attack: 0.01,  decay: 0.4,  sustain: 0.7, release: 0.3,  filterCutoff: 800,   distortion: 0.2, reverbMix: 0.05, chorusRate: 0 },
  pads:   { waveform: 'sine',    attack: 0.8,   decay: 0.6,  sustain: 0.8, release: 1.2,  filterCutoff: 2000,  distortion: 0,   reverbMix: 0.6,  chorusRate: 0.5 },
  fx:     { waveform: 'sine',    attack: 1.0,   decay: 0.8,  sustain: 0.5, release: 2.0,  filterCutoff: 1200,  distortion: 0,   reverbMix: 0.8,  chorusRate: 0 },
};

const INITIAL_CHANNELS: ChannelData[] = [
  { id: 'drums', name: 'Drums', muted: false, soloed: false, volume: 0.8, pan: 0, referenceEvents: [], recordedEvents: [], color: '#f59e0b', audioSrc: '/audio/blacktop-mirage/drums.wav', refEnabled: false, preset: CHANNEL_PRESETS.drums },
  { id: 'lead',  name: 'Lead',  muted: false, soloed: false, volume: 0.8, pan: 0, referenceEvents: [], recordedEvents: [], color: '#ec4899', audioSrc: '/audio/blacktop-mirage/other.wav', refEnabled: false, preset: CHANNEL_PRESETS.lead },
  { id: 'bass',  name: 'Bass',  muted: false, soloed: false, volume: 0.8, pan: 0, referenceEvents: [], recordedEvents: [], color: '#22d3ee', audioSrc: '/audio/blacktop-mirage/bass.wav', refEnabled: false, preset: CHANNEL_PRESETS.bass },
  { id: 'pads',  name: 'Pads',  muted: false, soloed: false, volume: 0.7, pan: 0, referenceEvents: [], recordedEvents: [], color: '#a855f7', refEnabled: false, preset: CHANNEL_PRESETS.pads },
  { id: 'fx',    name: 'FX',    muted: false, soloed: false, volume: 0.6, pan: 0, referenceEvents: [], recordedEvents: [], color: '#10b981', refEnabled: false, preset: CHANNEL_PRESETS.fx },
];

export const useChannelStore = create<ChannelState>((set, get) => ({
  channels: INITIAL_CHANNELS,
  activeChannelId: 'lead',

  isRecording: false,
  recordingChannelId: null,
  recordingStartTime: 0,
  activeNotes: {},

  setActiveChannel: (id) => {
    set({ activeChannelId: id });
    const channel = get().channels.find((c) => c.id === id);
    if (channel) {
      useSynthStore.getState().applyChannelPreset(channel.preset);
    }
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
