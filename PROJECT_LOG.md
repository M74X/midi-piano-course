# Trip Under the Night — Project Log

## Stack
- **Runtime:** React 18 + TypeScript 5.6 + Vite 6
- **Package manager:** pnpm 11
- **Audio engine:** Tone.js 15 + @tonejs/midi 2
- **State:** Zustand 5
- **Styling:** Tailwind CSS 3.4 + tailwind-merge + clsx + tailwindcss-animate
- **UI (shadcn/ui ready):** Radix UI (~25 primitives), lucide-react, recharts, sonner, cmdk, vaul, input-otp, embla-carousel
- **Routing:** react-router-dom 6 (installed, not yet used)
- **Utilities:** react-hook-form + @hookform/resolvers + zod, date-fns, class-variance-authority, react-resizable-panels
- **Testing:** Playwright (installed, no tests written yet)
- **Linting:** ESLint 9 + typescript-eslint
- **MIDI hardware:** Web MIDI API (navigator.requestMIDIAccess)
- **Canvas:** Canvas 2D API (waveform, piano roll)

## Hardware
- Arturia KeyLab essential MKIII 88 (MIDI controller)

## Pipeline de producción validado
1. **UVR** (MDX23C-InstVoc HQ) → instrumental.wav
2. **Demucs** (htdemucs_ft) → stems (bass, drums, other, vocals)
3. **Basic Pitch** → MIDI de referencia por stem

### Calidad de stems por tipo (darkwave)
| Stem | Calidad | Uso pedagógico |
|------|---------|----------------|
| **Drums** | ✅ usable | Enseñar ritmo base del género |
| **Other** | ⚠️ contiene lead + pads | Aislar con EQ, recrear con synth |
| **Bass** | ❌ sucio, frecuencias compartidas | Referencia tonal → recrear desde synth |
| **Vocals** | ❌ fantasma (reverb/chorus) | Referencia rítmica o reemplazar con synth choir |

**Regla fundamental:** stems = planos arquitectónicos, NO material de enseñanza directo.
La plataforma es un **motor de reconstrucción musical educativa**, no un extractor de stems.

## Visión del proyecto
Plataforma educativa de reconstrucción musical para géneros Dark con tres pilares:
- **Aprender a reconstruir** — deconstruir una canción por capas y recrear cada una desde cero
- **Aprender a tocar** — notas correctas vía KeyLab 88 + feedback timing sobre lo reconstruido
- **Aprender diseño de sonido** — cómo se construye el timbre específico del género

## Implementado (base existente)

### Audio Engine
- 88-key PolySynth + Filter + Distortion + Delay + Chorus + Reverb
- Efectos sincronizados con knobs UI via useEffect
- VOL knob centralizado en Tone.Destination.volume
- MIDI hardware input → mismo chain que teclado

### DAW Básico
- Grabación MIDI multi-take (Take 1, Take 2…)
- TrackList con mute/solo/volume + play button
- Export MIDI
- Piano roll de la toma grabada

### UI Components
- PianoKeyboard 88-key con scroll, highlighting por nota
- SVG Knobs (drag + click-to-edit)
- WaveformDisplay animado
- SynthControls (ADSR, volume, detune, waveform)
- EffectsPanel (reverb, delay, distortion, filter, chorus)
- PianoRollTrack (comparación take vs referencia)
- ErrorBoundary

### Lo que ya NO aplica (deprecado por el pivot)
- ~~17 lecciones synth con playBass/playPad sintéticas~~ → reemplazado por pipeline de reconstrucción
- ~~6 lecciones de piano tradicional~~ → no alignea con el enfoque de reconstrucción
- ~~VexFlow sheet music~~ → no es parte del nuevo flujo (piano roll + channel rack)
- ~~LessonNav, LessonGrid, LessonContent (lecciones viejas)~~ → deprecado
- ~~Synth genre engines (darkambient.ts, darkphonk.ts, etc.)~~ → reemplazado por preset system
- ~~AudioTest debug~~ → eliminar

---

## Roadmap

### Fase 1 — Core DAW (Channel Rack + Transport + Piano Roll)

#### 1. Channel Rack (tipo FL Studio)
- Grid de canales por instrumento: Bass, Lead, Drums, Pads, FX
- Cada canal con: mute/solo, volume, pan, MIDI clip asignado
- Playback independiente por canal con Tone.Part o Tone.Sequence
- Load/Save de patrones por género

#### 2. Transport
- Play / Stop / Record / Loop
- BPM control (sync con Tone.Transport)
- Metrónomo (audio + visual flash por beat)
- Cursor de transporte sincronizado con piano roll y channel rack
- Cuantización (1/4, 1/8, 1/16)

