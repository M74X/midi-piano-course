import { Lesson } from '../data/lessons';

interface LessonNavProps {
  lessons: Lesson[];
  currentLesson: number;
  onSelectLesson: (index: number) => void;
}

const LessonNav: React.FC<LessonNavProps> = ({ lessons, currentLesson, onSelectLesson }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-center">📚 Lecciones</h2>
      <div className="space-y-2">
        {lessons.map((lesson, index) => (
          <button
            key={lesson.id}
            onClick={() => onSelectLesson(index)}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              currentLesson === index
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${lesson.color}`}></div>
              <div className="flex-1">
                <div className="font-medium text-sm">{lesson.title}</div>
                <div className="text-xs opacity-70">{lesson.difficulty}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
        <h3 className="text-sm font-semibold text-purple-300 mb-2">🎯 Consejos para KeyLab</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Conecta tu KeyLab por USB</li>
          <li>• Activa el canal MIDI en tu DAW</li>
          <li>• Ajusta la sensitividad si es necesario</li>
          <li>• Usa el knob de modulation</li>
        </ul>
      </div>
    </div>
  );
};

export default LessonNav;