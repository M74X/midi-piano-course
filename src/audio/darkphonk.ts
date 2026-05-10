import * as Tone from 'tone';

export function playBass(): () => void {
  Tone.Transport.bpm.value = 90;
  const synth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: 'square' },
    envelope: { attack: 0.003, decay: 0.12, sustain: 0.28, release: 0.12 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const distortion = new Tone.Distortion(0.35).connect(limiter);
  const filter = new Tone.Filter(650, 'lowpass').connect(distortion);
  synth.connect(filter);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '4n', time),
    ['C2', 'C2', 'G2', 'C2', 'Eb2', 'Eb2', 'G2', 'Bb2'],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 10.6667;
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    distortion.dispose();
    limiter.dispose();
    sequence.dispose();
  };
}

export function playPad(): () => void {
  Tone.Transport.bpm.value = 90;
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.003, decay: 0.1, sustain: 0.25, release: 0.1 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.12 }).connect(limiter);
  const delay = new Tone.FeedbackDelay(0.2, 0.18).connect(reverb);
  const filter = new Tone.Filter(800, 'lowpass').connect(delay);
  synth.connect(filter);
  const sequence = new Tone.Sequence(
    (time, chord) => synth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3'], ['G3', 'Bb3', 'Eb4'], ['Eb3', 'G3', 'Bb3'], ['Bb2', 'Eb3', 'G3']],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 10.6667;
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    delay.dispose();
    reverb.dispose();
    limiter.dispose();
    sequence.dispose();
  };
}

export function playMelody(): () => void {
  Tone.Transport.bpm.value = 90;
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.002, decay: 0.08, sustain: 0.3, release: 0.1 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.12 }).connect(limiter);
  const delay = new Tone.FeedbackDelay(0.18, 0.15).connect(reverb);
  const filter = new Tone.Filter(900, 'lowpass').connect(delay);
  synth.connect(filter);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '16n', time),
    ['G4', null, 'Eb4', 'G4', null, 'C5', 'Bb4', null, 'G4', 'Eb4', null, 'G4', 'Eb4', null, 'C4', 'Eb4'],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 10.6667;
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    delay.dispose();
    reverb.dispose();
    limiter.dispose();
    sequence.dispose();
  };
}

export function playFull(): () => void {
  Tone.Transport.bpm.value = 90;
  const masterGain = new Tone.Gain(0.3).toDestination();
  const limiter = new Tone.Limiter(-6).connect(masterGain);

  const bassSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: 'square' },
    envelope: { attack: 0.003, decay: 0.12, sustain: 0.28, release: 0.12 },
  });
  const bassFilter = new Tone.Filter(650, 'lowpass');
  const bassDist = new Tone.Distortion(0.35).connect(limiter);
  bassSynth.connect(bassFilter);
  bassFilter.connect(bassDist);

  const padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.003, decay: 0.1, sustain: 0.25, release: 0.1 },
  });
  const padFilter = new Tone.Filter(800, 'lowpass');
  const padDelay = new Tone.FeedbackDelay(0.2, 0.18);
  const padReverb = new Tone.Reverb({ decay: 3, wet: 0.12 }).connect(limiter);
  padSynth.connect(padFilter);
  padFilter.connect(padDelay);
  padDelay.connect(padReverb);

  const melodySynth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.002, decay: 0.08, sustain: 0.3, release: 0.1 },
  });
  const melodyFilter = new Tone.Filter(900, 'lowpass');
  const melodyDelay = new Tone.FeedbackDelay(0.18, 0.15);
  const melodyReverb = new Tone.Reverb({ decay: 3, wet: 0.12 }).connect(limiter);
  melodySynth.connect(melodyFilter);
  melodyFilter.connect(melodyDelay);
  melodyDelay.connect(melodyReverb);

  const bassSeq = new Tone.Sequence(
    (time, note) => bassSynth.triggerAttackRelease(note, '4n', time),
    ['C2', 'C2', 'G2', 'C2', 'Eb2', 'Eb2', 'G2', 'Bb2'],
    '4n'
  ).start(0);
  bassSeq.loop = true;
  bassSeq.loopEnd = 10.6667;

  const padSeq = new Tone.Sequence(
    (time, chord) => padSynth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3'], ['G3', 'Bb3', 'Eb4'], ['Eb3', 'G3', 'Bb3'], ['Bb2', 'Eb3', 'G3']],
    '4n'
  ).start(0);
  padSeq.loop = true;
  padSeq.loopEnd = 10.6667;

  const melodySeq = new Tone.Sequence(
    (time, note) => melodySynth.triggerAttackRelease(note, '16n', time),
    ['G4', null, 'Eb4', 'G4', null, 'C5', 'Bb4', null, 'G4', 'Eb4', null, 'G4', 'Eb4', null, 'C4', 'Eb4'],
    '4n'
  ).start(0);
  melodySeq.loop = true;
  melodySeq.loopEnd = 10.6667;

  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    bassSynth.dispose();
    bassFilter.dispose();
    bassDist.dispose();
    padSynth.dispose();
    padFilter.dispose();
    padDelay.dispose();
    padReverb.dispose();
    melodySynth.dispose();
    melodyFilter.dispose();
    melodyDelay.dispose();
    melodyReverb.dispose();
    limiter.dispose();
    masterGain.dispose();
    bassSeq.dispose();
    padSeq.dispose();
    melodySeq.dispose();
  };
}
