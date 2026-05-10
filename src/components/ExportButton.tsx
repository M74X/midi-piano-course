import { useCallback } from 'react';
import { Midi } from '@tonejs/midi';
import { useTrackStore } from '@/store/trackStore';

function downloadBlob(data: Uint8Array, filename: string) {
  const blob = new Blob([data], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton() {
  const tracks = useTrackStore((s) => s.tracks);

  const hasExportable = tracks.some(
    (t) => t.type === 'midi' && t.events.length > 0 && !t.readonly,
  );

  const handleExport = useCallback(() => {
    const midiTrack = tracks.find(
      (t): t is Extract<typeof t, { type: 'midi' }> =>
        t.type === 'midi' && t.events.length > 0 && !t.readonly,
    );
    if (!midiTrack) return;

    const midi = new Midi();
    const track = midi.addTrack();
    track.name = midiTrack.name;

    const sorted = [...midiTrack.events].sort((a, b) => a.time - b.time);
    for (const ev of sorted) {
      track.addNote({
        midi: ev.note,
        time: ev.time,
        duration: ev.duration,
        velocity: ev.velocity,
      });
    }

    const safeName = midiTrack.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadBlob(midi.toArray(), `${safeName || 'recording'}.mid`);
  }, [tracks]);

  if (!hasExportable) return null;

  return (
    <button
      onClick={handleExport}
      className="rounded px-2.5 py-1 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
      title="Export MIDI"
    >
      Export MIDI
    </button>
  );
}
