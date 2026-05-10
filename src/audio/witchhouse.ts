import * as Tone from 'tone';

export function playBass(): () => void {
  Tone.Transport.bpm.value = 70;
  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.5, decay: 1.0, sustain: 0.65, release: 2.5 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const reverb = new Tone.Reverb({ decay: 6, wet: 0.65 }).connect(limiter);
  const distortion = new Tone.Distortion(0.12).connect(reverb);
  const filter = new Tone.Filter(550, 'lowpass').connect(distortion);
  synth.connect(filter);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '4n', time),
    ['C2', 'Eb2', 'G2', 'Bb2', 'Eb2', 'G2', 'Bb2', 'C3'],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 13.7143;
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    distortion.dispose();
    reverb.dispose();
    limiter.dispose();
    sequence.dispose();
  };
}

export function playPad(): () => void {
  Tone.Transport.bpm.value = 70;
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.5, decay: 1.0, sustain: 0.65, release: 2.5 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const reverb = new Tone.Reverb({ decay: 7, wet: 0.65 }).connect(limiter);
  const chorus = new Tone.Chorus(0.55, 4, 0.5).connect(reverb);
  const filter = new Tone.Filter(550, 'lowpass').connect(chorus);
  synth.connect(filter);
  const sequence = new Tone.Sequence(
    (time, chord) => synth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3', 'Bb3'], ['Eb3', 'G3', 'Bb3', 'C4'], ['F3', 'Ab3', 'C4', 'Eb4'], ['G3', 'Bb3', 'Eb4', 'G4']],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 13.7143;
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
  Tone.Transport.bpm.value = 70;
  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.6, decay: 0.8, sustain: 0.6, release: 3 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const delay = new Tone.FeedbackDelay(0.6, 0.35).connect(limiter);
  const filter = new Tone.Filter(600, 'lowpass').connect(delay);
  const chorus = new Tone.Chorus(0.55, 4, 0.5).connect(filter);
  synth.connect(chorus);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '4n', time),
    ['G4', 'Eb4', 'C4', 'Bb3', 'Ab3', 'G3', 'Eb3', 'C3', 'Bb3', 'G3', 'Eb3', 'Ab3', 'G3', 'Eb3', 'C4', 'Eb4'],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 13.7143;
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
  Tone.Transport.bpm.value = 70;
  const masterGain = new Tone.Gain(0.3).toDestination();
  const limiter = new Tone.Limiter(-6).connect(masterGain);

  const bassSynth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.5, decay: 1.0, sustain: 0.65, release: 2.5 },
  });
  const bassFilter = new Tone.Filter(550, 'lowpass');
  const bassDist = new Tone.Distortion(0.12);
  const bassReverb = new Tone.Reverb({ decay: 6, wet: 0.65 }).connect(limiter);
  bassSynth.connect(bassFilter);
  bassFilter.connect(bassDist);
  bassDist.connect(bassReverb);

  const padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.5, decay: 1.0, sustain: 0.65, release: 2.5 },
  });
  const padFilter = new Tone.Filter(550, 'lowpass');
  const padChorus = new Tone.Chorus(0.55, 4, 0.5);
  const padReverb = new Tone.Reverb({ decay: 7, wet: 0.65 }).connect(limiter);
  padSynth.connect(padFilter);
  padFilter.connect(padChorus);
  padChorus.connect(padReverb);

  const melodySynth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.6, decay: 0.8, sustain: 0.6, release: 3 },
  });
  const melodyChorus = new Tone.Chorus(0.55, 4, 0.5);
  const melodyFilter = new Tone.Filter(600, 'lowpass');
  const melodyDelay = new Tone.FeedbackDelay(0.6, 0.35).connect(limiter);
  melodySynth.connect(melodyChorus);
  melodyChorus.connect(melodyFilter);
  melodyFilter.connect(melodyDelay);

  const bassSeq = new Tone.Sequence(
    (time, note) => bassSynth.triggerAttackRelease(note, '4n', time),
    ['C2', 'Eb2', 'G2', 'Bb2', 'Eb2', 'G2', 'Bb2', 'C3'],
    '4n'
  ).start(0);
  bassSeq.loop = true;
  bassSeq.loopEnd = 13.7143;

  const padSeq = new Tone.Sequence(
    (time, chord) => padSynth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3', 'Bb3'], ['Eb3', 'G3', 'Bb3', 'C4'], ['F3', 'Ab3', 'C4', 'Eb4'], ['G3', 'Bb3', 'Eb4', 'G4']],
    '4n'
  ).start(0);
  padSeq.loop = true;
  padSeq.loopEnd = 13.7143;

  const melodySeq = new Tone.Sequence(
    (time, note) => melodySynth.triggerAttackRelease(note, '4n', time),
    ['G4', 'Eb4', 'C4', 'Bb3', 'Ab3', 'G3', 'Eb3', 'C3', 'Bb3', 'G3', 'Eb3', 'Ab3', 'G3', 'Eb3', 'C4', 'Eb4'],
    '4n'
  ).start(0);
  melodySeq.loop = true;
  melodySeq.loopEnd = 13.7143;

  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    bassSynth.dispose();
    bassFilter.dispose();
    bassDist.dispose();
    bassReverb.dispose();
    padSynth.dispose();
    padFilter.dispose();
    padChorus.dispose();
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
