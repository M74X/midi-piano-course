import * as Tone from 'tone';

export function playBass(): () => void {
  Tone.Transport.bpm.value = 100;
  const synth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.4, decay: 0.6, sustain: 0.75, release: 1.8 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.5 }).connect(limiter);
  const distortion = new Tone.Distortion(0.08).connect(reverb);
  const filter = new Tone.Filter(1400, 'lowpass').connect(distortion);
  const chorus = new Tone.Chorus(0.45, 3.5, 0.5).connect(filter);
  synth.connect(chorus);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '4n', time),
    ['C3', 'G3', 'Eb3', 'Bb2', 'Ab2', 'Eb3', 'C3', 'G2'],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 9.6;
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    chorus.dispose();
    distortion.dispose();
    reverb.dispose();
    limiter.dispose();
    sequence.dispose();
  };
}

export function playPad(): () => void {
  Tone.Transport.bpm.value = 100;
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.4, decay: 0.6, sustain: 0.75, release: 1.8 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const reverb = new Tone.Reverb({ decay: 3.5, wet: 0.5 }).connect(limiter);
  const filter = new Tone.Filter(1400, 'lowpass').connect(reverb);
  const chorus = new Tone.Chorus(0.45, 3.5, 0.5).connect(filter);
  synth.connect(chorus);
  const sequence = new Tone.Sequence(
    (time, chord) => synth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3'], ['Bb2', 'Eb3', 'G3'], ['Ab2', 'C3', 'Eb3'], ['G2', 'Bb2', 'Eb3']],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 9.6;
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    chorus.dispose();
    reverb.dispose();
    limiter.dispose();
    sequence.dispose();
  };
}

export function playMelody(): () => void {
  Tone.Transport.bpm.value = 100;
  const synth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.3, decay: 0.5, sustain: 0.7, release: 1.5 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const delay = new Tone.FeedbackDelay(0.4, 0.3).connect(limiter);
  const filter = new Tone.Filter(1600, 'lowpass').connect(delay);
  const chorus = new Tone.Chorus(0.45, 3.5, 0.5).connect(filter);
  synth.connect(chorus);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '8n', time),
    ['G4', 'Eb4', 'C4', 'Bb3', 'Ab3', 'C4', 'Eb4', 'G4', 'Bb4', 'G4', 'Eb4', 'C4', 'Eb4', 'G4', 'Bb4', 'C5'],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 9.6;
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    chorus.dispose();
    delay.dispose();
    limiter.dispose();
    sequence.dispose();
  };
}

export function playFull(): () => void {
  Tone.Transport.bpm.value = 100;
  const masterGain = new Tone.Gain(0.3).toDestination();
  const limiter = new Tone.Limiter(-6).connect(masterGain);

  const bassSynth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.4, decay: 0.6, sustain: 0.75, release: 1.8 },
  });
  const bassChorus = new Tone.Chorus(0.45, 3.5, 0.5);
  const bassFilter = new Tone.Filter(1400, 'lowpass');
  const bassDist = new Tone.Distortion(0.08);
  const bassReverb = new Tone.Reverb({ decay: 3, wet: 0.5 }).connect(limiter);
  bassSynth.connect(bassChorus);
  bassChorus.connect(bassFilter);
  bassFilter.connect(bassDist);
  bassDist.connect(bassReverb);

  const padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.4, decay: 0.6, sustain: 0.75, release: 1.8 },
  });
  const padChorus = new Tone.Chorus(0.45, 3.5, 0.5);
  const padFilter = new Tone.Filter(1400, 'lowpass');
  const padReverb = new Tone.Reverb({ decay: 3.5, wet: 0.5 }).connect(limiter);
  padSynth.connect(padChorus);
  padChorus.connect(padFilter);
  padFilter.connect(padReverb);

  const melodySynth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.3, decay: 0.5, sustain: 0.7, release: 1.5 },
  });
  const melodyChorus = new Tone.Chorus(0.45, 3.5, 0.5);
  const melodyFilter = new Tone.Filter(1600, 'lowpass');
  const melodyDelay = new Tone.FeedbackDelay(0.4, 0.3).connect(limiter);
  melodySynth.connect(melodyChorus);
  melodyChorus.connect(melodyFilter);
  melodyFilter.connect(melodyDelay);

  const bassSeq = new Tone.Sequence(
    (time, note) => bassSynth.triggerAttackRelease(note, '4n', time),
    ['C3', 'G3', 'Eb3', 'Bb2', 'Ab2', 'Eb3', 'C3', 'G2'],
    '4n'
  ).start(0);
  bassSeq.loop = true;
  bassSeq.loopEnd = 9.6;

  const padSeq = new Tone.Sequence(
    (time, chord) => padSynth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3'], ['Bb2', 'Eb3', 'G3'], ['Ab2', 'C3', 'Eb3'], ['G2', 'Bb2', 'Eb3']],
    '4n'
  ).start(0);
  padSeq.loop = true;
  padSeq.loopEnd = 9.6;

  const melodySeq = new Tone.Sequence(
    (time, note) => melodySynth.triggerAttackRelease(note, '8n', time),
    ['G4', 'Eb4', 'C4', 'Bb3', 'Ab3', 'C4', 'Eb4', 'G4', 'Bb4', 'G4', 'Eb4', 'C4', 'Eb4', 'G4', 'Bb4', 'C5'],
    '4n'
  ).start(0);
  melodySeq.loop = true;
  melodySeq.loopEnd = 9.6;

  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    bassSynth.dispose();
    bassChorus.dispose();
    bassFilter.dispose();
    bassDist.dispose();
    bassReverb.dispose();
    padSynth.dispose();
    padChorus.dispose();
    padFilter.dispose();
    padReverb.dispose();
    melodySynth.dispose();
    melodyChorus.dispose();
    melodyFilter.dispose();
    melodyDelay.dispose();
    limiter.dispose();
    masterGain.dispose();
    bassSeq.dispose();
    padSeq.dispose();
    melodySeq.dispose();
  };
}
