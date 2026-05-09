import { waveformPresets } from '../data/synthLessons';

interface SynthControlsProps {
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
  setWaveform: (w: 'sine' | 'square' | 'sawtooth' | 'triangle') => void;
  attack: number;
  setAttack: (v: number) => void;
  decay: number;
  setDecay: (v: number) => void;
  sustain: number;
  setSustain: (v: number) => void;
  release: number;
  setRelease: (v: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  detune: number;
  setDetune: (v: number) => void;
}

const SynthControls: React.FC<SynthControlsProps> = ({
  waveform, setWaveform,
  attack, setAttack,
  decay, setDecay,
  sustain, setSustain,
  release, setRelease,
  volume, setVolume,
  detune, setDetune,
}) => {
  const waveforms: Array<'sine' | 'square' | 'sawtooth' | 'triangle'> = ['sine', 'square', 'sawtooth', 'triangle'];
  const waveformIcons: Record<string, string> = {
    sine: '∿',
    square: '⊓',
    sawtooth: '⋀',
    triangle: '△',
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-cyan-900/30 rounded-xl p-4 border border-purple-500/30 backdrop-blur-sm">
      <h3 className="text-lg font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
        🎛️ SYNTH CONTROLS
      </h3>

      {/* Waveform Selector */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">WAVEFORM</label>
        <div className="flex gap-2">
          {waveforms.map(w => (
            <button
              key={w}
              onClick={() => setWaveform(w)}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-xl transition-all ${
                waveform === w
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {waveformIcons[w]}
            </button>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(waveformPresets).map(([name, preset]) => (
          <button
            key={name}
            onClick={() => {
              setWaveform(preset.waveform);
              setAttack(preset.attack);
              setDecay(preset.decay);
              setSustain(preset.sustain);
              setRelease(preset.release);
            }}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 border border-gray-700 hover:border-pink-500/50 transition-all"
          >
            {name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ADSR Sliders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">ATTACK</label>
          <input
            type="range"
            min="0.001"
            max="1"
            step="0.001"
            value={attack}
            onChange={e => setAttack(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <span className="text-xs text-pink-400">{attack.toFixed(3)}s</span>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">DECAY</label>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={decay}
            onChange={e => setDecay(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <span className="text-xs text-purple-400">{decay.toFixed(2)}s</span>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">SUSTAIN</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={sustain}
            onChange={e => setSustain(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <span className="text-xs text-cyan-400">{(sustain * 100).toFixed(0)}%</span>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">RELEASE</label>
          <input
            type="range"
            min="0.01"
            max="2"
            step="0.01"
            value={release}
            onChange={e => setRelease(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <span className="text-xs text-pink-400">{release.toFixed(2)}s</span>
        </div>
      </div>

      {/* Volume & Detune */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-xs text-gray-400 block mb-1">VOLUME</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <span className="text-xs text-white">{(volume * 100).toFixed(0)}%</span>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">DETUNE</label>
          <input
            type="range"
            min="-50"
            max="50"
            step="1"
            value={detune}
            onChange={e => setDetune(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <span className="text-xs text-pink-400">{detune} cents</span>
        </div>
      </div>
    </div>
  );
};

export default SynthControls;