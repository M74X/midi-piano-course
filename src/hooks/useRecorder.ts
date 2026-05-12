import { useEffect, useCallback, useState } from 'react';
import { audioEngine } from '@/audio/audioEngine';
import { useChannelStore } from '@/store/channelStore';

function getTransportSeconds(): number {
  return audioEngine.currentBeat * (60 / audioEngine.bpm);
}

export function useRecorder() {
  const [recordingTime, setRecordingTime] = useState(0);
  const isRecording = useChannelStore((s) => s.isRecording);

  const handleMidiNoteOn = useCallback((note: number, velocity: number) => {
    useChannelStore.getState().noteOn(note, velocity, getTransportSeconds());
  }, []);

  const handleMidiNoteOff = useCallback((note: number) => {
    useChannelStore.getState().noteOff(note, getTransportSeconds());
  }, []);

  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0);
      return;
    }
    const id = setInterval(() => {
      if (!audioEngine.isPlaying) {
        useChannelStore.getState().stopRecording(getTransportSeconds());
        return;
      }
      setRecordingTime(
        getTransportSeconds() - useChannelStore.getState().recordingStartTime,
      );
    }, 100);
    return () => clearInterval(id);
  }, [isRecording]);

  const startRecording = useCallback(() => {
    if (useChannelStore.getState().isRecording) return;
    if (!audioEngine.isPlaying) {
      audioEngine.init();
      audioEngine.play();
    }
    useChannelStore.getState().startRecording(getTransportSeconds());
  }, []);

  const stopRecording = useCallback(() => {
    if (!useChannelStore.getState().isRecording) return;
    useChannelStore.getState().stopRecording(getTransportSeconds());
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
