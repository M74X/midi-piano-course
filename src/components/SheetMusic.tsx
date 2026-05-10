import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import { getNoteColor } from '../utils/noteColors';

interface SheetMusicProps {
  notes: number[];
  currentStep: number;
  demoStep: number;
  isDemoPlaying: boolean;
}

const NOTES_PER_BAR = 4;
const VEX_LETTERS = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
const SHARP_PCS   = new Set([1, 3, 6, 8, 10]);

function midiToVex(midi: number): { key: string; sharp: boolean } {
  const pc     = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return { key: `${VEX_LETTERS[pc]}/${octave}`, sharp: SHARP_PCS.has(pc) };
}

const STAVE_Y    = 22;
const STAVE_H    = 125;
const FIRST_XTRA = 68;
const BAR_PAD    = 18;

const COL_PAST    = '#059669';
const COL_CURRENT = '#22d3ee';
const COL_STAVE   = '#374151';
const COL_SYMBOL  = '#6b7280';

// 4-bar loop length in Transport ticks
const LOOP_BARS = 4;

const SheetMusic: React.FC<SheetMusicProps> = ({
  notes, currentStep, demoStep, isDemoPlaying,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef    = useRef<HTMLDivElement>(null);
  const rafRef       = useRef(0);
  const metroRef     = useRef<Tone.Synth | null>(null);
  const scheduleRef  = useRef<number | null>(null);
  const [metroOn, setMetroOn] = useState(false);

  const activeStep = isDemoPlaying && demoStep >= 0 ? demoStep : currentStep;

  // FIX 1 — Transport cursor via requestAnimationFrame
  useEffect(() => {
    const tick = () => {
      const cursor = cursorRef.current;
      const outer  = cursor?.parentElement;
      if (cursor && outer) {
        if (Tone.Transport.state === 'started') {
          const ppq       = Tone.Transport.PPQ;
          const loopTicks = LOOP_BARS * 4 * ppq;
          const progress  = (Tone.Transport.ticks % loopTicks) / loopTicks;
          cursor.style.left    = `${progress * outer.clientWidth}px`;
          cursor.style.opacity = '1';
        } else {
          cursor.style.left    = '0px';
          cursor.style.opacity = '0';
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // FIX 3 — Metronome schedule on/off
  useEffect(() => {
    if (metroOn) {
      if (!metroRef.current) {
        metroRef.current = new Tone.Synth({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
        }).toDestination();
      }
      const metro = metroRef.current;
      scheduleRef.current = Tone.Transport.scheduleRepeat((time) => {
        const pos  = Tone.Transport.position as string;
        const beat = parseInt(pos.split(':')[1] ?? '0', 10);
        metro.triggerAttackRelease(beat === 0 ? 'C6' : 'G5', '32n', time);
      }, '4n');
    } else {
      if (scheduleRef.current !== null) {
        Tone.Transport.clear(scheduleRef.current);
        scheduleRef.current = null;
      }
    }
    return () => {
      if (scheduleRef.current !== null) {
        Tone.Transport.clear(scheduleRef.current);
        scheduleRef.current = null;
      }
    };
  }, [metroOn]);

  // Cleanup metro synth on unmount
  useEffect(() => {
    return () => { metroRef.current?.dispose(); };
  }, []);

  // VexFlow render — FIX 2: future notes colored by pitch via getNoteColor
  useEffect(() => {
    const el = containerRef.current;
    if (!el || notes.length === 0) return;

    el.innerHTML = '';

    const numBars   = Math.ceil(notes.length / NOTES_PER_BAR);
    const elW       = el.clientWidth || 720;
    const barW      = Math.max(160, Math.floor((elW - FIRST_XTRA - 10) / numBars));
    const totalSvgW = FIRST_XTRA + barW * numBars + 10;

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(totalSvgW, STAVE_H);
    const ctx = renderer.getContext();
    ctx.setStrokeStyle(COL_STAVE);
    ctx.setFillStyle(COL_SYMBOL);

    let xCursor = 5;

    for (let barIdx = 0; barIdx < numBars; barIdx++) {
      const isFirst  = barIdx === 0;
      const thisBarW = isFirst ? barW + FIRST_XTRA : barW;

      const stave = new Stave(xCursor, STAVE_Y, thisBarW);
      stave.setStyle({ strokeStyle: COL_STAVE, lineWidth: 1 });
      if (isFirst) stave.addClef('treble').addTimeSignature('4/4');
      stave.setContext(ctx).draw();

      const barNotes: StaveNote[] = [];
      const start = barIdx * NOTES_PER_BAR;
      const end   = Math.min(start + NOTES_PER_BAR, notes.length);

      for (let ni = start; ni < end; ni++) {
        const { key, sharp } = midiToVex(notes[ni]);
        const sn = new StaveNote({ keys: [key], duration: 'q', autoStem: true });

        // FIX 2: past=green, current=cyan, future=pitch color
        const noteColor =
          ni < activeStep   ? COL_PAST :
          ni === activeStep ? COL_CURRENT :
          getNoteColor(notes[ni]);

        if (sharp) {
          const acc = new Accidental('#');
          acc.setStyle({ fillStyle: noteColor, strokeStyle: noteColor });
          sn.addModifier(acc, 0);
        }
        sn.setStyle({ fillStyle: noteColor, strokeStyle: noteColor });
        barNotes.push(sn);
      }

      const restCount = NOTES_PER_BAR - barNotes.length;
      for (let r = 0; r < restCount; r++) {
        const rest = new StaveNote({ keys: ['b/4'], duration: 'qr' });
        rest.setStyle({ fillStyle: '#1f2937', strokeStyle: '#1f2937' });
        barNotes.push(rest);
      }

      const voice = new Voice({ numBeats: 4, beatValue: 4 });
      voice.setStrict(false);
      voice.addTickables(barNotes);
      const fmtWidth = thisBarW - (isFirst ? FIRST_XTRA + BAR_PAD : BAR_PAD);
      new Formatter().joinVoices([voice]).format([voice], fmtWidth);
      voice.draw(ctx, stave);

      if (activeStep >= start && activeStep < end) {
        const activeSN = barNotes[activeStep - start];
        const bb = activeSN.getBoundingBox();
        if (bb) {
          const svgEl = el.querySelector('svg');
          if (svgEl) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            line.setAttribute('x', String(bb.getX() - 4));
            line.setAttribute('y', String(STAVE_Y - 6));
            line.setAttribute('width', String(bb.getW() + 8));
            line.setAttribute('height', String(42));
            line.setAttribute('fill', `${COL_CURRENT}18`);
            line.setAttribute('rx', '3');
            svgEl.appendChild(line);
          }
        }
      }

      xCursor += thisBarW;
    }

    const svgEl = el.querySelector('svg');
    if (svgEl) svgEl.style.background = 'transparent';
  }, [notes, activeStep]);

  if (notes.length === 0) return null;

  return (
    <div
      className="rounded-xl overflow-hidden border border-purple-500/20 bg-black/60 relative"
      style={{ height: STAVE_H }}
    >
      <span className="absolute top-1 left-2 text-[9px] font-mono text-gray-700 pointer-events-none z-10 select-none">
        NOTATION
      </span>

      {/* FIX 3: Metronome toggle */}
      <button
        onClick={() => setMetroOn(v => !v)}
        title={metroOn ? 'Metrónomo ON' : 'Metrónomo OFF'}
        className={`absolute top-1 right-2 z-10 text-[10px] px-1.5 py-0.5 rounded font-bold transition-all ${
          metroOn
            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            : 'bg-gray-900/80 text-gray-600 border border-gray-800 hover:text-gray-400'
        }`}
      >
        {metroOn ? '🔔' : '🔕'}
      </button>

      <div
        ref={containerRef}
        className="w-full overflow-x-auto"
        style={{ height: STAVE_H }}
      />

      {/* FIX 1: Transport cursor — thin vertical line, moves with Tone.Transport */}
      <div
        ref={cursorRef}
        className="absolute pointer-events-none"
        style={{
          top: STAVE_Y - 6,
          left: 0,
          width: 2,
          height: 42,
          background: '#22d3ee',
          boxShadow: '0 0 6px #22d3ee',
          opacity: 0,
          zIndex: 20,
        }}
      />
    </div>
  );
};

export default SheetMusic;
