# SPEC-000 — Cleanup: Remove Dead Code and Extract Genre Presets

## ONE-LINE SUMMARY
Delete all deprecated components, data files, and audio genre engines; extract genre presets into a standalone file before the old data source is removed; update all import references.

---

## CONTEXT
The project pivoted from a lesson-based system to a DAW-based reconstruction platform. A large amount of code is now dead weight. This spec removes it cleanly before any new features are built, so subsequent specs work on a clean codebase.

---

## FILES TO DELETE (complete files)

### Components
- `src/components/Metronome.tsx`
- `src/components/LessonGrid.tsx`
- `src/components/LessonContent.tsx`
- `src/components/LessonNav.tsx`
- `src/components/ProgressBar.tsx`
- `src/components/SheetMusic.tsx`
- `src/components/AudioTest.tsx`

### Data
- `src/data/lessons.tsx` — 6 old piano lessons, not used in new system
- `src/data/synthLessons.tsx` — 17 synth lessons + genre presets. Presets must be extracted BEFORE this file is deleted (see Step 1)

### Audio genre engines
- `src/audio/darkambient.ts`
- `src/audio/darkeuphoric.ts`
- `src/audio/darkphonk.ts`
- `src/audio/darksynth.ts`
- `src/audio/darkwave.ts`
- `src/audio/industrial.ts`
- `src/audio/synthwave.ts`

### Hooks
- `src/hooks/useTrackPlayer.ts` — uses old Tone.Transport.schedule pattern, replaced by per-channel Tone.Part in SPEC-004

### Images
- `src/img/` — entire directory (contains only `Screenshot 2026-05-09 234546.png`)

---

## FILES TO CREATE

### `src/data/genrePresets.ts`
Extract ONLY the genre preset data from `synthLessons.tsx`. No lessons, no icons, no colors.

**Full content of this file:**

```ts
// Genre preset definitions for Trip Under the Night
// Each preset defines the synth/FX chain parameters for a dark music genre.

export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export type Genre =
  | 'darkambient'
  | 'darkwave'
  | 'synthwave'
  | 'darksynth'
  | 'darkphonk'
  | 'darkeuphoric'
  | 'industrial';

export interface GenrePreset {
  label: string;
  waveform: Waveform;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filterCutoff: number;
  reverbMix: number;
  delayTime: number;
  delayMix: number;
  distortion: number;
  chorusRate: number;
}

export const genrePresets: Record<Genre, GenrePreset> = {
  darkambient: {
    label: 'VOID',
    waveform: 'sine',
    attack: 3.0,
    decay: 2.0,
    sustain: 0.9,
    release: 5,
    filterCutoff: 350,
    reverbMix: 0.8,
    delayTime: 1.0,
    delayMix: 0.35,
    distortion: 0,
    chorusRate: 0.25,
  },
  darkwave: {
    label: 'PAD',
    waveform: 'sawtooth',
    attack: 0.4,
    decay: 0.6,
    sustain: 0.75,
    release: 1.8,
    filterCutoff: 1400,
    reverbMix: 0.5,
    delayTime: 0.4,
    delayMix: 0.3,
    distortion: 0.08,
    chorusRate: 0.45,
  },
  synthwave: {
    label: 'LEAD',
    waveform: 'square',
    attack: 0.005,
    decay: 0.15,
    sustain: 0.55,
    release: 0.25,
    filterCutoff: 2200,
    reverbMix: 0.22,
    delayTime: 0.3,
    delayMix: 0.4,
    distortion: 0.03,
    chorusRate: 0.35,
  },
  darksynth: {
    label: 'AGGR',
    waveform: 'sawtooth',
    attack: 0.002,
    decay: 0.08,
    sustain: 0.35,
    release: 0.15,
    filterCutoff: 3500,
    reverbMix: 0.15,
    delayTime: 0.15,
    delayMix: 0.12,
    distortion: 0.55,
    chorusRate: 0.05,
  },
  darkphonk: {
    label: 'BASS',
    waveform: 'square',
    attack: 0.003,
    decay: 0.12,
    sustain: 0.28,
    release: 0.12,
    filterCutoff: 650,
    reverbMix: 0.12,
    delayTime: 0.2,
    delayMix: 0.18,
    distortion: 0.35,
    chorusRate: 0,
  },
  darkeuphoric: {
    label: 'HAUNT',
    waveform: 'triangle',
    attack: 0.5,
    decay: 1.0,
    sustain: 0.65,
    release: 2.5,
    filterCutoff: 550,
    reverbMix: 0.65,
    delayTime: 0.6,
    delayMix: 0.35,
    distortion: 0.12,
    chorusRate: 0.55,
  },
  industrial: {
    label: 'MECH',
    waveform: 'sawtooth',
    attack: 0.001,
    decay: 0.04,
    sustain: 0.15,
    release: 0.08,
    filterCutoff: 1800,
    reverbMix: 0.08,
    delayTime: 0.1,
    delayMix: 0.03,
    distortion: 0.6,
    chorusRate: 0,
  },
};

export const genreIcons: Record<Genre, string> = {
  darkambient:  '🌫',
  darkwave:     '🌙',
  synthwave:    '⚡',
  darksynth:    '🔥',
  darkphonk:    '💀',
  darkeuphoric: '🕸',
  industrial:   '⚙️',
};
```

