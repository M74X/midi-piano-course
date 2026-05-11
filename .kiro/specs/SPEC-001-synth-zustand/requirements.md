# SPEC-001 — Extract useSynthState to Zustand

## ONE-LINE SUMMARY
Move 13 synth/FX local state values from App.tsx into a new Zustand store (`useSynthStore`), eliminating prop drilling into SynthControls and EffectsPanel.

---

## FILES TO MODIFY

| File | What changes |
|------|-------------|
| `src/App.tsx` | Remove 13 useState declarations, remove applyGenrePreset function, remove synth/FX props from SynthControls and EffectsPanel JSX, import useSynthStore |
| `src/components/SynthControls.tsx` | Remove all props, read state directly from useSynthStore |
| `src/components/EffectsPanel.tsx` | Remove all props, read state directly from useSynthStore |
| `src/utils/buildToneChain.ts` | No changes — interface stays identical |

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `src/store/synthStore.ts` | New Zustand store holding all 13 synth/FX values + setters + applyGenrePreset action |

## FILES TO DELETE / LINES TO REMOVE

### From `src/App.tsx` — delete these exact blocks:

**Block A — 13 useState declarations (lines ~55–70):**
```ts
const [waveform, setWaveform] = useState<'sine' | 'square' | 'sawtooth' | 'triangle'>('sawtooth');
const [attack, setAttack] = useState(0.05);
const [decay, setDecay] = useState(0.3);
const [sustain, setSustain] = useState(0.4);
const [release, setRelease] = useState(0.5);
const [volume, setVolume] = useState(0.75);
const [detune, setDetune] = useState(0);
const [reverbMix, setReverbMix] = useState(0.3);
const [delayTime, setDelayTime] = useState(0.4);
const [delayMix, setDelayMix] = useState(0.2);
const [distortion, setDistortion] = useState(0);
const [filterCutoff, setFilterCutoff] = useState(8000);
const [chorusRate, setChorusRate] = useState(0);
```

**Block B — applyGenrePreset function (lines ~195–212):**
```ts
const applyGenrePreset = (genre: Genre) => {
  const p = genrePresets[genre];
  setWaveform(p.waveform);
  setAttack(p.attack);
  // ... all 11 setters
};
```

**Block C — props on SynthControls JSX:**
```tsx
<SynthControls
  waveform={waveform} setWaveform={setWaveform}
  attack={attack} setAttack={setAttack}
  decay={decay} setDecay={setDecay}
  sustain={sustain} setSustain={setSustain}
  release={release} setRelease={setRelease}
  volume={volume} setVolume={setVolume}
  detune={detune} setDetune={setDetune}
/>
```
Replace with: `<SynthControls />`

**Block D — props on EffectsPanel JSX:**
```tsx
<EffectsPanel
  reverbMix={reverbMix} setReverbMix={setReverbMix}
  delayTime={delayTime} setDelayTime={setDelayTime}
  delayMix={delayMix} setDelayMix={setDelayMix}
  distortion={distortion} setDistortion={setDistortion}
  filterCutoff={filterCutoff} setFilterCutoff={setFilterCutoff}
  chorusRate={chorusRate} setChorusRate={setChorusRate}
/>
```
Replace with: `<EffectsPanel />`

**Block E — useEffect that syncs Tone chain to state:**
The dependency array currently lists all 13 values. After migration, replace the 13 local variable references with store selector calls. See Step 5 below.

---

## INTERFACES / TYPES

### `src/store/synthStore.ts`

```ts
import { create } from 'zustand';
import type { Genre } from '@/data/synthLessons';
import { genrePresets } from '@/data/synthLessons';

export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface SynthState {
  // Oscillator
  waveform: Waveform;
  detune: number;          // cents, range -50..50

  // ADSR
  attack: number;          // seconds
  decay: number;           // seconds
  sustain: number;         // 0..1
  release: number;         // seconds

  // Output
  volume: number;          // 0..1

  // FX
  reverbMix: number;       // 0..1
  delayTime: number;       // seconds, 0.1..0.8
  delayMix: number;        // 0..1 (feedback)
  distortion: number;      // 0..1
  filterCutoff: number;    // Hz, 200..12000
  chorusRate: number;      // 0..1

  // Actions
  setWaveform: (v: Waveform) => void;
  setDetune: (v: number) => void;
  setAttack: (v: number) => void;
  setDecay: (v: number) => void;
  setSustain: (v: number) => void;
  setRelease: (v: number) => void;
  setVolume: (v: number) => void;
  setReverbMix: (v: number) => void;
  setDelayTime: (v: number) => void;
  setDelayMix: (v: number) => void;
  setDistortion: (v: number) => void;
  setFilterCutoff: (v: number) => void;
  setChorusRate: (v: number) => void;

  /** Applies all 13 values from a GenrePreset in one set() call */
  applyGenrePreset: (genre: Genre) => void;
}
```

