# SPEC-004 — Phase 1 UI: Channel Rack + Transport + Piano Roll

## PREREQUISITE
SPEC-001 and SPEC-002 must be complete before executing this spec.
SPEC-003 is recommended but not strictly required.

## ONE-LINE SUMMARY
Add a new "DAW Mode" view alongside the existing lesson mode, featuring a Transport bar (Play/Stop/BPM), a Channel Rack (one channel per track with synth controls), and a full Piano Roll that loads the Wicked Triumph MIDI file and accepts live MIDI input.

---

## PILOT SONG
- **Name:** Wicked Triumph
- **Genre:** Dark Euphoric
- **BPM:** 75
- **MIDI source:** `src/audio/uvr/` — the MIDI file for Wicked Triumph must be processed through the same basic_pitch pipeline used for Blacktop Mirage. The processed file must be placed at: `src/audio/uvr/wicked-triumph.mid`
- **If the MIDI file does not exist yet:** The Piano Roll component must handle a null/empty events state gracefully (show "No MIDI loaded" placeholder).

---

## COMPONENT TREE (new components only)

```
App.tsx
└── [new] DawView                    src/components/DawView.tsx
    ├── [new] TransportBar           src/components/TransportBar.tsx
    ├── [new] ChannelRack            src/components/ChannelRack.tsx
    │   └── [new] ChannelStrip       src/components/ChannelStrip.tsx  (one per track)
    └── [new] DawPianoRoll           src/components/DawPianoRoll.tsx
        └── [reused] PianoRollTrack  src/components/PianoRollTrack.tsx (already exists)
```

The existing lesson view (`SequencePlayer`, `SheetMusic`, `PianoRoll`, `SynthControls`, `EffectsPanel`) is NOT removed. A tab or toggle in App.tsx switches between "Lesson Mode" and "DAW Mode".

---

## FILES TO MODIFY

| File | What changes |
|------|-------------|
| `src/App.tsx` | Add `mode` state (`'lesson' \| 'daw'`), add mode toggle button in header, conditionally render `DawView` vs existing lesson content |
| `src/store/trackStore.ts` | Add `referenceTrackId` field and `setReferenceTrack` action |

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/components/DawView.tsx` | Container for the DAW mode layout |
| `src/components/TransportBar.tsx` | Play/Stop/Record buttons + BPM display |
| `src/components/ChannelRack.tsx` | List of ChannelStrip components, one per track |
| `src/components/ChannelStrip.tsx` | Single channel: name, volume, mute, solo, waveform selector |
| `src/components/DawPianoRoll.tsx` | Loads MIDI file, renders PianoRollTrack with reference + live events |
| `src/hooks/useMidiFile.ts` | Hook that loads a .mid file using @tonejs/midi and returns MidiEvent[] |

## FILES TO DELETE
None.

---

## INTERFACES / TYPES

### `src/hooks/useMidiFile.ts`

```ts
import { Midi } from '@tonejs/midi';
import { useState, useEffect } from 'react';
import type { MidiEvent } from '@/store/types';

