import { useEffect, useRef, useMemo } from 'react';
import * as Tone from 'tone';
import { getNoteColor } from '@/utils/noteColors';
import type { MidiEvent, NoteClassification } from '@/store/types';

interface PianoRollTrackProps {
  events: MidiEvent[];
  referenceEvents?: MidiEvent[];
  bpm?: number;
  color?: string;
}

const NOTE_HEIGHT = 4;
const NOTE_LABEL_W = 30;
const PPS = 80;
const PAD_TOP = 10;
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const CLASS_COLORS: Record<NoteClassification, string> = {
  'on-time': '#22c55e',
  early: '#eab308',
  late: '#f59e0b',
  missed: '#6b7280',
  extra: '#ef4444',
};

function compareEvents(reference: MidiEvent[], student: MidiEvent[], bpm: number) {
  const intervalMs = 60000 / bpm;
  const toleranceMs = Math.max(50, Math.min(200, intervalMs * 0.3));
  const toleranceSec = toleranceMs / 1000;

  const sortedRef = [...reference].sort((a, b) => a.time - b.time);
  const sortedStu = [...student].sort((a, b) => a.time - b.time);
  const used = new Set<number>();
  const results: Array<{ idx: number; classification: NoteClassification }> = new Array(student.length).fill(null);

  for (const ref of sortedRef) {
    let bestIdx = -1;
    let bestDelta = Infinity;

    for (let i = 0; i < sortedStu.length; i++) {
      if (used.has(i)) continue;
      if (sortedStu[i].note !== ref.note) continue;
      const delta = Math.abs(sortedStu[i].time - ref.time);
      if (delta < bestDelta) {
        bestDelta = delta;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1 && bestDelta <= toleranceSec) {
      const stu = sortedStu[bestIdx];
      used.add(bestIdx);
      const deltaMs = (stu.time - ref.time) * 1000;
      results[bestIdx] = {
        idx: bestIdx,
        classification: deltaMs < -toleranceMs / 2 ? 'early' : deltaMs > toleranceMs / 2 ? 'late' : 'on-time',
      };
    }
  }

  for (let i = 0; i < sortedStu.length; i++) {
    if (used.has(i)) continue;
    results[i] = { idx: i, classification: 'extra' };
  }

  const colorMap = new Map<number, string>();
  for (const r of results) {
    if (r) {
      colorMap.set(r.idx, CLASS_COLORS[r.classification]);
    }
  }
  return colorMap;
}

export function PianoRollTrack({ events, referenceEvents, bpm, color: trackColor }: PianoRollTrackProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

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
    const paddedMin = Math.max(0, mn - 6);
    const paddedMax = Math.min(127, mx + 6);
    return { minNote: paddedMin, maxNote: Math.max(paddedMax, paddedMin + 12), totalTime: Math.max(mt + 1, 4) };
  }, [events, referenceEvents]);

  useEffect(() => {
    let raf: number;
    function tick() {
      if (cursorRef.current) {
        const pos = Tone.Transport.seconds * PPS + NOTE_LABEL_W;
        cursorRef.current.style.transform = `translateX(${pos}px)`;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const eventColors = useMemo(() => {
    if (!referenceEvents || !bpm) return null;
    return compareEvents(referenceEvents, events, bpm);
  }, [events, referenceEvents, bpm]);

  const range = maxNote - minNote;
  const totalH = range * NOTE_HEIGHT + PAD_TOP * 2;
  const totalW = totalTime * PPS + NOTE_LABEL_W + 20;
  const noteToY = (n: number) => PAD_TOP + (maxNote - n) * NOTE_HEIGHT;

  if (events.length === 0 && (!referenceEvents || referenceEvents.length === 0)) return null;

  function getBarColor(i: number, ev: MidiEvent): string {
    if (eventColors) return eventColors.get(i) ?? CLASS_COLORS.extra;
    return trackColor || getNoteColor(ev.note);
  }

  return (
    <div className="rounded-xl overflow-hidden border border-purple-500/20 bg-black/60">
      <div ref={scrollRef} className="overflow-x-auto" style={{ maxHeight: 160 }}>
        <div className="relative" style={{ width: totalW, height: totalH }}>
          {Array.from({ length: range + 1 }, (_, i) => {
            const note = maxNote - i;
            const isC = note % 12 === 0;
            return (
              <div
                key={`g-${i}`}
                className={
                  'absolute left-0 right-0 border-t pointer-events-none ' +
                  (isC ? 'border-gray-700/40' : 'border-gray-800/25')
                }
                style={{ top: noteToY(note) }}
              />
            );
          })}

          {Array.from({ length: range + 1 }, (_, i) => {
            const note = maxNote - i;
            const isC = note % 12 === 0;
            if (!isC) return null;
            const oct = Math.floor(note / 12) - 1;
            return (
              <div
                key={`l-${i}`}
                className="absolute left-1 text-[8px] font-mono text-gray-600 pointer-events-none leading-none"
                style={{ top: noteToY(note) - 3 }}
              >
                {NOTE_NAMES[note % 12]}{oct}
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
                  backgroundColor: '#6b7280',
                  opacity: 0.25,
                }}
              />
            );
          })}

          {events.map((ev, i) => {
            const x = ev.time * PPS + NOTE_LABEL_W;
            const w = Math.max(ev.duration * PPS, 2);
            const y = noteToY(ev.note);
            const c = getBarColor(i, ev);
            return (
              <div
                key={i}
                className="absolute rounded-sm"
                style={{
                  left: x, top: y, width: w, height: NOTE_HEIGHT,
                  backgroundColor: c,
                  opacity: eventColors ? 0.9 : 0.8,
                }}
                title={`${NOTE_NAMES[ev.note % 12]}${Math.floor(ev.note / 12) - 1} @ ${ev.time.toFixed(2)}s`}
              />
            );
          })}

          <div
            ref={cursorRef}
            className="absolute top-0 bottom-0 w-px bg-cyan-400/60 pointer-events-none z-10"
            style={{ left: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
