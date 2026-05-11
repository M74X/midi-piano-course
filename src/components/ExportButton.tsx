import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Midi } from '@tonejs/midi';
import { useChannelStore } from '@/store/channelStore';

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
  const channels = useChannelStore(useShallow((s) => s.channels));
  const activeChannelId = useChannelStore((s) => s.activeChannelId);

  const active = channels.find((c) => c.id === activeChannelId);
  const hasExportable = !!active && active.recordedEvents.length > 0;

  const handleExport = useCallback(() => {
    if (!active || active.recordedEvents.length === 0) return;
    const midi = new Midi();
    const track = midi.addTrack();
    track.name = active.name;
    const sorted = [...active.recordedEvents].sort((a, b) => a.time - b.time);
    for (const ev of sorted) {
      track.addNote({
        midi: ev.note,
        time: ev.time,
        duration: ev.duration,
        velocity: ev.velocity,
      });
    }
    const safeName = active.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadBlob(midi.toArray(), `${safeName || 'recording'}.mid`);
  }, [active]);

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
