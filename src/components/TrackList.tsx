import { useTrackStore } from '@/store/trackStore';
import type { TrackData } from '@/store/types';

function TrackIcon({ track }: { track: TrackData }) {
  return (
    <span className="text-xs">
      {track.type === 'audio' ? '♫' : '♩'}
    </span>
  );
}

function TrackRow({ track, isActive }: { track: TrackData; isActive: boolean }) {
  const toggleMute = useTrackStore((s) => s.toggleMute);
  const toggleSolo = useTrackStore((s) => s.toggleSolo);
  const setTrackVolume = useTrackStore((s) => s.setTrackVolume);
  const setActiveTrack = useTrackStore((s) => s.setActiveTrack);

  return (
    <div
      className={
        'flex items-center gap-2 rounded px-2 py-1 transition-colors ' +
        (isActive ? 'bg-white/10' : 'hover:bg-white/5')
      }
    >
      <button onClick={() => setActiveTrack(track.id)} className="flex items-center gap-1.5 min-w-0 flex-1">
        <TrackIcon track={track} />
        <span className="truncate text-xs text-white/70">{track.name}</span>
      </button>

      <button
        onClick={() => toggleMute(track.id)}
        className={
          'h-5 w-5 rounded text-[10px] font-bold transition-colors ' +
          (track.muted
            ? 'bg-red-900/40 text-red-400'
            : 'bg-white/5 text-white/30 hover:bg-white/10')
        }
        title={track.muted ? 'Unmute' : 'Mute'}
      >
        M
      </button>

      <button
        onClick={() => toggleSolo(track.id)}
        className={
          'h-5 w-5 rounded text-[10px] font-bold transition-colors ' +
          (track.soloed
            ? 'bg-yellow-900/40 text-yellow-400'
            : 'bg-white/5 text-white/30 hover:bg-white/10')
        }
        title={track.soloed ? 'Unsolo' : 'Solo'}
      >
        S
      </button>

      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={track.volume}
        onChange={(e) => setTrackVolume(track.id, +e.target.value)}
        className="w-14 h-1 bg-gray-800 rounded appearance-none cursor-pointer accent-cyan-500"
        title="Volume"
      />
    </div>
  );
}

export function TrackList() {
  const tracks = useTrackStore((s) => s.tracks);
  const activeTrackId = useTrackStore((s) => s.activeTrackId);

  if (tracks.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5">
      {tracks.map((t) => (
        <TrackRow key={t.id} track={t} isActive={t.id === activeTrackId} />
      ))}
    </div>
  );
}
