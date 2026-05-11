import { useChannelStore, type ChannelType } from '@/store/channelStore';
import { useSynthStore } from '@/store/synthStore';
import Knob from './Knob';

interface ChannelStripProps {
  channelId: ChannelType;
}

const WAVEFORMS: Array<'sine' | 'square' | 'sawtooth' | 'triangle'> = [
  'sine', 'square', 'sawtooth', 'triangle',
];
const WAVE_ICONS: Record<string, string> = {
  sine: '∿', square: '⊓', sawtooth: '⋀', triangle: '△',
};

export function ChannelStrip({ channelId }: ChannelStripProps) {
  // Select only primitive fields to avoid infinite re-render loops.
  // Never select the whole channel object — find() returns a new reference each render.
  const name    = useChannelStore((s) => s.channels.find((c) => c.id === channelId)!.name);
  const muted   = useChannelStore((s) => s.channels.find((c) => c.id === channelId)!.muted);
  const soloed  = useChannelStore((s) => s.channels.find((c) => c.id === channelId)!.soloed);
  const volume  = useChannelStore((s) => s.channels.find((c) => c.id === channelId)!.volume);
  const pan     = useChannelStore((s) => s.channels.find((c) => c.id === channelId)!.pan);
  const color   = useChannelStore((s) => s.channels.find((c) => c.id === channelId)!.color);
  const audioSrc = useChannelStore((s) => s.channels.find((c) => c.id === channelId)?.audioSrc ?? null);
  const refEnabled = useChannelStore((s) => s.channels.find((c) => c.id === channelId)!.refEnabled);
  const activeChannelId = useChannelStore((s) => s.activeChannelId);
  const setActiveChannel = useChannelStore((s) => s.setActiveChannel);
  const toggleMute = useChannelStore((s) => s.toggleMute);
  const toggleSolo = useChannelStore((s) => s.toggleSolo);
  const toggleRef = useChannelStore((s) => s.toggleRef);
  const setVolume = useChannelStore((s) => s.setVolume);
  const setPan = useChannelStore((s) => s.setPan);

  const waveform = useSynthStore((s) => s.waveform);
  const setWaveform = useSynthStore((s) => s.setWaveform);

  const isActive = channelId === activeChannelId;

  return (
    <div
      onClick={() => setActiveChannel(channelId)}
      className={`flex flex-col gap-1.5 p-2 rounded cursor-pointer transition-all select-none ${
        isActive
          ? 'bg-white/10 border border-cyan-500/30'
          : 'hover:bg-white/5 border border-transparent'
      }`}
      style={{ width: 80 }}
    >
      {/* Color dot + name */}
      <div className="flex items-center gap-1">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-[10px] font-bold text-white/70 truncate">
          {name}
        </span>
      </div>

      {/* Waveform selector — all channels share the single synth */}
      <div className="flex gap-0.5 flex-wrap">
        {WAVEFORMS.map((w) => (
          <button
            key={w}
            onClick={(e) => { e.stopPropagation(); setWaveform(w); }}
            className={`w-5 h-5 rounded text-[10px] font-bold transition-all ${
              waveform === w
                ? 'bg-pink-500/30 text-pink-400 border border-pink-500/50'
                : 'bg-gray-900 text-gray-600 hover:bg-gray-800'
            }`}
            title={w}
          >
            {WAVE_ICONS[w]}
          </button>
        ))}
      </div>

      {/* Volume knob */}
      <Knob
        label="VOL"
        value={volume}
        min={0}
        max={1}
        onChange={(v) => setVolume(channelId, v)}
        color={color}
        format={(v) => `${Math.round(v * 100)}%`}
      />

      {/* Pan knob */}
      <Knob
        label="PAN"
        value={pan}
        min={-1}
        max={1}
        onChange={(v) => setPan(channelId, v)}
        color="#94a3b8"
        format={(v) => (v === 0 ? 'C' : v > 0 ? `R${Math.round(v * 100)}` : `L${Math.round(Math.abs(v) * 100)}`)}
      />

      {/* Mute / Solo / Ref */}
      <div className="flex gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(channelId); }}
          className={`flex-1 h-5 rounded text-[9px] font-bold transition-colors ${
            muted
              ? 'bg-red-900/60 text-red-400'
              : 'bg-white/5 text-white/30 hover:bg-white/10'
          }`}
          title={muted ? 'Unmute' : 'Mute'}
        >
          M
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleSolo(channelId); }}
          className={`flex-1 h-5 rounded text-[9px] font-bold transition-colors ${
            soloed
              ? 'bg-yellow-900/60 text-yellow-400'
              : 'bg-white/5 text-white/30 hover:bg-white/10'
          }`}
          title={soloed ? 'Unsolo' : 'Solo'}
        >
          S
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleRef(channelId); }}
          disabled={!audioSrc}
          className={`flex-1 h-5 rounded text-[9px] font-bold transition-colors ${
            !audioSrc
              ? 'bg-gray-900/30 text-gray-700 cursor-not-allowed'
              : refEnabled
                ? 'text-white border border-current shadow-[0_0_6px_currentColor]'
                : 'bg-white/5 text-white/30 hover:bg-white/10'
          }`}
          style={refEnabled && audioSrc ? { backgroundColor: `${color}40`, color, borderColor: color } : {}}
          title={!audioSrc ? 'No stem available' : refEnabled ? 'Disable reference' : 'Enable reference'}
        >
          REF
        </button>
      </div>
    </div>
  );
}
