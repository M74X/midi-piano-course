interface PianoKeyboardProps {
  guideNote: number | null;
  highlightedNotes: number[];
  activeNotes: number[];
  wrongNotes: number[];
  beatMs: number;            // milliseconds per beat — drives guide pulse speed
  onKeyPress: (note: number) => void;
  onKeyRelease: (note: number) => void;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  guideNote,
  highlightedNotes,
  activeNotes,
  wrongNotes,
  beatMs,
  onKeyPress,
  onKeyRelease,
}) => {
  const START_NOTE = 48; // C3
  const OCTAVES = 3;     // C3–B5

  const isBlackKey = (note: number) => [1, 3, 6, 8, 10].includes(note % 12);

  const getKeyStyle = (note: number): React.CSSProperties => {
    const black = isBlackKey(note);

    if (wrongNotes.includes(note)) return {
      background: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
      boxShadow: '0 0 28px #ef4444, 0 0 56px #ef4444',
    };
    if (activeNotes.includes(note)) return {
      background: highlightedNotes.includes(note)
        ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(180deg, #ec4899 0%, #db2777 100%)',
      boxShadow: highlightedNotes.includes(note)
        ? '0 0 28px #10b981'
        : '0 0 28px #ec4899',
    };
    if (highlightedNotes.includes(note)) return {
      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
      boxShadow: '0 0 18px #10b981',
    };
    if (note === guideNote) return {
      background: 'linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)',
      boxShadow: '0 0 22px #22d3ee, 0 0 44px #22d3ee',
      animationName: 'guidePulse',
      animationDuration: `${beatMs / 1000}s`,
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
    };
    return {
      background: black
        ? 'linear-gradient(180deg, #1f2937 0%, #111827 100%)'
        : 'linear-gradient(180deg, #f9fafb 0%, #e5e7eb 100%)',
    };
  };

  const showLabel = (note: number) =>
    note === guideNote || highlightedNotes.includes(note) ||
    activeNotes.includes(note) || wrongNotes.includes(note);

  const BLACK_KEY_POS: Record<number, number> = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 };

  const renderOctave = (octaveOffset: number) => {
    const whiteKeys: JSX.Element[] = [];
    const blackDefs: { note: number; pos: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const note = START_NOTE + octaveOffset * 12 + i;
      const black = isBlackKey(note);

      if (black) {
        blackDefs.push({ note, pos: BLACK_KEY_POS[i] ?? 0 });
      } else {
        whiteKeys.push(
          <button
            key={note}
            className="relative transition-all duration-75 rounded-b-lg flex items-end justify-center pb-2 w-12 h-36"
            style={getKeyStyle(note)}
            onMouseDown={() => onKeyPress(note)}
            onMouseUp={() => onKeyRelease(note)}
            onMouseLeave={() => { if (activeNotes.includes(note)) onKeyRelease(note); }}
            onTouchStart={e => { e.preventDefault(); onKeyPress(note); }}
            onTouchEnd={() => onKeyRelease(note)}
          >
            {showLabel(note) && (
              <span className="text-xs font-bold text-gray-700">{NOTE_NAMES[note % 12]}</span>
            )}
          </button>
        );
      }
    }

    return (
      <div key={octaveOffset} className="flex relative">
        <div className="flex">{whiteKeys}</div>
        <div className="absolute inset-0 flex pointer-events-none">
          {blackDefs.map(({ note, pos }) => (
            <div
              key={note}
              className="absolute pointer-events-auto"
              style={{ left: `${(pos + 1) * 48 - 16}px` }}
            >
              <button
                className="relative transition-all duration-75 rounded-b-lg flex items-end justify-center pb-1 w-8 h-24 -mt-20 z-20 mx-[-16px]"
                style={getKeyStyle(note)}
                onMouseDown={() => onKeyPress(note)}
                onMouseUp={() => onKeyRelease(note)}
                onMouseLeave={() => { if (activeNotes.includes(note)) onKeyRelease(note); }}
                onTouchStart={e => { e.preventDefault(); onKeyPress(note); }}
                onTouchEnd={() => onKeyRelease(note)}
              >
                {showLabel(note) && (
                  <span className="text-[10px] font-bold text-white">{NOTE_NAMES[note % 12]}</span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black/50 rounded-2xl px-4 pt-3 pb-2 border border-purple-500/20 backdrop-blur-sm">
      <div className="flex gap-1 min-w-fit overflow-x-auto pb-2 select-none">
        {Array.from({ length: OCTAVES }, (_, i) => renderOctave(i))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-1 text-[10px] text-gray-600">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-cyan-400 inline-block" /> Siguiente</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-pink-500 inline-block" /> Tocando</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Correcta</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Error</span>
      </div>

      <style>{`
        @keyframes guidePulse {
          0%, 100% { box-shadow: 0 0 18px #22d3ee; }
          50%       { box-shadow: 0 0 42px #22d3ee, 0 0 68px #22d3ee; }
        }
      `}</style>
    </div>
  );
};

export default PianoKeyboard;