interface UseMidiFileResult {
  events: MidiEvent[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Loads a .mid file from a URL and returns its note events as MidiEvent[].
 * Uses track index 0 by default. Pass trackIndex to select a different track.
 * Returns empty events array while loading or on error.
 */
export function useMidiFile(url: string | null, trackIndex = 0): UseMidiFileResult
```

**Implementation notes for `useMidiFile`:**
- If `url` is null, return `{ events: [], isLoading: false, error: null }` immediately.
- Fetch the file with `fetch(url)`, get `arrayBuffer()`, pass to `new Midi(buffer)`.
- Map `midi.tracks[trackIndex].notes` to `MidiEvent[]`:
  ```ts
  {
    note: n.midi,           // MIDI note number
    velocity: n.velocity,   // 0..1
    time: n.time,           // seconds from start
    duration: n.duration,   // seconds
  }
  ```
- If `midi.tracks[trackIndex]` does not exist, return empty events with error message.
- The hook re-runs when `url` changes.

### `src/components/TransportBar.tsx`

```ts
interface TransportBarProps {
  // No props — reads everything from stores
}
```

Internal state/store reads:
```ts
const bpm = useLessonStore((s) => s.currentBpm);
const setBpm = useLessonStore((s) => s.setBpm);
const { isRecording, startRecording, stopRecording } = useRecorder();
```

Transport play/stop controls `Tone.Transport` directly:
```ts
function handlePlay() {
  Tone.start();
  Tone.Transport.start();
}
function handleStop() {
  Tone.Transport.stop();
  Tone.Transport.seconds = 0;
}
```

UI elements (all required):
- Play button (▶) — calls `handlePlay`
- Stop button (■) — calls `handleStop`
- Record button (●) — calls `startRecording` / `stopRecording`
- BPM display: numeric input, min=40, max=240, calls `setBpm` on change
- Transport time display: `MM:SS` format, updates via `requestAnimationFrame`

### `src/components/ChannelStrip.tsx`

```ts
interface ChannelStripProps {
  trackId: string;
}
```

Internal reads:
```ts
const track = useTrackStore((s) => s.tracks.find(t => t.id === trackId));
const toggleMute = useTrackStore((s) => s.toggleMute);
const toggleSolo = useTr ackStore((s) => s.toggleSolo);
const setTrackVolume = useTrackStore((s) => s.setTrackVolume);
const activeTrackId = useTrackStore((s) => s.activeTrackId);
const setActiveTrack = useTrackStore((s) => s.setActiveTrack);
```

For MIDI tracks only — show waveform selector that writes to `useSynthStore`:
```ts
// Only render waveform selector if track.type === 'midi' && !track.readonly
const waveform = useSynthStore((s) => s.waveform);
const setWaveform = useSynthStore((s) => s.setWaveform);
```

UI elements per strip:
- Track name (text, truncated)
- Active indicator (highlighted border when `track.id === activeTrackId`)
- Click to set active track
- Mute button (M) — toggles mute
- Solo button (S) — toggles solo
- Volume slider (vertical or horizontal, 0..1)
- Waveform selector (sine/square/sawtooth/triangle) — MIDI tracks only

### `src/components/ChannelRack.tsx`

```ts
// No props
```

Reads `useTrackStore((s) => s.tracks)` and renders one `<ChannelStrip trackId={t.id} />` per track.

### `src/components/DawPianoRoll.tsx`

```ts
// No props
```

Internal:
```ts
const WICKED_TRIUMPH_MIDI_URL = '/src/audio/uvr/wicked-triumph.mid';
// Note: Vite serves files under src/ at their path during dev.
// For production, the file must be in public/ or imported as an asset.
// Use: import wickedTriumphUrl from '@/audio/uvr/wicked-triumph.mid?url'
// This requires adding '?url' Vite asset import.

const { events: referenceEvents, isLoading, error } = useMidiFile(WICKED_TRIUMPH_MIDI_URL);
const activeTrackId = useTrackStore((s) => s.activeTrackId);
const liveEvents = useTrackStore((s) => {
  const track = s.tracks.find(t => t.id === activeTrackId);
  return track?.type === 'midi' ? track.events : [];
});
const bpm = useLessonStore((s) => s.currentBpm);
```

Renders:
- If `isLoading`: spinner or "Loading MIDI..." text
- If `error`: error message in red
- Otherwise: `<PianoRollTrack events={liveEvents} referenceEvents={referenceEvents} bpm={bpm} />`

### `src/components/DawView.tsx`

```ts
// No props
```

Layout (vertical flex, full height):
```
┌─────────────────────────────────────────┐
│ TransportBar (fixed height ~48px)        │
├──────────────┬──────────────────────────┤
│ ChannelRack  │ DawPianoRoll             │
│ (fixed 200px │ (flex-1, scrollable)     │
│  width)      │                          │
└──────────────┴──────────────────────────┘
```

### `src/store/trackStore.ts` additions

Add to `TrackState` interface:
```ts
referenceTrackId: string | null;
setReferenceTrack: (id: string | null) => void;
```

Add to initial state:
```ts
referenceTrackId: null,
```

Add action:
```ts
setReferenceTrack: (id) => set({ referenceTrackId: id }),
```

### `src/App.tsx` additions

Add mode toggle state:
```ts
const [mode, setMode] = useState<'lesson' | 'daw'>('lesson');
```

Add to header (after the existing genre badge area):
```tsx
<div className="flex gap-1">
  <button
    onClick={() => setMode('lesson')}
    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
      mode === 'lesson'
        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
        : 'bg-gray-900 text-gray-600 hover:bg-gray-800'
    }`}
  >🎹 LESSON</button>
  <button
    onClick={() => setMode('daw')}
    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
      mode === 'daw'
        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
        : 'bg-gray-900 text-gray-600 hover:bg-gray-800'
    }`}
  >🎛 DAW</button>
