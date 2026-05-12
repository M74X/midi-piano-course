import { useEffect } from 'react';
import { TransportBar } from './TransportBar';
import { ChannelRack } from './ChannelRack';
import { DawPianoRoll } from './DawPianoRoll';
import SynthControls from './SynthControls';
import EffectsPanel from './EffectsPanel';
import { useChannelStore } from '@/store/channelStore';
import { audioEngine } from '@/audio/audioEngine';

export function DawView() {
  const channels = useChannelStore((s) => s.channels);

  useEffect(() => {
    for (const ch of channels) {
      if (ch.audioSrc) {
        audioEngine.loadStem(ch.audioSrc).catch(() => {});
      }
    }
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TransportBar />

      <div className="flex flex-1 overflow-hidden">
        <ChannelRack />
        <DawPianoRoll />
        <div className="flex-shrink-0 w-[280px] flex flex-col gap-2 p-2 border-l border-purple-900/30 overflow-y-auto bg-black/40">
          <SynthControls />
          <EffectsPanel />
        </div>
      </div>
    </div>
  );
}
