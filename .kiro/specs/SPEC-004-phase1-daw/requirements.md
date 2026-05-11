# SPEC-004 — Phase 1 DAW: Channel Rack + Transport + Piano Roll

## PREREQUISITES
- SPEC-000 (cleanup) must be complete
- SPEC-001 (useSynthStore) must be complete
- SPEC-002 (BPM single source of truth) must be complete

## ONE-LINE SUMMARY
Replace the deprecated lesson UI with a full DAW view: Transport bar, 5-channel Channel Rack (Drums/Lead/Bass/Pads/FX), and a Piano Roll showing reference MIDI + recorded take for visual comparison.

---

## SCOPE DEFINITION

### IN SCOPE — Fase 1
- `App.tsx` renders DAW view directly (no lesson mode toggle)
- Transport: Play / Stop / Record / BPM display
- Channel Rack: 5 fixed channels (Drums, Lead, Bass, Pads, FX) with mute/solo/volume/pan
- Per-channel MIDI clip assignment (reference MIDI loaded from `.mid` file)
- Per-channel playback via `Tone.Part`
- Piano Roll: static reference MIDI display + recorded take overlay (visual comparison only)
- `useMidiFile` hook: loads `.mid` file via `@tonejs/midi`
- New `useChannelStore`: Zustand store for the 5 fixed channels
- Pilot song: Wicked Triumph (Dark Euphoric, 75 BPM)

### OUT OF SCOPE — Fase 1 (do NOT implement)
- Guided mode (notes falling + real-time green/red feedback) → Fase 3
- Note editing in Piano Roll (draw, delete, move, resize) → future spec
- Session View (Ableton-style clip launcher) → future spec
- Loop / metronome → future spec
- Quantization → future spec
- MIDI CC mapping (KeyLab knobs/faders/pads) → future spec
- Score / accuracy calculation → future spec
- Song browser → future spec
- Pentagrama / sheet music view → future spec (optional feature)
- Slow practice mode → future spec
- Audio track playback (backing track WAV) → future spec
- Save/load project state → future spec

---

## PILOT SONG DATA

Song: **Wicked Triumph**
Genre: Dark Euphoric
BPM: 75
Stems available in `src/audio/separated/`:
- `drums/drums.wav` (usable — MIDI reference available)
- `other/other.wav` (contains lead + pads)
- `bass/bass.wav` (dirty — use as approximate reference only)
- `vocals/vocals.wav` (ghost — skip for Fase 1)

MIDI reference file location: `src/audio/uvr/wicked-triumph.mid`
If this file does not exist yet, `DawPianoRoll` must handle null gracefully (show placeholder).

---

## COMPONENT TREE

```
App.tsx
└── DawView                          src/components/daw/DawView.tsx
    ├── TransportBar                 src/components/daw/TransportBar.tsx
    ├── ChannelRack                  src/components/daw/ChannelRack.tsx
    │   └── ChannelStrip (×5)        src/components/daw/ChannelStrip.tsx
    └── DawPianoRoll                 src/components/daw/DawPianoRoll.tsx
        └── PianoRollTrack           src/components/PianoRollTrack.tsx (existing, unchanged)
```

All new DAW components live in `src/components/daw/` to keep them isolated from existing components.

---

## FILES TO MODIFY

| File | What changes |
|------|-------------|
| `src/App.tsx` | Remove lesson UI remnants (post SPEC-000), import and render `<DawView />` as main content, keep audio engine + keyboard strip at bottom |
| `src/store/lessonStore.ts` | No changes (SPEC-002 output is sufficient) |

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/store/channelStore.ts` | Zustand store for 5 fixed channels |
| `src/hooks/useMidiFile.ts` | Hook: loads .mid file, returns MidiEvent[] |
| `src/components/daw/DawView.tsx` | DAW layout container |
| `src/components/daw/TransportBar.tsx` | Play/Stop/Record/BPM controls |
| `src/components/daw/ChannelRack.tsx` | Renders 5 ChannelStrip components |
| `src/components/daw/ChannelStrip.tsx` | Single channel UI |
| `src/components/daw/DawPianoRoll.tsx` | Piano roll: reference + recorded take |

## FILES TO DELETE
None (SPEC-000 handles all deletions).

---

## INTERFACES / TYPES

### `src/store/channelStore.ts`

```ts
import { create } from 'zustand';
import type { MidiEvent } from '@/store/types';

export type ChannelType = 'drums' | 'lead' | 'bass' | 'pads' | 'fx';

export interface ChannelData {
  id: ChannelType;           // unique, fixed
  name: string;              // display name: 'Drums', 'Lead', 'Bass', 'Pads', 'FX'
  muted: boolean;
  soloed: boolean;
  volume: number;            // 0..1
  pan: number;               // -1..1 (0 = center)
  referenceEvents: MidiEvent[];  // loaded from .mid file
  recordedEvents: MidiEvent[];   // from useTrackStore (linked by activeTrackId)
  color: string;             // hex color for UI accent
}