</div>
```

In the main content area, replace the center content with:
```tsx
{mode === 'lesson' ? (
  /* existing lesson content — unchanged */
) : (
  <DawView />
)}
```

The left sidebar (lesson list) is hidden in DAW mode — wrap it with `{mode === 'lesson' && <aside ...>}`.

---

## STEP-BY-STEP IMPLEMENTATION ORDER

### Step 1 — Create `src/hooks/useMidiFile.ts`
Implement the hook as specified. Test with a null URL — must return empty events without errors.
**Verification:** `pnpm build` passes.

### Step 2 — Update `src/store/trackStore.ts`
Add `referenceTrackId` and `setReferenceTrack` as specified.
**Verification:** `pnpm build` passes. No existing functionality broken.

### Step 3 — Create `src/components/ChannelStrip.tsx`
Implement with all UI elements listed. Use existing Tailwind classes consistent with the app's dark theme (bg-black/50, border-purple-500/20, text-gray-400, etc.).
**Verification:** `pnpm build` passes.

### Step 4 — Create `src/components/ChannelRack.tsx`
Renders list of ChannelStrip components.
**Verification:** `pnpm build` passes.

### Step 5 — Create `src/components/TransportBar.tsx`
Implement Play/Stop/Record/BPM/time display. The transport time display must use `requestAnimationFrame` (same pattern as `PianoRollTrack`'s cursor).
**Verification:** `pnpm build` passes. Play button starts `Tone.Transport`. Stop resets to 0.

### Step 6 — Create `src/components/DawPianoRoll.tsx`
Implement with `useMidiFile` hook. Handle loading/error states.
For the MIDI file import, use Vite's `?url` suffix:
```ts
import wickedTriumphUrl from '@/audio/uvr/wicked-triumph.mid?url';
```
If the file does not exist, the import will fail at build time — in that case, set `const wickedTriumphUrl = null` and the hook will return empty events gracefully.
**Verification:** `pnpm build` passes. If MIDI file exists, reference events render in PianoRollTrack.

### Step 7 — Create `src/components/DawView.tsx`
Compose TransportBar + ChannelRack + DawPianoRoll with the layout specified.
**Verification:** `pnpm build` passes.

### Step 8 — Update `src/App.tsx`
1. Add `mode` state.
2. Add mode toggle buttons to header.
3. Conditionally render `DawView` vs lesson content.
4. Hide left sidebar in DAW mode.
5. Import `DawView`.
**Verification:** `pnpm build` passes. Toggling between LESSON and DAW modes works. Existing lesson mode is fully functional.

---

## ACCEPTANCE CRITERIA

1. `pnpm build` exits with code 0 and zero TypeScript errors.
2. A "DAW" toggle button appears in the header.
3. Clicking "DAW" shows the DawView; clicking "LESSON" restores the lesson view.
4. TransportBar Play button starts `Tone.Transport`; Stop button stops and resets to 0.
5. BPM input in TransportBar reads from and writes to `useLessonStore.currentBpm`.
6. ChannelRack shows one strip per track in `useTrackStore.tracks`.
7. Mute/Solo/Volume controls in ChannelStrip call the correct trackStore actions.
8. If `wicked-triumph.mid` exists: DawPianoRoll renders reference events as gray bars.
9. If `wicked-triumph.mid` does not exist: DawPianoRoll shows "No MIDI loaded" without crashing.
10. Recording a MIDI take in DAW mode shows the recorded events in DawPianoRoll.
11. Existing lesson mode (SequencePlayer, SheetMusic, PianoRoll, keyboard) is fully functional after the change.

## OUT OF SCOPE FOR PHASE 1

The following are explicitly NOT implemented in this spec:
- Audio track playback (backing track) — ChannelStrip renders audio tracks but play is not wired
- Multi-track MIDI playback via Transport — only live input is shown
- Saving/loading projects
- Exporting MIDI from DAW mode
- Quantization
- Note editing in the Piano Roll (click to add/delete notes)
- Zoom controls on the Piano Roll
- Multiple synth chains per channel (all MIDI channels share the single `toneChainRef` in App.tsx)
- The `referenceTrackId` field added to trackStore is scaffolding only — not used in Phase 1 UI

## DO NOT TOUCH

- `src/components/PianoRollTrack.tsx` — used as-is, no modifications
- `src/components/PianoKeyboard.tsx` — unchanged
- `src/components/SequencePlayer.tsx` — unchanged
- `src/components/SheetMusic.tsx` — unchanged
- `src/components/PianoRoll.tsx` — unchanged (the existing step-sequencer roll)
- `src/components/RecordingControls.tsx` — unchanged
- `src/components/TrackList.tsx` — unchanged
- `src/hooks/useRecorder.ts` — unchanged
- `src/hooks/useTrackPlayer.ts` — unchanged
- `src/store/lessonStore.ts` — unchanged (SPEC-002 output)
- `src/store/synthStore.ts` — unchanged (SPEC-001 output)
- `src/data/synthLessons.tsx` — unchanged
- `src/utils/buildToneChain.ts` — unchanged
- Tone.js version — unchanged
