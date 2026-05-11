# SPEC-002 — Single Source of Truth for BPM

## ONE-LINE SUMMARY
Remove the local `bpm` useState from App.tsx and make `useLessonStore.currentBpm` the single owner of BPM, keeping `Tone.Transport.bpm.value` in sync via a Zustand subscriber instead of a useEffect.

---

## FILES TO MODIFY

| File | What changes |
|------|-------------|
| `src/store/lessonStore.ts` | `setBpm` action must also set `Tone.Transport.bpm.value` synchronously |
| `src/App.tsx` | Remove `bpm` useState, remove manual sync useEffect, replace all `bpm` reads with store selector |
| `src/components/PianoRollTrack.tsx` | No change to props — `bpm` prop stays, caller changes |

## FILES TO CREATE
None.

## FILES TO DELETE / LINES TO REMOVE

### From `src/App.tsx`:

**Line to delete — useState declaration:**
```ts
const [bpm, setBpm] = useState(120);
```

**Block to delete — manual sync useEffect inside the lesson-loading useEffect:**
Inside the `useEffect` that depends on `[currentLesson]`, these two lines:
```ts
setBpm(lesson.bpm);
// and
useLessonStore.getState().setBpm(lesson.bpm);  // if present after partial migration
```
Replace with only:
```ts
useLessonStore.getState().setBpm(lesson.bpm);
```
(The `setBpm` local setter call is removed; the store call is the only one.)

**BpmControl JSX — update props:**
Current:
```tsx
<BpmControl bpm={bpm} setBpm={setBpm} />
```
Replace with:
```tsx
<BpmControl />
```
And update `BpmControl` component (it lives inside App.tsx) to read from store directly — see Step 3.

**beatMs calculation — update source:**
Current:
```ts
const beatMs = (60 / bpm) * 1000;
```
Replace with:
```ts
const bpm = useLessonStore((s) => s.currentBpm);
const beatMs = (60 / bpm) * 1000;
```
Place the selector at the top of the `App` component body alongside other store selectors.

---

## INTERFACES / TYPES

### Updated `LessonState` in `src/store/lessonStore.ts`

No new fields. Only the `setBpm` action implementation changes:

```ts
setBpm: (bpm: number) => {
  // Clamp to valid range
  const clamped = Math.max(40, Math.min(240, bpm));
  set({ currentBpm: clamped });
  // Keep Transport in sync — import Tone at top of file
  Tone.Transport.bpm.value = clamped;
},
```

Add import at top of `lessonStore.ts`:
```ts
import * as Tone from 'tone';
```

The `setGenre` action does NOT need to change — it does not touch BPM.

---

## STEP-BY-STEP IMPLEMENTATION ORDER

### Step 1 — Update `lessonStore.ts` to own Transport sync
1. Add `import * as Tone from 'tone';` at the top of `src/store/lessonStore.ts`.
2. Replace the `setBpm` implementation:
   ```ts
   // BEFORE
   setBpm: (bpm) => set({ currentBpm: bpm }),

   // AFTER
   setBpm: (bpm) => {
     const clamped = Math.max(40, Math.min(240, bpm));
     set({ currentBpm: clamped });
     Tone.Transport.bpm.value = clamped;
   },
   ```
3. The initial `currentBpm: 120` value must also be applied to Transport on store creation. Add this after the `create(...)` call:
   ```ts
   // Sync initial BPM to Transport
   Tone.Transport.bpm.value = 120;
   ```
**Verification:** `pnpm build` passes. Calling `useLessonStore.getState().setBpm(140)` from browser console sets `Tone.Transport.bpm.value` to 140.

### Step 2 — Remove `bpm` useState from `App.tsx`
1. Delete: `const [bpm, setBpm] = useState(120);`
2. Add at the top of the `App` component body (with other store selectors):
   ```ts
   const bpm = useLessonStore((s) => s.currentBpm);
   ```
