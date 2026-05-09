import { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';

interface SheetMusicProps {
  notes: number[];
  currentStep: number;
  demoStep: number;
  isDemoPlaying: boolean;
}

const NOTES_PER_BAR = 4;
// Chromatic pitch class → VexFlow letter (sharps only)
const VEX_LETTERS = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
const SHARP_PCS   = new Set([1, 3, 6, 8, 10]);

function midiToVex(midi: number): { key: string; sharp: boolean } {
  const pc     = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return { key: `${VEX_LETTERS[pc]}/${octave}`, sharp: SHARP_PCS.has(pc) };
}

const STAVE_Y    = 22;   // px from SVG top to first staff line
const STAVE_H    = 125;  // total SVG height — fits C3–B5 plus clef curl
const FIRST_XTRA = 68;   // extra width for clef + time-sig in first measure
const BAR_PAD    = 18;   // px padding inside each bar (formatting slack)

// Colour palette (dark theme)
const COL_PAST    = '#059669'; // green
const COL_CURRENT = '#22d3ee'; // cyan
const COL_FUTURE  = '#7c3aed'; // purple
const COL_STAVE   = '#374151'; // gray for lines
const COL_SYMBOL  = '#6b7280'; // gray for clef, time-sig

const SheetMusic: React.FC<SheetMusicProps> = ({
  notes, currentStep, demoStep, isDemoPlaying,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const activeStep = isDemoPlaying && demoStep >= 0 ? demoStep : currentStep;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || notes.length === 0) return;

    el.innerHTML = '';

    const numBars    = Math.ceil(notes.length / NOTES_PER_BAR);
    const elW        = el.clientWidth || 720;
    // Each bar needs at least 160px; expand to fill container
    const barW       = Math.max(160, Math.floor((elW - FIRST_XTRA - 10) / numBars));
    const totalSvgW  = FIRST_XTRA + barW * numBars + 10;

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(totalSvgW, STAVE_H);
    const ctx = renderer.getContext();

    // Base dark-theme colours for stave lines, clef, time-sig
    ctx.setStrokeStyle(COL_STAVE);
    ctx.setFillStyle(COL_SYMBOL);

    let xCursor = 5;

    for (let barIdx = 0; barIdx < numBars; barIdx++) {
      const isFirst = barIdx === 0;
      const thisBarW = isFirst ? barW + FIRST_XTRA : barW;

      const stave = new Stave(xCursor, STAVE_Y, thisBarW);
      stave.setStyle({ strokeStyle: COL_STAVE, lineWidth: 1 });

      if (isFirst) {
        stave.addClef('treble').addTimeSignature('4/4');
      }
      stave.setContext(ctx).draw();

      // Build notes for this bar
      const barNotes: StaveNote[] = [];
      const start = barIdx * NOTES_PER_BAR;
      const end   = Math.min(start + NOTES_PER_BAR, notes.length);

      for (let ni = start; ni < end; ni++) {
        const { key, sharp } = midiToVex(notes[ni]);

        const sn = new StaveNote({ keys: [key], duration: 'q', auto_stem: true });

        if (sharp) {
          const acc = new Accidental('#');
          // colour the accidental to match the note
          const noteColor = ni < activeStep ? COL_PAST : ni === activeStep ? COL_CURRENT : COL_FUTURE;
          acc.setStyle({ fillStyle: noteColor, strokeStyle: noteColor });
          sn.addModifier(acc, 0);
        }

        const noteColor = ni < activeStep ? COL_PAST : ni === activeStep ? COL_CURRENT : COL_FUTURE;
        sn.setStyle({ fillStyle: noteColor, strokeStyle: noteColor });

        barNotes.push(sn);
      }

      // Pad last bar with rests so the voice is always complete
      const restCount = NOTES_PER_BAR - barNotes.length;
      for (let r = 0; r < restCount; r++) {
        const rest = new StaveNote({ keys: ['b/4'], duration: 'qr' });
        rest.setStyle({ fillStyle: '#1f2937', strokeStyle: '#1f2937' });
        barNotes.push(rest);
      }

      const voice = new Voice({ num_beats: 4, beat_value: 4 });
      voice.setStrict(false);
      voice.addTickables(barNotes);

      const fmtWidth = thisBarW - (isFirst ? FIRST_XTRA + BAR_PAD : BAR_PAD);
      new Formatter().joinVoices([voice]).format([voice], fmtWidth);
      voice.draw(ctx, stave);

      // Highlight current beat: vertical line on the active note's column
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

    // Style the SVG element for dark-theme integration
    const svgEl = el.querySelector('svg');
    if (svgEl) {
      svgEl.style.background = 'transparent';
    }
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
      <div
        ref={containerRef}
        className="w-full overflow-x-auto"
        style={{ height: STAVE_H }}
      />
    </div>
  );
};

export default SheetMusic;