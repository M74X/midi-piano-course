import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { useLessonStore } from '@/store/lessonStore';
import { buildToneChain, type ToneChain } from '@/utils/buildToneChain';
import type { MidiEvent } from '@/store/types';

export function useTrackPlayer() {
  const preset = useLessonStore((s) => s.currentPreset);
  const chainRef = useRef<ToneChain | null>(null);
  const scheduledRef = useRef<number[]>([]);

  useEffect(() => {
    const chain = buildToneChain(preset);
    chainRef.current = chain;
    return () => {
      const { synth, filter, distNode, reverb, delay, chorus } = chain;
      synth.dispose();
      filter.dispose();
      distNode.dispose();
      reverb.dispose();
      delay.dispose();
      chorus.dispose();
      chainRef.current = null;
    };
  }, [preset]);

  const play = useCallback((events: MidiEvent[]) => {
    const synth = chainRef.current?.synth;
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
