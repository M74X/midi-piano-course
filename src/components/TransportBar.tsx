import { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { useLessonStore } from '@/store/lessonStore';
import { useChannelStore } from '@/store/channelStore';
import { useRecorder } from '@/hooks/useRecorder';
import { useChannelAudio } from '@/hooks/useChannelAudio';
import type { MidiEvent } from '@/store/types';

interface TransportBarProps {
  playRecordedEvents: (events: MidiEvent[]) => void;
  stopRecordedPlayback: () => void;
}

export function TransportBar({ playRecordedEvents, stopRecordedPlayback }: TransportBarProps) {
  const bpm = useLessonStore((s) => s.currentBpm);
  const setBpm = useLessonStore((s) => s.setBpm);
  const { isRecording, startRecording, stopRecording } = useRecorder();
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState('00:00');
  const { startAudio, stopAudio } = useChannelAudio();

  const handlePlay = useCallback(async () => {
    await Tone.start();
    Tone.getTransport().start();
    startAudio();
    const state = useChannelStore.getState();
    const active = state.channels.find((c) => c.id === state.activeChannelId);
    if (active) playRecordedEvents(active.recordedEvents);
    setIsPlaying(true);
  }, [startAudio, playRecordedEvents]);

  const handleStop = useCallback(() => {
    Tone.getTransport().stop();
    Tone.getTransport().seconds = 0;
    stopAudio();
    stopRecordedPlayback();
    setIsPlaying(false);
  }, [stopAudio, stopRecordedPlayback]);

  const handleRecord = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await Tone.start();
      if (!isPlaying) {
        Tone.getTransport().start();
        setIsPlaying(true);
      }
      startRecording();
    }
  }, [isRecording, isPlaying, startRecording, stopRecording]);

  // Update time display via requestAnimationFrame
  useEffect(() => {
    let rafId: number;
    const updateTime = () => {
      const seconds = Tone.getTransport().seconds;
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      setTimeDisplay(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      rafId = requestAnimationFrame(updateTime);
    };
    rafId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-black/50 border-b border-purple-900/30 h-12">
      {/* Play/Stop/Record */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePlay}
          className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-colors ${isPlaying
              ? 'bg-green-900/40 text-green-400'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          title="Play"
        >
          ▶
        </button>
        <button
          onClick={handleStop}
          className="w-8 h-8 rounded bg-white/10 text-white/70 hover:bg-white/20 flex items-center justify-center text-sm font-bold transition-colors"
          title="Stop"
        >
          ■
        </button>
        <button
          onClick={handleRecord}
          className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-colors ${isRecording
              ? 'bg-red-900/40 text-red-400 animate-pulse'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          title={isRecording ? 'Stop Recording' : 'Record'}
        >
          ●
        </button>
      </div>

      {/* Time display */}
      <div className="text-sm font-mono text-cyan-400 tabular-nums">
        {timeDisplay}
      </div>

      {/* BPM */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-gray-600 font-bold tracking-widest">BPM</span>
        <input
          type="number"
          min={40}
          max={240}
          value={bpm}
          onChange={(e) => setBpm(Math.max(40, Math.min(240, +e.target.value)))}
          className="w-12 bg-gray-900 border border-gray-800 rounded px-1 py-0.5 text-sm text-center text-cyan-400"
        />
        <input
          type="range"
          min={40}
          max={240}
          value={bpm}
          onChange={(e) => setBpm(+e.target.value)}
          className="w-20 h-1 bg-gray-800 rounded appearance-none cursor-pointer accent-cyan-500"
        />
      </div>
    </div>
  );
}
