export interface MidiEvent {
  note: number;
  velocity: number;
  time: number;
  duration: number;
}

export type NoteClassification = 'on-time' | 'early' | 'late' | 'missed' | 'extra';

export interface ComparisonResult {
  note: number;
  studentTime: number | null;
  referenceTime: number | null;
  delta: number | null;
  classification: NoteClassification;
}
