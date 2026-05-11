# SPEC-003 — Fix Tone.js Closure Bug in playNote

## ONE-LINE SUMMARY
Fix the stale closure in `playNote` where `buildToneChain` is called with synth parameter values captured at `useCallback` definition time, not at call time, by reading params from the store via `getState()` at the moment of chain creation.

---

## BUG REPRODUCTION STEPS (exact)

1. Open the app. Do NOT press any key.
2. Select lesson "Neon Drive" (synthwave, lesson 14) — this calls `applyGenrePreset('synthwave')` which sets `waveform: 'square'`, `filterCutoff: 2200`, etc.
3. Immediately select lesson "Dark Phonk Stab" (darkphonk, lesson 6) — this calls `applyGenrePreset('darkphonk')` which sets `waveform: 'square'`, `filterCutoff: 650`, `distortion: 0.35`.
4. Press a key on the piano keyboard.
5. **Expected:** Sound has `filterCutoff: 650` and `distortion: 0.35` (darkphonk preset).
6. **Actual (bug):** `buildToneChain` is called with the values that were in the `playNote` closure when it was last re-created by `useCallback`. If the `useCallback` dependency array has not re-run since the preset changed, the chain is built with stale values.

**Root cause:** `playNote` is defined with `useCallback` and its dependency array includes all 13 synth params as individual values. React batches state updates, and if `applyGenrePreset` sets all 13 values in a single `set()` call (as SPEC-001 implements), the `useCallback` re-runs once — but the timing between the `set()` call and the `useCallback` re-run is not guaranteed to be synchronous before the user's first keypress.