3. In the lesson-loading `useEffect` (depends on `[currentLesson]`), the line `setBpm(lesson.bpm)` must be replaced with `useLessonStore.getState().setBpm(lesson.bpm)`. The `useLessonStore.getState().setBpm(lesson.bpm)` call that already exists in that useEffect stays. Remove the local `setBpm` call only.
**Verification:** `pnpm build` passes. No reference to local `setBpm` remains in App.tsx.

### Step 3 — Update `BpmControl` component in `App.tsx`
`BpmControl` is defined inside `App.tsx`. Currently it receives `{ bpm, setBpm }` as props.

1. Change its props interface from:
   ```ts
   function BpmControl({ bpm, setBpm }: { bpm: number; setBpm: (v: number) => void })
   ```
   to:
   ```ts
   function BpmControl()
   ```
2. Add inside `BpmControl` body:
   ```ts
   const bpm = useLessonStore((s) => s.currentBpm);
   const setBpm = useLessonStore((s) => s.setBpm);
   ```
3. The JSX body of `BpmControl` does NOT change — variable names are identical.
4. Update the call site in `App` render from `<BpmControl bpm={bpm} setBpm={setBpm} />` to `<BpmControl />`.
**Verification:** `pnpm build` passes. BPM buttons and slider still work. Changing BPM via the control updates `Tone.Transport.bpm.value`.

### Step 4 — Update `beatMs` and downstream consumers in `App.tsx`
`beatMs` is derived from `bpm` and used in:
- `playDemoMelody` (via closure — uses `bpm` variable)
- `<PianoKeyboard beatMs={beatMs} ... />`
- `<RecordingTrackSection>` (reads `bpm` from store directly — already correct)

After Step 2, `bpm` in App is the store selector value. `beatMs` calculation stays identical:
```ts
const beatMs = (60 / bpm) * 1000;
```
No further changes needed — `bpm` now comes from the store selector added in Step 2.

**Verification:** Demo playback speed matches the BPM shown in the control.

### Step 5 — Remove the manual BPM sync from lesson-loading useEffect
In the `useEffect` that depends on `[currentLesson]`, find:
```ts
setBpm(lesson.bpm);
```
Delete this line. The `useLessonStore.getState().setBpm(lesson.bpm)` call (which now also sets Transport) is sufficient.

Also remove `setBpm` from the `useEffect`'s dependency array if it was listed there.

**Verification:** Switching lessons changes the BPM display and `Tone.Transport.bpm.value` correctly.

---

## ACCEPTANCE CRITERIA

1. `pnpm build` exits with code 0 and zero TypeScript errors.
2. `App.tsx` contains zero `useState` calls for `bpm`.
3. `App.tsx` contains zero calls to a local `setBpm` setter.
4. `useLessonStore.getState().setBpm(90)` called from browser console:
   - Updates `useLessonStore.getState().currentBpm` to `90`
   - Updates `Tone.Transport.bpm.value` to `90`
   - Updates the BPM display in the UI
5. Switching lessons updates the BPM display to the lesson's BPM value.
6. The BPM slider and +/- buttons still work.
7. BPM is clamped to [40, 240] — values outside this range are rejected.
8. `RecordingTrackSection` still receives correct BPM (it already reads from store — verify it still compiles).

## DO NOT TOUCH

- `src/store/trackStore.ts` — unchanged
- `src/store/types.ts` — unchanged
- `src/hooks/useRecorder.ts` — unchanged
- `src/hooks/useTrackPlayer.ts` — unchanged (it does not use BPM directly)
- `src/components/PianoRollTrack.tsx` — unchanged (receives `bpm` as prop from its caller)
- `src/components/RecordingControls.tsx` — unchanged
- `src/data/synthLessons.tsx` — unchanged
- The `currentGenre` and `currentPreset` fields in `lessonStore.ts` — unchanged
- The `setGenre` action in `lessonStore.ts` — unchanged
- The lazy init behavior of `toneChainRef` in App.tsx — unchanged
