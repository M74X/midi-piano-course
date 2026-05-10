import * as Tone from 'tone';

export function playBass(): () => void {
  Tone.Transport.bpm.value = 118;
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0.55, release: 0.25 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.22 }).connect(limiter);
  const distortion = new Tone.Distortion(0.03).connect(reverb);
  const filter = new Tone.Filter(2200, 'lowpass').connect(distortion);
  synth.connect(filter);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '8n', time),
    ['C2', 'C2', 'G2', 'Eb2', 'C2', 'G2', 'Bb2', 'Eb2'],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 8.1356;
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
  Tone.Transport.bpm.value = 118;
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.3 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const delay = new Tone.FeedbackDelay(0.3, 0.4);
  const reverb = new Tone.Reverb({ decay: 3.5, wet: 0.22 }).connect(limiter);
  const filter = new Tone.Filter(2200, 'lowpass').connect(delay);
  const chorus = new Tone.Chorus(0.35, 3.5, 0.5).connect(filter);
  delay.connect(reverb);
  synth.connect(chorus);
  const sequence = new Tone.Sequence(
    (time, chord) => synth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3'], ['Eb2', 'G2', 'Bb2'], ['F2', 'Ab2', 'C3'], ['G2', 'Bb2', 'Eb3']],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 8.1356;
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    chorus.dispose();
    delay.dispose();
    reverb.dispose();
    limiter.dispose();
    sequence.dispose();
  };
}

export function playMelody(): () => void {
  Tone.Transport.bpm.value = 118;
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.6, release: 0.2 },
  });
  const limiter = new Tone.Limiter(-6).toDestination();
  const delay = new Tone.FeedbackDelay(0.25, 0.35).connect(limiter);
  const filter = new Tone.Filter(2400, 'lowpass').connect(delay);
  synth.connect(filter);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '16n', time),
    ['C4', 'Eb4', 'G4', 'C5', 'Eb4', 'G4', 'Eb4', 'C4', 'Bb3', 'G3', 'Eb3', 'G3', 'Bb3', 'Eb4', 'G4', 'C5', 'Eb5', 'G5', 'Eb5', 'C5', 'G4', 'Eb4', 'C4', 'G3'],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = 8.1356;
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    delay.dispose();
    limiter.dispose();
    sequence.dispose();
  };
}

export function playFull(): () => void {
  Tone.Transport.bpm.value = 118;
  const masterGain = new Tone.Gain(0.3).toDestination();
  const limiter = new Tone.Limiter(-6).connect(masterGain);

  const bassSynth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0.55, release: 0.25 },
  });
  const bassFilter = new Tone.Filter(2200, 'lowpass');
  const bassDist = new Tone.Distortion(0.03);
  const bassReverb = new Tone.Reverb({ decay: 3, wet: 0.22 }).connect(limiter);
  bassSynth.connect(bassFilter);
  bassFilter.connect(bassDist);
  bassDist.connect(bassReverb);

  const padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.3 },
  });
  const padChorus = new Tone.Chorus(0.35, 3.5, 0.5);
  const padFilter = new Tone.Filter(2200, 'lowpass');
  const padDelay = new Tone.FeedbackDelay(0.3, 0.4);
  const padReverb = new Tone.Reverb({ decay: 3.5, wet: 0.22 }).connect(limiter);
  padSynth.connect(padChorus);
  padChorus.connect(padFilter);
  padFilter.connect(padDelay);
  padDelay.connect(padReverb);

  const melodySynth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.6, release: 0.2 },
  });
  const melodyFilter = new Tone.Filter(2400, 'lowpass');
  const melodyDelay = new Tone.FeedbackDelay(0.25, 0.35).connect(limiter);
  melodySynth.connect(melodyFilter);
  melodyFilter.connect(melodyDelay);

  const bassSeq = new Tone.Sequence(
    (time, note) => bassSynth.triggerAttackRelease(note, '8n', time),
    ['C2', 'C2', 'G2', 'Eb2', 'C2', 'G2', 'Bb2', 'Eb2'],
    '4n'
  ).start(0);
  bassSeq.loop = true;
  bassSeq.loopEnd = 8.1356;

  const padSeq = new Tone.Sequence(
    (time, chord) => padSynth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3'], ['Eb2', 'G2', 'Bb2'], ['F2', 'Ab2', 'C3'], ['G2', 'Bb2', 'Eb3']],
    '4n'
  ).start(0);
  padSeq.loop = true;
  padSeq.loopEnd = 8.1356;

  const melodySeq = new Tone.Sequence(
    (time, note) => melodySynth.triggerAttackRelease(note, '16n', time),
    ['C4', 'Eb4', 'G4', 'C5', 'Eb4', 'G4', 'Eb4', 'C4', 'Bb3', 'G3', 'Eb3', 'G3', 'Bb3', 'Eb4', 'G4', 'C5', 'Eb5', 'G5', 'Eb5', 'C5', 'G4', 'Eb4', 'C4', 'G3'],
    '4n'
  ).start(0);
  melodySeq.loop = true;
  melodySeq.loopEnd = 8.1356;

  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    bassSynth.dispose();
    bassFilter.dispose();
    bassDist.dispose();
    bassReverb.dispose();
    padSynth.dispose();
    padChorus.dispose();
    padFilter.dispose();
    padDelay.dispose();
    padReverb.dispose();
    melodySynth.dispose();
    melodyFilter.dispose();
    melodyDelay.dispose();
    limiter.dispose();
    masterGain.dispose();
    bassSeq.dispose();
    padSeq.dispose();
    melodySeq.dispose();
  };
}
