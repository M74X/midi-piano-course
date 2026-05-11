import { Midi } from '@tonejs/midi';
import { useState, useEffect } from 'react';
import type { MidiEvent } from '@/store/types';

export interface UseMidiFileResult {
  events: MidiEvent[];
  isLoading: boolean;
  error: string | null;
}

export function useMidiFile(url: string | null, trackIndex = 0): UseMidiFileResult {
  const [result, setResult] = useState<UseMidiFileResult>({
    events: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!url) {
      setResult({ events: [], isLoading: false, error: null });
      return;
    }

    let cancelled = false;
    setResult({ events: [], isLoading: true, error: null });

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch MIDI: ${res.status}`);
        return res.arrayBuffer();
      })
      .then(buffer => {
        if (cancelled) return;
        const midi = new Midi(buffer);
        const track = midi.tracks[trackIndex];
        if (!track) {
          setResult({ events: [], isLoading: false, error: `Track ${trackIndex} not found` });
          return;
        }
        const events: MidiEvent[] = track.notes.map(n => ({
          note: n.midi,
          velocity: n.velocity,
          time: n.time,
          duration: n.duration,
        }));
        setResult({ events, isLoading: false, error: null });
      })
      .catch(err => {
        if (cancelled) return;
        setResult({ events: [], isLoading: false, error: err.message || 'Failed to load MIDI' });
      });

    return () => { cancelled = true; };
  }, [url, trackIndex]);

  return result;
}
