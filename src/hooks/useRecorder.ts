import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';
import { useTrackStore } from '@/store/trackStore';
import type { MidiTrackData } from '@/store/types';

export function useRecorder() {
  const [recordingTime, setRecordingTime] = useState(0);
  const isRecording = useTrackStore((s) => s.isRecording);

  const handleMidiNoteOn = useCallback((note: number, velocity: number) => {
    useTrackStore.getState().noteOn(note, velocity, Tone.Transport.seconds);
  }, []);

  const handleMidiNoteOff = useCallback((note: number) => {
    useTrackStore.getState().noteOff(note, Tone.Transport.seconds);
  }, []);

  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0);
      return;
    }
    const id = setInterval(() => {
      if (Tone.Transport.state === 'stopped') {
        useTrackStore.getState().stopRecording(Tone.Transport.seconds);
        return;
      }
      setRecordingTime(
        Tone.Transport.seconds - useTrackStore.getState().recordingStartTime,
      );
    }, 100);
    return () => clearInterval(id);
  }, [isRecording]);

  const startRecording = useCallback(() => {
    if (useTrackStore.getState().isRecording) return;
    const store = useTrackStore.getState();
    const takeCount = store.tracks.filter(
      (t) => t.type === 'midi' && !t.readonly && t.name.startsWith('Take'),
    ).length;
    const newTrack: Omit<MidiTrackData, 'id'> = {
      name: `Take ${takeCount + 1}`,
      type: 'midi',
      events: [],
      color: '#22d3ee',
      muted: false,
      soloed: false,
      volume: 1,
      readonly: false,
    };
    const id = store.addTrack(newTrack);
    store.setActiveTrack(id);
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }
    useTrackStore.getState().startRecording(Tone.Transport.seconds);
  }, []);

  const stopRecording = useCallback(() => {
    if (!useTrackStore.getState().isRecording) return;
    useTrackStore.getState().stopRecording(Tone.Transport.seconds);
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    recordingTime,
    handleMidiNoteOn,
    handleMidiNoteOff,
  };
}
