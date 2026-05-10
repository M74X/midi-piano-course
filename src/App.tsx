import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import PianoKeyboard from './components/PianoKeyboard';
import SynthControls from './components/SynthControls';
import EffectsPanel from './components/EffectsPanel';
import SequencePlayer from './components/SequencePlayer';
import PianoRoll from './components/PianoRoll';
import { PianoRollTrack } from './components/PianoRollTrack';
import SheetMusic from './components/SheetMusic';
import WaveformDisplay from './components/WaveformDisplay';
import { RecordingControls } from './components/RecordingControls';
import { TrackList } from './components/TrackList';
import { ExportButton } from './components/ExportButton';
import { lessons, genreIcons, genrePresets, type Genre } from './data/synthLessons';
import { useRecorder } from './hooks/useRecorder';
import { useLessonStore } from './store/lessonStore';
import { useTrackStore } from './store/trackStore';
import { buildToneChain, type ToneChain } from './utils/buildToneChain';

export type LessonScore = { accuracy: number; completed: boolean };

// ── BPM strip ────────────────────────────────────────────────────────────────
const BPM_PRESETS = [60, 80, 100, 120, 140, 160];

function BpmControl({ bpm, setBpm }: { bpm: number; setBpm: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <span className="text-[9px] text-gray-600 font-bold tracking-widest">BPM</span>
      <button onClick={() => setBpm(Math.max(40, bpm - 5))} className="w-6 h-6 rounded bg-gray-900 hover:bg-gray-800 text-gray-500 text-sm flex items-center justify-center">−</button>
      <span className="text-sm font-bold text-cyan-400 w-8 text-center tabular-nums">{bpm}</span>
      <button onClick={() => setBpm(Math.min(240, bpm + 5))} className="w-6 h-6 rounded bg-gray-900 hover:bg-gray-800 text-gray-500 text-sm flex items-center justify-center">+</button>
      <input
        type="range" min="40" max="240" value={bpm}
        onChange={e => setBpm(+e.target.value)}
        className="w-20 h-1 bg-gray-800 rounded appearance-none cursor-pointer accent-cyan-500"
      />
      <div className="flex gap-1">
        {BPM_PRESETS.map(p => (
          <button
            key={p}
            onClick={() => setBpm(p)}
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${bpm === p ? 'bg-cyan-500 text-black' : 'bg-gray-900 text-gray-600 hover:bg-gray-800'}`}
          >{p}</button>
        ))}
      </div>
    </div>
  );
}

// ── Genre badge ───────────────────────────────────────────────────────────────
const GENRE_STYLE: Record<string, { pill: string; dot: string }> = {
  darkambient: { pill: 'bg-indigo-900/40 text-indigo-400 border border-indigo-500/30',  dot: 'bg-indigo-500'  },
  darkwave:    { pill: 'bg-purple-900/40 text-purple-400 border border-purple-500/30',  dot: 'bg-purple-500'  },
  synthwave:   { pill: 'bg-pink-900/40 text-pink-400 border border-pink-500/30',        dot: 'bg-pink-500'    },
  darksynth:   { pill: 'bg-red-900/40 text-red-400 border border-red-500/30',           dot: 'bg-red-500'     },
  darkphonk:   { pill: 'bg-green-900/40 text-green-400 border border-green-500/30',     dot: 'bg-green-500'   },
  darkeuphoric:  { pill: 'bg-violet-900/40 text-violet-400 border border-violet-500/30',  dot: 'bg-violet-500'  },
  industrial:  { pill: 'bg-orange-900/40 text-orange-400 border border-orange-500/30',  dot: 'bg-orange-500'  },
};

// ── Lesson sidebar item ───────────────────────────────────────────────────────
function SidebarLesson({
  lesson, isActive, score, onClick,
}: {
  lesson: typeof lessons[0]; isActive: boolean;
  score?: LessonScore; onClick: () => void;
}) {
  const gs = GENRE_STYLE[lesson.genre];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2.5 py-2 transition-all border-l-2 ${
        isActive
          ? 'bg-purple-900/40 border-l-pink-500 border-b border-gray-800'
          : 'border-l-transparent hover:bg-gray-900/60 border-b border-gray-900/60'
      }`}
    >
      {/* Name row */}
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="text-[11px] font-medium leading-tight flex-1 min-w-0 truncate">
          {lesson.name}
        </span>
        {score?.completed && (
          <span className={`text-[9px] font-bold flex-shrink-0 tabular-nums ${
            score.accuracy >= 80 ? 'text-green-400' : score.accuracy >= 60 ? 'text-yellow-400' : 'text-orange-400'
          }`}>
            {score.accuracy}%
          </span>
        )}
      </div>
      {/* Meta row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Genre chip */}
        <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${gs.pill}`}>
          <span>{genreIcons[lesson.genre]}</span>
          <span>{lesson.genre}</span>
        </span>
        <span className="text-[9px] text-gray-700">{lesson.bpm}bpm</span>
        <span className={`text-[9px] font-bold ${
          lesson.difficulty === 'Easy' ? 'text-green-700' :
          lesson.difficulty === 'Medium' ? 'text-yellow-700' : 'text-red-700'
        }`}>{lesson.difficulty}</span>
      </div>
    </button>
  );
}

// ── Recording track view ─────────────────────────────────────────────────
function RecordingTrackSection() {
  const tracks = useTrackStore((s) => s.tracks);
  const activeTrackId = useTrackStore((s) => s.activeTrackId);
  const bpm = useLessonStore((s) => s.currentBpm);

  const activeTrack = activeTrackId
    ? tracks.find((t) => t.id === activeTrackId) ?? null
    : tracks.find((t) => t.type === 'midi' && !t.readonly) ?? null;

  if (!activeTrack || activeTrack.type !== 'midi') return null;
  if (activeTrack.events.length === 0) return null;

  const referenceTrack = tracks.find(
    (t) => t.type === 'midi' && t.readonly && t.id !== activeTrack.id,
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-gray-600 tracking-widest uppercase">
          {activeTrack.name}
        </span>
      </div>
      <PianoRollTrack
        events={activeTrack.events}
        referenceEvents={referenceTrack?.type === 'midi' ? referenceTrack.events : undefined}
        bpm={bpm}
      />
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  // Lesson
  const [currentLesson, setCurrentLesson] = useState(0);
  const [targetNotes, setTargetNotes] = useState<number[]>([]);
  const [highlightedNotes, setHighlightedNotes] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [sequenceMode, setSequenceMode] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [lessonScores, setLessonScores] = useState<Record<number, LessonScore>>({});
  const [lessonComplete, setLessonComplete] = useState<{ accuracy: number } | null>(null);

  // Score
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongNoteFlash, setWrongNoteFlash] = useState<number | null>(null);

  // Demo
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [demoStep, setDemoStep] = useState(-1);
  const demoTimeoutsRef = useRef<number[]>([]);

  // UI
  const [isPlaying, setIsPlaying] = useState(false);
  const [pressedNotes, setPressedNotes] = useState<number[]>([]);

  // Synth params
  const [waveform, setWaveform] = useState<'sine' | 'square' | 'sawtooth' | 'triangle'>('sawtooth');
  const [attack, setAttack] = useState(0.05);
  const [decay, setDecay] = useState(0.3);
  const [sustain, setSustain] = useState(0.4);
  const [release, setRelease] = useState(0.5);
  const [volume, setVolume] = useState(0.75);
  const [detune, setDetune] = useState(0);

  // FX
  const [reverbMix, setReverbMix] = useState(0.3);
  const [delayTime, setDelayTime] = useState(0.4);
  const [delayMix, setDelayMix] = useState(0.2);
  const [distortion, setDistortion] = useState(0);
  const [filterCutoff, setFilterCutoff] = useState(8000);
  const [chorusRate, setChorusRate] = useState(0);

  // Audio nodes
  const midiDebounceRef = useRef<Map<number, number>>(new Map());
  const toneChainRef = useRef<ToneChain | null>(null);

  // ── Play / Stop note ─────────────────────────────────────────────────────
  const playNote = useCallback((midiNote: number, velocity = 0.8) => {
    if (!toneChainRef.current) {
      Tone.start();
      toneChainRef.current = buildToneChain({
        waveform, attack, decay, sustain, release,
        filterCutoff, distortion, reverbMix, delayTime, delayMix, chorusRate,
      });
      Tone.Destination.volume.value = (volume * 26) - 32;
    }
    const note = Tone.Frequency(midiNote, 'midi').toNote();
    toneChainRef.current.synth.triggerRelease(note, Tone.now());
    toneChainRef.current.synth.triggerAttack(note, Tone.now() + 0.005, velocity);
    setPressedNotes(prev => prev.includes(midiNote) ? prev : [...prev, midiNote]);
    setIsPlaying(true);
  }, [waveform, attack, decay, sustain, release, filterCutoff, distortion, reverbMix, delayTime, delayMix, chorusRate, volume]);

  const stopNote = useCallback((midiNote: number) => {
    if (!toneChainRef.current) return;
    const note = Tone.Frequency(midiNote, 'midi').toNote();
    toneChainRef.current.synth.triggerRelease(note, Tone.now());
    setPressedNotes(prev => prev.filter(n => n !== midiNote));
  }, []);

  const playGuideNote = useCallback((note: number) => {
    playNote(note, 0.6);
    setTimeout(() => stopNote(note), 800);
  }, [playNote, stopNote]);

  // ── Demo playback ─────────────────────────────────────────────────────────
  const playNoteRef = useRef(playNote); playNoteRef.current = playNote;
  const stopNoteRef = useRef(stopNote); stopNoteRef.current = stopNote;

  const stopDemo = useCallback(() => {
    demoTimeoutsRef.current.forEach(clearTimeout);
    demoTimeoutsRef.current = [];
    setIsDemoPlaying(false);
    setDemoStep(-1);
    toneChainRef.current?.synth.releaseAll();
  }, []);

  const playDemoMelody = useCallback(() => {
    if (isDemoPlaying) { stopDemo(); return; }
    const beatMs = (60 / bpm) * 1000;
    const noteOn = Math.min(beatMs * 0.85, 700);
    const timeouts: number[] = [];
    setIsDemoPlaying(true);
    targetNotes.forEach((note, i) => {
      timeouts.push(window.setTimeout(() => { setDemoStep(i); playNoteRef.current(note, 0.75); }, i * beatMs));
      timeouts.push(window.setTimeout(() => { stopNoteRef.current(note); }, i * beatMs + noteOn));
    });
    timeouts.push(window.setTimeout(() => { setIsDemoPlaying(false); setDemoStep(-1); }, targetNotes.length * beatMs + 300));
    demoTimeoutsRef.current = timeouts;
  }, [isDemoPlaying, targetNotes, bpm, stopDemo]);

  // ── Sync Tone chain to state ──────────────────────────────────────────────
  useEffect(() => {
    const chain = toneChainRef.current;
    if (!chain) return;
    chain.synth.set({ oscillator: { type: waveform } });
    chain.synth.set({ envelope: { attack, decay, sustain, release } });
    chain.synth.set({ detune: detune * 1.7 });
    chain.filter.frequency.value = filterCutoff;
    chain.distNode.distortion = distortion;
    chain.reverb.wet.value = reverbMix;
    chain.delay.delayTime.value = delayTime;
    chain.delay.feedback.value = delayMix;
    chain.chorus.frequency.value = chorusRate;
    Tone.Destination.volume.value = (volume * 26) - 32;
  }, [waveform, attack, decay, sustain, release, detune, filterCutoff, distortion, reverbMix, delayTime, delayMix, chorusRate, volume]);

  // ── Cleanup Tone chain on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (toneChainRef.current) {
        const { synth, filter, distNode, reverb, delay, chorus } = toneChainRef.current;
        synth.dispose();
        filter.dispose();
        distNode.dispose();
        reverb.dispose();
        delay.dispose();
        chorus.dispose();
        toneChainRef.current = null;
      }
    };
  }, []);

  // ── Key press ─────────────────────────────────────────────────────────────
  const handleKeyPress = useCallback((note: number) => {
    if (!sequenceMode || isDemoPlaying) return;
    const expected = targetNotes[currentStep];
    if (note === expected) {
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      setStreak(s => s + 1);
      setHighlightedNotes(prev => [...prev, note]);
      const nextStep = currentStep + 1;
      if (nextStep >= targetNotes.length) {
        const accuracy = Math.round((newCorrect / (newCorrect + wrongCount)) * 100);
        setLessonScores(prev => ({ ...prev, [currentLesson]: { accuracy, completed: true } }));
        setLessonComplete({ accuracy });
        setCurrentStep(0);
      } else {
        setCurrentStep(nextStep);
      }
    } else {
      setWrongCount(w => w + 1);
      setStreak(0);
      setWrongNoteFlash(note);
      setTimeout(() => setWrongNoteFlash(null), 400);
    }
  }, [targetNotes, currentStep, sequenceMode, isDemoPlaying, correctCount, wrongCount, currentLesson]);

  // ── Recording hook ───────────────────────────────────────────────────────
  const recorder = useRecorder();
  const hasMidiEvents = useTrackStore((s) =>
    s.tracks.some((t) => t.type === 'midi' && t.events.length > 0),
  );

  // ── MIDI (stable ref registration) ───────────────────────────────────────
  const handleKeyPressRef = useRef(handleKeyPress);
  handleKeyPressRef.current = handleKeyPress;

  useEffect(() => {
    const onMidi = (event: MIDIMessageEvent) => {
      const data = event.data;
      if (!data || data.length < 3) return;
      const [status, note, velocity] = data;
      if (status >= 144 && status <= 159 && velocity > 0) {
        const now = performance.now();
        const last = midiDebounceRef.current.get(note);
        if (last && now - last < 30) return;
        midiDebounceRef.current.set(note, now);
        playNoteRef.current(note, velocity / 127);
        handleKeyPressRef.current(note);
        recorder.handleMidiNoteOn(note, velocity / 127);
      } else if ((status >= 128 && status <= 143) || (status >= 144 && status <= 159 && velocity === 0)) {
        stopNoteRef.current(note);
        recorder.handleMidiNoteOff(note);
      }
    };
    let midiAccess: MIDIAccess | null = null;
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then(a => { midiAccess = a; a.inputs.forEach(i => { i.onmidimessage = onMidi; }); })
        .catch(() => {});
    }
    return () => { if (midiAccess) midiAccess.inputs.forEach(i => { i.onmidimessage = null; }); };
  }, []);

  // ── Lesson loading ────────────────────────────────────────────────────────
  const resetScore = () => {
    setCorrectCount(0); setWrongCount(0); setStreak(0); setLessonComplete(null);
  };

  const applyGenrePreset = (genre: Genre) => {
    const p = genrePresets[genre];
    setWaveform(p.waveform);
    setAttack(p.attack);
    setDecay(p.decay);
    setSustain(p.sustain);
    setRelease(p.release);
    setFilterCutoff(p.filterCutoff);
    setReverbMix(p.reverbMix);
    setDelayTime(p.delayTime);
    setDelayMix(p.delayMix);
    setDistortion(p.distortion);
    setChorusRate(p.chorusRate);
  };

  useEffect(() => {
    const lesson = lessons[currentLesson];
    if (!lesson) return;
    stopDemo();
    setTargetNotes(lesson.pattern);
    setHighlightedNotes([]);
    setCurrentStep(0);
    setSequenceMode(true);
    setBpm(lesson.bpm);
    resetScore();
    applyGenrePreset(lesson.genre);
    useLessonStore.getState().setGenre(lesson.genre);
    useLessonStore.getState().setBpm(lesson.bpm);
  }, [currentLesson]);

  const selectLesson = (index: number) => {
    if (index === currentLesson) return;
    setCurrentLesson(index);
  };

  // Guide note
  const beatMs = (60 / bpm) * 1000;
  const guideNote = isDemoPlaying
    ? (demoStep >= 0 ? targetNotes[demoStep] ?? null : null)
    : sequenceMode && !lessonComplete
      ? targetNotes[currentStep] ?? null
      : null;

  const completedCount = Object.values(lessonScores).filter(s => s.completed).length;
  const currentLessonData = lessons[currentLesson];
  const currentGenreStyle = currentLessonData ? GENRE_STYLE[currentLessonData.genre] : null;
  const currentPresetLabel = currentLessonData ? genrePresets[currentLessonData.genre].label : '';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-black text-white"
      style={{
        backgroundImage: 'linear-gradient(rgba(138,43,226,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(138,43,226,.06) 1px,transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    >
      {/* ── HEADER ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-purple-900/50 bg-black/80 backdrop-blur-sm gap-4">
        {/* Left: title */}
        <div className="flex-shrink-0">
          <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
            SYNTHWAVE PIANO
          </h1>
          <p className="text-[9px] text-gray-700 tracking-widest">DARKWAVE · SYNTHWAVE · DARK PHONK</p>
        </div>

        {/* Center: preset badge + progress */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {currentGenreStyle && (
            <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold flex-shrink-0 ${currentGenreStyle.pill}`}>
              <span>{genreIcons[currentLessonData!.genre]}</span>
              <span>{currentPresetLabel}</span>
            </span>
          )}
          {isDemoPlaying && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 animate-pulse flex-shrink-0">
              ▶ Demo
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <div className="w-20 h-1 bg-gray-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-cyan-500 transition-all"
                style={{ width: `${(completedCount / lessons.length) * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-gray-600 tabular-nums">{completedCount}/{lessons.length}</span>
          </div>
        </div>

        {/* Right: mini waveform */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className="flex flex-col items-end gap-0.5">
            <span className={`text-[8px] font-bold ${isPlaying ? 'text-pink-500' : 'text-gray-700'} tracking-widest`}>
              {isPlaying ? '● LIVE' : '○ IDLE'}
            </span>
            <WaveformDisplay isPlaying={isPlaying} compact />
          </div>
        </div>
      </header>

      {/* ── MAIN ROW ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-52 flex-shrink-0 flex flex-col border-r border-purple-900/30 bg-gray-950/90 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-900 flex-shrink-0 flex items-center justify-between">
            <p className="text-[9px] font-bold text-purple-600 tracking-widest">LECCIONES</p>
            <span className="text-[9px] text-gray-700">{lessons.length} tracks</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {lessons.map((lesson, i) => (
              <SidebarLesson
                key={lesson.id}
                lesson={lesson}
                isActive={currentLesson === i}
                score={lessonScores[i]}
                onClick={() => selectLesson(i)}
              />
            ))}
          </div>
          {/* Mode toggle */}
          <div className="flex-shrink-0 p-2 border-t border-gray-900 flex gap-1">
            <button
              onClick={() => setSequenceMode(true)}
              className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-all ${sequenceMode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-900 text-gray-600 hover:bg-gray-800'}`}
            >🎯 Guiado</button>
            <button
              onClick={() => { setSequenceMode(false); stopDemo(); }}
              className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-all ${!sequenceMode ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-gray-900 text-gray-600 hover:bg-gray-800'}`}
            >🎸 Libre</button>
          </div>
        </aside>

        {/* ── CENTER CONTENT + KEYBOARD ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Scrollable center */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">

            {/* Lesson complete banner */}
            {lessonComplete && (
              <div className="p-3 bg-gradient-to-r from-green-900/40 to-cyan-900/40 rounded-xl border border-green-500/30 text-center">
                <p className="text-xl font-bold text-green-400">🎉 ¡COMPLETADO!</p>
                <p className="text-gray-400 text-xs mt-1">
                  Precisión:{' '}
                  <span className={`font-bold ${lessonComplete.accuracy >= 80 ? 'text-green-400' : lessonComplete.accuracy >= 60 ? 'text-yellow-400' : 'text-orange-400'}`}>
                    {lessonComplete.accuracy}%
                  </span>
                </p>
                <div className="flex justify-center gap-2 mt-2">
                  <button
                    onClick={() => { setHighlightedNotes([]); setCurrentStep(0); resetScore(); }}
                    className="px-3 py-1 bg-gray-800/60 text-gray-300 rounded-lg text-xs hover:bg-gray-800 transition"
                  >🔄 Repetir</button>
                  {currentLesson < lessons.length - 1 && (
                    <button
                      onClick={() => selectLesson(currentLesson + 1)}
                      className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-xs hover:opacity-90 transition"
                    >➡ Siguiente</button>
                  )}
                </div>
              </div>
            )}

            {/* Sequence player */}
            {sequenceMode && !lessonComplete && (
              <SequencePlayer
                targetNotes={targetNotes}
                currentStep={currentStep}
                lessonName={lessons[currentLesson]?.name ?? ''}
                lessonTip={lessons[currentLesson]?.tip ?? ''}
                correctCount={correctCount}
                wrongCount={wrongCount}
                streak={streak}
                isDemoPlaying={isDemoPlaying}
                demoStep={demoStep}
                onPlayGuide={playGuideNote}
                onPlayDemo={playDemoMelody}
              />
            )}

            {/* Sheet music notation */}
            {targetNotes.length > 0 && (
              <SheetMusic
                notes={targetNotes}
                currentStep={currentStep}
                demoStep={demoStep}
                isDemoPlaying={isDemoPlaying}
              />
            )}

            {/* Piano roll */}
            {targetNotes.length > 0 && (
              <div style={{ height: 88 }}>
                <PianoRoll
                  notes={targetNotes}
                  currentStep={currentStep}
                  demoStep={demoStep}
                  isDemoPlaying={isDemoPlaying}
                  onNotePreview={playGuideNote}
                />
              </div>
            )}

            {/* Recording track view */}
            {hasMidiEvents && <RecordingTrackSection />}

            {/* Synth + FX knob panels side by side */}
            <div className="grid grid-cols-2 gap-2">
              <SynthControls
                waveform={waveform} setWaveform={setWaveform}
                attack={attack} setAttack={setAttack}
                decay={decay} setDecay={setDecay}
                sustain={sustain} setSustain={setSustain}
                release={release} setRelease={setRelease}
                volume={volume} setVolume={setVolume}
                detune={detune} setDetune={setDetune}
              />
              <EffectsPanel
                reverbMix={reverbMix} setReverbMix={setReverbMix}
                delayTime={delayTime} setDelayTime={setDelayTime}
                delayMix={delayMix} setDelayMix={setDelayMix}
                distortion={distortion} setDistortion={setDistortion}
                filterCutoff={filterCutoff} setFilterCutoff={setFilterCutoff}
                chorusRate={chorusRate} setChorusRate={setChorusRate}
              />
            </div>

          </div>

          {/* ── FIXED KEYBOARD STRIP ── */}
          <div className="flex-shrink-0 border-t border-purple-900/30 bg-black/80 backdrop-blur-sm px-3 pt-2 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <RecordingControls />
              <div className="flex-1 min-w-0 min-h-[40px] border border-white/10">
                <TrackList />
              </div>
              <ExportButton />
            </div>
            <BpmControl bpm={bpm} setBpm={setBpm} />
            <div className="mt-2">
              <PianoKeyboard
                guideNote={guideNote}
                highlightedNotes={highlightedNotes}
                activeNotes={pressedNotes}
                wrongNotes={wrongNoteFlash !== null ? [wrongNoteFlash] : []}
                beatMs={beatMs}
                onKeyPress={note => { playNote(note, 0.8); handleKeyPress(note); }}
                onKeyRelease={stopNote}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;