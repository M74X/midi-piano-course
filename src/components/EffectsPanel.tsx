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
}) => {
  return (
    <div className="mb-6 bg-gradient-to-r from-cyan-900/20 via-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-cyan-500/30 backdrop-blur-sm">
      <h3 className="text-lg font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
        ✨ FX PROCESSOR
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Reverb */}
        <div>
          <label className="text-xs text-purple-400 block mb-1">🔊 REVERB</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={reverbMix}
            onChange={e => setReverbMix(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <span className="text-xs text-purple-400">{(reverbMix * 100).toFixed(0)}%</span>
        </div>

        {/* Delay Time */}
        <div>
          <label className="text-xs text-cyan-400 block mb-1">⏱️ DELAY TIME</label>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.01"
            value={delayTime}
            onChange={e => setDelayTime(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <span className="text-xs text-cyan-400">{(delayTime * 1000).toFixed(0)}ms</span>
        </div>

        {/* Delay Mix */}
        <div>
          <label className="text-xs text-pink-400 block mb-1">🔁 DELAY MIX</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={delayMix}
            onChange={e => setDelayMix(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <span className="text-xs text-pink-400">{(delayMix * 100).toFixed(0)}%</span>
        </div>

        {/* Distortion */}
        <div>
          <label className="text-xs text-red-400 block mb-1">💀 DISTORT</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={distortion}
            onChange={e => setDistortion(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <span className="text-xs text-red-400">{(distortion * 100).toFixed(0)}%</span>
        </div>

        {/* Filter */}
        <div>
          <label className="text-xs text-green-400 block mb-1">🎚️ FILTER</label>
          <input
            type="range"
            min="200"
            max="12000"
            step="100"
            value={filterCutoff}
            onChange={e => setFilterCutoff(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <span className="text-xs text-green-400">{(filterCutoff / 1000).toFixed(1)}kHz</span>
        </div>

        {/* Chorus */}
        <div>
          <label className="text-xs text-yellow-400 block mb-1">🌊 CHORUS</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={chorusRate}
            onChange={e => setChorusRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <span className="text-xs text-yellow-400">{(chorusRate * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Effect Descriptions */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
          🔊 Reverb = Ambiente/Espacio
        </span>
        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded">
          ⏱️ Delay = Eco repetitivo
        </span>
        <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded">
          💀 Distort = Saturación grim
        </span>
        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">
          🎚️ Filter = Brillo/Oscuridad
        </span>
        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
          🌊 Chorus = Grosor/Envoltura
        </span>
      </div>
    </div>
  );
};

export default EffectsPanel;