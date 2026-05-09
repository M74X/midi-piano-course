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

// DAW-style compact dimensions
const WHITE_W = 22;  // px
const WHITE_H = 72;  // px
const BLACK_W = 13;  // px  (~59% of white width — standard piano proportion)
const BLACK_H = 44;  // px  (~61% of white height)
const OCT_W   = 7 * WHITE_W; // 154px per octave

// Semitone index → number of preceding white keys in octave (for positioning)
const BLACK_KEY_POS: Record<number, number> = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 };

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  guideNote,
  highlightedNotes,
  activeNotes,
  wrongNotes,
  beatMs,
  onKeyPress,
  onKeyRelease,
}) => {
  const START_NOTE = 36; // C2
  const OCTAVES    = 5;  // C2 – B6  (≈ C2–C7, 61-key synth range)

  const isBlackKey = (note: number) => [1, 3, 6, 8, 10].includes(note % 12);

  // Active octave = octave containing guideNote, or first highlighted note
  const activeOctaveStart =
    guideNote !== null
      ? Math.floor((guideNote - START_NOTE) / 12)
      : highlightedNotes.length > 0
        ? Math.floor((highlightedNotes[0] - START_NOTE) / 12)
        : null;

  const getKeyStyle = (note: number): React.CSSProperties => {
    const black = isBlackKey(note);

    if (wrongNotes.includes(note)) return {
      background: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
      boxShadow: '0 0 14px #ef4444',
    };
    if (activeNotes.includes(note)) return {
      background: highlightedNotes.includes(note)
        ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(180deg, #ec4899 0%, #db2777 100%)',
      boxShadow: highlightedNotes.includes(note) ? '0 0 12px #10b981' : '0 0 12px #ec4899',
    };
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

  const renderOctave = (octaveOffset: number) => {
    const isActive = activeOctaveStart === octaveOffset;

    const whiteKeys: JSX.Element[] = [];
    const blackDefs: { note: number; pos: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const note = START_NOTE + octaveOffset * 12 + i;
      const black = isBlackKey(note);

      if (black) {
        blackDefs.push({ note, pos: BLACK_KEY_POS[i] ?? 0 });
      } else {
        const isC = (note % 12 === 0);
        whiteKeys.push(
          <button
            key={note}
            className="relative transition-all duration-75 rounded-b-sm flex flex-col items-center justify-end pb-1 border-r border-gray-400/20"
            style={{ width: WHITE_W, height: WHITE_H, ...getKeyStyle(note) }}
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
            {/* Octave label on every C key */}
            {isC && (
              <span
                className={`text-[7px] font-bold leading-none ${isActive ? 'text-cyan-500' : 'text-gray-500/60'}`}
                style={{ marginTop: 1 }}
              >
                C{2 + octaveOffset}
              </span>
            )}
          </button>
        );
      }
    }

    return (
      <div
        key={octaveOffset}
        className="relative flex-shrink-0"
        style={{ width: OCT_W }}
      >
        {/* Active octave top-bar indicator */}
        {isActive && (
          <div
            className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
            style={{
              height: 2,
              background: '#22d3ee',
              boxShadow: '0 0 6px #22d3ee, 0 0 12px #22d3ee',
            }}
          />
        )}

        {/* Non-active dimming overlay */}
        {!isActive && activeOctaveStart !== null && (
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.22)' }}
          />
        )}

        {/* White keys */}
        <div className="flex">{whiteKeys}</div>

        {/* Black keys overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 25 }}>
          {blackDefs.map(({ note, pos }) => {
            const leftPx = (pos + 1) * WHITE_W - BLACK_W / 2;
            return (
              <div
                key={note}
                className="absolute pointer-events-auto"
                style={{ left: leftPx, top: 0, width: BLACK_W, height: BLACK_H, zIndex: 26 }}
              >
                <button
                  className="relative w-full h-full transition-all duration-75 rounded-b-sm flex flex-col items-center justify-end pb-0.5"
                  style={getKeyStyle(note)}
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
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black/60 rounded-xl px-3 pt-2 pb-2 border border-purple-500/20">
      {/* Keyboard row */}
      <div className="flex overflow-x-auto gap-px min-w-fit pb-1 select-none">
        {Array.from({ length: OCTAVES }, (_, i) => renderOctave(i))}
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
};

export default PianoKeyboard;