---

## FILES TO MODIFY

### `src/store/lessonStore.ts`
Currently imports `Genre`, `GenrePreset`, and `genrePresets` from `@/data/synthLessons`.
Change import to:
```ts
import type { Genre, GenrePreset } from '@/data/genrePresets';
import { genrePresets } from '@/data/genrePresets';
```
No other changes to this file.

### `src/App.tsx`
Currently imports from `@/data/synthLessons`:
```ts
import { lessons, genreIcons, genrePresets, type Genre } from './data/synthLessons';
```

After cleanup, `lessons` no longer exists. The entire lesson-based UI in App.tsx (sidebar, SequencePlayer, SheetMusic, PianoRoll step-sequencer, lesson scores, demo playback, handleKeyPress) is deprecated.

**Action:** Remove the import line above. Add:
```ts
import { genreIcons, genrePresets, type Genre } from '@/data/genrePresets';
```

Then remove all code in App.tsx that references `lessons`, `currentLesson`, `lessonScores`, `lessonComplete`, `targetNotes`, `highlightedNotes`, `currentStep`, `sequenceMode`, `isDemoPlaying`, `demoStep`, `correctCount`, `wrongCount`, `streak`, `wrongNoteFlash`, `handleKeyPress`, `playDemoMelody`, `stopDemo`, `selectLesson`, `SidebarLesson`, `BpmControl` (if it references lessons), `SequencePlayer`, `SheetMusic`, `PianoRoll` (step-sequencer version).

**What stays in App.tsx after cleanup:**
- MIDI hardware input registration (useEffect with navigator.requestMIDIAccess)
- `playNote` / `stopNote` callbacks
- `toneChainRef` and Tone chain sync useEffect
- `pressedNotes` state
- `isPlaying` state
- `<PianoKeyboard>` render
- `<SynthControls>` render
- `<EffectsPanel>` render
- `<RecordingControls>` render
- `<TrackList>` render
- `<ExportButton>` render
- `<WaveformDisplay>` render
- Header with app title
- `<ErrorBoundary>` wrapper

**App.tsx after cleanup is a minimal shell** — just the audio engine, keyboard, and recording controls. SPEC-004 will add the DAW view on top of this.

### `src/components/PianoKeyboard.tsx`
Check if it imports from `synthLessons` or `lessons`. If yes, update import to `genrePresets`. If no imports from those files, no change needed.

### `src/components/WaveformDisplay.tsx`
Check for imports from deprecated files. Update if needed.

### `src/components/RecordingControls.tsx`
Check for imports from deprecated files. No changes expected.

### `src/components/TrackList.tsx`
Check for imports from deprecated files. No changes expected.

### `src/components/ExportButton.tsx`
Check for imports from deprecated files. No changes expected.

---

## STEP-BY-STEP IMPLEMENTATION ORDER

### Step 1 — Create `src/data/genrePresets.ts`
Create the file with the exact content specified above.
**Verification:** `pnpm build` passes (file exists, no imports yet).

### Step 2 — Update `src/store/lessonStore.ts` imports
Change import source from `@/data/synthLessons` to `@/data/genrePresets`.
**Verification:** `pnpm build` passes. `useLessonStore` still works.

### Step 3 — Delete audio genre engine files
Delete all 7 files in `src/audio/`: `darkambient.ts`, `darkeuphoric.ts`, `darkphonk.ts`, `darksynth.ts`, `darkwave.ts`, `industrial.ts`, `synthwave.ts`.
**Verification:** `pnpm build` passes (nothing imports these files).

