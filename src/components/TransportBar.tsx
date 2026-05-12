import { useState, useEffect, useCallback } from 'react';
import { audioEngine } from '@/audio/audioEngine';
import { useLessonStore } from '@/store/lessonStore';
import { useChannelStore } from '@/store/channelStore';
import { usePlayheadStore } from '@/store/playheadStore';
import { useTransportStore } from '@/store/transportStore';
import { useRecorder } from '@/hooks/useRecorder';

export function TransportBar() {
  const bpm = useLessonStore((s) => s.currentBpm);
  const setBpm = useLessonStore((s) => s.setBpm);
  const { isRecording, startRecording, stopRecording } = useRecorder();
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState('00:00');

  const loopEnabled = useTransportStore((s) => s.loopEnabled);
  const loopStart = useTransportStore((s) => s.loopStart);
  const loopEnd = useTransportStore((s) => s.loopEnd);
  const stopAtLoopEnd = useTransportStore((s) => s.stopAtLoopEnd);
  const setLoopEnabled = useTransportStore((s) => s.setLoopEnabled);
  const setLoopStart = useTransportStore((s) => s.setLoopStart);
  const setLoopEnd = useTransportStore((s) => s.setLoopEnd);
  const toggleStopAtLoopEnd = useTransportStore((s) => s.toggleStopAtLoopEnd);
  const metronomeEnabled = useTransportStore((s) => s.metronomeEnabled);
  const toggleMetronome = useTransportStore((s) => s.toggleMetronome);
  const quantize = useTransportStore((s) => s.quantize);
  const setQuantize = useTransportStore((s) => s.setQuantize);

  const handlePlay = useCallback(() => {
    audioEngine.init();
    audioEngine.play();
    setIsPlaying(true);
    usePlayheadStore.getState().setIsPlaying(true);

    const state = useChannelStore.getState();
    for (const ch of state.channels) {
      if (ch.audioSrc && ch.refEnabled) {
        audioEngine.loadStem(ch.audioSrc).then(() => {
          audioEngine.playStem(ch.id, ch.audioSrc, ch.volume);
        });
      }
    }

    const active = state.channels.find((c) => c.id === state.activeChannelId);
    if (active && active.recordedEvents.length > 0) {
      const events = [...active.recordedEvents].sort((a, b) => a.time - b.time);
      audioEngine.playRecordedEvents(events, active.id);
    }
  }, []);

  useEffect(() => {
    audioEngine.onTick = (beat, playing) => {
      if (playing) {
        const mins = Math.floor(beat / 4 / (bpm / 60));
        const secs = Math.floor((beat / 4) % 60);
        setTimeDisplay(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        usePlayheadStore.getState().setCurrentBeat(beat);
      }
    };
    audioEngine.stopAtLoopEnd = stopAtLoopEnd;
    return () => { audioEngine.onTick = null; };
  }, [bpm, stopAtLoopEnd]);

  const handleStop = useCallback(() => {
    audioEngine.stop();
    setIsPlaying(false);
    usePlayheadStore.getState().setIsPlaying(false);
    usePlayheadStore.getState().setCurrentBeat(0);
    setTimeDisplay('00:00');
  }, []);

  const handleRecord = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      audioEngine.init();
      if (!isPlaying) {
        audioEngine.play();
        setIsPlaying(true);
        usePlayheadStore.getState().setIsPlaying(true);
      }
      startRecording();
    }
  }, [isRecording, isPlaying, startRecording, stopRecording]);

  const handleLoopToggle = useCallback(() => {
    const next = !loopEnabled;
    setLoopEnabled(next);
    if (next) {
      audioEngine.setLoop(loopStart, loopEnd);
    } else {
      audioEngine.clearLoop();
    }
  }, [loopEnabled, loopStart, loopEnd, setLoopEnabled]);

  const handleStopAtLoopEndToggle = useCallback(() => {
    toggleStopAtLoopEnd();
    audioEngine.stopAtLoopEnd = !stopAtLoopEnd;
  }, [stopAtLoopEnd, toggleStopAtLoopEnd]);

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-black/50 border-b border-purple-900/30 h-12 gap-2">
      {/* Play/Stop/Record */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handlePlay}
          className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-colors ${isPlaying ? 'bg-green-900/40 text-green-400' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          title="Play"
        >▶</button>
        <button
          onClick={handleStop}
          className="w-7 h-7 rounded bg-white/10 text-white/70 hover:bg-white/20 flex items-center justify-center text-xs font-bold"
          title="Stop"
        >■</button>
        <button
          onClick={handleRecord}
          className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-colors ${isRecording ? 'bg-red-900/40 text-red-400 animate-pulse' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          title={isRecording ? 'Stop Recording' : 'Record'}
        >●</button>
      </div>

      {/* Loop / Metronome */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleLoopToggle}
          className={`w-7 h-7 rounded text-xs font-bold transition-colors ${loopEnabled ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/40' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
          title="Toggle Loop"
        >⟳</button>
        {loopEnabled && (
          <>
            <input
              type="number"
              min={0}
              max={256}
              value={loopStart}
              onChange={(e) => { const v = +e.target.value; setLoopStart(v); audioEngine.setLoop(v, loopEnd); }}
              className="w-8 bg-gray-900 border border-gray-800 rounded px-1 py-0.5 text-xs text-center text-cyan-400"
              title="Loop Start (beats)"
            />
            <span className="text-[9px] text-gray-700">-</span>
            <input
              type="number"
              min={0}
              max={256}
              value={loopEnd}
              onChange={(e) => { const v = +e.target.value; setLoopEnd(v); audioEngine.setLoop(loopStart, v); }}
              className="w-8 bg-gray-900 border border-gray-800 rounded px-1 py-0.5 text-xs text-center text-cyan-400"
              title="Loop End (beats)"
            />
            <button
              onClick={handleStopAtLoopEndToggle}
              className={`w-7 h-7 rounded text-[9px] font-bold transition-colors ${stopAtLoopEnd ? 'bg-red-900/40 text-red-400 border border-red-500/40' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
              title={stopAtLoopEnd ? 'Loop stops at end' : 'Loop wraps around'}
            >⏹</button>
          </>
        )}
        <button
          onClick={toggleMetronome}
          className={`w-7 h-7 rounded text-xs font-bold transition-colors ${metronomeEnabled ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/40' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
          title="Metronome"
        >♩</button>
      </div>

      {/* Quantize */}
      <div className="flex items-center gap-1">
        <span className="text-[9px] text-gray-600 font-bold tracking-widest">Q</span>
        <select
          value={quantize}
          onChange={(e) => setQuantize(e.target.value as any)}
          className="w-14 bg-gray-900 border border-gray-800 rounded px-1 py-0.5 text-[10px] text-center text-cyan-400"
        >
          <option value="off">OFF</option>
          <option value="1/4">1/4</option>
          <option value="1/8">1/8</option>
          <option value="1/16">1/16</option>
        </select>
      </div>

      {/* Time display */}
      <div className="text-sm font-mono text-cyan-400 tabular-nums">{timeDisplay}</div>

      {/* BPM */}
      <div className="flex items-center gap-1.5">
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
          className="w-16 h-1 bg-gray-800 rounded appearance-none cursor-pointer accent-cyan-500"
        />
      </div>
    </div>
  );
}