#### 3. Piano Roll
- Grid de notas MIDI (pitch vs time)
- Edición: dibujar, borrar, mover, redimensionar notas
- Snap to grid
- Roll de referencia (MIDI de Basic Pitch superpuesto)
- Roll de la toma grabada

#### 4. Session View (tipo Ableton)
- Grid de clips lanzables por scenes/tracks
- Clip recording, overdub, follow actions
- Escenas por sección de canción (intro, verso, drop, outro)

---

### Fase 2 — Sistema de lecciones de reconstrucción

Cada capa se aborda según la calidad de su stem:
- **usable** → enseñar sobre el stem, cuantizar y limpiar
- **referencia** → mostrar el original como meta, el alumno recrea con synth
- **perdido** → el alumno compone su propia versión (voz, pads)

#### 5. Drums (ritmo base)
- Stem usable: extraer MIDI con Basic Pitch, cuantizar
- Lección: armar el patrón de batería en el channel rack
- Conceptos: kick/snare/hi-hat placement, swing, groove del género

#### 6. Bass (recreación desde cero)
- Stem es referencia NO usable → el alumno recrea la línea con synth
- Lección: programar las notas en el piano roll sobre ghost notes de referencia
- Diseño de sonido: sawtooth + sine layer → LPF → distorsión suave → sidechain
- Conceptos: raíz vs walking, sincopación, cómo el bajo interactúa con el kick

#### 7. Lead (other, aislar vía EQ)
- Other stem contiene lead + pads: aislar con EQ (+2k-5k, cortar <150Hz)
- MIDI de referencia guía la recreación
- Lección: tocar/programar la melodía principal
- Diseño de sonido: waveform del género (saw, square, wavetable), unísono, portamento

#### 8. Pads / Armonía
- Extraer del other stem (zona baja de frecuencias)
- O recrear desde teoría: encontrar las progresiones de acordes del género
- Lección: construir el colchón armónico
- Diseño de sonido: supersaw, chorus, reverb largo, filter sweep lento

#### 9. Vocals (opcional, reemplazo creativo)
- Stem original inusable → el alumno crea una parte vocal con synth
- Synth choir → pad con formantes, o lead vocal sintético
- Concepto: la voz como instrumento dentro del arreglo darkwave

#### 10. Modo reconstrucción completa
- Ensamble de todas las capas en el channel rack
- Session View: organizar secciones (intro, verso, drop, outro)
- Scoring global: qué tan cerca está la reconstrucción del original
- Referencia A/B: comparar la mezcla del alumno contra la canción original

#### 11. Browser de canciones
- Lista de canciones procesadas por género
- Preview de stems originales (con advertencia de calidad: usable / referencia / perdido)
- Estado de progreso por canción y por capa

---

### Fase 3 — Feedback de timing + práctica con KeyLab

#### 12. Sistema de timing (Transport-driven)
- Ventana de timing ±1/8 para acertar la nota
- Feedback visual en teclado: early / late / on-time / miss
- Highlight de la tecla a tocar antes de que suene
- Score en tiempo real por capa

#### 13. MIDI CC mapping (KeyLab)
- 9 knobs → FILTER, REVERB, DLY, DIST, ADSR, VOL
- 9 faders → mixer de canales del channel rack
- Transport: Play, Stop, Record, Loop
- Pads → lanzar clips / scenes
- Pitch / Mod wheel → expresión en tiempo real

#### 14. Loop de práctica
- Loop por compás o sección
- Slow practice mode (bajar BPM sin cambiar pitch)
- Aislamiento de capa (solo la capa que se está practicando)

---

### Fase 4 — Diseño de sonido

#### 15. Sistema de presets por género
- Presets de synth (waveform, ADSR, filter, FX chain) por género
- Carga automática al seleccionar una canción
- Visualización de la cadena de efectos

#### 16. Synth Rack visual
- Osciloscopio en tiempo real
- ADSR gráfico interactivo
- Filter curve visualization
- FX chain drag & drop

#### 17. Modo diseño de sonido
- El alumno construye el timbre desde cero
  - Waveform → ADSR → Filter → FX chain
- Scoring: qué tan cerca está del timbre original (comparación espectral)

---

### Backlog (futuro)
- Export audio (WAV render de la reconstrucción)
- Temas / skins de color por género
- Progreso histórico y estadísticas por sesión
- Import MIDI externo como lección personalizada
- Backend multi-usuario (compartir reconstrucciones)
- Visualizador de acordes en tiempo real

