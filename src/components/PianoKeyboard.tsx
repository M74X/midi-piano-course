import { useState } from 'react';

interface PianoKeyboardProps {
  highlightedNotes: number[];
  targetNotes: number[];
  guideNote: number | null;
  onKeyPress: (note: number) => void;
  onKeyRelease: (note: number) => void;
}

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  highlightedNotes,
  targetNotes,
  onKeyPress,
  onKeyRelease,
}) => {
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const startNote = 48; // C3
  const octaves = 2;

  const isBlackKey = (note: number): boolean => {
    const n = note % 12;
    return [1, 3, 6, 8, 10].includes(n);
  };

  const getNoteName = (note: number): string => {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return names[note % 12];
  };

  const isHighlighted = (note: number): boolean => highlightedNotes.includes(note);
  const isTarget = (note: number): boolean => targetNotes.includes(note);
  const isActive = (note: number): boolean => activeNotes.has(note);

  const getKeyStyle = (note: number): React.CSSProperties => {
    const isBlack = isBlackKey(note);
    const highlighted = isHighlighted(note);
    const target = isTarget(note);
    const active = isActive(note);

    if (active) {
      return {
        background: highlighted
          ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
          : 'linear-gradient(180deg, #ec4899 0%, #db2777 100%)',
        boxShadow: highlighted
          ? '0 0 30px #10b981, 0 0 60px #10b981'
          : '0 0 30px #ec4899, 0 0 60px #ec4899',
      };
    }

    if (highlighted) {
      return {
        background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
        boxShadow: '0 0 20px #10b981',
      };
    }

    if (target) {
      return {
        background: 'linear-gradient(180deg, #facc15 0%, #eab308 100%)',
        boxShadow: '0 0 20px #facc15, inset 0 -2px 10px rgba(0,0,0,0.3)',
        animation: 'pulse 1s ease-in-out infinite',
      };
    }

    return {
      background: isBlack
        ? 'linear-gradient(180deg, #1f2937 0%, #111827 100%)'
        : 'linear-gradient(180deg, #f9fafb 0%, #e5e7eb 100%)',
    };
  };

  const handleMouseDown = (note: number) => {
    setActiveNotes(prev => new Set([...prev, note]));
    onKeyPress(note);
  };

  const handleMouseUp = (note: number) => {
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    onKeyRelease(note);
  };

  const renderOctave = (octaveIndex: number) => {
    const whiteKeys: JSX.Element[] = [];
    const blackKeys: { note: number; element: JSX.Element }[] = [];

    for (let i = 0; i < 12; i++) {
      const note = startNote + (octaveIndex * 12) + i;
      const isBlack = isBlackKey(note);

      const keyElement = (
        <button
          key={note}
          className={`relative transition-all duration-100 rounded-b-lg flex items-end justify-center pb-2 ${isBlack
            ? 'w-8 h-24 -mt-20 z-20 mx-[-16px]'
            : 'w-12 h-36'
            }`}
          style={getKeyStyle(note)}
          onMouseDown={() => handleMouseDown(note)}
          onMouseUp={() => handleMouseUp(note)}
          onMouseLeave={() => {
            if (activeNotes.has(note)) {
              handleMouseUp(note);
            }
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handleMouseDown(note);
          }}
          onTouchEnd={() => handleMouseUp(note)}
        >
          <span className={`text-xs font-bold ${isBlack ? 'text-gray-400' : 'text-gray-600'}`}>
            {isTarget(note) || isHighlighted(note) || isActive(note) ? getNoteName(note) : ''}
          </span>
        </button>
      );

      if (isBlack) {
        blackKeys.push({ note, element: keyElement });
      } else {
        whiteKeys.push(keyElement);
      }
    }

    // Calculate black key positions based on which white keys they follow
    const getBlackKeyPosition = (noteIndex: number): number => {
      // Black keys are positioned after specific white keys
      // C# is after C (index 0), D# after D (index 2), etc.
      const positions: { [key: number]: number } = {
        1: 0,  // C# after C
        3: 1,  // D# after D
        6: 3,  // F# after F
        8: 4,  // G# after G
        10: 5, // A# after A
      };
      return positions[noteIndex % 12] ?? 0;
    };

    return (
      <div key={octaveIndex} className="flex relative">
        <div className="flex">{whiteKeys}</div>
        <div className="absolute inset-0 flex pointer-events-none">
          {blackKeys.map(({ note, element }) => {
            const noteIndex = note % 12;
            const position = getBlackKeyPosition(noteIndex);
            return (
              <div
                key={note}
                className="absolute pointer-events-auto"
                style={{ left: `${(position + 1) * 48 - 16}px` }}
              >
                {element}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-cyan-900/50 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-sm">
      <div className="flex gap-1 min-w-fit overflow-x-auto pb-4">
        {Array.from({ length: octaves }, (_, i) => renderOctave(i))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-yellow-400 rounded shadow-lg shadow-yellow-400/50"></span>
          <span className="text-gray-400">Objetivo</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-pink-500 rounded shadow-lg shadow-pink-500/50"></span>
          <span className="text-gray-400">Tocando</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-500 rounded shadow-lg shadow-green-500/50"></span>
          <span className="text-gray-400">Completado</span>
        </span>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px #facc15; }
          50% { box-shadow: 0 0 40px #facc15, 0 0 60px #facc15; }
        }
      `}</style>
    </div>
  );
};

export default PianoKeyboard;