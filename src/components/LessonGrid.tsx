import { SynthLesson, genreColors } from '../data/synthLessons';

export interface LessonScore {
  accuracy: number;
  completed: boolean;
}

interface LessonGridProps {
  lessons: SynthLesson[];
  currentLesson: number;
  onSelectLesson: (index: number) => void;
  lessonScores: Record<number, LessonScore>;
}

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy:   'bg-green-500/20 text-green-300',
  Medium: 'bg-yellow-500/20 text-yellow-300',
  Hard:   'bg-red-500/20 text-red-300',
};

const LessonGrid: React.FC<LessonGridProps> = ({
  lessons,
  currentLesson,
  onSelectLesson,
  lessonScores,
}) => {
  return (
    <div className="mb-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 backdrop-blur-sm">
      <h3 className="text-lg font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
        🎯 LECCIÓN ACTUAL
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {lessons.map((lesson, index) => {
          const colors = genreColors[lesson.genre];
          const isActive = currentLesson === index;
          const score = lessonScores[index];

          return (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson(index)}
              className={`p-3 rounded-lg text-left transition-all hover:scale-105 relative ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg shadow-pink-500/40'
                  : `bg-gradient-to-r ${colors.bg} border ${colors.border}/50`
              }`}
            >
              {/* Completion badge */}
              {score?.completed && (
                <div className={`absolute top-1.5 right-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold
                  ${score.accuracy >= 80 ? 'bg-green-500/30 text-green-300' :
                    score.accuracy >= 60 ? 'bg-yellow-500/30 text-yellow-300' :
                    'bg-orange-500/30 text-orange-300'}`}>
                  {score.accuracy}%
                </div>
              )}

              <div className="pr-8">
                <p className="text-xs font-bold leading-tight mb-1">{lesson.name}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${DIFFICULTY_STYLE[lesson.difficulty]}`}>
                    {lesson.difficulty}
                  </span>
                  <span className={`text-xs ${colors.text}`}>{lesson.bpm} BPM</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{lesson.pattern.length} notas</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active lesson tip */}
      {lessons[currentLesson] && (
        <div className="mt-4 p-3 bg-black/30 rounded-lg border border-purple-500/20">
          <p className="text-xs text-purple-300 italic">{lessons[currentLesson].tip}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {lessons[currentLesson].pattern.map((note, i) => {
              const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
              return (
                <span key={i} className="px-2 py-0.5 bg-gray-800 rounded text-xs font-mono text-pink-400">
                  {names[note % 12]}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonGrid;