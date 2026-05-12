import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useMidiFile } from '@/hooks/useMidiFile';
import { usePlayheadStore } from '@/store/playheadStore';
import { useTransportStore, snapBeat } from '@/store/transportStore';
import { useChannelStore, type ChannelType, type NoteData } from '@/store/channelStore';
import { audioEngine } from '@/audio/audioEngine';

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

const NOTE_HEIGHT = 18;
const NOTE_LABEL_W = 28;
const PPS = 80;
const PAD_TOP = 8;
const RULER_H = 16;
const VELOCITY_LANE_H = 48;
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const WHITE_KEYS = new Set([0, 2, 4, 5, 7, 9, 11]);

let _noteIdCounter = 0;
function genNoteId(): string { return `n${++_noteIdCounter}`; }

export function DawPianoRoll() {
  const activeChannelId = useChannelStore((s) => s.activeChannelId);
  const channel = useChannelStore(useShallow((s) => s.channels.find((c) => c.id === s.activeChannelId)!));
  const setNotes = useChannelStore((s) => s.setNotes);
  const addNote = useChannelStore((s) => s.addNote);
  const deleteNote = useChannelStore((s) => s.deleteNote);
  const updateNote = useChannelStore((s) => s.updateNote);
  const quantize = useTransportStore((s) => s.quantize);
  const bpm = audioEngine.bpm;
  const currentBeat = usePlayheadStore((s) => s.currentBeat);
  const isPlaying = usePlayheadStore((s) => s.isPlaying);

  const midiUrl = MIDI_URLS[activeChannelId];
  const { events: referenceEvents, isLoading, error } = useMidiFile(midiUrl);

  const seededRef = useRef(false);
  useEffect(() => {
    if (!seededRef.current && referenceEvents.length > 0 && channel.notes.length === 0) {
      const beatSec = 60 / bpm;
      const seeded: NoteData[] = referenceEvents.map((e) => ({
        id: genNoteId(),
        pitch: e.note,
        startBeat: snapBeat(e.time / beatSec, quantize),
        durationBeats: Math.max(e.duration / beatSec, 0.25),
        velocity: Math.round(e.velocity * 100),
      }));
      setNotes(activeChannelId, seeded);
      seededRef.current = true;
    }
  }, [referenceEvents, bpm, quantize, channel.notes.length, activeChannelId, setNotes]);

  useEffect(() => {
    seededRef.current = false;
  }, [activeChannelId]);

  // ── Initial scroll to C3 (MIDI 60) ──
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = (128 - 60) * NOTE_HEIGHT;
  }, []);

  // ── Interaction state ──
  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{
    mode: 'drag' | 'resize';
    noteId: string;
    startX: number;
    startY: number;
    origNote: NoteData;
  } | null>(null);

  // ── Layout computation ──
  const { minNote, maxNote, totalTime } = useMemo(() => {
    const beatSec = 60 / bpm;
    let mn = Infinity, mx = -Infinity, mt = 0;
    const all = referenceEvents.length > 0 ? referenceEvents : [];
    for (const e of all) {
      if (e.note < mn) mn = e.note;
      if (e.note > mx) mx = e.note;
      const end = e.time + e.duration;
      if (end > mt) mt = end;
    }
    for (const n of channel.notes) {
      if (n.pitch < mn) mn = n.pitch;
      if (n.pitch > mx) mx = n.pitch;
      const end = (n.startBeat + n.durationBeats) * beatSec;
      if (end > mt) mt = end;
    }
    const paddedMin = Math.max(0, mn === Infinity ? 60 : mn - 4);
    const paddedMax = Math.min(127, mx === -Infinity ? 72 : mx + 4);
    return {
      minNote: paddedMin,
      maxNote: Math.max(paddedMax, paddedMin + 12),
      totalTime: Math.max(mt + 1, 4),
    };
  }, [referenceEvents, channel.notes, bpm]);

  const range = maxNote - minNote;
  const totalH = range * NOTE_HEIGHT + PAD_TOP * 2;
  const gridH = totalH;
  const contentH = RULER_H + gridH;
  const totalW = totalTime * PPS + NOTE_LABEL_W + 20;
  const noteToY = (n: number) => PAD_TOP + RULER_H + (maxNote - n) * NOTE_HEIGHT;
  const beatSec = 60 / bpm;
  const totalBeats = Math.ceil(totalTime / beatSec);

  // ── Pixel → data coordinate helpers ──
  const pxToBeat = useCallback((px: number) => {
    const sec = Math.max(0, (px - NOTE_LABEL_W) / PPS);
    return sec / beatSec;
  }, [beatSec]);

  const pxToPitch = useCallback((py: number) => {
    const relY = py - PAD_TOP - RULER_H;
    return Math.round(maxNote - relY / NOTE_HEIGHT);
  }, [maxNote]);

  const findNoteAt = useCallback((px: number, py: number): NoteData | null => {
    const beat = pxToBeat(px);
    const pitch = pxToPitch(py);
    const tolBeats = 0.3 / beatSec;
    for (const n of channel.notes) {
      if (Math.abs(n.pitch - pitch) > 0) continue;
      const nEnd = n.startBeat + n.durationBeats;
      if (beat >= n.startBeat - tolBeats && beat <= nEnd + tolBeats) {
        if (Math.abs(pxToPitch(py) - n.pitch) <= 0) {
          // Check Y proximity
          const noteY = noteToY(n.pitch);
          if (py >= noteY && py <= noteY + NOTE_HEIGHT) return n;
        }
      }
    }
    return null;
  }, [channel.notes, pxToBeat, pxToPitch]);

  const isOnRightEdge = useCallback((px: number, n: NoteData) => {
    const nX = n.startBeat * beatSec * PPS + NOTE_LABEL_W;
    const nW = n.durationBeats * beatSec * PPS;
    return px >= nX + nW - 6 && px <= nX + nW + 6;
  }, [beatSec]);

  // ── Mouse handlers ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPlaying) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left + (containerRef.current?.scrollLeft ?? 0);
    const py = e.clientY - rect.top;

    const note = findNoteAt(px, py);
    if (!note) {
      // Create new note on left click
      if (e.button === 0) {
        const beat = snapBeat(pxToBeat(px), quantize);
        const pitch = Math.max(0, Math.min(127, pxToPitch(py)));
        const dur = quantize === 'off' ? 1 : quantize === '1/4' ? 1 : quantize === '1/8' ? 0.5 : 0.25;
        addNote(activeChannelId, {
          id: genNoteId(),
          pitch,
          startBeat: beat,
          durationBeats: dur,
          velocity: 100,
        });
      }
      return;
    }

    if (e.button === 2) {
      // Right click: delete
      e.preventDefault();
      deleteNote(activeChannelId, note.id);
      return;
    }

    if (e.button === 0) {
      const isResize = isOnRightEdge(px, note);
      setDrag({
        mode: isResize ? 'resize' : 'drag',
        noteId: note.id,
        startX: px,
        startY: py,
        origNote: { ...note },
      });
    }
  }, [activeChannelId, addNote, deleteNote, findNoteAt, isOnRightEdge, isPlaying, pxToBeat, pxToPitch, quantize]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left + (containerRef.current?.scrollLeft ?? 0);
    const py = e.clientY - rect.top;

    if (drag.mode === 'drag') {
      const dxBeat = pxToBeat(px) - pxToBeat(drag.startX);
      const dyPitch = Math.round((drag.startY - py) / NOTE_HEIGHT);
      const newStart = snapBeat(drag.origNote.startBeat + dxBeat, quantize);
      const newPitch = Math.max(0, Math.min(127, drag.origNote.pitch + dyPitch));
      updateNote(activeChannelId, drag.noteId, {
        startBeat: Math.max(0, newStart),
        pitch: newPitch,
      });
    } else if (drag.mode === 'resize') {
      const dxBeat = pxToBeat(px) - pxToBeat(drag.startX);
      const newDur = snapBeat(Math.max(drag.origNote.durationBeats + dxBeat, 0.25), quantize);
      updateNote(activeChannelId, drag.noteId, { durationBeats: newDur });
    }
  }, [drag, activeChannelId, updateNote, pxToBeat, quantize]);

  const handleMouseUp = useCallback(() => {
    setDrag(null);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // ── Visual-only state ──
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [velocityLaneVisible, setVelocityLaneVisible] = useState(false);
  const [scrollLeft, setScrollLeft] = useState(0);

  // ── Render ──
  const ghostEvents = referenceEvents.length > 0 ? referenceEvents : channel.referenceEvents;

  return (
    <div className="flex-1 max-h-[35vh] flex flex-col bg-black/30 p-2 overflow-hidden relative">
      <div className="text-[9px] font-bold text-purple-600 tracking-widest mb-1 px-1 uppercase flex items-center gap-3">
        <span>{channel.name} — Piano Roll</span>
        <span className="text-gray-600 normal-case font-normal">
          {channel.notes.length} notes
        </span>
        <span className="text-[9px] text-gray-700">snap: {quantize}</span>
        <button
          onClick={() => setVelocityLaneVisible((v) => !v)}
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto ${velocityLaneVisible ? 'bg-purple-600/30 text-purple-300' : 'text-gray-500 hover:text-gray-300'}`}
        >
          VEL
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto rounded-xl border border-purple-500/20 bg-black/60 hide-scrollbar"
        onScroll={() => setScrollLeft(containerRef.current?.scrollLeft ?? 0)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        <div className="relative" style={{ width: totalW, height: contentH, minHeight: 120 }}>
          {/* Ruler */}
          <div className="absolute top-0 left-0 right-0 select-none" style={{ height: RULER_H, zIndex: 40 }}>
            {Array.from({ length: totalBeats + 1 }, (_, i) => {
              const isBar = i % 4 === 0;
              const x = i * beatSec * PPS + NOTE_LABEL_W;
              return (
                <div key={i} className="absolute top-0" style={{ left: x }}>
                  <div className="w-px" style={{ height: RULER_H, backgroundColor: isBar ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)' }} />
                  {isBar && (
                    <span className="absolute top-0.5 left-1.5 text-[8px] font-mono text-gray-500 font-bold">
                      {Math.floor(i / 4) + 1}
                    </span>
                  )}
                </div>
              );
            })}
            <div
              className="absolute inset-0 cursor-pointer"
              onMouseDown={(e) => {
                if (isPlaying) return;
                e.stopPropagation();
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                const px = e.clientX - rect.left + (containerRef.current?.scrollLeft ?? 0);
                const beat = snapBeat(pxToBeat(px), quantize);
                audioEngine.seek(beat);
                usePlayheadStore.getState().setCurrentBeat(beat);
              }}
            />
          </div>

          {/* Vertical grid lines — subdivision / beat / bar */}
          {(() => {
            const subStep = quantize === '1/16' ? 0.25 : quantize === '1/8' ? 0.5 : 1;
            const totalSub = Math.ceil(totalBeats / subStep);
            return Array.from({ length: totalSub + 1 }, (_, j) => {
              const beat = j * subStep;
              const x = beat * beatSec * PPS + NOTE_LABEL_W;
              const isBar = beat % 4 === 0;
              const isBeat = beat % 1 === 0;
              let bgColor: string;
              if (isBar) { bgColor = 'rgba(255,255,255,0.2)'; }
              else if (isBeat) { bgColor = 'rgba(255,255,255,0.08)'; }
              else { bgColor = 'rgba(255,255,255,0.04)'; }
              return (
                <div key={`vg-${j}`} className="absolute top-0 pointer-events-none"
                  style={{ left: x, width: 1, top: RULER_H, height: gridH, backgroundColor: bgColor }}
                />
              );
            });
          })()}

          {/* Row backgrounds — Ableton purple-grey */}
          {Array.from({ length: range + 1 }, (_, i) => {
            const note = maxNote - i;
            const isWhite = WHITE_KEYS.has(note % 12);
            return (
              <div key={`bg-${i}`} className="absolute left-0 right-0 pointer-events-none"
                style={{ top: noteToY(note), height: NOTE_HEIGHT, backgroundColor: isWhite ? '#2d2d3d' : '#252535' }}
              />
            );
          })}

          {/* Piano keys — Ableton narrow */}
          {Array.from({ length: range + 1 }, (_, i) => {
            const note = maxNote - i;
            const isWhite = WHITE_KEYS.has(note % 12);
            const isC = note % 12 === 0;
            const y = noteToY(note);
            return (
              <div key={`key-${i}`} className="absolute left-0 pointer-events-none"
                style={{
                  top: y, height: NOTE_HEIGHT, width: NOTE_LABEL_W,
                  backgroundColor: isWhite ? '#3a3a4a' : '#1e1e2a',
                  zIndex: isWhite ? 1 : 2,
                }}
              >
                {!isWhite && (
                  <div className="absolute right-0 pointer-events-none"
                    style={{
                      top: 3, height: 12, width: 18,
                      backgroundColor: '#1e1e2a',
                      zIndex: 3,
                    }}
                  />
                )}
                {isC && (
                  <span className="absolute font-mono" style={{ bottom: 0, left: 2, fontSize: 10, lineHeight: '10px', color: 'rgba(255,255,255,0.5)' }}>
                    C{Math.floor(note / 12) - 1}
                  </span>
                )}
              </div>
            );
          })}

          {/* Reference ghost notes */}
          {ghostEvents.map((ev, i) => {
            const x = ev.time * PPS + NOTE_LABEL_W;
            const w = Math.max(ev.duration * PPS, 2);
            const y = noteToY(ev.note);
            return (
              <div key={`ref-${i}`} className="absolute rounded-sm pointer-events-none"
                style={{ left: x, top: y, width: w, height: NOTE_HEIGHT, backgroundColor: channel.color, opacity: 0.15 }}
              />
            );
          })}

          {/* Editable notes */}
          {channel.notes.map((n) => {
            const x = n.startBeat * beatSec * PPS + NOTE_LABEL_W;
            const w = Math.max(n.durationBeats * beatSec * PPS, 6);
            const y = noteToY(n.pitch) + 1;
            const isDragging = drag?.noteId === n.id;
            const isSelected = selectedNoteId === n.id;
            const opacity = 0.75 + (n.velocity / 100) * 0.25;
            const noteName = `${NOTE_NAMES[n.pitch % 12]}${Math.floor(n.pitch / 12) - 1}`;
            return (
              <div
                key={n.id}
                className={`absolute cursor-pointer z-10 ${isDragging ? 'z-20' : ''}`}
                style={{
                  left: x, top: y, width: w, height: 16,
                  backgroundColor: isSelected ? `${channel.color}cc` : channel.color,
                  opacity: isDragging ? 1 : opacity,
                  borderRadius: 2,
                  border: isDragging || isSelected ? '1px solid rgba(255,255,255,0.9)' : '1px solid rgba(255,255,255,0.1)',
                }}
                onMouseDown={() => setSelectedNoteId(n.id)}
                title={`${noteName} @ ${n.startBeat.toFixed(2)}b`}
              >
                {w > 20 && (
                  <span className="absolute font-mono truncate" style={{ left: 3, top: '50%', transform: 'translateY(-50%)', fontSize: 9, lineHeight: '9px', color: 'rgba(255,255,255,0.85)' }}>
                    {noteName}
                  </span>
                )}
                {w > 10 && (
                  <div className="absolute right-0 top-0 bottom-0 pointer-events-none"
                    style={{ width: 3, backgroundColor: 'rgba(0,0,0,0.25)' }}
                  />
                )}
              </div>
            );
          })}

          {/* Playhead */}
          {isPlaying && (
            <div className="absolute top-0 bottom-0 w-px bg-cyan-400/70 pointer-events-none z-30"
              style={{ left: currentBeat * beatSec * PPS + NOTE_LABEL_W }}
            />
          )}
        </div>
      </div>

      {velocityLaneVisible && (
        <div className="absolute pointer-events-none" style={{
          bottom: 0, left: 64, right: 0, height: 64,
          background: 'rgba(15,15,25,0.92)',
          backdropFilter: 'blur(4px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          zIndex: 10,
        }}>
          {channel.notes.map((n) => {
            const barH = (n.velocity / 127) * 56;
            const noteW = Math.max(n.durationBeats * beatSec * PPS, 4);
            const x = n.startBeat * beatSec * PPS + NOTE_LABEL_W - scrollLeft;
            return (
              <div key={`vel-${n.id}`} className="absolute bottom-0"
                style={{ left: x - 64, width: Math.max(noteW - 1, 2), height: barH, backgroundColor: channel.color, opacity: 0.6 }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