export interface ChannelState {
  channels: ChannelData[];
  activeChannelId: ChannelType;

  setActiveChannel: (id: ChannelType) => void;
  toggleMute: (id: ChannelType) => void;
  toggleSolo: (id: ChannelType) => void;
  setVolume: (id: ChannelType, volume: number) => void;
  setPan: (id: ChannelType, pan: number) => void;
  setReferenceEvents: (id: ChannelType, events: MidiEvent[]) => void;
  setRecordedEvents: (id: ChannelType, events: MidiEvent[]) => void;
}
```

**Initial channel data (hardcoded, 5 fixed channels):**
```ts
const INITIAL_CHANNELS: ChannelData[] = [
  { id: 'drums', name: 'Drums',  muted: false, soloed: false, volume: 0.8, pan: 0, referenceEvents: [], recordedEvents: [], color: '#f59e0b' },
  { id: 'lead',  name: 'Lead',   muted: false, soloed: false, volume: 0.8, pan: 0, referenceEvents: [], recordedEvents: [], color: '#ec4899' },
  { id: 'bass',  name: 'Bass',   muted: false, soloed: false, volume: 0.8, pan: 0, referenceEvents: [], recordedEvents: [], color: '#22d3ee' },
  { id: 'pads',  name: 'Pads',   muted: false, soloed: false, volume: 0.7, pan: 0, referenceEvents: [], recordedEvents: [], color: '#a855f7' },
  { id: 'fx',    name: 'FX',     muted: false, soloed: false, volume: 0.6, pan: 0, referenceEvents: [], recordedEvents: [], color: '#10b981' },
];
```

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
 * trackIndex selects which MIDI track to use (default: 0, the first track with notes).
 * Returns empty events while loading or on error.
 */
export function useMidiFile(url: string | null, trackIndex = 0): UseMidiFileResult
```

**Implementation rules:**
- If `url` is null → return `{ events: [], isLoading: false, error: null }` immediately, no fetch.
- Fetch with `fetch(url)` → `arrayBuffer()` → `new Midi(buffer)`.
- Find the first track with notes if `trackIndex` is out of bounds.
- Map `midi.tracks[trackIndex].notes` to `MidiEvent[]`:
  ```ts
  { note: n.midi, velocity: n.velocity, time: n.time, duration: n.duration }
  ```
- On any error: set `error` message, return empty `events`.
- Re-runs when `url` changes.
- Cleans up (sets loading false) on unmount.

### `src/components/daw/TransportBar.tsx`

No props. Reads from stores directly.

```ts
// Store reads
const bpm = useLessonStore((s) => s.currentBpm);
const setBpm = useLessonStore((s) => s.setBpm);
const { isRecording, startRecording, stopRecording } = useRecorder();

// Local state
const [isPlaying, setIsPlaying] = useState(false);
const [transportTime, setTransportTime] = useState('00:00');
```

**Transport time display:** uses `requestAnimationFrame` to read `Tone.Transport.seconds` and format as `MM:SS`. Stops the RAF loop when component unmounts.

**Play handler:**
```ts
async function handlePlay() {
  await Tone.start();
  Tone.Transport.start();
  setIsPlaying(true);
}
```

**Stop handler:**
```ts
function handleStop() {
  Tone.Transport.stop();
  Tone.Transport.seconds = 0;
  setIsPlaying(false);
}
```

**UI layout (single horizontal bar, ~48px height):**
```
[■ Stop] [▶ Play] [● Rec]   |   ♩ [BPM input]   |   [MM:SS display]
```

All buttons use existing Tailwind dark theme classes consistent with the rest of the app.

### `src/components/daw/ChannelStrip.tsx`

```ts
interface ChannelStripProps {
  channelId: ChannelType;
}
```

**Store reads inside component:**
```ts
const channel = useChannelStore((s) => s.channels.find(c => c.id === channelId)!);
const activeChannelId = useChannelStore((s) => s.activeChannelId);
const { toggleMute, toggleSolo, setVolume, setPan, setActiveChannel } = useChannelStore();
```

**UI elements (vertical strip layout):**
- Channel name label (top, truncated)
- Active indicator: highlighted left border when `channel.id === activeChannelId`
- Click anywhere on strip → `setActiveChannel(channelId)`
- **[M]** mute button — active state: `bg-yellow-500/30 text-yellow-400`
- **[S]** solo button — active state: `bg-green-500/30 text-green-400`
- Volume fader: vertical slider, 0..1, `setVolume(channelId, v)`
- Pan knob: use existing `<Knob>` component, -1..1, center = 0
- Color accent dot matching `channel.color`

