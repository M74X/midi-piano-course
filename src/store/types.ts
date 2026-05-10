export interface MidiEvent {
  note: number;
  velocity: number;
  time: number;
  duration: number;
}

export interface MidiTrackData {
  id: string;
  name: string;
  type: 'midi';
  events: MidiEvent[];
  color: string;
  muted: boolean;
  soloed: boolean;
  volume: number;
  readonly: boolean;
}

export interface AudioTrackData {
  id: string;
  name: string;
  type: 'audio';
  src: string;
  color: string;
  muted: boolean;
  soloed: boolean;
  volume: number;
  readonly: boolean;
}

export type TrackData = MidiTrackData | AudioTrackData;

export type NoteClassification = 'on-time' | 'early' | 'late' | 'missed' | 'extra';

export interface ComparisonResult {
  note: number;
  studentTime: number | null;
  referenceTime: number | null;
  delta: number | null;
  classification: NoteClassification;
}