**Initial values** (must match the removed useState defaults exactly):
```ts
waveform: 'sawtooth',
detune: 0,
attack: 0.05,
decay: 0.3,
sustain: 0.4,
release: 0.5,
volume: 0.75,
reverbMix: 0.3,
delayTime: 0.4,
delayMix: 0.2,
distortion: 0,
filterCutoff: 8000,
chorusRate: 0,
```

**`applyGenrePreset` implementation:**
```ts
applyGenrePreset: (genre) => {
  const p = genrePresets[genre];
  set({
    waveform: p.waveform,
    attack: p.attack,
    decay: p.decay,
    sustain: p.sustain,
    release: p.release,
    filterCutoff: p.filterCutoff,
    reverbMix: p.reverbMix,
    delayTime: p.delayTime,
    delayMix: p.delayMix,
    distortion: p.distortion,
    chorusRate: p.chorusRate,
    // NOTE: detune and volume are NOT in GenrePreset — do not reset them
  });
},
```

---

## STEP-BY-STEP IMPLEMENTATION ORDER

### Step 1 — Create `src/store/synthStore.ts`
Create the file with the full `SynthState` interface and `useSynthStore` export.
Initial values must match the removed useState defaults exactly (listed above).
**Verification:** `pnpm build` passes with no TypeScript errors.

### Step 2 — Migrate `SynthControls.tsx`
1. Delete the entire `SynthControlsProps` interface.
2. Delete all destructured props from the function signature.
3. Add at the top of the component body:
   ```ts
   const waveform = useSynthStore((s) => s.waveform);
   const setWaveform = useSynthStore((s) => s.setWaveform);
   const attack = useSynthStore((s) => s.attack);
   const setAttack = useSynthStore((s) => s.setAttack);
   const decay = useSynthStore((s) => s.decay);
   const setDecay = useSynthStore((s) => s.setDecay);
   const sustain = useSynthStore((s) => s.sustain);
   const setSustain = useSynthStore((s) => s.setSustain);
   const release = useSynthStore((s) => s.release);
   const setRelease = useSynthStore((s) => s.setRelease);
   const volume = useSynthStore((s) => s.volume);
   const setVolume = useSynthStore((s) => s.setVolume);
   const detune = useSynthStore((s) => s.detune);
   const setDetune = useSynthStore((s) => s.setDetune);
   ```
4. The JSX body does NOT change — variable names are identical.
5. Change component declaration from `React.FC<SynthControlsProps>` to `React.FC` (no generic).
**Verification:** `pnpm build` passes. Component renders identically.

### Step 3 — Migrate `EffectsPanel.tsx`
1. Delete the entire `EffectsPanelProps` interface.
2. Delete all destructured props from the function signature.
3. Add at the top of the component body:
   ```ts
   const reverbMix = useSynthStore((s) => s.reverbMix);
   const setReverbMix = useSynthStore((s) => s.setReverbMix);
   const delayTime = useSynthStore((s) => s.delayTime);
   const setDelayTime = useSynthStore((s) => s.setDelayTime);
   const delayMix = useSynthStore((s) => s.delayMix);
   const setDelayMix = useSynthStore((s) => s.setDelayMix);
   const distortion = useSynthStore((s) => s.distortion);
   const setDistortion = useSynthStore((s) => s.setDistortion);
   const filterCutoff = useSynthStore((s) => s.filterCutoff);
   const setFilterCutoff = useSynthStore((s) => s.setFilterCutoff);
   const chorusRate = useSynthStore((s) => s.chorusRate);
   const setChorusRate = useSynthStore((s) => s.setChorusRate);
   ```
4. The JSX body does NOT change.
5. Change component declaration to `React.FC` (no generic).
**Verification:** `pnpm build` passes. Component renders identically.

### Step 4 — Update `App.tsx` — remove state and applyGenrePreset
1. Remove the 13 `useState` declarations (Block A above).
2. Remove the `applyGenrePreset` function (Block B above).
3. Add import: `import { useSynthStore } from './store/synthStore';`
4. In the `useEffect` that loads a lesson (the one that calls `applyGenrePreset`), replace:
   ```ts
   applyGenrePreset(lesson.genre);
   ```
   with:
   ```ts
   useSynthStore.getState().applyGenrePreset(lesson.genre);
   ```
