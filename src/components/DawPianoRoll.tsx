import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useMidiFile } from '@/hooks/useMidiFile';
import { useLessonStore } from '@/store/lessonStore';
import { useChannelStore, type ChannelType } from '@/store/channelStore';
import { PianoRollTrack } from './PianoRollTrack';

import drumsMidiUrl from '@/audio/uvr/blacktop-mirage-drums.mid?url';
import leadMidiUrl from '@/audio/uvr/blacktop-mirage-lead.mid?url';
import bassMidiUrl from '@/audio/uvr/blacktop-mirage.mid?url';

const MIDI_URLS: Record<ChannelType, string | null> = {
  drums: drumsMidiUrl,
  lead: leadMidiUrl,
  bass: bassMidiUrl,
  pads: null,
  fx: null,
};

export function DawPianoRoll() {
  const activeChannelId = useChannelStore((s) => s.activeChannelId);
  const setReferenceEvents = useChannelStore((s) => s.setReferenceEvents);
  const channel = useChannelStore(useShallow((s) =>
    s.channels.find((c) => c.id === activeChannelId)!,
  ));

  const midiUrl = MIDI_URLS[activeChannelId];
  const { events: referenceEvents, isLoading, error } = useMidiFile(midiUrl);

  const storedRef = useRef(false);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevUrlRef.current !== midiUrl) {
      prevUrlRef.current = midiUrl;
      storedRef.current = false;
    }
  }, [midiUrl]);

  useEffect(() => {
    if (!storedRef.current && referenceEvents.length > 0) {
      storedRef.current = true;
      setReferenceEvents(activeChannelId, referenceEvents);
    }
  }, [referenceEvents, activeChannelId, setReferenceEvents]);

  const bpm = useLessonStore((s) => s.currentBpm);

  const displayReference =
    referenceEvents.length > 0 ? referenceEvents : channel.referenceEvents;
  const recordedEvents = channel.recordedEvents;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black/30">
        <div className="text-gray-500 text-sm animate-pulse">Loading MIDI...</div>
      </div>
    );
  }

  if (error && displayReference.length === 0 && recordedEvents.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black/30 gap-2">
        <div className="text-gray-500 text-sm">No MIDI loaded</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-black/30 p-2">
      <div className="text-[9px] font-bold text-purple-600 tracking-widest mb-1 px-1 uppercase">
        {channel.name} — Piano Roll
        {displayReference.length > 0 && (
          <span className="ml-2 text-gray-600 normal-case font-normal">
            reference: {displayReference.length} notes
          </span>
        )}
        {recordedEvents.length > 0 && (
          <span className="ml-2 text-cyan-600 normal-case font-normal">
            take: {recordedEvents.length} notes
          </span>
        )}
      </div>
      <PianoRollTrack
        events={recordedEvents}
        referenceEvents={displayReference.length > 0 ? displayReference : undefined}
        bpm={bpm}
        color={channel.color}
      />
    </div>
  );
}
