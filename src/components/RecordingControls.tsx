import { useRecorder } from '@/hooks/useRecorder';
import { useTrackStore } from '@/store/trackStore';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function RecordingControls() {
  const { isRecording, startRecording, stopRecording, recordingTime } = useRecorder();
  const activeTrackId = useTrackStore((s) => s.activeTrackId);
  const activeTrack = useTrackStore((s) =>
    s.activeTrackId ? s.tracks.find((t) => t.id === s.activeTrackId) ?? null : null,
  );
  const clearTrack = useTrackStore((s) => s.clearTrack);

  const hasEvents =
    activeTrack?.type === 'midi' && activeTrack.events.length > 0;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={
          'flex h-8 w-8 items-center justify-center rounded-full transition-colors ' +
          (isRecording
            ? 'bg-red-600 hover:bg-red-500'
            : 'bg-red-900/60 hover:bg-red-700/80')
        }
        title={isRecording ? 'Detener grabación' : 'Iniciar grabación'}
      >
        {isRecording ? (
          <div className="h-3 w-3 rounded-sm bg-white" />
        ) : (
          <div className="h-3 w-3 rounded-full bg-red-400" />
        )}
      </button>

      <span className="font-mono text-sm tabular-nums text-white/80 min-w-[3rem]">
        {formatTime(recordingTime)}
      </span>

      {isRecording && (
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-red-400">
            REC
          </span>
        </div>
      )}

      {!isRecording && hasEvents && (
        <button
          onClick={() => {
            if (activeTrackId) clearTrack(activeTrackId);
          }}
          className="rounded px-2 py-0.5 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
        >
          Descartar & Reintentar
        </button>
      )}
    </div>
  );
}
