import { useShallow } from 'zustand/react/shallow';
import { useChannelStore } from '@/store/channelStore';
import { ChannelStrip } from './ChannelStrip';

export function ChannelRack() {
  const channels = useChannelStore(useShallow((s) => s.channels));

  return (
    <div className="flex-shrink-0 flex flex-col bg-black/60 border-r border-purple-900/30 overflow-y-auto">
      <div className="px-2 py-1.5 border-b border-gray-900 flex-shrink-0">
        <p className="text-[9px] font-bold text-purple-600 tracking-widest">CHANNELS</p>
      </div>
      <div className="flex flex-row gap-1 p-2">
        {channels.map((c) => (
          <ChannelStrip key={c.id} channelId={c.id} />
        ))}
      </div>
    </div>
  );
}
