import * as Tone from 'tone';

export function playBass(): () => void {
  Tone.Transport.bpm.value = 70;
  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.5, decay: 1.0, sustain: 0.65, release: 2.5 },
  });
  const filter = new Tone.Filter(550, 'lowpass');
  const reverb = new Tone.Reverb({ decay: 6, wet: 0.65 }).toDestination();
  synth.connect(filter);
  filter.connect(reverb);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '4n', time),
    ['C2', 'Eb2', 'G2', 'Bb2', 'Eb2', 'G2', 'Bb2', 'C3'],
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
    reverb.dispose();
    sequence.dispose();
  };
}

export function playPad(): () => void {
  Tone.Transport.bpm.value = 70;
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.5, decay: 1.0, sustain: 0.65, release: 2.5 },
  });
  const filter = new Tone.Filter(550, 'lowpass');
  const chorus = new Tone.Chorus(0.55, 4, 0.5);
  const reverb = new Tone.Reverb({ decay: 7, wet: 0.65 }).toDestination();
  synth.connect(filter);
  filter.connect(chorus);
  chorus.connect(reverb);
  const sequence = new Tone.Sequence(
    (time, chord) => synth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3', 'Bb3'], ['Eb3', 'G3', 'Bb3', 'C4'], ['F3', 'Ab3', 'C4', 'Eb4'], ['G3', 'Bb3', 'Eb4', 'G4']],
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
    chorus.dispose();
    reverb.dispose();
    sequence.dispose();
  };
}

export function playMelody(): () => void {
  Tone.Transport.bpm.value = 70;
  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.6, decay: 0.8, sustain: 0.6, release: 3 },
  });
  const filter = new Tone.Filter(600, 'lowpass');
  const chorus = new Tone.Chorus(0.55, 4, 0.5).connect(filter);
  const delay = new Tone.FeedbackDelay(0.6, 0.35).toDestination();
  filter.connect(delay);
  synth.connect(chorus);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '4n', time),
    ['G4', 'Eb4', 'C4', 'Bb3', 'Ab3', 'G3', 'Eb3', 'C3', 'Bb3', 'G3', 'Eb3', 'Ab3', 'G3', 'Eb3', 'C4', 'Eb4'],
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
    chorus.dispose();
    delay.dispose();
    sequence.dispose();
  };
}

export function playFull(): () => void {
  Tone.Transport.bpm.value = 70;
  const bassSynth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.5, decay: 1.0, sustain: 0.65, release: 2.5 },
  });
  const bassFilter = new Tone.Filter(550, 'lowpass');
  const bassReverb = new Tone.Reverb({ decay: 6, wet: 0.65 }).toDestination();
  bassSynth.connect(bassFilter);
  bassFilter.connect(bassReverb);

  const padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.5, decay: 1.0, sustain: 0.65, release: 2.5 },
  });
  const padFilter = new Tone.Filter(550, 'lowpass');
  const padChorus = new Tone.Chorus(0.55, 4, 0.5);
  const padReverb = new Tone.Reverb({ decay: 7, wet: 0.65 }).toDestination();
  padSynth.connect(padFilter);
  padFilter.connect(padChorus);
  padChorus.connect(padReverb);

  const melodySynth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.6, decay: 0.8, sustain: 0.6, release: 3 },
  });
  const melodyFilter = new Tone.Filter(600, 'lowpass');
  const melodyChorus = new Tone.Chorus(0.55, 4, 0.5).connect(melodyFilter);
  const melodyDelay = new Tone.FeedbackDelay(0.6, 0.35).toDestination();
  melodyFilter.connect(melodyDelay);
  melodySynth.connect(melodyChorus);

  const bassSeq = new Tone.Sequence(
    (time, note) => bassSynth.triggerAttackRelease(note, '4n', time),
    ['C2', 'Eb2', 'G2', 'Bb2', 'Eb2', 'G2', 'Bb2', 'C3'],
    '4n'
  ).start(0);
  bassSeq.loop = true;
  bassSeq.loopEnd = '4m';

  const padSeq = new Tone.Sequence(
    (time, chord) => padSynth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3', 'Bb3'], ['Eb3', 'G3', 'Bb3', 'C4'], ['F3', 'Ab3', 'C4', 'Eb4'], ['G3', 'Bb3', 'Eb4', 'G4']],
    '4n'
  ).start(0);
  padSeq.loop = true;
  padSeq.loopEnd = '4m';

  const melodySeq = new Tone.Sequence(
    (time, note) => melodySynth.triggerAttackRelease(note, '4n', time),
    ['G4', 'Eb4', 'C4', 'Bb3', 'Ab3', 'G3', 'Eb3', 'C3', 'Bb3', 'G3', 'Eb3', 'Ab3', 'G3', 'Eb3', 'C4', 'Eb4'],
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
    bassReverb.dispose();
    padSynth.dispose();
    padFilter.dispose();
    padChorus.dispose();
    padReverb.dispose();
    melodySynth.dispose();
    melodyFilter.dispose();
    melodyChorus.dispose();
    melodyDelay.dispose();
    bassSeq.dispose();
    padSeq.dispose();
    melodySeq.dispose();
  };
}
