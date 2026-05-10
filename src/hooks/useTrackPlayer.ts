import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { useLessonStore } from '@/store/lessonStore';
import type { MidiEvent } from '@/store/types';

export function useTrackPlayer() {
  const preset = useLessonStore((s) => s.currentPreset);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const scheduledRef = useRef<number[]>([]);

  useEffect(() => {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: preset.waveform },
      envelope: {
        attack: preset.attack,
        decay: preset.decay,
        sustain: preset.sustain,
        release: preset.release,
      },
    }).toDestination();
    synthRef.current = synth;
    return () => {
      synth.dispose();
      synthRef.current = null;
    };
  }, [preset]);

  const play = useCallback((events: MidiEvent[]) => {
    const synth = synthRef.current;
    if (!synth) return;

    scheduledRef.current.forEach((id) => Tone.Transport.clear(id));
    scheduledRef.current = [];

    Tone.Transport.stop();
    Tone.Transport.seconds = 0;

    const ids = events.map((ev) =>
      Tone.Transport.schedule((time) => {
        synth.triggerAttackRelease(
          Tone.Frequency(ev.note, 'midi').toNote(),
          ev.duration,
          time,
          ev.velocity,
        );
      }, ev.time),
    );
    scheduledRef.current = ids;
    Tone.Transport.start();
  }, []);

  const stop = useCallback(() => {
    scheduledRef.current.forEach((id) => Tone.Transport.clear(id));
    scheduledRef.current = [];
    Tone.Transport.stop();
  }, []);

  return { play, stop };
}