### Step 4 — Delete deprecated component files
Delete: `Metronome.tsx`, `LessonGrid.tsx`, `LessonContent.tsx`, `LessonNav.tsx`, `ProgressBar.tsx`, `SheetMusic.tsx`, `AudioTest.tsx`.
**Verification:** `pnpm build` passes (nothing imports these after App.tsx cleanup in Step 6).

### Step 5 — Delete `src/hooks/useTrackPlayer.ts`
**Verification:** `pnpm build` passes (nothing imports it after App.tsx cleanup).

### Step 6 — Clean up `src/App.tsx`
1. Replace the `synthLessons` import with `genrePresets` import (as specified above).
2. Remove all lesson-related state, functions, and JSX (full list above).
3. Remove imports for deleted components: `SequencePlayer`, `SheetMusic`, `PianoRoll` (step-sequencer), `LessonNav`, `LessonGrid`, `LessonContent`.
4. Keep all audio engine code, MIDI input, keyboard, recording, synth controls.
**Verification:** `pnpm build` passes. App renders: header + keyboard + synth controls + effects + recording controls.

### Step 7 — Delete data files
Delete `src/data/lessons.tsx` and `src/data/synthLessons.tsx`.
**Verification:** `pnpm build` passes. No remaining imports from these files.

### Step 8 — Delete image directory
Delete `src/img/` directory.
**Verification:** `pnpm build` passes.

### Step 9 — Final import audit
Run `pnpm build` and confirm zero TypeScript errors. Search for any remaining imports from deleted files:
- No imports from `synthLessons`
- No imports from `lessons`
- No imports from `darkambient`, `darkwave`, etc.
- No imports from `useTrackPlayer`
- No imports from deleted components

---

## ACCEPTANCE CRITERIA

1. `pnpm build` exits with code 0 and zero TypeScript errors.
2. The following files do NOT exist:
   - `src/components/Metronome.tsx`
   - `src/components/LessonGrid.tsx`
   - `src/components/LessonContent.tsx`
   - `src/components/LessonNav.tsx`
   - `src/components/ProgressBar.tsx`
   - `src/components/SheetMusic.tsx`
   - `src/components/AudioTest.tsx`
   - `src/data/lessons.tsx`
   - `src/data/synthLessons.tsx`
   - `src/audio/darkambient.ts`
   - `src/audio/darkeuphoric.ts`
   - `src/audio/darkphonk.ts`
   - `src/audio/darksynth.ts`
   - `src/audio/darkwave.ts`
   - `src/audio/industrial.ts`
   - `src/audio/synthwave.ts`
   - `src/hooks/useTrackPlayer.ts`
   - `src/img/` (directory)
3. `src/data/genrePresets.ts` exists and exports `genrePresets`, `genreIcons`, `Genre`, `GenrePreset`, `Waveform`.
4. `src/store/lessonStore.ts` imports from `@/data/genrePresets`, not from `@/data/synthLessons`.
5. App renders without crashing: header, piano keyboard, synth controls, effects panel, recording controls are visible.
6. MIDI hardware input still works (no regression in audio engine).
7. `App.tsx` contains zero references to: `lessons`, `currentLesson`, `lessonScores`, `targetNotes`, `sequenceMode`, `isDemoPlaying`, `handleKeyPress` (lesson version).

## DO NOT TOUCH

- `src/store/trackStore.ts` — unchanged
- `src/store/types.ts` — unchanged
- `src/hooks/useRecorder.ts` — unchanged
- `src/utils/buildToneChain.ts` — unchanged
- `src/utils/noteColors.ts` — unchanged
- `src/components/PianoKeyboard.tsx` — unchanged
- `src/components/SynthControls.tsx` — unchanged
- `src/components/EffectsPanel.tsx` — unchanged
- `src/components/Knob.tsx` — unchanged
- `src/components/RecordingControls.tsx` — unchanged
- `src/components/TrackList.tsx` — unchanged
- `src/components/ExportButton.tsx` — unchanged
- `src/components/WaveformDisplay.tsx` — unchanged
- `src/components/PianoRollTrack.tsx` — unchanged
- `src/components/ErrorBoundary.tsx` — unchanged
- `src/audio/raw/` — unchanged (MP3 source files)
- `src/audio/separated/` — unchanged (stem WAV files)
- `src/audio/uvr/` — unchanged (MIDI reference files)
- Tone.js audio engine behavior — unchanged
