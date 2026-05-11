import Knob from './Knob';
import { useSynthStore } from '@/store/synthStore';

const EffectsPanel: React.FC = () => {
  const reverbMix = useSynthStore((s) => s.reverbMix);
  const setReverbMix = useSynthStore((s) => s.setReverbMix);
  const delayTime = useSynthStore((s) => s.delayTime);
  const setDelayTime = useSynthStore((s) => s.setDelayTime);
  const delayMix = useSynthStore((s) => s.delayMix);
  const setDelayMix = useSynthStore((s) => s.setDelayMix);
  const distortion = useSynthStore((s) => s.distortion);
  const setDistortion = useSynthStore((s) => s.setDistortion);
  const filterCutoff = useSynthStore((s) => s.filterCutoff);
  const setFilterCutoff = useSynthStore((s) => s.setFilterCutoff);
  const chorusRate = useSynthStore((s) => s.chorusRate);
  const setChorusRate = useSynthStore((s) => s.setChorusRate);

  return (
    <div className="bg-black/50 rounded-xl p-3 border border-cyan-500/20">
      <div className="flex items-center mb-3">
        <span className="text-[9px] font-bold tracking-widest text-cyan-700">FX</span>
      </div>

      <div className="grid grid-cols-3 gap-1 justify-items-center">
        <Knob
          label="REVERB" value={reverbMix} min={0} max={1} onChange={setReverbMix}
          color="#a855f7" format={v => `${Math.round(v * 100)}%`}
        />
        <Knob
          label="DLY T" value={delayTime} min={0.1} max={0.8} onChange={setDelayTime}
          color="#22d3ee" format={v => `${Math.round(v * 1000)}ms`}
        />
        <Knob
          label="DLY MX" value={delayMix} min={0} max={1} onChange={setDelayMix}
          color="#ec4899" format={v => `${Math.round(v * 100)}%`}
        />
        <Knob
          label="DIST" value={distortion} min={0} max={1} onChange={setDistortion}
          color="#ef4444" format={v => `${Math.round(v * 100)}%`}
        />
        <Knob
          label="FILTER" value={filterCutoff} min={200} max={12000} onChange={setFilterCutoff}
          color="#10b981" format={v => `${(v / 1000).toFixed(1)}k`}
        />
        <Knob
          label="CHORUS" value={chorusRate} min={0} max={1} onChange={setChorusRate}
          color="#facc15" format={v => `${Math.round(v * 100)}%`}
        />
      </div>
    </div>
  );
};

export default EffectsPanel;