**After SPEC-001:** The bug becomes more subtle. `applyGenrePreset` calls `useSynthStore.getState().applyGenrePreset(genre)` which calls Zustand `set()`. The `synthParams` selector in App triggers a re-render, which re-creates `playNote` via `useCallback([synthParams])`. If the user presses a key before the re-render completes (e.g., during React's batched update cycle), `playNote` still holds the old closure.

**The real fix:** `buildToneChain` must read params from the store at call time, not from the closure.

---

## FILES TO MODIFY

| File | What changes |
|------|-------------|
| `src/App.tsx` | `playNote` useCallback reads synth params from `useSynthStore.getState()` at call time instead of from closure variables |

## FILES TO CREATE
None.

## FILES TO DELETE / LINES TO REMOVE

### From `src/App.tsx` — inside `playNote` useCallback:

**Current code (after SPEC-001 migration):**
```ts
const playNote = useCallback((midiNote: number, velocity = 0.8) => {
  if (!toneChainRef.current) {
    Tone.start();
    toneChainRef.current = buildToneChain({
      waveform, attack, decay, sustain, release,
      filterCutoff, distortion, reverbMix, delayTime, delayMix, chorusRate,
    });
    Tone.Destination.volume.value = (volume * 26) - 32;
  }
  // ...
}, [waveform, attack, decay, sustain, release, filterCutoff, distortion, reverbMix, delayTime, delayMix, chorusRate, volume]);
```

**Replace with:**
```ts
const playNote = useCallback((midiNote: number, velocity = 0.8) => {
  if (!toneChainRef.current) {
    Tone.start();
    // Read params from store at call time — never stale
    const p = useSynthStore.getState();
    toneChainRef.current = buildToneChain({
      waveform: p.waveform,
      attack: p.attack,
      decay: p.decay,
      sustain: p.sustain,
      release: p.release,
      filterCutoff: p.filterCutoff,
      distortion: p.distortion,
      reverbMix: p.reverbMix,
      delayTime: p.delayTime,
      delayMix: p.delayMix,
      chorusRate: p.chorusRate,
    });
    Tone.Destination.volume.value = (p.volume * 26) - 32;
  }
  const note = Tone.Frequency(midiNote, 'midi').toNote();
  toneChainRef.current.synth.triggerRelease(note, Tone.now());
  toneChainRef.current.synth.triggerAttack(note, Tone.now() + 0.005, velocity);
  setPressedNotes(prev => prev.includes(midiNote) ? prev : [...prev, midiNote]);
  setIsPlaying(true);
}, []); // Empty dependency array — params read from store at call time
```

**Key changes:**
1. `const p = useSynthStore.getState()` — reads current store state synchronously at the moment of the first keypress, not at `useCallback` definition time.
2. Dependency array becomes `[]` — `playNote` is created once and never re-created due to param changes.
3. The `playNoteRef.current = playNote` pattern already in App.tsx ensures MIDI handlers always call the latest version — this is unaffected.

---

## INTERFACES / TYPES
No new types. No interface changes.

---

## STEP-BY-STEP IMPLEMENTATION ORDER

### Step 1 — Verify SPEC-001 is complete
Confirm `useSynthStore` exists at `src/store/synthStore.ts` and is imported in `App.tsx`.
If SPEC-001 is not done, this spec cannot be executed — stop and complete SPEC-001 first.

### Step 2 — Update `playNote` in `App.tsx`
1. Locate the `playNote` useCallback in `App.tsx`.
2. Inside the `if (!toneChainRef.current)` block, replace the `buildToneChain({...})` call:
   - Remove all closure variable references (`waveform`, `attack`, etc.)
   - Add `const p = useSynthStore.getState();` before the `buildToneChain` call
   - Pass `p.waveform`, `p.attack`, etc. to `buildToneChain`
   - Replace `(volume * 26) - 32` with `(p.volume * 26) - 32`
3. Change the `useCallback` dependency array to `[]`.
**Verification:** `pnpm build` passes. No TypeScript errors.

### Step 3 — Verify the Tone chain sync useEffect is still correct
The `useEffect` that syncs the existing chain (when `synthParams` changes) must still work. After SPEC-001, it reads from `useSynthStore.getState()` — confirm this is the case. This useEffect handles the case where the chain already exists and params change. `playNote` handles the case where the chain does not yet exist. These two paths are complementary and must both be present.

**Verification:** 
- Chain does not exist → first keypress → chain built with current store params ✓
- Chain exists → knob turned → useEffect fires → chain updated in place ✓

### Step 4 — Manual regression test
1. Open app, do NOT press any key.
2. Select lesson 14 (Neon Drive, synthwave).
3. Select lesson 6 (Phonk Stab, darkphonk).
4. Press a key.
5. Verify the sound is dark/filtered (darkphonk preset: filterCutoff 650Hz, distortion 0.35) — NOT bright/clean (synthwave preset).
6. Turn the FILTER knob — verify sound changes in real time (chain sync useEffect still works).

---

## ACCEPTANCE CRITERIA

1. `pnpm build` exits with code 0 and zero TypeScript errors.
2. `playNote`'s `useCallback` dependency array is `[]`.
3. Inside `playNote`, `buildToneChain` receives values from `useSynthStore.getState()`, not from closure variables.
4. Regression test in Step 4 passes — first note after preset change uses the correct preset.
5. Knob changes after first note still update the sound (the sync useEffect is unaffected).
6. `stopNote` is unaffected — it only calls `triggerRelease` and does not reference synth params.

## DO NOT TOUCH

- `src/utils/buildToneChain.ts` — interface and implementation unchanged
- `stopNote` useCallback — unchanged
- `playGuideNote` — unchanged
- `playDemoMelody` — unchanged
- The lazy init behavior: chain is still created on first `playNote`, NOT on mount
- The Tone chain cleanup `useEffect` on unmount — unchanged
- The Tone chain sync `useEffect` (the one with `[synthParams]` dependency) — unchanged
- `src/store/synthStore.ts` — unchanged
- `src/hooks/useRecorder.ts` — unchanged
- MIDI event handler registration `useEffect` — unchanged
