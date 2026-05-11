import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import PianoKeyboard from './components/PianoKeyboard';
import { DawView } from './components/DawView';
import { RecordingControls } from './components/RecordingControls';
import { ExportButton } from './components/ExportButton';
import WaveformDisplay from './components/WaveformDisplay';
import { genreIcons, genrePresets } from '@/data/genrePresets';
import { useRecorder } from './hooks/useRecorder';
import { useLessonStore } from './store/lessonStore';
import { useSynthStore } from './store/synthStore';
import { useShallow } from 'zustand/react/shallow';
import { buildToneChain, type ToneChain } from './utils/buildToneChain';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { MidiEvent } from './store/types';

// ── Genre badge styles ────────────────────────────────────────────────────────
const GENRE_STYLE: Record<string, { pill: string }> = {
  darkambient:  { pill: 'bg-indigo-900/40 text-indigo-400 border border-indigo-500/30'  },
  darkwave:     { pill: 'bg-purple-900/40 text-purple-400 border border-purple-500/30'  },
  synthwave:    { pill: 'bg-pink-900/40 text-pink-400 border border-pink-500/30'        },
  darksynth:    { pill: 'bg-red-900/40 text-red-400 border border-red-500/30'           },
  darkphonk:    { pill: 'bg-green-900/40 text-green-400 border border-green-500/30'     },
  darkeuphoric: { pill: 'bg-violet-900/40 text-violet-400 border border-violet-500/30'  },
  industrial:   { pill: 'bg-orange-900/40 text-orange-400 border border-orange-500/30'  },
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pressedNotes, setPressedNotes] = useState<number[]>([]);

  const currentGenre = useLessonStore((s) => s.currentGenre);
  const currentBpm   = useLessonStore((s) => s.currentBpm);

  const synthParams = useSynthStore(useShallow((s) => ({
    waveform: s.waveform, attack: s.attack, decay: s.decay,
    sustain: s.sustain, release: s.release, detune: s.detune,
    volume: s.volume, reverbMix: s.reverbMix, delayTime: s.delayTime,
    delayMix: s.delayMix, distortion: s.distortion,
    filterCutoff: s.filterCutoff, chorusRate: s.chorusRate,
  })));

  const midiDebounceRef = useRef<Map<number, number>>(new Map());
  const toneChainRef    = useRef<ToneChain | null>(null);
  const playbackPartsRef = useRef<Tone.Part[]>([]);

  const ensureChain = useCallback(() => {
    if (!toneChainRef.current) {
      const p = useSynthStore.getState();
      toneChainRef.current = buildToneChain({
        waveform: p.waveform, attack: p.attack, decay: p.decay,
        sustain: p.sustain, release: p.release, filterCutoff: p.filterCutoff,
        distortion: p.distortion, reverbMix: p.reverbMix, delayTime: p.delayTime,
        delayMix: p.delayMix, chorusRate: p.chorusRate,
      });
      Tone.getDestination().volume.value = (p.volume * 26) - 32;
    }
    return toneChainRef.current;
  }, []);

  // ── Play / Stop note ──────────────────────────────────────────────────────
  const playNote = useCallback((midiNote: number, velocity = 0.8) => {
    Tone.start();
    const chain = ensureChain();
    const note = Tone.Frequency(midiNote, 'midi').toNote();
    chain.synth.triggerRelease(note, Tone.now());
    chain.synth.triggerAttack(note, Tone.now() + 0.005, velocity);
    setPressedNotes((prev) => (prev.includes(midiNote) ? prev : [...prev, midiNote]));
    setIsPlaying(true);
  }, [ensureChain]);

  const stopNote = useCallback((midiNote: number) => {
    if (!toneChainRef.current) return;
    const note = Tone.Frequency(midiNote, 'midi').toNote();
    toneChainRef.current.synth.triggerRelease(note, Tone.now());
    setPressedNotes((prev) => prev.filter((n) => n !== midiNote));
  }, []);

  // ── Recording ─────────────────────────────────────────────────────────────
  const recorder     = useRecorder();
  const playNoteRef  = useRef(playNote); playNoteRef.current = playNote;
  const stopNoteRef  = useRef(stopNote); stopNoteRef.current = stopNote;
  const recorderRef  = useRef(recorder); recorderRef.current = recorder;

  // On-screen keyboard handlers that also feed the recorder.
  const handleKeyPress = useCallback((note: number) => {
    playNoteRef.current(note, 0.8);
    recorderRef.current.handleMidiNoteOn(note, 0.8);
  }, []);
  const handleKeyRelease = useCallback((note: number) => {
    stopNoteRef.current(note);
    recorderRef.current.handleMidiNoteOff(note);
  }, []);

  // ── Recorded-event playback ───────────────────────────────────────────────
  const playRecordedEvents = useCallback((events: MidiEvent[]) => {
    const chain = ensureChain();
    for (const part of playbackPartsRef.current) part.dispose();
    playbackPartsRef.current = [];
    if (events.length === 0) return;

    const part = new Tone.Part((time, event: MidiEvent) => {
      const note = Tone.Frequency(event.note, 'midi').toNote();
      chain.synth.triggerAttackRelease(note, event.duration, time, event.velocity);
    }, events);
    part.loop = false;
    part.start(0);
    playbackPartsRef.current.push(part);
  }, [ensureChain]);

  const stopRecordedPlayback = useCallback(() => {
    for (const part of playbackPartsRef.current) part.dispose();
    playbackPartsRef.current = [];
  }, []);

  // ── Sync Tone chain to synth store ────────────────────────────────────────
  useEffect(() => {
    const chain = toneChainRef.current;
    if (!chain) return;
    const s = useSynthStore.getState();
    chain.synth.set({ oscillator: { type: s.waveform } });
    chain.synth.set({ envelope: { attack: s.attack, decay: s.decay, sustain: s.sustain, release: s.release } });
    chain.synth.set({ detune: s.detune * 1.7 });
    chain.filter.frequency.value   = s.filterCutoff;
    chain.distNode.distortion      = s.distortion;
    chain.reverb.wet.value         = s.reverbMix;
    chain.delay.delayTime.value    = s.delayTime;
    chain.delay.feedback.value     = s.delayMix;
    chain.chorus.frequency.value   = s.chorusRate;
    Tone.getDestination().volume.value = (s.volume * 26) - 32;
  }, [synthParams]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      for (const part of playbackPartsRef.current) part.dispose();
      playbackPartsRef.current = [];
      if (toneChainRef.current) {
        const { synth, filter, distNode, reverb, delay, chorus } = toneChainRef.current;
        synth.dispose(); filter.dispose(); distNode.dispose();
        reverb.dispose(); delay.dispose(); chorus.dispose();
        toneChainRef.current = null;
      }
    };
  }, []);

  // ── MIDI hardware input ───────────────────────────────────────────────────
  useEffect(() => {
    const onMidi = (event: MIDIMessageEvent) => {
      const data = event.data;
      if (!data || data.length < 3) return;
      const [status, note, velocity] = data;
      if (status >= 144 && status <= 159 && velocity > 0) {
        const now  = performance.now();
        const last = midiDebounceRef.current.get(note);
        if (last && now - last < 30) return;
        midiDebounceRef.current.set(note, now);
        playNoteRef.current(note, velocity / 127);
        recorderRef.current.handleMidiNoteOn(note, velocity / 127);
      } else if (
        (status >= 128 && status <= 143) ||
        (status >= 144 && status <= 159 && velocity === 0)
      ) {
        stopNoteRef.current(note);
        recorderRef.current.handleMidiNoteOff(note);
      }
    };
    let midiAccess: MIDIAccess | null = null;
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then((a) => { midiAccess = a; a.inputs.forEach((i) => { i.onmidimessage = onMidi; }); })
        .catch(() => {});
    }
    return () => { if (midiAccess) midiAccess.inputs.forEach((i) => { i.onmidimessage = null; }); };
  }, []);

  const genreStyle      = GENRE_STYLE[currentGenre];
  const presetLabel     = genrePresets[currentGenre]?.label ?? '';
  const beatMs          = (60 / currentBpm) * 1000;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ErrorBoundary>
      <div
        className="h-screen flex flex-col overflow-hidden bg-black text-white"
        style={{
          backgroundImage:
            'linear-gradient(rgba(138,43,226,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(138,43,226,.06) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      >
        {/* ── HEADER ── */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-purple-900/50 bg-black/80 backdrop-blur-sm gap-4">
          {/* Title */}
          <div className="flex-shrink-0">
            <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
              TRIP UNDER THE NIGHT
            </h1>
            <p className="text-[9px] text-gray-700 tracking-widest">DARKWAVE · SYNTHWAVE · DARK PHONK</p>
          </div>

          {/* Genre badge */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {genreStyle && (
              <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold flex-shrink-0 ${genreStyle.pill}`}>
                <span>{genreIcons[currentGenre]}</span>
                <span>{presetLabel}</span>
              </span>
            )}
          </div>

          {/* Live indicator + waveform */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="flex flex-col items-end gap-0.5">
              <span className={`text-[8px] font-bold ${isPlaying ? 'text-pink-500' : 'text-gray-700'} tracking-widest`}>
                {isPlaying ? '● LIVE' : '○ IDLE'}
              </span>
              <WaveformDisplay isPlaying={isPlaying} compact />
            </div>
          </div>
        </header>

        {/* ── DAW VIEW ── */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <DawView
            playRecordedEvents={playRecordedEvents}
            stopRecordedPlayback={stopRecordedPlayback}
          />
        </div>

        {/* ── FIXED KEYBOARD STRIP — always visible ── */}
        <div className="flex-shrink-0 border-t border-purple-900/30 bg-black/80 backdrop-blur-sm px-3 pt-2 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <RecordingControls />
            <div className="flex-1" />
            <ExportButton />
          </div>
          <PianoKeyboard
            guideNote={null}
            highlightedNotes={[]}
            activeNotes={pressedNotes}
            wrongNotes={[]}
            beatMs={beatMs}
            onKeyPress={handleKeyPress}
            onKeyRelease={handleKeyRelease}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
