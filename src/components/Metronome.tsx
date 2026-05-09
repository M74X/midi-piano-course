import { useState, useEffect, useRef, useCallback } from 'react';

interface MetronomeProps {
  bpm: number;
  setBpm: (bpm: number) => void;
}

const bpmPresets = [
  { name: 'SLOW', bpm: 60 },
  { name: 'CHILL', bpm: 80 },
  { name: 'SYNTHWAVE', bpm: 118 },
  { name: 'DARKPHONK', bpm: 140 },
  { name: 'HYPER', bpm: 160 },
  { name: 'MAX', bpm: 200 },
];

const Metronome: React.FC<MetronomeProps> = ({ bpm, setBpm }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playTick = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 1000;
    gain.gain.value = 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = 60000 / bpm;
      intervalRef.current = window.setInterval(playTick, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm, playTick]);

  return (
    <div className="mb-6 bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-xl p-4 border border-cyan-500/30 backdrop-blur-sm">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
              isPlaying
                ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/50 animate-pulse'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <div>
            <span className="text-sm text-gray-400">BPM</span>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(Math.max(40, Math.min(240, parseInt(e.target.value) || 60)))}
              className="w-20 bg-transparent text-3xl font-bold text-cyan-400 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {bpmPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setBpm(preset.bpm)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                bpm === preset.bpm
                  ? 'bg-cyan-500 text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* BPM Slider */}
      <div className="mt-4">
        <input
          type="range"
          min="40"
          max="240"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>40</span>
          <span className="text-cyan-400">{bpm} BPM</span>
          <span>240</span>
        </div>
      </div>
    </div>
  );
};

export default Metronome;