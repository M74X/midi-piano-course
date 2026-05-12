import { useMemo } from 'react';
import { useSessionStore, getSceneName } from '@/store/sessionStore';
import { useChannelStore, type ChannelType } from '@/store/channelStore';
import { audioEngine } from '@/audio/audioEngine';

const CHANNELS: ChannelType[] = ['drums', 'lead', 'bass', 'pads', 'fx'];
const SCENES = 8;

export function SessionView() {
  const clips = useSessionStore((s) => s.clips);
  const setClip = useSessionStore((s) => s.setClip);
  const currentScene = useSessionStore((s) => s.currentScene);
  const setCurrentScene = useSessionStore((s) => s.setCurrentScene);
  const channels = useChannelStore((s) => s.channels);

  const channelMap = useMemo(() => {
    const m = new Map<ChannelType, typeof channels[0]>();
    for (const c of channels) m.set(c.id, c);
    return m;
  }, [channels]);

  const handleCellClick = (scene: number, chId: ChannelType) => {
    const key = `${scene}-${chId}`;
    const clip = clips[key];
    if (clip && clip.hasNotes) {
      audioEngine.init();
      audioEngine.stop();
      audioEngine.play();
      const chEvents = clip.notes.map((n) => ({
        note: n.pitch,
        time: n.startBeat * (60 / audioEngine.bpm),
        duration: n.durationBeats * (60 / audioEngine.bpm),
      }));
      audioEngine.playRecordedEvents(chEvents);
    } else {
      setClip(scene, chId, { name: `Clip ${Object.keys(clips).length + 1}`, hasNotes: false, notes: [] });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-black/30 p-3 overflow-auto">
      <div className="text-[9px] font-bold text-purple-600 tracking-widest mb-2 uppercase">Session View</div>
      <div className="overflow-auto rounded-xl border border-purple-500/20 bg-black/60">
        <div className="grid gap-px" style={{ gridTemplateColumns: `80px repeat(${CHANNELS.length}, 1fr)` }}>
          {/* Header row */}
          <div className="bg-gray-900/80 p-2 border-b border-purple-500/20" />
          {CHANNELS.map((chId) => {
            const ch = channelMap.get(chId);
            return (
              <div key={chId} className="bg-gray-900/80 p-2 text-[9px] font-bold text-center tracking-widest border-b border-purple-500/20"
                style={{ color: ch?.color ?? '#fff' }}
              >
                {ch?.name ?? chId}
              </div>
            );
          })}

          {/* Scene rows */}
          {Array.from({ length: SCENES }, (_, scene) => (
            <>
              <div
                key={`label-${scene}`}
                onClick={() => setCurrentScene(scene)}
                className={`p-2 text-[10px] font-mono flex items-center cursor-pointer transition-colors ${scene === currentScene ? 'bg-purple-900/40 text-purple-400' : 'bg-gray-900/50 text-gray-500 hover:bg-gray-800/50'}`}
              >
                {scene === currentScene ? '▶ ' : '  '}{getSceneName(scene)}
              </div>
              {CHANNELS.map((chId) => {
                const key = `${scene}-${chId}`;
                const clip = clips[key];
                const ch = channelMap.get(chId);
                return (
                  <div
                    key={key}
                    onClick={() => handleCellClick(scene, chId)}
                    className="p-2 min-h-[40px] flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5 border border-transparent hover:border-white/10"
                    style={{
                      ...(clip?.hasNotes ? { backgroundColor: `${ch?.color}30` } : {}),
                      borderColor: scene === currentScene ? (clip?.hasNotes ? ch?.color : '#a855f7') : (clip?.hasNotes ? ch?.color : 'transparent'),
                      borderWidth: scene === currentScene ? '1px' : (clip?.hasNotes ? '1px' : '0px'),
                    }}
                  >
                    {clip ? (
                      <span className="text-[10px] text-white/70 truncate">{clip.name}</span>
                    ) : (
                      <span className="text-gray-700 text-xs opacity-0 hover:opacity-100 transition-opacity">+</span>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      <div className="mt-3 text-[9px] text-gray-700 text-center">
        Click a cell to launch clip · Click empty cell to create
      </div>
    </div>
  );
}
