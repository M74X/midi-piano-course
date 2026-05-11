import { useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { useChannelStore, type ChannelType } from '@/store/channelStore';
import { useLessonStore } from '@/store/lessonStore';

export function useChannelAudio() {
  const playersRef = useRef<Map<ChannelType, Tone.Player>>(new Map());
  const disposeTimerRef = useRef<number | null>(null);
  const channels = useChannelStore((s) => s.channels);
  const bpm = useLessonStore((s) => s.currentBpm);

  // Lazy-init the players exactly once for the life of this ref. Each
  // channel.id keys its own Tone.Player constructed with its own URL.
  if (playersRef.current.size === 0) {
    const initial = useChannelStore.getState().channels;
    for (const channel of initial) {
      if (!channel.audioSrc) continue;
      const url = channel.audioSrc;
      const player = new Tone.Player(url).toDestination();
      player.sync();
      playersRef.current.set(channel.id, player);
    }
  }

  // React to channel.refEnabled / bpm changes.
  useEffect(() => {
    const isPlaying = Tone.getTransport().state === 'started';
    for (const channel of channels) {
      const player = playersRef.current.get(channel.id);
      if (!player) continue;

      player.playbackRate = bpm / 120;

      if (channel.refEnabled && isPlaying) {
        if (player.state === 'stopped') {
          try { player.start(0); } catch { /* not loaded yet */ }
        }
      } else if (player.state === 'started') {
        player.stop();
      }
    }
  }, [channels, bpm]);

  // Defer disposal so StrictMode's simulated unmount-remount doesn't dispose
  // and recreate players (which races with the async buffer fetch). On
  // remount, the setup function cancels any pending disposal.
  useEffect(() => {
    if (disposeTimerRef.current !== null) {
      clearTimeout(disposeTimerRef.current);
      disposeTimerRef.current = null;
    }
    return () => {
      const players = playersRef.current;
      disposeTimerRef.current = window.setTimeout(() => {
        for (const player of players.values()) {
          player.stop();
          player.dispose();
        }
        players.clear();
        disposeTimerRef.current = null;
      }, 0);
    };
  }, []);

  const startAudio = useCallback(() => {
    const state = useChannelStore.getState();
    for (const [id, player] of playersRef.current) {
      if (player.state === 'started') player.stop();
      const ch = state.channels.find((c) => c.id === id);
      if (!ch || !ch.refEnabled) continue;
      try { player.start(0); } catch { /* not loaded yet */ }
    }
  }, []);

  const stopAudio = useCallback(() => {
    for (const player of playersRef.current.values()) {
      if (player.state === 'started') player.stop();
    }
  }, []);

  return { startAudio, stopAudio };
}