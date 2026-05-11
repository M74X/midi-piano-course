import { useEffect, useCallback, useState } from 'react';
import * as Tone from 'tone';
import { useChannelStore } from '@/store/channelStore';

export function useRecorder() {
  const [recordingTime, setRecordingTime] = useState(0);
  const isRecording = useChannelStore((s) => s.isRecording);

  const handleMidiNoteOn = useCallback((note: number, velocity: number) => {
    useChannelStore.getState().noteOn(note, velocity, Tone.Transport.seconds);
  }, []);

  const handleMidiNoteOff = useCallback((note: number) => {
    useChannelStore.getState().noteOff(note, Tone.Transport.seconds);
  }, []);

  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0);
      return;
    }
    const id = setInterval(() => {
      if (Tone.Transport.state === 'stopped') {
        useChannelStore.getState().stopRecording(Tone.Transport.seconds);
        return;
      }
      setRecordingTime(
        Tone.Transport.seconds - useChannelStore.getState().recordingStartTime,
      );
    }, 100);
    return () => clearInterval(id);
  }, [isRecording]);

  const startRecording = useCallback(() => {
    if (useChannelStore.getState().isRecording) return;
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }
    useChannelStore.getState().startRecording(Tone.Transport.seconds);
  }, []);

  const stopRecording = useCallback(() => {
    if (!useChannelStore.getState().isRecording) return;
    useChannelStore.getState().stopRecording(Tone.Transport.seconds);
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