**Width:** fixed at 80px per strip.

### `src/components/daw/ChannelRack.tsx`

No props.

```ts
const channels = useChannelStore((s) => s.channels);
```

Renders 5 `<ChannelStrip channelId={c.id} />` in a horizontal flex row.
Fixed height: 200px.
Background: `bg-black/60 border border-purple-900/30`.

### `src/components/daw/DawPianoRoll.tsx`

No props.

```ts
// MIDI file import — use Vite ?url suffix
// If file doesn't exist, set to null and handle gracefully
import wickedTriumphUrl from '@/audio/uvr/wicked-triumph.mid?url';
// If import fails at build time because file doesn't exist:
// const wickedTriumphUrl: string | null = null;

const activeChannelId = useChannelStore((s) => s.activeChannelId);
const setReferenceEvents = useChannelStore((s) => s.setReferenceEvents);

const { events: referenceEvents, isLoading, error } = useMidiFile(wickedTriumphUrl ?? null);

// When reference events load, store them in the active channel
useEffect(() => {
  if (referenceEvents.length > 0) {
    setReferenceEvents(activeChannelId, referenceEvents);
  }
}, [referenceEvents, activeChannelId]);

// Get recorded events for active channel from trackStore
const activeTrackId = useTrackStore((s) => s.activeTrackId);
const recordedEvents = useTrackStore((s) => {
  const track = s.tracks.find(t => t.id === activeTrackId);
  return track?.type === 'midi' ? track.events : [];
});

const bpm = useLessonStore((s) => s.currentBpm);
```

**Render logic:**
- If `isLoading`: `<div>Loading MIDI...</div>` with a subtle pulse animation
- If `error`: `<div className="text-red-400 text-xs p-2">Failed to load MIDI: {error}</div>`
- If no reference events AND no recorded events: `<div className="text-gray-600 text-xs p-4 text-center">No MIDI loaded — assign a .mid file to this channel</div>`
- Otherwise: `<PianoRollTrack events={recordedEvents} referenceEvents={referenceEvents} bpm={bpm} />`

### `src/components/daw/DawView.tsx`

No props.

**Layout (full height flex column):**
```
┌─────────────────────────────────────────────────────┐
│ TransportBar                          (~48px, fixed) │
├──────────────────────┬──────────────────────────────┤
│ ChannelRack          │ DawPianoRoll                  │
│ (400px fixed width,  │ (flex-1, overflow-x-auto)     │
│  200px height)       │                               │
├──────────────────────┴──────────────────────────────┤
│ [existing] PianoKeyboard strip        (fixed bottom) │
└─────────────────────────────────────────────────────┘
```

The PianoKeyboard strip is NOT inside DawView — it stays in App.tsx at the bottom, always visible.

### `src/App.tsx` after SPEC-004

App.tsx becomes a thin shell:

```tsx
function App() {
  // Audio engine state (from SPEC-001: useSynthStore)
  // MIDI hardware input useEffect
  // playNote / stopNote callbacks
  // toneChainRef + sync useEffect
  // pressedNotes, isPlaying state

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col overflow-hidden bg-black text-white"
        style={{ backgroundImage: '...' }} // keep existing grid pattern
      >
        {/* Header */}
        <header>
          {/* App title: TRIP UNDER THE NIGHT */}
          {/* Genre badge (from useLessonStore) */}
          {/* WaveformDisplay */}
        </header>

        {/* DAW View — takes all remaining space */}
        <div className="flex-1 overflow-hidden">
          <DawView />
        </div>

        {/* Fixed keyboard strip — always at bottom */}
        <div className="flex-shrink-0 border-t border-purple-900/30 bg-black/80 backdrop-blur-sm px-3 pt-2 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <RecordingControls />
            <div className="flex-1 min-w-0 min-h-[40px] border border-white/10">
              <TrackList />
            </div>
            <ExportButton />
          </div>
          <PianoKeyboard
            guideNote={null}
            highlightedNotes={[]}
            activeNotes={pressedNotes}
            wrongNotes={[]}
            beatMs={(60 / bpm) * 1000}
            onKeyPress={(note) => playNote(note, 0.8)}
            onKeyRelease={stopNote}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
```

Where `bpm` comes from `useLessonStore((s) => s.currentBpm)` (SPEC-002 output).

---

## STEP-BY-STEP IMPLEMENTATION ORDER

### Step 1 — Create `src/store/channelStore.ts`
Implement with 5 fixed channels and all actions as specified.
**Verification:** `pnpm build` passes.

### Step 2 — Create `src/hooks/useMidiFile.ts`
Implement hook. Test with `url = null` — must return empty events without errors.
**Verification:** `pnpm build` passes.

