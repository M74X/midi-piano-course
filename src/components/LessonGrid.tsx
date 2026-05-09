import { SynthLesson, genreColors } from '../data/synthLessons';

interface LessonGridProps {
  lessons: SynthLesson[];
  currentLesson: number;
  onSelectLesson: (index: number) => void;
  progress: number;
}

const LessonGrid: React.FC<LessonGridProps> = ({
  lessons,
  currentLesson,
  onSelectLesson,
  progress,
}) => {
  return (
    <div className="mb-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-gray-700 backdrop-blur-sm">
      <h3 className="text-lg font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
        🎯 LESSON GRID
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {lessons.map((lesson, index) => {
          const colors = genreColors[lesson.genre];
          const isActive = currentLesson === index;

          return (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson(index)}
              className={`p-3 rounded-lg text-left transition-all transform hover:scale-105 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg shadow-pink-500/50'
                  : `bg-gradient-to-r ${colors.bg} border ${colors.border}`
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">{lesson.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  lesson.difficulty === 'Easy' ? 'bg-green-500/30 text-green-300' :
                  lesson.difficulty === 'Medium' ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-red-500/30 text-red-300'
                }`}>
                  {lesson.difficulty}
                </span>
              </div>
              <div className="text-xs opacity-70 mb-1">{lesson.description}</div>
              <div className="flex items-center gap-2 text-xs">
                <span className={colors.text}>{lesson.bpm} BPM</span>
                <span className="opacity-50">|</span>
                <span className="opacity-70">{lesson.pattern.length} notes</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Lesson Details */}
      {lessons[currentLesson] && (
        <div className="mt-4 p-4 bg-black/30 rounded-lg border border-pink-500/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-pink-400">{lessons[currentLesson].name}</h4>
            <span className="text-cyan-400 text-sm">{lessons[currentLesson].bpm} BPM</span>
          </div>
          <p className="text-sm text-gray-300 mb-3">{lessons[currentLesson].tip}</p>
          <div className="flex gap-2 flex-wrap">
            {lessons[currentLesson].pattern.map((note, i) => (
              <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs font-mono text-pink-400">
                {note}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonGrid;