import { useChannelStore } from '@/store/channelStore';
import type { ChannelType } from '@/store/channelStore';

let audioCtx: AudioContext | null = null;
let _isPlaying = false;
let _startTime = 0;
let _currentBeat = 0;
let _bpm = 120;
let _tickId: number | null = null;
let _loopStart = 0;
let _loopEnd = 8;
let _loopEnabled = false;
let _stopAtLoopEnd = false;
let _metronomeEnabled = false;
let _onTick: ((beat: number, playing: boolean) => void) | null = null;
let _lastMetronome16th = -1;

const _stemBuffers = new Map<string, AudioBuffer>();
const _activeSources = new Map<string, AudioBufferSourceNode>();
const _activeSynths = new Map<number, { osc: OscillatorNode; gain: GainNode; release: number }>();
const _pitchToNote = new Map<number, number>();
let _synthId = 0;
const _scheduledTimeouts: number[] = [];

function _getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function _playClick(isDownbeat: boolean) {
  const ctx = _getCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = isDownbeat ? 1000 : 800;
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.04);
}

function _tick() {
  if (!_isPlaying) return;
  const ctx = audioCtx!;
  _currentBeat = (ctx.currentTime - _startTime) * (_bpm / 60);

  if (_loopEnabled && _currentBeat >= _loopEnd) {
    if (_stopAtLoopEnd) {
      this.stop();
      return;
    }
    const range = _loopEnd - _loopStart;
    _currentBeat = _loopStart + ((_currentBeat - _loopStart) % range);
    _startTime = ctx.currentTime - (_currentBeat / (_bpm / 60));
  }

  if (_metronomeEnabled) {
    const tick16th = Math.floor(_currentBeat * 4);
    if (tick16th > _lastMetronome16th) {
      for (let t = _lastMetronome16th + 1; t <= tick16th; t++) {
        _playClick(t % 4 === 0);
      }
      _lastMetronome16th = tick16th;
    }
  }

  if (_onTick) _onTick(_currentBeat, true);
  _tickId = window.setTimeout(_tick, 10);
}

