import Knob from './Knob';

interface EffectsPanelProps {
  reverbMix: number;
  setReverbMix: (v: number) => void;
  delayTime: number;
  setDelayTime: (v: number) => void;
  delayMix: number;
  setDelayMix: (v: number) => void;
  distortion: number;
  setDistortion: (v: number) => void;
  filterCutoff: number;
  setFilterCutoff: (v: number) => void;
  chorusRate: number;
  setChorusRate: (v: number) => void;
}

const EffectsPanel: React.FC<EffectsPanelProps> = ({
  reverbMix, setReverbMix,
  delayTime, setDelayTime,
  delayMix, setDelayMix,
  distortion, setDistortion,
  filterCutoff, setFilterCutoff,
  chorusRate, setChorusRate,
}) => (
  <div className="bg-black/50 rounded-xl p-3 border border-cyan-500/20">
    <div className="flex items-center mb-3">
      <span className="text-[9px] font-bold tracking-widest text-cyan-700">FX</span>
    </div>

    <div className="flex justify-around">
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

export default EffectsPanel;