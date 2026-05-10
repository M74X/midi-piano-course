import * as Tone from 'tone';

export function playBass(): () => void {
  Tone.Transport.bpm.value = 90;
  const synth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: 'square' },
    envelope: { attack: 0.003, decay: 0.12, sustain: 0.28, release: 0.12 },
  });
  const filter = new Tone.Filter(650, 'lowpass');
  const distortion = new Tone.Distortion(0.35).toDestination();
  synth.connect(filter);
  filter.connect(distortion);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '4n', time),
    ['C2', 'C2', 'G2', 'C2', 'Eb2', 'Eb2', 'G2', 'Bb2'],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = '4m';
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    distortion.dispose();
    sequence.dispose();
  };
}

export function playPad(): () => void {
  Tone.Transport.bpm.value = 90;
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.003, decay: 0.1, sustain: 0.25, release: 0.1 },
  });
  const filter = new Tone.Filter(800, 'lowpass');
  const delay = new Tone.FeedbackDelay(0.2, 0.18).toDestination();
  synth.connect(filter);
  filter.connect(delay);
  const sequence = new Tone.Sequence(
    (time, chord) => synth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3'], ['G3', 'Bb3', 'Eb4'], ['Eb3', 'G3', 'Bb3'], ['Bb2', 'Eb3', 'G3']],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = '4m';
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    delay.dispose();
    sequence.dispose();
  };
}

export function playMelody(): () => void {
  Tone.Transport.bpm.value = 90;
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.002, decay: 0.08, sustain: 0.3, release: 0.1 },
  });
  const filter = new Tone.Filter(900, 'lowpass');
  const delay = new Tone.FeedbackDelay(0.18, 0.15).toDestination();
  synth.connect(filter);
  filter.connect(delay);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '16n', time),
    ['G4', null, 'Eb4', 'G4', null, 'C5', 'Bb4', null, 'G4', 'Eb4', null, 'G4', 'Eb4', null, 'C4', 'Eb4'],
    '4n'
  ).start(0);
  sequence.loop = true;
  sequence.loopEnd = '4m';
  Tone.Transport.start();
  return () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    synth.dispose();
    filter.dispose();
    delay.dispose();
    sequence.dispose();
  };
}

export function playFull(): () => void {
  Tone.Transport.bpm.value = 90;
  const bassSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: 'square' },
    envelope: { attack: 0.003, decay: 0.12, sustain: 0.28, release: 0.12 },
  });
  const bassFilter = new Tone.Filter(650, 'lowpass');
  const bassDist = new Tone.Distortion(0.35).toDestination();
  bassSynth.connect(bassFilter);
  bassFilter.connect(bassDist);

  const padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.003, decay: 0.1, sustain: 0.25, release: 0.1 },
  });
  const padFilter = new Tone.Filter(800, 'lowpass');
  const padDelay = new Tone.FeedbackDelay(0.2, 0.18).toDestination();
  padSynth.connect(padFilter);
  padFilter.connect(padDelay);

  const melodySynth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.002, decay: 0.08, sustain: 0.3, release: 0.1 },
  });
  const melodyFilter = new Tone.Filter(900, 'lowpass');
  const melodyDelay = new Tone.FeedbackDelay(0.18, 0.15).toDestination();
  melodySynth.connect(melodyFilter);
  melodyFilter.connect(melodyDelay);

  const bassSeq = new Tone.Sequence(
    (time, note) => bassSynth.triggerAttackRelease(note, '4n', time),
    ['C2', 'C2', 'G2', 'C2', 'Eb2', 'Eb2', 'G2', 'Bb2'],
    '4n'
  ).start(0);
  bassSeq.loop = true;
  bassSeq.loopEnd = '4m';

  const padSeq = new Tone.Sequence(
    (time, chord) => padSynth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3'], ['G3', 'Bb3', 'Eb4'], ['Eb3', 'G3', 'Bb3'], ['Bb2', 'Eb3', 'G3']],
    '4n'
  ).start(0);
  padSeq.loop = true;
  padSeq.loopEnd = '4m';

  const melodySeq = new Tone.Sequence(
    (time, note) => melodySynth.triggerAttackRelease(note, '16n', time),
    ['G4', null, 'Eb4', 'G4', null, 'C5', 'Bb4', null, 'G4', 'Eb4', null, 'G4', 'Eb4', null, 'C4', 'Eb4'],
    '4n'
  ).start(0);
  melodySeq.loop = true;
  melodySeq.loopEnd = '4m';

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
    melodySynth.dispose();
    melodyFilter.dispose();
    melodyDelay.dispose();
    bassSeq.dispose();
    padSeq.dispose();
    melodySeq.dispose();
  };
}
