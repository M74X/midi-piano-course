import * as Tone from 'tone';

export function playBass(): () => void {
  Tone.Transport.bpm.value = 135;
  const synth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0.15, release: 0.08 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.08 }).connect(limiter);
  const distortion = new Tone.Distortion(0.6).connect(reverb);
  const filter = new Tone.Filter(1800, 'lowpass').connect(distortion);
  synth.connect(filter);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '16n', time),
    ['C2', 'C2', 'C2', 'C2', 'Eb2', 'Eb2', 'Eb2', 'Eb2', 'F2', 'F2', 'F2', 'F2', 'B2', 'B2', 'B2', 'B2'],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 7.1111;
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
  Tone.Transport.bpm.value = 135;
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0.12, release: 0.08 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.08 }).connect(limiter);
  const distortion = new Tone.Distortion(0.6).connect(reverb);
  const filter = new Tone.Filter(1800, 'lowpass').connect(distortion);
  synth.connect(filter);
  const sequence = new Tone.Sequence(
    (time, chord) => synth.triggerAttackRelease(chord, '8n', time),
    [['C2', 'Eb2', 'Ab2'], ['C2', 'Eb2', 'Bb2'], ['D2', 'F2', 'Ab2'], ['Eb2', 'G2', 'B2']],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 7.1111;
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

export function playMelody(): () => void {
  Tone.Transport.bpm.value = 135;
  const synth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.03, sustain: 0.15, release: 0.06 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.08 }).connect(limiter);
  const delay = new Tone.FeedbackDelay(0.1, 0.03).connect(reverb);
  const distortion = new Tone.Distortion(0.6).connect(delay);
  const filter = new Tone.Filter(2000, 'lowpass').connect(distortion);
  synth.connect(filter);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '16n', time),
    ['G4', 'Ab4', 'Bb4', 'C5', 'Db5', 'Eb5', 'F5', 'Gb5', 'Eb5', 'Db5', 'C5', 'Bb4', 'Ab4', 'G4', 'F4', 'Eb4'],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 7.1111;
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    distortion.dispose();
    delay.dispose();
    reverb.dispose();
    limiter.dispose();
    sequence.dispose();
  };
}

export function playFull(): () => void {
  Tone.Transport.bpm.value = 135;
  const masterGain = new Tone.Gain(0.3).toDestination();
  const limiter = new Tone.Limiter(-6).connect(masterGain);

  const bassSynth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0.15, release: 0.08 },
  });
  const bassFilter = new Tone.Filter(1800, 'lowpass');
  const bassDist = new Tone.Distortion(0.6);
  const bassReverb = new Tone.Reverb({ decay: 3, wet: 0.08 }).connect(limiter);
  bassSynth.connect(bassFilter);
  bassFilter.connect(bassDist);
  bassDist.connect(bassReverb);

  const padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0.12, release: 0.08 },
  });
  const padFilter = new Tone.Filter(1800, 'lowpass');
  const padDist = new Tone.Distortion(0.6);
  const padReverb = new Tone.Reverb({ decay: 3, wet: 0.08 }).connect(limiter);
  padSynth.connect(padFilter);
  padFilter.connect(padDist);
  padDist.connect(padReverb);

  const melodySynth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.03, sustain: 0.15, release: 0.06 },
  });
  const melodyFilter = new Tone.Filter(2000, 'lowpass');
  const melodyDist = new Tone.Distortion(0.6);
  const melodyDelay = new Tone.FeedbackDelay(0.1, 0.03);
  const melodyReverb = new Tone.Reverb({ decay: 3, wet: 0.08 }).connect(limiter);
  melodySynth.connect(melodyFilter);
  melodyFilter.connect(melodyDist);
  melodyDist.connect(melodyDelay);
  melodyDelay.connect(melodyReverb);

  const bassSeq = new Tone.Sequence(
    (time, note) => bassSynth.triggerAttackRelease(note, '16n', time),
    ['C2', 'C2', 'C2', 'C2', 'Eb2', 'Eb2', 'Eb2', 'Eb2', 'F2', 'F2', 'F2', 'F2', 'B2', 'B2', 'B2', 'B2'],
    '4n'
  ).start(0);
  bassSeq.loop = true;
  bassSeq.loopEnd = 7.1111;

  const padSeq = new Tone.Sequence(
    (time, chord) => padSynth.triggerAttackRelease(chord, '8n', time),
    [['C2', 'Eb2', 'Ab2'], ['C2', 'Eb2', 'Bb2'], ['D2', 'F2', 'Ab2'], ['Eb2', 'G2', 'B2']],
    '4n'
  ).start(0);
  padSeq.loop = true;
  padSeq.loopEnd = 7.1111;

  const melodySeq = new Tone.Sequence(
    (time, note) => melodySynth.triggerAttackRelease(note, '16n', time),
    ['G4', 'Ab4', 'Bb4', 'C5', 'Db5', 'Eb5', 'F5', 'Gb5', 'Eb5', 'Db5', 'C5', 'Bb4', 'Ab4', 'G4', 'F4', 'Eb4'],
    '4n'
  ).start(0);
  melodySeq.loop = true;
  melodySeq.loopEnd = 7.1111;

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
    padDist.dispose();
    padReverb.dispose();
    melodySynth.dispose();
    melodyFilter.dispose();
    melodyDist.dispose();
    melodyDelay.dispose();
    melodyReverb.dispose();
    limiter.dispose();
    masterGain.dispose();
    bassSeq.dispose();
    padSeq.dispose();
    melodySeq.dispose();
  };
}