export const audioEngine = {
  init() { _getCtx(); },

  get isPlaying() { return _isPlaying; },
  get bpm() { return _bpm; },
  get currentBeat() { return _currentBeat; },

  set onTick(fn: ((beat: number, playing: boolean) => void) | null) { _onTick = fn; },
  get onTick() { return _onTick; },

  setBPM(val: number) {
    val = Math.max(40, Math.min(240, val));
    if (_isPlaying && audioCtx) {
      _startTime = audioCtx.currentTime - (_currentBeat / (val / 60));
    }
    _bpm = val;
  },

  async loadStem(url: string): Promise<AudioBuffer> {
    const existing = _stemBuffers.get(url);
    if (existing) return existing;
    const ctx = _getCtx();
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const audio = await ctx.decodeAudioData(buf);
    _stemBuffers.set(url, audio);
    return audio;
  },

  playStem(id: string, url: string, volume: number) {
    const buffer = _stemBuffers.get(url);
    if (!buffer) return;
    const ctx = _getCtx();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = volume * 0.8;
    source.connect(gain).connect(ctx.destination);
    source.start(0);
    const prev = _activeSources.get(id);
    if (prev) { try { prev.stop(); } catch {} }
    _activeSources.set(id, source);
  },

  stopStem(id: string) {
    const source = _activeSources.get(id);
    if (source) { try { source.stop(); } catch {} _activeSources.delete(id); }
  },

  stopAllStems() {
    for (const id of _activeSources.keys()) this.stopStem(id);
  },

  noteOn(pitch: number, velocity = 0.8, channelId?: ChannelType) {
    const ctx = _getCtx();
    const now = ctx.currentTime;
    const freq = 440 * Math.pow(2, (pitch - 69) / 12);

    const state = useChannelStore.getState();
    const activeChannelId = channelId ?? state.activeChannelId;
    const channel = state.channels.find((c) => c.id === activeChannelId);
    const preset = channel?.preset;

    const osc = ctx.createOscillator();
    osc.type = preset?.waveform ?? 'sawtooth';
    osc.frequency.value = freq;
    if (preset?.detune) osc.detune.value = preset.detune;

    const filter = ctx.createBiquadFilter();
    filter.type = preset?.filterType ?? 'lowpass';
    filter.frequency.value = preset?.filterCutoff ?? 8000;

    const gain = ctx.createGain();
    const attack = preset?.attack ?? 0.01;
    const decay = preset?.decay ?? 0.3;
    const sus = preset?.sustain ?? 0.7;
    const rel = preset?.release ?? 0.2;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(velocity, now + attack);
    gain.gain.linearRampToValueAtTime(velocity * sus, now + attack + decay);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(now);

    const prev = _pitchToNote.get(pitch);
    if (prev !== undefined) {
      const entry = _activeSynths.get(prev);
      if (entry) {
        entry.gain.gain.cancelScheduledValues(now);
        entry.gain.gain.setValueAtTime(entry.gain.gain.value, now);
        entry.gain.gain.linearRampToValueAtTime(0, now + 0.02);
        setTimeout(() => { try { entry.osc.stop(); } catch {} }, 30);
      }
      _activeSynths.delete(prev);
    }

    const id = _synthId++;
    _activeSynths.set(id, { osc, gain, release: rel });
    _pitchToNote.set(pitch, id);
    return id;
  },

  noteOff(pitch: number) {
    const id = _pitchToNote.get(pitch);
    if (id === undefined) return;
    const entry = _activeSynths.get(id);
    if (!entry) return;
    const now = _getCtx().currentTime;
    const rel = entry.release;
    entry.gain.gain.cancelScheduledValues(now);
    entry.gain.gain.setValueAtTime(entry.gain.gain.value, now);
    entry.gain.gain.linearRampToValueAtTime(0, now + rel);
    setTimeout(() => { try { entry.osc.stop(); } catch {} }, (rel + 0.05) * 1000);
    _activeSynths.delete(id);
    _pitchToNote.delete(pitch);
  },

  synthNote(pitch: number, duration: number, channelId?: ChannelType) {
    const id = this.noteOn(pitch, 0.8, channelId);
    const t = window.setTimeout(() => { this.noteOff(pitch); }, duration * 1000);
    _scheduledTimeouts.push(t);
  },

  playRecordedEvents(events: Array<{ note: number; time: number; duration: number }>, channelId?: ChannelType) {
    for (const ev of events) {
      const delayMs = ev.time * 1000;
      const t = window.setTimeout(() => { this.synthNote(ev.note, ev.duration, channelId); }, delayMs);
      _scheduledTimeouts.push(t);
    }
  },

  clearScheduled() {
    for (const t of _scheduledTimeouts) clearTimeout(t);
    _scheduledTimeouts.length = 0;
    for (const [, entry] of _activeSynths) { try { entry.osc.stop(); } catch {} }
    _activeSynths.clear();
    _pitchToNote.clear();
  },

  play() {
    if (_isPlaying) return;
    _isPlaying = true;
    _startTime = _getCtx().currentTime;
    _currentBeat = 0;
    _lastMetronome16th = -1;
    _tickId = window.setTimeout(_tick, 10);
  },

  stop() {
    _isPlaying = false;
    _currentBeat = 0;
    if (_tickId !== null) { clearTimeout(_tickId); _tickId = null; }
    this.stopAllStems();
    this.clearScheduled();
    _lastMetronome16th = -1;
    if (_onTick) _onTick(0, false);
  },

  seek(beat: number) {
    _currentBeat = Math.max(0, beat);
    if (!_isPlaying && audioCtx) {
      _startTime = audioCtx.currentTime - (_currentBeat / (_bpm / 60));
    }
  },
  toggleMetronome() { _metronomeEnabled = !_metronomeEnabled; return _metronomeEnabled; },
  setLoop(start: number, end: number) { _loopStart = start; _loopEnd = end; _loopEnabled = true; },
  clearLoop() { _loopEnabled = false; },
  get loopEnabled() { return _loopEnabled; },
  set stopAtLoopEnd(v: boolean) { _stopAtLoopEnd = v; },
  get stopAtLoopEnd() { return _stopAtLoopEnd; },
  get metronomeEnabled() { return _metronomeEnabled; },
};
