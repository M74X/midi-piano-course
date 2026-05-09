import { useState, useEffect, useCallback, useRef } from 'react';
import PianoKeyboard from './components/PianoKeyboard';
import SynthControls from './components/SynthControls';
import EffectsPanel from './components/EffectsPanel';
import LessonGrid from './components/LessonGrid';
import Metronome from './components/Metronome';
import WaveformDisplay from './components/WaveformDisplay';
import SequencePlayer from './components/SequencePlayer';
import { lessons } from './data/synthLessons';

function App() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [targetNotes, setTargetNotes] = useState<number[]>([]);
  const [highlightedNotes, setHighlightedNotes] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [sequenceMode, setSequenceMode] = useState(false);
  const [showGuideNote, setShowGuideNote] = useState(true);

  // Synth params
  const [waveform, setWaveform] = useState<'sine' | 'square' | 'sawtooth' | 'triangle'>('sawtooth');
  const [attack, setAttack] = useState(0.05);
  const [decay, setDecay] = useState(0.3);
  const [sustain, setSustain] = useState(0.4);
  const [release, setRelease] = useState(0.5);
  const [volume, setVolume] = useState(0.7);
  const [detune, setDetune] = useState(0);

  // Effects
  const [reverbMix, setReverbMix] = useState(0.3);
  const [delayTime, setDelayTime] = useState(0.4);
  const [delayMix, setDelayMix] = useState(0.2);
  const [distortion, setDistortion] = useState(0);
  const [filterCutoff, setFilterCutoff] = useState(8000);
  const [chorusRate, setChorusRate] = useState(0);

  // Audio nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const delayFeedbackRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const distortionNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const chorusNodesRef = useRef<{ delay: DelayNode; lfo: OscillatorNode; lfoGain: GainNode }[]>([]);

  // Active notes tracking - store oscillators for proper cleanup
  const activeNotesRef = useRef<Map<number, { oscs: OscillatorNode[]; gainNode: GainNode }>>(new Map());

  // MIDI debounce - prevent machine gun effect from duplicate NoteOn messages
  const midiDebounceRef = useRef<Map<number, number>>(new Map());

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    // Resume if suspended (browsers require user gesture to start audio)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (!masterGainRef.current) {
      // Master gain
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = volume;
      masterGainRef.current.connect(audioContextRef.current.destination);

      // Create reverb impulse response
      convolverRef.current = audioContextRef.current.createConvolver();
      const reverbLength = 2;
      const sampleRate = audioContextRef.current.sampleRate;
      const impulse = audioContextRef.current.createBuffer(2, sampleRate * reverbLength, sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.5));
        }
      }
      convolverRef.current.buffer = impulse;

      // Delay node
      delayRef.current = audioContextRef.current.createDelay(1);
      delayRef.current.delayTime.value = delayTime;
      delayFeedbackRef.current = audioContextRef.current.createGain();
      delayFeedbackRef.current.gain.value = 0.4;
      delayRef.current.connect(delayFeedbackRef.current);
      delayFeedbackRef.current.connect(delayRef.current);

      // Distortion
      distortionNodeRef.current = audioContextRef.current.createDynamicsCompressor();
      distortionNodeRef.current.threshold.value = -20;
      distortionNodeRef.current.knee.value = 10;
      distortionNodeRef.current.ratio.value = 4;

      // Chorus setup
      const chorus1Delay = audioContextRef.current.createDelay(0.05);
      const chorus1Lfo = audioContextRef.current.createOscillator();
      const chorus1LfoGain = audioContextRef.current.createGain();
      chorus1Lfo.frequency.value = 1.5;
      chorus1Lfo.type = 'sine';
      chorus1LfoGain.gain.value = 0.002;
      chorus1Lfo.connect(chorus1LfoGain);
      chorus1LfoGain.connect(chorus1Delay.delayTime);
      chorus1Lfo.start();
      chorusNodesRef.current.push({ delay: chorus1Delay, lfo: chorus1Lfo, lfoGain: chorus1LfoGain });

      const chorus2Delay = audioContextRef.current.createDelay(0.05);
      const chorus2Lfo = audioContextRef.current.createOscillator();
      const chorus2LfoGain = audioContextRef.current.createGain();
      chorus2Lfo.frequency.value = 1.8;
      chorus2Lfo.type = 'sine';
      chorus2LfoGain.gain.value = 0.0015;
      chorus2Lfo.connect(chorus2LfoGain);
      chorus2LfoGain.connect(chorus2Delay.delayTime);
      chorus2Lfo.start();
      chorusNodesRef.current.push({ delay: chorus2Delay, lfo: chorus2Lfo, lfoGain: chorus2LfoGain });
    }
    return audioContextRef.current;
  }, []);

  // TRUE POLYPHONY - Allow multiple notes to play simultaneously
  const playNote = useCallback((midiNote: number, velocity: number = 0.8) => {
    const ctx = initAudio();

    // Stop any existing instance of this note first
    if (activeNotesRef.current.has(midiNote)) {
      // Cancel pending release timeout — without this, the stale timeout fires
      // after re-trigger and deletes the new note's map entry, making NoteOff a no-op
      const existingTimeout = cleanupTimeoutsRef.current.get(midiNote);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        cleanupTimeoutsRef.current.delete(midiNote);
      }
      const existing = activeNotesRef.current.get(midiNote)!;
      try {
        existing.oscs.forEach(osc => osc.stop());
        existing.oscs.forEach(osc => osc.disconnect());
        existing.gainNode.disconnect();
      } catch (e) { }
      activeNotesRef.current.delete(midiNote);
    }

    // Calculate frequency
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

    // Create oscillators for richer sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filterNode = ctx.createBiquadFilter();

    osc1.frequency.value = freq * (1 + detune / 1000);
    osc2.frequency.value = freq * 2.02;
    osc1.type = waveform;
    osc2.type = waveform;

    // Filter
    filterNode.type = 'lowpass';
    filterNode.frequency.value = filterCutoff;
    filterNode.Q.value = 2;

    // ADSR envelope
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(velocity * volume, now + attack);
    gainNode.gain.exponentialRampToValueAtTime(velocity * volume * sustain, now + attack + decay);

    // Connect
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(filterNode);

    // Effects routing
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    dryGain.gain.value = 1 - distortion;
    wetGain.gain.value = distortion;

    if (distortion > 0 && distortionNodeRef.current && masterGainRef.current) {
      filterNode.connect(distortionNodeRef.current);
      distortionNodeRef.current.connect(wetGain);
      wetGain.connect(masterGainRef.current);
    }
    filterNode.connect(dryGain);
    if (masterGainRef.current) {
      dryGain.connect(masterGainRef.current);
    }

    if (delayMix > 0 && delayRef.current && delayFeedbackRef.current && masterGainRef.current) {
      const delayGain = ctx.createGain();
      delayGain.gain.value = delayMix;
      delayRef.current.delayTime.value = delayTime;
      delayFeedbackRef.current.gain.value = 0.4;
      filterNode.connect(delayRef.current);
      // delayRef→delayFeedbackRef→delayRef loop already wired in initAudio; do NOT re-add
      delayRef.current.connect(delayGain);
      delayGain.connect(masterGainRef.current);
    }

    if (reverbMix > 0 && convolverRef.current) {
      const reverbGain = ctx.createGain();
      reverbGain.gain.value = reverbMix;
      filterNode.connect(reverbGain);
      reverbGain.connect(convolverRef.current);
      convolverRef.current.connect(masterGainRef.current!);
    }

    if (chorusRate > 0) {
      chorusNodesRef.current.forEach(({ delay, lfoGain }) => {
        lfoGain.gain.value = chorusRate * 0.003;
        filterNode.connect(delay);
        delay.connect(masterGainRef.current!);
      });
    }

    osc1.start();
    osc2.start();

    // Store oscillators for later cleanup
    activeNotesRef.current.set(midiNote, { oscs: [osc1, osc2], gainNode });
    setIsPlaying(true);
  }, [initAudio, waveform, attack, decay, sustain, release, volume, detune, filterCutoff, reverbMix, delayTime, delayMix, distortion, chorusRate]);

  // Track cleanup timeouts for proper cleanup
  const cleanupTimeoutsRef = useRef<Map<number, number>>(new Map());

  const stopNote = useCallback((midiNote: number) => {
    const ctx = audioContextRef.current;
    if (ctx && activeNotesRef.current.has(midiNote)) {
      // Clear any existing timeout for this note
      const existingTimeout = cleanupTimeoutsRef.current.get(midiNote);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const note = activeNotesRef.current.get(midiNote)!;
      // Apply release envelope
      note.gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + release);
      // Clean up after release
      const timeoutId = window.setTimeout(() => {
        try {
          note.oscs.forEach(osc => osc.stop());
          note.oscs.forEach(osc => osc.disconnect());
          note.gainNode.disconnect();
        } catch (e) { }
        activeNotesRef.current.delete(midiNote);
        cleanupTimeoutsRef.current.delete(midiNote);
      }, release * 1000 + 50);
      cleanupTimeoutsRef.current.set(midiNote, timeoutId);
    }
  }, [release]);

  // Handle key press with SEQUENTIAL LESSON SYSTEM
  const handleKeyPress = useCallback((note: number) => {
    if (sequenceMode && showGuideNote) {
      // Sequential mode - check if it's the correct next note
      const expectedNote = targetNotes[currentStep];
      if (note === expectedNote) {
        // Correct note!
        setHighlightedNotes(prev => [...prev, note]);
        setCurrentStep(prev => {
          const nextStep = prev + 1;
          if (nextStep >= targetNotes.length) {
            // Lesson complete!
            setProgress(p => Math.min(p + 10, 100));
            setSequenceMode(false);
            setHighlightedNotes([]);
            return 0;
          }
          return nextStep;
        });
      }
    } else if (targetNotes.includes(note)) {
      // Free mode - just mark as highlighted
      setHighlightedNotes(prev => {
        if (!prev.includes(note)) {
          const newHighlighted = [...prev, note];
          if (newHighlighted.length === targetNotes.length) {
            setProgress(p => Math.min(p + 10, 100));
          }
          return newHighlighted;
        }
        return prev;
      });
    }
  }, [targetNotes, currentStep, sequenceMode, showGuideNote]);

  // Play guide note (demo the note user should play)
  const playGuideNote = useCallback((note: number) => {
    playNote(note, 0.6);
  }, [playNote]);

  // MIDI input with TRUE POLYPHONY support
  useEffect(() => {
    const handleMidiMessage = (event: MIDIMessageEvent) => {
      const data = event.data;
      if (data && data.length >= 3) {
        const [status, note, velocity] = data;

        // Note On (144-159) with velocity > 0
        if (status >= 144 && status <= 159 && velocity > 0) {
          // Debounce: ignore NoteOn if same note fired less than 30ms ago
          const now = performance.now();
          const lastTrigger = midiDebounceRef.current.get(note);
          if (lastTrigger && now - lastTrigger < 30) {
            return; // Ignore duplicate NoteOn
          }
          midiDebounceRef.current.set(note, now);

          playNote(note, velocity / 127);
          handleKeyPress(note);
        }
        // Note Off (128-143) or Note On with velocity 0
        else if (status >= 128 && status <= 143 || (status >= 144 && status <= 159 && velocity === 0)) {
          stopNote(note);
        }
      }
    };

    let midiAccess: MIDIAccess | null = null;

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(access => {
        midiAccess = access;
        access.inputs.forEach(input => {
          input.onmidimessage = handleMidiMessage;
        });
      }).catch(() => { });
    }

    return () => {
      if (midiAccess) {
        midiAccess.inputs.forEach(input => {
          input.onmidimessage = null;
        });
      }
    };
  }, [playNote, handleKeyPress]);

  // Load lesson
  useEffect(() => {
    if (lessons[currentLesson]) {
      setTargetNotes(lessons[currentLesson].pattern);
      setHighlightedNotes([]);
      setCurrentStep(0);
      setSequenceMode(true);
      setBpm(lessons[currentLesson].bpm);
    }
  }, [currentLesson]);

  const selectLesson = (index: number) => {
    setCurrentLesson(index);
    setHighlightedNotes([]);
    setCurrentStep(0);
    setSequenceMode(true);
  };

  const getCurrentGuideNote = () => {
    if (sequenceMode && targetNotes.length > 0 && currentStep < targetNotes.length) {
      return targetNotes[currentStep];
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Neon grid background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(138, 43, 226, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(138, 43, 226, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-lg">
            SYNTHWAVE PIANO
          </h1>
          <p className="text-gray-400 text-lg">Darkwave • Synthwave • Dark Phonk</p>
          <div className="flex justify-center gap-4 mt-4">
            <span className="px-3 py-1 bg-pink-500/20 border border-pink-500/50 rounded-full text-sm text-pink-400">
              🎹 TRUE POLYPHONY
            </span>
            <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-sm text-cyan-400">
              {sequenceMode ? '🎯 SEQUENCE MODE' : '🎸 FREE MODE'}
            </span>
            <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm text-purple-400">
              {bpm} BPM
            </span>
          </div>
        </header>

        {/* Sequential Lesson Player */}
        {sequenceMode && (
          <SequencePlayer
            targetNotes={targetNotes}
            currentStep={currentStep}
            onPlayGuide={playGuideNote}
            lessonName={lessons[currentLesson]?.name || ''}
          />
        )}

        {/* Waveform Display */}
        <WaveformDisplay isPlaying={isPlaying} />

        {/* Synth Controls */}
        <SynthControls
          waveform={waveform}
          setWaveform={setWaveform}
          attack={attack}
          setAttack={setAttack}
          decay={decay}
          setDecay={setDecay}
          sustain={sustain}
          setSustain={setSustain}
          release={release}
          setRelease={setRelease}
          volume={volume}
          setVolume={setVolume}
          detune={detune}
          setDetune={setDetune}
          filterCutoff={filterCutoff}
          setFilterCutoff={setFilterCutoff}
        />

        {/* Effects */}
        <EffectsPanel
          reverbMix={reverbMix}
          setReverbMix={setReverbMix}
          delayTime={delayTime}
          setDelayTime={setDelayTime}
          delayMix={delayMix}
          setDelayMix={setDelayMix}
          distortion={distortion}
          setDistortion={setDistortion}
          filterCutoff={filterCutoff}
          setFilterCutoff={setFilterCutoff}
          chorusRate={chorusRate}
          setChorusRate={setChorusRate}
        />

        {/* Piano Keyboard with guide note highlighting */}
        <div className="mb-6">
          <PianoKeyboard
            highlightedNotes={highlightedNotes}
            targetNotes={targetNotes}
            guideNote={sequenceMode ? getCurrentGuideNote() : null}
            onKeyPress={(note) => {
              playNote(note, 0.8);
              handleKeyPress(note);
            }}
            onKeyRelease={stopNote}
          />
        </div>

        {/* Metronome */}
        <Metronome bpm={bpm} setBpm={setBpm} />

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setSequenceMode(!sequenceMode)}
            className={`px-6 py-3 rounded-full font-bold transition-all ${sequenceMode
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            {sequenceMode ? '🎯 Modo Secuencia Activo' : '🎸 Modo Libre'}
          </button>
        </div>

        {/* Lesson Grid */}
        <LessonGrid
          lessons={lessons}
          currentLesson={currentLesson}
          onSelectLesson={selectLesson}
          progress={progress}
        />

        {/* Progress */}
        <div className="mt-6 bg-gray-900/50 rounded-full p-1">
          <div
            className="h-3 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-gray-500 mt-2">Progreso: {progress}%</p>

        {/* Instructions */}
        {sequenceMode && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30 text-center">
            <p className="text-purple-300">
              🎯 <strong>Modo Secuencia:</strong> Presiona las teclas en orden. La tecla verde es la siguiente nota que debes tocar.
            </p>
            <button
              onClick={() => playGuideNote(targetNotes[currentStep])}
              className="mt-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition"
            >
              🔊 Escuchar nota guía
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;