### Step 3 — Create `src/components/daw/ChannelStrip.tsx`
Implement with mute/solo/volume/pan/active indicator. Use `<Knob>` for pan.
**Verification:** `pnpm build` passes.

### Step 4 — Create `src/components/daw/ChannelRack.tsx`
Renders 5 ChannelStrip components horizontally.
**Verification:** `pnpm build` passes.

### Step 5 — Create `src/components/daw/TransportBar.tsx`
Implement Play/Stop/Record/BPM/time display with RAF-based time counter.
**Verification:** `pnpm build` passes. Play starts `Tone.Transport`. Stop resets to 0.

### Step 6 — Create `src/components/daw/DawPianoRoll.tsx`
Implement with `useMidiFile`. Handle all three states: loading, error, no data.
For the MIDI import: attempt `import wickedTriumphUrl from '@/audio/uvr/wicked-triumph.mid?url'`. If the file does not exist and the import fails at build time, replace with `const wickedTriumphUrl: string | null = null`.
**Verification:** `pnpm build` passes. If MIDI exists, reference events render. If not, placeholder shows.

### Step 7 — Create `src/components/daw/DawView.tsx`
Compose TransportBar + ChannelRack + DawPianoRoll with the layout specified.
**Verification:** `pnpm build` passes.

### Step 8 — Update `src/App.tsx`
1. Remove all remaining lesson-related code (post SPEC-000, anything still referencing lessons).
2. Import and render `<DawView />` as main content.
3. Keep header, keyboard strip, recording controls, track list, export button.
4. Update header title to "TRIP UNDER THE NIGHT".
5. `guideNote` passed to PianoKeyboard is always `null` in Fase 1 (guided mode is Fase 3).
**Verification:** `pnpm build` passes. App renders DAW view.

### Step 9 — Integration test
1. Open app — DAW view renders with TransportBar + ChannelRack + DawPianoRoll.
2. Click Play — `Tone.Transport` starts, time counter advances.
3. Click Stop — transport stops, counter resets to 00:00.
4. Click Record — recording starts (red indicator in RecordingControls).
5. Play notes on keyboard — notes appear in TrackList.
6. Stop recording — recorded events appear in DawPianoRoll as colored bars.
7. If `wicked-triumph.mid` exists — gray reference bars visible behind recorded events.
8. Mute/Solo buttons on ChannelStrip respond visually.
9. Volume fader on ChannelStrip changes value (store update confirmed).

---

## ACCEPTANCE CRITERIA

1. `pnpm build` exits with code 0 and zero TypeScript errors.
2. App renders DAW view on load — no lesson sidebar, no step-sequencer piano roll.
3. Header title reads "TRIP UNDER THE NIGHT".
4. TransportBar Play/Stop/Record buttons are functional.
5. BPM input in TransportBar reads from and writes to `useLessonStore.currentBpm`.
6. `Tone.Transport.bpm.value` matches the BPM display at all times.
7. ChannelRack shows exactly 5 strips: Drums, Lead, Bass, Pads, FX.
8. Mute/Solo/Volume/Pan controls in ChannelStrip update `useChannelStore`.
9. Clicking a channel strip sets it as active (highlighted border).
10. DawPianoRoll renders without crashing whether or not `wicked-triumph.mid` exists.
11. Recording a MIDI take and stopping shows the recorded events in DawPianoRoll.
12. PianoKeyboard at the bottom is always visible and functional.
13. MIDI hardware input (KeyLab) still triggers `playNote` correctly.
14. `useSynthStore` knobs (SynthControls, EffectsPanel) still affect the sound.

## DO NOT TOUCH

- `src/components/PianoRollTrack.tsx` — used as-is, zero modifications
- `src/components/PianoKeyboard.tsx` — unchanged
- `src/components/SynthControls.tsx` — unchanged (SPEC-001 output)
- `src/components/EffectsPanel.tsx` — unchanged (SPEC-001 output)
- `src/components/Knob.tsx` — unchanged
- `src/components/RecordingControls.tsx` — unchanged
- `src/components/TrackList.tsx` — unchanged
- `src/components/ExportButton.tsx` — unchanged
- `src/components/WaveformDisplay.tsx` — unchanged
- `src/components/ErrorBoundary.tsx` — unchanged
- `src/store/trackStore.ts` — unchanged
- `src/store/types.ts` — unchanged
- `src/store/synthStore.ts` — unchanged (SPEC-001 output)
- `src/store/lessonStore.ts` — unchanged (SPEC-002 output)
- `src/hooks/useRecorder.ts` — unchanged
- `src/utils/buildToneChain.ts` — unchanged
- `src/utils/noteColors.ts` — unchanged
- `src/data/genrePresets.ts` — unchanged (SPEC-000 output)
- Tone.js version — unchanged
- The lazy init behavior of `toneChainRef` in App.tsx — unchanged