---

## Deudas técnicas
- Componentes sin usar que eliminar: Metronome.tsx, LessonGrid.tsx, LessonContent.tsx, LessonNav.tsx, ProgressBar.tsx, SheetMusic.tsx
- Dead data: `data/lessons.tsx` (6 lecciones viejas), `data/synthLessons.tsx` (deprecado por nuevo sistema)
- Genre engines en `src/audio/`: darkambient.ts, darkeuphoric.ts, darkphonk.ts, darksynth.ts, darkwave.ts, industrial.ts, synthwave.ts — deprecados, reemplazar por preset system
- Archivos basura: `src/img/Screenshot*`, `src/audio/raw/:Zone.Identifier` (ya limpiado)
- ErrorBoundary mínimo — sin UI linda
- Sin estados vacíos ni loading states
- Sin CI/CD
- Sin tests
- `react-router-dom` instalado pero sin usar
- README.md template por defecto de Vite

## Session — May 10, 2026 — Phase 1 DAW Complete

### SPECs completed
- **SPEC-000:** Cleanup — deleted 17 deprecated files (old lessons, genre engines, dead components), created `genrePresets.ts`
- **SPEC-001:** Zustand Synth State — 13 parameters migrated to `useSynthStore` with `useShallow` selectors
- **SPEC-002:** BPM single source of truth in `lessonStore` — `setBpm` now sets `Tone.Transport.bpm.value`
- **SPEC-003:** Tone.js closure bug — `playNote` reads `getState()` at call time instead of capturing stale values
- **SPEC-004:** Phase 1 DAW — Channel Rack (5 channels), Transport Bar (Play/Stop/Record/BPM), Piano Roll (per-channel MIDI + REF stems), SynthControls + EffectsPanel

### Architecture decisions
- Channel Rack: 5 fixed channels (Drums, Lead, Bass, Pads, FX) — no dynamic channels
- REF button per channel — plays stem WAV as reference audio via `Tone.Player`
- Per-channel synth presets via `CHANNEL_PRESETS` constant in `channelStore`
- `setActiveChannel` auto-applies the channel's preset to the synth
- Per-channel MIDI files imported independently via `?url` Vite suffix
- `useChannelPlayback` respects both `muted` and `refEnabled`
- Recordings are channel-keyed (pending full implementation)

### Audio pipeline
- Pilot song: **Blacktop Mirage** (darkwave) — switched from Wicked Triumph
- Stems at `public/audio/blacktop-mirage/`: drums.wav, bass.wav, other.wav
- Per-channel MIDI: `blacktop-mirage-drums.mid`, `blacktop-mirage-lead.mid`, `blacktop-mirage.mid` (full instrumental)
- Demucs htdemucs_ft validated on CPU (~6 min)
- Basic Pitch ONNX model serialization working in `/tmp/bp-env/`

### Bugs fixed
- **Infinite render loop:** missing `useShallow` in 6 selectors — fixed by selecting primitive values only
- **AudioContext suspended:** `await Tone.start()` in Play handler
- **Floating point crash:** `Math.max(0, time)` in `player.stop()`
- **All channels same audio:** channel-keyed `Tone.Player` instances via `Map<ChannelType, Tone.Player>`
- **PolySynth wrong preset:** `applyChannelPreset` on `setActiveChannel`

## Pendientes Fase 2

### Synth/FX por canal independiente
Actualmente el panel Synth/FX es global — todos los canales comparten el mismo sintetizador visible.

Lo que debe cambiar:
- Cada canal tiene su propio panel Synth/FX
- Al seleccionar un canal → el panel muestra y permite editar el preset de ESE canal
- Los knobs del panel solo afectan el canal activo
- El preset se guarda en `channelStore.channels[id].preset`

### Migración Web Audio API
Reemplazar Tone.js por Web Audio API directo:
- `AudioWorklet` para procesamiento en thread separado
- Sin bugs de Transport, AudioContext, o buffer cache
- Solo cambia el motor — UI y stores se quedan igual

### Pending (post-Demo Day)
- Migrate audio engine from Tone.js to Web Audio API
- Channel-keyed recording implementation
- On-screen keyboard capture during recording
- Deploy to production domain

### Commits
```
ff8650a feat: multi-take recording and playback
aaf3803 fix: volume disparity, Tone.js audio engine migration, recording infrastructure
0948a05 refactor: shared ToneChain builder, witchhouse→darkeuphoric, project log
d68f964 chore: remove Zone.Identifier files and add to gitignore
```
