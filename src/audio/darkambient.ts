import * as Tone from 'tone';

export function playBass(): () => void {
  Tone.Transport.bpm.value = 50;
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 3.0, decay: 2.0, sustain: 0.9, release: 5 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const reverb = new Tone.Reverb({ decay: 8, wet: 0.8 }).connect(limiter);
  const filter = new Tone.Filter(350, 'lowpass').connect(reverb);
  synth.connect(filter);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '8n', time),
    ['C2', 'G2', 'Eb2', 'Bb2'],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 19.2;
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    reverb.dispose();
    limiter.dispose();
    sequence.dispose();
  };
}

export function playPad(): () => void {
  Tone.Transport.bpm.value = 50;
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 3.0, decay: 2.0, sustain: 0.9, release: 5 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const reverb = new Tone.Reverb({ decay: 10, wet: 0.8 }).connect(limiter);
  const chorus = new Tone.Chorus(0.25, 3.5, 0.5).connect(reverb);
  synth.connect(chorus);
  const chordSequence = new Tone.Sequence(
    (time, chord) => synth.triggerAttackRelease(chord, '1n', time),
    [['C3', 'Eb3', 'G3', 'Bb3'], ['Eb2', 'G2', 'Bb2', 'C3'], ['F2', 'Ab2', 'C3', 'Eb3'], ['Bb2', 'Eb2', 'G2', 'Bb2']],
    '4n'
  ).start(0);
  chordSequence.loop = true;
  chordSequence.loopEnd = 19.2;
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    chorus.dispose();
    reverb.dispose();
    limiter.dispose();
    chordSequence.dispose();
  };
}

export function playMelody(): () => void {
  Tone.Transport.bpm.value = 50;
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 3.5, decay: 1.5, sustain: 0.85, release: 6 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const reverb = new Tone.Reverb({ decay: 12, wet: 0.8 }).connect(limiter);
  const delay = new Tone.FeedbackDelay(1.0, 0.35).connect(reverb);
  const chorus = new Tone.Chorus(0.25, 3.5, 0.5).connect(delay);
  synth.connect(chorus);
  const melodySequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '4n', time),
    ['C4', 'Eb4', 'G4', 'Bb4', 'Eb5', 'G4', 'Eb4', 'C4', 'Bb3', 'G3', 'Eb3', 'C3'],
    '4n'
  ).start(0);
  melodySequence.loop = true;
  melodySequence.loopEnd = 19.2;
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    chorus.dispose();
    delay.dispose();
    reverb.dispose();
    limiter.dispose();
    melodySequence.dispose();
  };
}

export function playFull(): () => void {
  Tone.Transport.bpm.value = 50;
  const masterGain = new Tone.Gain(0.3).toDestination();
  const limiter = new Tone.Limiter(-6).connect(masterGain);

  const bassSynth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 3.0, decay: 2.0, sustain: 0.9, release: 5 },
  });
  const bassFilter = new Tone.Filter(350, 'lowpass');
  const bassReverb = new Tone.Reverb({ decay: 8, wet: 0.8 }).connect(limiter);
  bassSynth.connect(bassFilter);
  bassFilter.connect(bassReverb);

  const padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 3.0, decay: 2.0, sustain: 0.9, release: 5 },
  });
  const padChorus = new Tone.Chorus(0.25, 3.5, 0.5);
  const padReverb = new Tone.Reverb({ decay: 10, wet: 0.8 }).connect(limiter);
  padSynth.connect(padChorus);
  padChorus.connect(padReverb);

  const melodySynth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 3.5, decay: 1.5, sustain: 0.85, release: 6 },
  });
  const melodyChorus = new Tone.Chorus(0.25, 3.5, 0.5);
  const melodyDelay = new Tone.FeedbackDelay(1.0, 0.35);
  const melodyReverb = new Tone.Reverb({ decay: 12, wet: 0.8 }).connect(limiter);
  melodySynth.connect(melodyChorus);
  melodyChorus.connect(melodyDelay);
  melodyDelay.connect(melodyReverb);

  const bassSeq = new Tone.Sequence(
    (time, note) => bassSynth.triggerAttackRelease(note, '8n', time),
    ['C2', 'G2', 'Eb2', 'Bb2'],
    '4n'
  ).start(0);
  bassSeq.loop = true;
  bassSeq.loopEnd = 19.2;

  const padSeq = new Tone.Sequence(
    (time, chord) => padSynth.triggerAttackRelease(chord, '1n', time),
    [['C3', 'Eb3', 'G3', 'Bb3'], ['Eb2', 'G2', 'Bb2', 'C3'], ['F2', 'Ab2', 'C3', 'Eb3'], ['Bb2', 'Eb2', 'G2', 'Bb2']],
    '4n'
  ).start(0);
  padSeq.loop = true;
  padSeq.loopEnd = 19.2;

  const melodySeq = new Tone.Sequence(
    (time, note) => melodySynth.triggerAttackRelease(note, '4n', time),
    ['C4', 'Eb4', 'G4', 'Bb4', 'Eb5', 'G4', 'Eb4', 'C4', 'Bb3', 'G3', 'Eb3', 'C3'],
    '4n'
  ).start(0);
  melodySeq.loop = true;
  melodySeq.loopEnd = 19.2;

  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    bassSynth.dispose();
    bassFilter.dispose();
    bassReverb.dispose();
    padSynth.dispose();
    padChorus.dispose();
    padReverb.dispose();
    melodySynth.dispose();
    melodyChorus.dispose();
    melodyDelay.dispose();
    melodyReverb.dispose();
    limiter.dispose();
    masterGain.dispose();
    bassSeq.dispose();
    padSeq.dispose();
    melodySeq.dispose();
  };
}
