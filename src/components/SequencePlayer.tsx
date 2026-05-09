import { useState, useEffect } from 'react';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface SequencePlayerProps {
  targetNotes: number[];
  currentStep: number;
  lessonName: string;
  lessonTip: string;
  correctCount: number;
  wrongCount: number;
  streak: number;
  isDemoPlaying: boolean;
  demoStep: number;
  onPlayGuide: (note: number) => void;
  onPlayDemo: () => void;
}

const SequencePlayer: React.FC<SequencePlayerProps> = ({
  targetNotes,
  currentStep,
  lessonName,
  lessonTip,
  correctCount,
  wrongCount,
  streak,
  isDemoPlaying,
  demoStep,
  onPlayGuide,
  onPlayDemo,
}) => {
  const [wrongFlash, setWrongFlash] = useState(false);

  const total = correctCount + wrongCount;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 100;

  const displayStep = isDemoPlaying ? demoStep : currentStep;
  const currentNote = targetNotes[displayStep];
  const noteName = currentNote !== undefined ? NOTE_NAMES[currentNote % 12] : '–';
  const octave = currentNote !== undefined ? Math.floor(currentNote / 12) - 1 : 4;

  useEffect(() => {
    if (wrongCount === 0) return;
    setWrongFlash(true);
    const t = setTimeout(() => setWrongFlash(false), 400);
    return () => clearTimeout(t);
  }, [wrongCount]);

  return (
    <div className="bg-gradient-to-r from-cyan-900/25 via-purple-900/25 to-pink-900/25 rounded-xl p-4 border border-cyan-500/20 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-cyan-400 truncate">{lessonName}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isDemoPlaying
              ? `Demo: nota ${demoStep + 1}/${targetNotes.length}`
              : `Paso ${Math.min(currentStep + 1, targetNotes.length)} / ${targetNotes.length}`}
          </p>
        </div>

        {/* Demo + guide buttons */}
        <div className="flex gap-2 flex-shrink-0 ml-2">
          <button
            onClick={() => !isDemoPlaying && currentNote !== undefined && onPlayGuide(currentNote)}
            disabled={isDemoPlaying}
            className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition text-xs disabled:opacity-40"
          >
            🔊 Nota
          </button>
          <button
            onClick={onPlayDemo}
            className={`px-3 py-1.5 rounded-lg transition text-xs font-bold ${
              isDemoPlaying
                ? 'bg-red-500/30 text-red-300 hover:bg-red-500/40 animate-pulse'
                : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
            }`}
          >
            {isDemoPlaying ? '⏹ Stop' : '▶ Demo'}
          </button>
        </div>
      </div>

      {/* Score row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-black/30 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-green-400 leading-none">{correctCount}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">CORRECTAS</p>
        </div>
        <div className={`bg-black/30 rounded-lg p-2 text-center transition-colors ${wrongFlash ? 'bg-red-900/50' : ''}`}>
          <p className={`text-lg font-bold leading-none transition-colors ${wrongFlash ? 'text-red-400' : 'text-red-500'}`}>
            {wrongCount}
          </p>
          <p className="text-[10px] text-gray-600 mt-0.5">ERRORES</p>
        </div>
        <div className="bg-black/30 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-purple-400 leading-none">{streak}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">RACHA</p>
        </div>
      </div>

      {/* Accuracy bar */}
      {total > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-gray-600">Precisión</span>
            <span className={accuracy >= 80 ? 'text-green-400' : accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}>
              {accuracy}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                accuracy >= 80 ? 'bg-gradient-to-r from-cyan-500 to-green-500' :
                accuracy >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-red-500 to-pink-500'
              }`}
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>
      )}

      {/* Current note + sequence dots */}
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-14 h-14 rounded-xl border flex flex-col items-center justify-center transition-all
          ${wrongFlash ? 'border-red-500 bg-red-900/30'
            : isDemoPlaying ? 'border-yellow-400/60 bg-yellow-900/20'
            : 'border-cyan-500/40 bg-black/40'}`}>
          <span className={`text-2xl font-bold leading-none ${
            wrongFlash ? 'text-red-400' : isDemoPlaying ? 'text-yellow-400' : 'text-cyan-300'}`}>
            {wrongFlash ? '✗' : noteName}
          </span>
          {!wrongFlash && <span className="text-xs text-gray-500">{octave}</span>}
        </div>

        <div className="flex flex-wrap gap-1 flex-1 overflow-hidden" style={{ maxHeight: 52 }}>
          {targetNotes.map((note, i) => (
            <button
              key={i}
              onClick={() => onPlayGuide(note)}
              className={`w-7 h-7 rounded text-[10px] font-bold transition-all ${
                i < (isDemoPlaying ? demoStep : currentStep)
                  ? 'bg-green-500/30 text-green-400'
                  : i === (isDemoPlaying ? demoStep : currentStep)
                    ? isDemoPlaying
                      ? 'bg-yellow-400/60 text-yellow-900 border border-yellow-400'
                      : 'bg-cyan-500/60 text-cyan-100 border border-cyan-400 animate-pulse'
                    : 'bg-gray-800/50 text-gray-600'
              }`}
            >
              {NOTE_NAMES[note % 12]}
            </button>
          ))}
        </div>
      </div>

      {/* Step progress bar */}
      <div className="h-1 bg-gray-800 rounded-full overflow-hidden mt-3">
        <div
          className={`h-full rounded-full transition-all duration-200 ${isDemoPlaying ? 'bg-yellow-400' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`}
          style={{ width: `${targetNotes.length > 0 ? ((isDemoPlaying ? demoStep + 1 : currentStep) / targetNotes.length) * 100 : 0}%` }}
        />
      </div>

      <p className="text-[10px] text-gray-600 mt-2 italic truncate">{lessonTip}</p>
    </div>
  );
};

export default SequencePlayer;