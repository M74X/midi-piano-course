import Knob from './Knob';
import { useChannelStore } from '@/store/channelStore';

const WAVEFORMS: Array<'sine' | 'square' | 'sawtooth' | 'triangle'> = ['sine', 'square', 'sawtooth', 'triangle'];
const WAVE_ICONS: Record<string, string> = { sine: '∿', square: '⊓', sawtooth: '⋀', triangle: '△' };

const SynthControls: React.FC = () => {
  const activeChannelId = useChannelStore((s) => s.activeChannelId);
  const channels = useChannelStore((s) => s.channels);
  const updatePreset = useChannelStore((s) => s.updatePreset);
  const setVolume = useChannelStore((s) => s.setVolume);

  const channel = channels.find((c) => c.id === activeChannelId);
  const preset = channel?.preset;
  const volume = channel?.volume ?? 0.75;

  if (!preset) return null;

  return (
    <div className="bg-black/50 rounded-xl p-3 border border-purple-500/20">
      {/* Header row with waveform selector */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-bold tracking-widest text-purple-600">SYNTH</span>
        <div className="flex gap-1 ml-1">
          {WAVEFORMS.map(w => (
            <button
              key={w}
              onClick={() => updatePreset(activeChannelId, { waveform: w })}
              className={`w-8 h-7 rounded text-base font-bold transition-all ${preset.waveform === w
                ? 'bg-pink-500/30 text-pink-400 border border-pink-500/50 shadow-[0_0_8px_#ec489960]'
                : 'bg-gray-900 text-gray-600 hover:bg-gray-800 hover:text-gray-400'
                }`}
            >
              {WAVE_ICONS[w]}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[9px] text-gray-700 font-mono">{preset.waveform.toUpperCase()}</span>
      </div>

      {/* Knob grid: 3 columns, 2 rows */}
      <div className="grid grid-cols-3 gap-1 justify-items-center">
        <Knob
          label="ATK" value={preset.attack} min={0.001} max={1} onChange={(v) => updatePreset(activeChannelId, { attack: v })}
          color="#ec4899" format={v => `${Math.round(v * 1000)}ms`}
        />
        <Knob
          label="DEC" value={preset.decay} min={0.01} max={1} onChange={(v) => updatePreset(activeChannelId, { decay: v })}
          color="#a855f7" format={v => `${v.toFixed(2)}s`}
        />
        <Knob
          label="SUS" value={preset.sustain} min={0} max={1} onChange={(v) => updatePreset(activeChannelId, { sustain: v })}
          color="#22d3ee" format={v => `${Math.round(v * 100)}%`}
        />
        <Knob
          label="REL" value={preset.release} min={0.01} max={2} onChange={(v) => updatePreset(activeChannelId, { release: v })}
          color="#ec4899" format={v => `${v.toFixed(2)}s`}
        />
        <Knob
          label="VOL" value={volume} min={0} max={1} onChange={(v) => setVolume(activeChannelId, v)}
          color="#f9fafb" format={v => `${Math.round(v * 100)}%`}
        />
        <Knob
          label="DTUNE" value={preset.detune} min={-50} max={50} onChange={(v) => updatePreset(activeChannelId, { detune: v })}
          color="#a78bfa" format={v => `${Math.round(v)}ct`}
        />
      </div>
    </div>
  );
};

export default SynthControls;