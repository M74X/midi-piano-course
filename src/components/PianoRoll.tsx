const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface PianoRollProps {
  notes: number[];
  currentStep: number;
  demoStep: number;
  isDemoPlaying: boolean;
  onNotePreview: (note: number) => void;
}

const PianoRoll: React.FC<PianoRollProps> = ({
  notes,
  currentStep,
  demoStep,
  isDemoPlaying,
  onNotePreview,
}) => {
  if (notes.length === 0) return null;

  const minNote = Math.min(...notes);
  const maxNote = Math.max(...notes);
  // Ensure at least a 7-semitone range so narrow melodies still look readable
  const range = Math.max(maxNote - minNote, 7);

  const BAR_H = 14;
  const ROLL_H = 88;
  const PAD = 6;

  const noteToY = (n: number) =>
    PAD + ((maxNote - n) / range) * (ROLL_H - BAR_H - PAD * 2);

  const activeStep = isDemoPlaying ? demoStep : currentStep;

  return (
    <div className="rounded-xl overflow-hidden border border-purple-500/20 bg-black/60 relative select-none" style={{ height: ROLL_H }}>
      {/* Pitch guide lines */}
      {Array.from({ length: range + 1 }, (_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 border-t border-gray-800/60"
          style={{ top: PAD + (i / range) * (ROLL_H - PAD * 2) }}
        />
      ))}

      {/* Note bars */}
      {notes.map((note, i) => {
        const isPast = !isDemoPlaying && i < currentStep;
        const isCurrent = i === activeStep;
        const isFuture = !isPast && !isCurrent;

        let cls = 'bg-purple-500/30 border border-purple-500/20';
        if (isPast) cls = 'bg-green-500/50 border border-green-400/40';
        if (isCurrent) cls = isDemoPlaying
          ? 'bg-yellow-400 border border-yellow-300 shadow-lg shadow-yellow-400/60'
          : 'bg-cyan-400 border border-cyan-300 shadow-lg shadow-cyan-400/60';

        const w = `calc(${(1 / notes.length) * 100}% - 3px)`;
        const l = `calc(${(i / notes.length) * 100}% + 1.5px)`;
        const top = noteToY(note);

        return (
          <button
            key={i}
            className={`absolute rounded transition-all duration-75 flex items-center justify-center cursor-pointer ${cls}`}
            style={{ left: l, top, width: w, height: BAR_H }}
            onClick={() => onNotePreview(note)}
            title={`${NOTE_NAMES[note % 12]}${Math.floor(note / 12) - 1}`}
          >
            {(isCurrent || isFuture === false || notes.length <= 12) && (
              <span className="text-[9px] font-bold text-white/90 leading-none truncate px-0.5">
                {NOTE_NAMES[note % 12]}
              </span>
            )}
          </button>
        );
      })}

      {/* Playhead */}
      {activeStep >= 0 && activeStep < notes.length && (
        <div
          className={`absolute top-0 bottom-0 w-px opacity-60 transition-all duration-75 ${isDemoPlaying ? 'bg-yellow-400' : 'bg-cyan-400'}`}
          style={{ left: `calc(${(activeStep / notes.length) * 100}% + ${(0.5 / notes.length) * 100}%)` }}
        />
      )}

      <span className="absolute top-1 left-2 text-[9px] font-mono text-gray-600 pointer-events-none">
        PIANO ROLL
      </span>
    </div>
  );
};

export default PianoRoll;