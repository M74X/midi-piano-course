import Knob from './Knob';

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

const WAVEFORMS: Array<'sine' | 'square' | 'sawtooth' | 'triangle'> = ['sine', 'square', 'sawtooth', 'triangle'];
const WAVE_ICONS: Record<string, string> = { sine: '∿', square: '⊓', sawtooth: '⋀', triangle: '△' };

const SynthControls: React.FC<SynthControlsProps> = ({
  waveform, setWaveform,
  attack, setAttack,
  decay, setDecay,
  sustain, setSustain,
  release, setRelease,
  volume, setVolume,
  detune, setDetune,
}) => (
  <div className="bg-black/50 rounded-xl p-3 border border-purple-500/20">
    {/* Header row with waveform selector */}
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[9px] font-bold tracking-widest text-purple-600">SYNTH</span>
      <div className="flex gap-1 ml-1">
        {WAVEFORMS.map(w => (
          <button
            key={w}
            onClick={() => setWaveform(w)}
            className={`w-8 h-7 rounded text-base font-bold transition-all ${
              waveform === w
                ? 'bg-pink-500/30 text-pink-400 border border-pink-500/50 shadow-[0_0_8px_#ec489960]'
                : 'bg-gray-900 text-gray-600 hover:bg-gray-800 hover:text-gray-400'
            }`}
          >
            {WAVE_ICONS[w]}
          </button>
        ))}
      </div>
      <span className="ml-auto text-[9px] text-gray-700 font-mono">{waveform.toUpperCase()}</span>
    </div>

    {/* Knob row */}
    <div className="flex justify-around">
      <Knob
        label="ATK" value={attack} min={0.001} max={1} onChange={setAttack}
        color="#ec4899" format={v => `${Math.round(v * 1000)}ms`}
      />
      <Knob
        label="DEC" value={decay} min={0.01} max={1} onChange={setDecay}
        color="#a855f7" format={v => `${v.toFixed(2)}s`}
      />
      <Knob
        label="SUS" value={sustain} min={0} max={1} onChange={setSustain}
        color="#22d3ee" format={v => `${Math.round(v * 100)}%`}
      />
      <Knob
        label="REL" value={release} min={0.01} max={2} onChange={setRelease}
        color="#ec4899" format={v => `${v.toFixed(2)}s`}
      />
      <Knob
        label="VOL" value={volume} min={0} max={1} onChange={setVolume}
        color="#f9fafb" format={v => `${Math.round(v * 100)}%`}
      />
      <Knob
        label="DTUNE" value={detune} min={-50} max={50} onChange={setDetune}
        color="#a78bfa" format={v => `${Math.round(v)}ct`}
      />
    </div>
  </div>
);

export default SynthControls;