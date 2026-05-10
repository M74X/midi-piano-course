# Trip Under the Night — Project Log

## Stack
- React 19 + TypeScript + Vite
- Tone.js 15 (audio engine)
- Zustand (state)
- Tailwind CSS

## Hardware
- Arturia KeyLab essential MKIII 88 (MIDI controller)

## Implementado

### Audio Engine
- 88-key PolySynth + Filter + Distortion + Delay + Chorus + Reverb
- Efectos sincronizados con knobs UI via useEffect
- VOL knob centralizado en Tone.Destination.volume
- MIDI hardware input → mismo chain que teclado

### Lecciones
- 17 lecciones en 7 géneros (dark ambient → dark euphoric)
- Modo Guiado (nota por nota con scoring) y Libre
- Demo playback automático
- Score por lección (accuracy, completado)

### DAW Básico
- Grabación MIDI multi-take (Take 1, Take 2…)
- TrackList con mute/solo/volume + play button
- Export MIDI
- Piano roll de la toma grabada

### AudioTest (debug)
- 7 géneros reproducibles con playFull()
- Salida atenuada -10.5dB via masterGain(0.3)

## Roadmap — Fase 1: Core de enseñanza

### 1. Compass/beat system
Migrar lecciones de keypress-driven a Transport-driven.
- Tone.Transport como clock, cursor avanza al beat
- Ventana de timing ±1/8 para acertar la nota
- Data: `pattern: number[]` + `bpm` → nota `i` en beat `i * beatsPerNote`
- Sin esto no hay curso real

### 2. Feedback visual en teclado
- Highlight la tecla a tocar antes de que suene
- Indicador de timing: early / late / on-time
- Color en el teclado gráfico según acierto/error

### 3. Pipeline Suno → lecciones (7 géneros)
- MP3 en `src/audio/raw/` → Demucs → Basic Pitch → validación manual → `synthLessons.tsx`
- Generar melodías y bajos reales para cada género
- Las canciones Suno también sirven como reference playback (reemplazan a las funciones sintéticas `playBass/playPad/playMelody/playFull`)

### 4. Persistencia
- localStorage para scores y lecciones completadas
- Que el progreso sobreviva a recargas

### 5. Loop de práctica
- Repetir compás actual en loop
- Bajar velocidad sin cambiar pitch
- Slow practice mode

### 6. Audio playback de grabaciones
- Escuchar la toma grabada con el chain de synth completo
- No solo export MIDI

## Roadmap — Fase 2: Contenido y features

### 7. Aprendizaje por construcción de canciones
Las lecciones se desarrollan como si el alumno estuviera creando una canción desde cero en cada género:
- Session View: organizar secciones (intro, verso, drop, outro) como clips/scenes
- Channel Rack: programar percusión base del género
- Bajo: aprender la línea de bajo como primera capa melódica
- Melodía/lead: segunda capa
- Armonía/pads: tercera capa
- Cada lección agrega un elemento a la canción en construcción
- Cada sesión alimenta a la siguiente: lo que aprendiste en la lección 1 se usa en la lección 2, y así sucesivamente
- Al final del curso, el alumno tiene una canción completa por género
- Progresión: beats → bajo → pads → melodía → arreglo final (Session View)
- Síntesis: el alumno vuelve a tocar la misma canción, pero esta vez construyendo los sonidos desde cero
  (waveform → ADSR → filter → FX chain) en lugar de usar el preset del género

### 8. Metrónomo visual
- Flash BPM + beat grid en pantalla

### 9. Import MIDI
- Cargar .mid externo como lección

### 10. Import audio
- Backing tracks desde WAV/MP3 (AudioTrackData actualmente vacío)

### 11. Librería de acordes visual por género

### 12. Progreso histórico
- Stats por sesión, evolución en el tiempo

### 13. Lecciones personalizables
- Usuario crea sus propios patterns

### 14. Tempo automation
- Cambios de BPM dentro de una lección

## Roadmap — Fase 3: UI y DAW

### 15. Session View
- Reemplaza al SequencePlayer
- Grid de clips lanzables por scenes/tracks
- Clip recording, overdub, follow actions

### 16. Backing track modal
- Step sequencer / channel rack tipo FL Studio
- Programar percusiones (patterns, mute/solo, swing, export)

### 17. Layout estilo Ableton
- Track lanes verticales con clips de lecciones
- Browser lateral (presets, samples, MIDI files)
- Rack de synth visual (osciloscopio, ADSR gráfico, filtro)

### 18. MIDI CC mapping (KeyLab)
- 9 knobs → FILTER, REVERB, DLY, DIST, ADSR, VOL
- 9 faders → mixer tracks
- Transport: Play Demo, Stop, Record, Loop
- Pads → lanzar lecciones / scenes
- Pitch / Mod wheel → expresión en tiempo real

### 19. Limpieza
- Eliminar AudioTest (debug removido)

## Roadmap — Fase 4: Extras

- [ ] Temas / skins de color por género
- [ ] Export audio (WAV render)
- [ ] Curso de synth (post-piano)
- [ ] Backend multi-usuario
- [ ] Visualizador de acordes en tiempo real

## Commits
```
ff8650a feat: multi-take recording and playback
aaf3803 fix: volume disparity, Tone.js audio engine migration, recording infrastructure
```
