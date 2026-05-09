import { Lesson } from '../data/lessons';

interface LessonContentProps {
  lesson: Lesson;
  exercise: number;
  lessonComplete: boolean;
  onNext: () => void;
  correctNotes: number;
  totalAttempts: number;
}

const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  exercise,
  lessonComplete,
  onNext,
  correctNotes,
  totalAttempts,
}) => {
  const currentExercise = lesson.exercises[exercise];

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{lesson.title}</h2>
          <p className="text-gray-400">{lesson.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${lesson.difficulty === 'Principiante' ? 'bg-green-500/20 text-green-400' : lesson.difficulty === 'Intermedio' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
          {lesson.difficulty}
        </span>
      </div>

      {currentExercise && (
        <div className="bg-gray-900/50 rounded-xl p-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-purple-300">
              Ejercicio {exercise + 1}: {currentExercise.name}
            </h3>
            <span className="text-sm text-gray-500">
              {exercise + 1}/{lesson.exercises.length}
            </span>
          </div>
          <p className="text-gray-300 mb-4">{currentExercise.description}</p>
          <div className="flex items-center gap-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
            <span className="text-2xl">💡</span>
            <p className="text-sm text-purple-200">{currentExercise.tip}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          <span>Exactitud: {totalAttempts > 0 ? Math.round((correctNotes / totalAttempts) * 100) : 0}%</span>
          <span className="mx-2">•</span>
          <span>Notas acertadas: {correctNotes}</span>
        </div>
        {lessonComplete && (
          <button
            onClick={onNext}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2"
          >
            Siguiente Ejercicio
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonContent;