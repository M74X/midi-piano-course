import { useRef, useEffect } from 'react';
import { getNoteColor } from '../utils/noteColors';

interface PianoKeyboardProps {
  guideNote: number | null;
  highlightedNotes: number[];
  activeNotes: number[];
  wrongNotes: number[];
  beatMs: number;
  onKeyPress: (note: number) => void;
  onKeyRelease: (note: number) => void;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const WHITE_W = 22;
const WHITE_H = 72;
const BLACK_W = 13;
const BLACK_H = 44;

const START_MIDI = 21;  // A0
const END_MIDI   = 108; // C8

const isBlackKey = (note: number) => [1, 3, 6, 8, 10].includes(note % 12);

// Pre-compute full 88-key layout once at module level
const layout = (() => {
  const whites: { note: number; wIdx: number }[] = [];
  const blacks: { note: number; left: number }[] = [];
  let wIdx = 0;
  for (let n = START_MIDI; n <= END_MIDI; n++) {
    if (isBlackKey(n)) {
      // Black key sits between the last placed white and the next one
      blacks.push({ note: n, left: wIdx * WHITE_W - BLACK_W / 2 });
    } else {
      whites.push({ note: n, wIdx });
      wIdx++;
    }
  }
  return { whites, blacks, totalWhite: wIdx }; // totalWhite === 52
})();

const TOTAL_WIDTH = layout.totalWhite * WHITE_W; // 52 × 22 = 1144 px

// White key index of C4 (MIDI 60) — used for initial scroll
const C4_WHITE_IDX = layout.whites.findIndex(k => k.note === 60);
const C4_LEFT      = C4_WHITE_IDX * WHITE_W;

function PianoKeyboard({
  guideNote,
  highlightedNotes,
  activeNotes,
  wrongNotes,
  beatMs,
  onKeyPress,
  onKeyRelease,
}: PianoKeyboardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Center C4 on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = C4_LEFT - el.clientWidth / 2 + WHITE_W / 2;
  }, []);

  // Active octave: the MIDI octave (C{n}..B{n}) that contains guideNote or
  // the first highlighted note — used for the cyan top-bar indicator.
  const activeOctave =
    guideNote !== null
      ? Math.floor(guideNote / 12)
      : highlightedNotes.length > 0
        ? Math.floor(highlightedNotes[0] / 12)
        : null;

  const getKeyStyle = (note: number): React.CSSProperties => {
    const black = isBlackKey(note);
    if (wrongNotes.includes(note)) return {
      background: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
      boxShadow: '0 0 14px #ef4444',
    };
    if (activeNotes.includes(note)) {
      if (highlightedNotes.includes(note)) return {
        background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
        boxShadow: '0 0 12px #10b981',
      };
      const col = getNoteColor(note);
      return {
        background: `linear-gradient(180deg, ${col} 0%, ${col}99 100%)`,
        boxShadow: `0 0 12px ${col}`,
      };
    }
    if (highlightedNotes.includes(note)) return {
      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
      boxShadow: '0 0 10px #10b981',
    };
    if (note === guideNote) return {
      background: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)',
      boxShadow: '0 0 14px #22d3ee',
      animationName: 'guidePulse',
      animationDuration: `${beatMs / 1000}s`,
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
    };
    return {
      background: black
        ? 'linear-gradient(180deg, #1a2030 0%, #0d1117 100%)'
        : 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)',
    };
  };

  const showLabel = (note: number) =>
    note === guideNote || highlightedNotes.includes(note) ||
    activeNotes.includes(note) || wrongNotes.includes(note);

  return (
    <div className="bg-black/60 rounded-xl px-3 pt-2 pb-2 border border-purple-500/20">
      {/* Scrollable keyboard strip */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-1 select-none"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        <div
          className="relative flex-shrink-0"
          style={{ width: TOTAL_WIDTH, height: WHITE_H }}
        >
          {/* White keys */}
          {layout.whites.map(({ note, wIdx }) => {
            const isC   = note % 12 === 0;
            const oct   = Math.floor(note / 12) - 1;
            const inAct = activeOctave !== null && Math.floor(note / 12) === activeOctave;
            return (
              <button
                key={note}
                className="absolute transition-all duration-75 rounded-b-sm flex flex-col items-center justify-end pb-1 border-r border-gray-400/20"
                style={{
                  left: wIdx * WHITE_W,
                  top: 0,
                  width: WHITE_W,
                  height: WHITE_H,
                  ...getKeyStyle(note),
                }}
                onMouseDown={() => onKeyPress(note)}
                onMouseUp={() => onKeyRelease(note)}
                onMouseLeave={() => { if (activeNotes.includes(note)) onKeyRelease(note); }}
                onTouchStart={e => { e.preventDefault(); onKeyPress(note); }}
                onTouchEnd={() => onKeyRelease(note)}
              >
                {showLabel(note) && (
                  <span className="text-[9px] font-bold text-gray-700 leading-none">
                    {NOTE_NAMES[note % 12]}
                  </span>
                )}
                {isC && (
                  <span
                    className={`text-[7px] font-bold leading-none ${inAct ? 'text-cyan-500' : 'text-gray-500/60'}`}
                    style={{ marginTop: 1 }}
                  >
                    C{oct}
                  </span>
                )}
              </button>
            );
          })}

          {/* Active-octave cyan top bar */}
          {activeOctave !== null && (() => {
            const firstNote = layout.whites.find(k => Math.floor(k.note / 12) === activeOctave);
            const lastNote  = [...layout.whites].reverse().find(k => Math.floor(k.note / 12) === activeOctave);
            if (!firstNote || !lastNote) return null;
            const left  = firstNote.wIdx * WHITE_W;
            const right = (lastNote.wIdx + 1) * WHITE_W;
            return (
              <div
                className="absolute top-0 pointer-events-none"
                style={{
                  left,
                  width: right - left,
                  height: 2,
                  background: '#22d3ee',
                  boxShadow: '0 0 6px #22d3ee, 0 0 12px #22d3ee',
                  zIndex: 30,
                }}
              />
            );
          })()}

          {/* Black keys — rendered on top */}
          {layout.blacks.map(({ note, left }) => (
            <button
              key={note}
              className="absolute transition-all duration-75 rounded-b-sm flex flex-col items-center justify-end pb-0.5"
              style={{
                left,
                top: 0,
                width: BLACK_W,
                height: BLACK_H,
                zIndex: 10,
                ...getKeyStyle(note),
              }}
              onMouseDown={() => onKeyPress(note)}
              onMouseUp={() => onKeyRelease(note)}
              onMouseLeave={() => { if (activeNotes.includes(note)) onKeyRelease(note); }}
              onTouchStart={e => { e.preventDefault(); onKeyPress(note); }}
              onTouchEnd={() => onKeyRelease(note)}
            >
              {showLabel(note) && (
                <span className="text-[7px] font-bold text-white leading-none">
                  {NOTE_NAMES[note % 12]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-3 mt-1 text-[8px] text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-cyan-400 inline-block" /> Siguiente
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-pink-500 inline-block" /> Tocando
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-green-500 inline-block" /> Correcta
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Error
        </span>
      </div>

      <style>{`
        @keyframes guidePulse {
          0%, 100% { box-shadow: 0 0 10px #22d3ee; }
          50%       { box-shadow: 0 0 22px #22d3ee, 0 0 38px #22d3ee; }
        }
      `}</style>
    </div>
  );
}

export default PianoKeyboard;
