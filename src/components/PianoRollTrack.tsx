import { useRef, useMemo } from 'react';
import { usePlayheadStore } from '@/store/playheadStore';
import { getNoteColor } from '@/utils/noteColors';
import type { MidiEvent } from '@/store/types';

interface PianoRollTrackProps {
  events: MidiEvent[];
  referenceEvents?: MidiEvent[];
  bpm?: number;
  color?: string;
}

const NOTE_HEIGHT = 6;
const NOTE_LABEL_W = 32;
const PPS = 80;
const PAD_TOP = 8;
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const WHITE_KEYS = new Set([0, 2, 4, 5, 7, 9, 11]);

export function PianoRollTrack({ events, referenceEvents, bpm, color: trackColor }: PianoRollTrackProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentBeat = usePlayheadStore((s) => s.currentBeat);
  const isPlaying = usePlayheadStore((s) => s.isPlaying);

  const { minNote, maxNote, totalTime } = useMemo(() => {
    let mn = Infinity, mx = -Infinity, mt = 0;
    const allEvents = referenceEvents ? [...events, ...referenceEvents] : events;
    if (allEvents.length === 0) return { minNote: 60, maxNote: 72, totalTime: 8 };
    for (const e of allEvents) {
      if (e.note < mn) mn = e.note;
      if (e.note > mx) mx = e.note;
      const end = e.time + e.duration;
      if (end > mt) mt = end;
    }
    const paddedMin = Math.max(0, mn - 4);
    const paddedMax = Math.min(127, mx + 4);
    return { minNote: paddedMin, maxNote: Math.max(paddedMax, paddedMin + 12), totalTime: Math.max(mt + 1, 4) };
  }, [events, referenceEvents]);

  const range = maxNote - minNote;
  const totalH = range * NOTE_HEIGHT + PAD_TOP * 2;
  const totalW = totalTime * PPS + NOTE_LABEL_W + 20;
  const noteToY = (n: number) => PAD_TOP + (maxNote - n) * NOTE_HEIGHT;

  const cursorX = isPlaying ? currentBeat * (PPS / 4) + NOTE_LABEL_W : -100;

  if (events.length === 0 && (!referenceEvents || referenceEvents.length === 0)) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-purple-500/20 bg-black/60">
      <div ref={scrollRef} className="overflow-x-auto" style={{ maxHeight: 280, minHeight: 120 }}>
        <div className="relative" style={{ width: totalW, height: totalH }}>
          {Array.from({ length: range + 1 }, (_, i) => {
            const note = maxNote - i;
            const isWhite = WHITE_KEYS.has(note % 12);
            const isC = note % 12 === 0;
            const y = noteToY(note);
            return (
              <div key={`row-${i}`}>
                {!isWhite && (
                  <div
                    className="absolute left-0 pointer-events-none"
                    style={{
                      top: y, height: NOTE_HEIGHT, width: NOTE_LABEL_W + 4,
                      backgroundColor: 'rgba(31,41,55,0.5)',
                      borderRight: '1px solid rgba(75,85,99,0.3)',
                    }}
                  />
                )}
                <div
                  className={
                    'absolute left-0 right-0 border-t pointer-events-none ' +
                    (isC ? 'border-gray-600/50' : isWhite ? 'border-gray-800/30' : 'border-gray-800/15')
                  }
                  style={{ top: y }}
                />
                <div
                  className="absolute pointer-events-none text-[9px] font-mono leading-none"
                  style={{
                    left: 2, top: y + 0.5,
                    color: isC ? '#d1d5db' : isWhite ? '#6b7280' : 'transparent',
                  }}
                >
                  {NOTE_NAMES[note % 12]}{isC ? Math.floor(note / 12) - 1 : ''}
                </div>
              </div>
            );
          })}

          {referenceEvents && referenceEvents.map((ev, i) => {
            const x = ev.time * PPS + NOTE_LABEL_W;
            const w = Math.max(ev.duration * PPS, 2);
            const y = noteToY(ev.note);
            return (
              <div
                key={`ref-${i}`}
                className="absolute rounded-sm pointer-events-none"
                style={{
                  left: x, top: y, width: w, height: NOTE_HEIGHT,
                  backgroundColor: trackColor || '#a855f7',
                  opacity: 0.55,
                  boxShadow: `0 0 2px ${trackColor || '#a855f7'}60`,
                }}
              />
            );
          })}

          {events.map((ev, i) => {
            const x = ev.time * PPS + NOTE_LABEL_W;
            const w = Math.max(ev.duration * PPS, 2);
            const y = noteToY(ev.note);
            return (
              <div
                key={i}
                className="absolute rounded-sm"
                style={{
                  left: x, top: y, width: w, height: NOTE_HEIGHT,
                  backgroundColor: getNoteColor(ev.note),
                  opacity: 0.8,
                }}
                title={`${NOTE_NAMES[ev.note % 12]}${Math.floor(ev.note / 12) - 1} @ ${ev.time.toFixed(2)}s`}
              />
            );
          })}

          {/* Playhead cursor */}
          {isPlaying && (
            <div
              className="absolute top-0 bottom-0 w-px bg-cyan-400/60 pointer-events-none z-10"
              style={{ left: cursorX }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
