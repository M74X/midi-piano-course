import { useState, useEffect, useCallback, useRef } from 'react';
import PianoKeyboard from './components/PianoKeyboard';
import { DawView } from './components/DawView';
import { SessionView } from './components/SessionView';
import { RecordingControls } from './components/RecordingControls';
import { ExportButton } from './components/ExportButton';
import { SaveButton } from './components/SaveButton';
import WaveformDisplay from './components/WaveformDisplay';
import { genreIcons, genrePresets } from '@/data/genrePresets';
import { useLessonStore } from './store/lessonStore';
import { useRecorder } from './hooks/useRecorder';
import { audioEngine } from './audio/audioEngine';
import { ErrorBoundary } from './components/ErrorBoundary';

const GENRE_STYLE: Record<string, { pill: string }> = {
  darkambient:  { pill: 'bg-indigo-900/40 text-indigo-400 border border-indigo-500/30'  },
  darkwave:     { pill: 'bg-purple-900/40 text-purple-400 border border-purple-500/30'  },
  synthwave:    { pill: 'bg-pink-900/40 text-pink-400 border border-pink-500/30'        },
  darksynth:    { pill: 'bg-red-900/40 text-red-400 border border-red-500/30'           },
  darkphonk:    { pill: 'bg-green-900/40 text-green-400 border border-green-500/30'     },
  darkeuphoric: { pill: 'bg-violet-900/40 text-violet-400 border border-violet-500/30'  },
  industrial:   { pill: 'bg-orange-900/40 text-orange-400 border border-orange-500/30'  },
};

function App() {
  const [pressedNotes, setPressedNotes] = useState<number[]>([]);
  const [mode, setMode] = useState<'daw' | 'session'>('daw');
  const [isPlaying, setIsPlaying] = useState(false);

  const currentGenre = useLessonStore((s) => s.currentGenre);
  const currentBpm   = useLessonStore((s) => s.currentBpm);

  const midiDebounceRef = useRef<Map<number, number>>(new Map());

  const recorder     = useRecorder();
  const playNoteRef  = useRef<(n: number, v?: number) => void>();
  const stopNoteRef  = useRef<(n: number) => void>();
  const recorderRef  = useRef(recorder);
  recorderRef.current = recorder;

  const playNote = useCallback((midiNote: number, velocity = 0.8) => {
    audioEngine.init();
    audioEngine.noteOn(midiNote, velocity);
    setPressedNotes((prev) => (prev.includes(midiNote) ? prev : [...prev, midiNote]));
  }, []);

  const stopNote = useCallback((midiNote: number) => {
    audioEngine.noteOff(midiNote);
    setPressedNotes((prev) => prev.filter((n) => n !== midiNote));
  }, []);

  playNoteRef.current = playNote;
  stopNoteRef.current = stopNote;

  const handleKeyPress = useCallback((note: number) => {
    playNoteRef.current!(note, 0.8);
    recorderRef.current.handleMidiNoteOn(note, 0.8);
  }, []);

  const handleKeyRelease = useCallback((note: number) => {
    stopNoteRef.current!(note);
    recorderRef.current.handleMidiNoteOff(note);
  }, []);

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
        playNoteRef.current!(note, velocity / 127);
        recorderRef.current.handleMidiNoteOn(note, velocity / 127);
      } else if (
        (status >= 128 && status <= 143) ||
        (status >= 144 && status <= 159 && velocity === 0)
      ) {
        stopNoteRef.current!(note);
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

  // Poll audioEngine.isPlaying for LIVE indicator
  useEffect(() => {
    let id: number;
    const check = () => {
      setIsPlaying(audioEngine.isPlaying);
      id = requestAnimationFrame(check);
    };
    id = requestAnimationFrame(check);
    return () => cancelAnimationFrame(id);
  }, []);

  const genreStyle      = GENRE_STYLE[currentGenre];
  const presetLabel     = genrePresets[currentGenre]?.label ?? '';
  const beatMs          = (60 / currentBpm) * 1000;

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
        <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-purple-900/50 bg-black/80 backdrop-blur-sm gap-4">
          <div className="flex-shrink-0">
            <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
              TRIP UNDER THE NIGHT
            </h1>
            <p className="text-[9px] text-gray-700 tracking-widest">DARKWAVE · SYNTHWAVE · DARK PHONK</p>
          </div>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            {genreStyle && (
              <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold flex-shrink-0 ${genreStyle.pill}`}>
                <span>{genreIcons[currentGenre]}</span>
                <span>{presetLabel}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setMode('daw')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${mode === 'daw' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'bg-gray-900 text-gray-600 hover:bg-gray-800'}`}
            >DAW</button>
            <button onClick={() => setMode('session')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${mode === 'session' ? 'bg-pink-500/30 text-pink-300 border border-pink-500/40' : 'bg-gray-900 text-gray-600 hover:bg-gray-800'}`}
            >SESSION</button>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="flex flex-col items-end gap-0.5">
              <span className={`text-[8px] font-bold ${isPlaying ? 'text-pink-500' : 'text-gray-700'} tracking-widest`}>
                {isPlaying ? '● LIVE' : '○ IDLE'}
              </span>
              <WaveformDisplay isPlaying={isPlaying} compact />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col">
          {mode === 'session' ? <SessionView /> : <DawView />}
        </div>

        <div className="flex-shrink-0 border-t border-purple-900/30 bg-black/80 backdrop-blur-sm px-3 pt-2 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <RecordingControls />
            <div className="flex-1" />
            <SaveButton />
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
