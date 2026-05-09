import { useState, useEffect } from 'react';

interface SequencePlayerProps {
  targetNotes: number[];
  currentStep: number;
  onPlayGuide: (note: number) => void;
  lessonName: string;
}

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SequencePlayer: React.FC<SequencePlayerProps> = ({
  targetNotes,
  currentStep,
  onPlayGuide,
  lessonName
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const currentNote = targetNotes[currentStep];
  const noteName = currentNote !== undefined ? noteNames[currentNote % 12] : '';
  const octave = currentNote !== undefined ? Math.floor(currentNote / 12) - 1 : 4;

  const completedSteps = currentStep;
  const totalSteps = targetNotes.length;
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="mb-6 bg-gradient-to-r from-cyan-900/30 via-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-cyan-500/30 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            {lessonName}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Nota {currentStep + 1} de {totalSteps}
          </p>
        </div>
        <button
          onClick={() => {
            if (currentNote !== undefined) {
              setIsAnimating(true);
              onPlayGuide(currentNote);
              setTimeout(() => setIsAnimating(false), 500);
            }
          }}
          className={`px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition flex items-center gap-2 ${isAnimating ? 'animate-pulse' : ''
            }`}
        >
          <span>🔊</span>
          Escuchar Nota
        </button>
      </div>

      {/* Current Note Display */}
      <div className="flex items-center justify-center mb-4">
        <div className={`bg-black/50 rounded-2xl p-8 border-2 ${isAnimating ? 'border-cyan-400 shadow-lg shadow-cyan-400/50' : 'border-purple-500/50'
          } transition-all`}>
          <div className="text-center">
            <span className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {noteName}
            </span>
            <span className="text-3xl font-bold text-gray-400 ml-2">
              {octave}
            </span>
            <p className="text-gray-400 text-sm mt-2">MIDI: {currentNote}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progreso</span>
          <span>{completedSteps}/{totalSteps}</span>
        </div>
        <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Note Sequence Visualization */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {targetNotes.map((note, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const noteName = noteNames[note % 12];

          return (
            <button
              key={index}
              onClick={() => onPlayGuide(note)}
              className={`
                min-w-[48px] h-12 rounded-lg font-bold text-sm transition-all flex items-center justify-center
                ${isCompleted
                  ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                  : isCurrent
                    ? 'bg-cyan-500/50 text-cyan-300 border-2 border-cyan-400 animate-pulse'
                    : 'bg-gray-800/50 text-gray-500 border border-gray-700 hover:bg-gray-700'
                }
              `}
            >
              {noteName}
            </button>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-black/30 rounded-lg text-center">
        <p className="text-purple-300 text-sm">
          Toca la nota indicada en tu teclado MIDI o haz clic en las teclas
        </p>
      </div>
    </div>
  );
};

export default SequencePlayer;