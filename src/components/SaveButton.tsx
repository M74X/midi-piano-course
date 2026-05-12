import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useChannelStore } from '@/store/channelStore';
import { useTransportStore } from '@/store/transportStore';
import { useSessionStore } from '@/store/sessionStore';
import { useLessonStore } from '@/store/lessonStore';

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function SaveButton() {
  const channels = useChannelStore(useShallow((s) => s.channels));
  const activeChannelId = useChannelStore((s) => s.activeChannelId);
  const transport = useTransportStore(useShallow((s) => ({
    loopEnabled: s.loopEnabled,
    loopStart: s.loopStart,
    loopEnd: s.loopEnd,
    metronomeEnabled: s.metronomeEnabled,
    quantize: s.quantize,
  })));
  const clips = useSessionStore((s) => s.clips);
  const bpm = useLessonStore((s) => s.currentBpm);
  const genre = useLessonStore((s) => s.currentGenre);

  const handleSave = useCallback(() => {
    const project = {
      version: 1,
      bpm,
      genre,
      activeChannelId,
      channels: channels.map((c) => ({
        id: c.id,
        name: c.name,
        muted: c.muted,
        soloed: c.soloed,
        volume: c.volume,
        pan: c.pan,
        notes: c.notes,
        recordedEvents: c.recordedEvents,
        preset: c.preset,
      })),
      transport,
      clips,
    };
    downloadJson(project, `project-${Date.now()}.json`);
  }, [channels, activeChannelId, transport, clips, bpm, genre]);

  return (
    <button
      onClick={handleSave}
      className="rounded px-2.5 py-1 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white/90"
      title="Save Project (JSON)"
    >
      Save
    </button>
  );
}
