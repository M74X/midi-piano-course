interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="bg-gray-800 rounded-full p-1 mb-6">
      <div
        className="h-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      ></div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>Progreso del curso</span>
        <span>{progress}%</span>
      </div>
    </div>
  );
};

export default ProgressBar;