5. Remove the `import { genrePresets, type Genre }` from `synthLessons` import IF `genrePresets` is no longer used in App.tsx after this change. Keep `lessons`, `genreIcons`, `type Genre` if still referenced.
**Verification:** `pnpm build` passes. No TypeScript errors about missing variables.

### Step 5 — Update `App.tsx` — fix Tone chain sync useEffect
The `useEffect` that syncs the Tone chain currently reads 13 local variables. Replace them with store reads:

```ts
useEffect(() => {
  const chain = toneChainRef.current;
  if (!chain) return;
  const s = useSynthStore.getState();
  chain.synth.set({ oscillator: { type: s.waveform } });
  chain.synth.set({ envelope: { attack: s.attack, decay: s.decay, sustain: s.sustain, release: s.release } });
  chain.synth.set({ detune: s.detune * 1.7 });
  chain.filter.frequency.value = s.filterCutoff;
  chain.distNode.distortion = s.distortion;
  chain.reverb.wet.value = s.reverbMix;
  chain.delay.delayTime.value = s.delayTime;
  chain.delay.feedback.value = s.delayMix;
  chain.chorus.frequency.value = s.chorusRate;
  Tone.Destination.volume.value = (s.volume * 26) - 32;
}, [/* see note below */]);
```

**Dependency array:** This useEffect must re-run when any synth param changes. Use Zustand's subscribe pattern OR keep a single derived value as the dependency trigger. The simplest correct approach: add a `useSynthStore` selector that returns a stable snapshot object, and use it as the single dependency:

```ts
const synthParams = useSynthStore((s) => ({
  waveform: s.waveform, attack: s.attack, decay: s.decay,
  sustain: s.sustain, release: s.release, detune: s.detune,
  volume: s.volume, reverbMix: s.reverbMix, delayTime: s.delayTime,
  delayMix: s.delayMix, distortion: s.distortion,
  filterCutoff: s.filterCutoff, chorusRate: s.chorusRate,
}));
```

Place this selector at the top of the `App` component. Then the useEffect dependency array is `[synthParams]`. Zustand will re-render App only when any of these values change (shallow compare by default — use `useShallow` from `zustand/react/shallow` to prevent unnecessary re-renders).

Import: `import { useShallow } from 'zustand/react/shallow';`
Selector: `const synthParams = useSynthStore(useShallow((s) => ({ ... })));`

**Verification:** `pnpm build` passes. Changing a knob in SynthControls still updates the Tone chain in real time.

### Step 6 — Update `App.tsx` — remove props from JSX
1. Replace the `<SynthControls ... />` JSX with `<SynthControls />` (Block C above).
2. Replace the `<EffectsPanel ... />` JSX with `<EffectsPanel />` (Block D above).
**Verification:** `pnpm build` passes with zero TypeScript errors.

---

## ACCEPTANCE CRITERIA

1. `pnpm build` exits with code 0 and zero TypeScript errors.
2. `App.tsx` contains zero references to: `waveform`, `attack`, `decay`, `sustain`, `release`, `volume`, `detune`, `reverbMix`, `delayTime`, `delayMix`, `distortion`, `filterCutoff`, `chorusRate` as local state variables (useState calls).
3. `SynthControls.tsx` has no props interface and no function parameters.
4. `EffectsPanel.tsx` has no props interface and no function parameters.
5. Selecting a lesson still applies the genre preset (knobs visually update).
6. Turning a knob still changes the sound in real time.
7. `useSynthStore.getState().applyGenrePreset('synthwave')` called from browser console updates all knob values.

## DO NOT TOUCH

- `src/utils/buildToneChain.ts` — interface and implementation unchanged
- `src/store/lessonStore.ts` — unchanged
- `src/store/trackStore.ts` — unchanged
- `src/store/types.ts` — unchanged
- `src/hooks/useRecorder.ts` — unchanged
- `src/hooks/useTrackPlayer.ts` — unchanged
- `src/components/Knob.tsx` — unchanged
- `src/components/PianoKeyboard.tsx` — unchanged
- `src/components/SequencePlayer.tsx` — unchanged
- `src/components/PianoRoll.tsx` — unchanged
- `src/components/PianoRollTrack.tsx` — unchanged
- `src/data/synthLessons.tsx` — unchanged
- The lazy init behavior of `toneChainRef` (chain is created on first `playNote`, not on mount)
