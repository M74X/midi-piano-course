import Knob from './Knob';
import { useChannelStore } from '@/store/channelStore';

const EffectsPanel: React.FC = () => {
  const activeChannelId = useChannelStore((s) => s.activeChannelId);
  const channels = useChannelStore((s) => s.channels);
  const updatePreset = useChannelStore((s) => s.updatePreset);

  const channel = channels.find((c) => c.id === activeChannelId);
  const preset = channel?.preset;

  if (!preset) return null;

  const upd = (key: Parameters<typeof updatePreset>[1]) => updatePreset(activeChannelId, key);

  return (
    <div className="bg-black/50 rounded-xl p-3 border border-cyan-500/20">
      <div className="flex items-center mb-3">
        <span className="text-[9px] font-bold tracking-widest text-cyan-700">FX</span>
      </div>

      <div className="grid grid-cols-3 gap-1 justify-items-center">
        <Knob
          label="REVERB" value={preset.reverbMix} min={0} max={1} onChange={(v) => upd({ reverbMix: v })}
          color="#a855f7" format={v => `${Math.round(v * 100)}%`}
        />
        <Knob
          label="DLY T" value={preset.delayTime} min={0.1} max={0.8} onChange={(v) => upd({ delayTime: v })}
          color="#22d3ee" format={v => `${Math.round(v * 1000)}ms`}
        />
        <Knob
          label="DLY MX" value={preset.delayMix} min={0} max={1} onChange={(v) => upd({ delayMix: v })}
          color="#ec4899" format={v => `${Math.round(v * 100)}%`}
        />
        <Knob
          label="DIST" value={preset.distortion} min={0} max={1} onChange={(v) => upd({ distortion: v })}
          color="#ef4444" format={v => `${Math.round(v * 100)}%`}
        />
        <Knob
          label="FILTER" value={preset.filterCutoff} min={200} max={12000} onChange={(v) => upd({ filterCutoff: v })}
          color="#10b981" format={v => `${(v / 1000).toFixed(1)}k`}
        />
        <Knob
          label="CHORUS" value={preset.chorusRate} min={0} max={1} onChange={(v) => upd({ chorusRate: v })}
          color="#facc15" format={v => `${Math.round(v * 100)}%`}
        />
      </div>
    </div>
  );
};

export default EffectsPanel;