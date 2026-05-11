import { TransportBar } from './TransportBar';
import { ChannelRack } from './ChannelRack';
import { DawPianoRoll } from './DawPianoRoll';
import SynthControls from './SynthControls';
import EffectsPanel from './EffectsPanel';
import type { MidiEvent } from '@/store/types';

interface DawViewProps {
  playRecordedEvents: (events: MidiEvent[]) => void;
  stopRecordedPlayback: () => void;
}

export function DawView({ playRecordedEvents, stopRecordedPlayback }: DawViewProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Transport */}
      <TransportBar
        playRecordedEvents={playRecordedEvents}
        stopRecordedPlayback={stopRecordedPlayback}
      />

      {/* Main DAW area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Channel Rack */}
        <ChannelRack />

        {/* Center: Piano Roll */}
        <DawPianoRoll />

        {/* Right: Synth + FX panels */}
        <div className="flex-shrink-0 w-[280px] flex flex-col gap-2 p-2 border-l border-purple-900/30 overflow-y-auto bg-black/40">
          <SynthControls />
          <EffectsPanel />
        </div>
      </div>
    </div>
  );
}
