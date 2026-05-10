import * as Tone from 'tone';

export function playBass(): () => void {
  Tone.Transport.bpm.value = 100;
  const synth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.4, decay: 0.6, sustain: 0.75, release: 1.8 },
  });
  const filter = new Tone.Filter(1400, 'lowpass');
  const chorus = new Tone.Chorus(0.45, 3.5, 0.5);
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.5 }).toDestination();
  synth.connect(filter);
  filter.connect(chorus);
  chorus.connect(reverb);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '4n', time),
    ['C3', 'G3', 'Eb3', 'Bb2', 'Ab2', 'Eb3', 'C3', 'G2'],
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

export function playPad(): () => void {
  Tone.Transport.bpm.value = 100;
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.4, decay: 0.6, sustain: 0.75, release: 1.8 },
  });
  const filter = new Tone.Filter(1400, 'lowpass');
  const chorus = new Tone.Chorus(0.45, 3.5, 0.5).connect(filter);
  const reverb = new Tone.Reverb({ decay: 3.5, wet: 0.5 }).toDestination();
  synth.connect(chorus);
  filter.connect(reverb);
  const sequence = new Tone.Sequence(
    (time, chord) => synth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3'], ['Bb2', 'Eb3', 'G3'], ['Ab2', 'C3', 'Eb3'], ['G2', 'Bb2', 'Eb3']],
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
  Tone.Transport.bpm.value = 100;
  const synth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.3, decay: 0.5, sustain: 0.7, release: 1.5 },
  });
  const filter = new Tone.Filter(1600, 'lowpass');
  const chorus = new Tone.Chorus(0.45, 3.5, 0.5).connect(filter);
  const delay = new Tone.FeedbackDelay(0.4, 0.3).toDestination();
  filter.connect(delay);
  synth.connect(chorus);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '8n', time),
    ['G4', 'Eb4', 'C4', 'Bb3', 'Ab3', 'C4', 'Eb4', 'G4', 'Bb4', 'G4', 'Eb4', 'C4', 'Eb4', 'G4', 'Bb4', 'C5'],
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
  Tone.Transport.bpm.value = 100;
  const bassSynth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.4, decay: 0.6, sustain: 0.75, release: 1.8 },
  });
  const bassFilter = new Tone.Filter(1400, 'lowpass').toDestination();
  const bassChorus = new Tone.Chorus(0.45, 3.5, 0.5).connect(bassFilter);
  bassSynth.connect(bassChorus);

  const padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.4, decay: 0.6, sustain: 0.75, release: 1.8 },
  });
  const padFilter = new Tone.Filter(1400, 'lowpass');
  const padChorus = new Tone.Chorus(0.45, 3.5, 0.5).connect(padFilter);
  const padReverb = new Tone.Reverb({ decay: 3.5, wet: 0.5 }).toDestination();
  padFilter.connect(padReverb);
  padSynth.connect(padChorus);

  const melodySynth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.3, decay: 0.5, sustain: 0.7, release: 1.5 },
  });
  const melodyFilter = new Tone.Filter(1600, 'lowpass');
  const melodyChorus = new Tone.Chorus(0.45, 3.5, 0.5).connect(melodyFilter);
  const melodyDelay = new Tone.FeedbackDelay(0.4, 0.3).toDestination();
  melodyFilter.connect(melodyDelay);
  melodySynth.connect(melodyChorus);

  const bassSeq = new Tone.Sequence(
    (time, note) => bassSynth.triggerAttackRelease(note, '4n', time),
    ['C3', 'G3', 'Eb3', 'Bb2', 'Ab2', 'Eb3', 'C3', 'G2'],
    '4n'
  ).start(0);
  bassSeq.loop = true;
  bassSeq.loopEnd = '4m';

  const padSeq = new Tone.Sequence(
    (time, chord) => padSynth.triggerAttackRelease(chord, '2n', time),
    [['C3', 'Eb3', 'G3'], ['Bb2', 'Eb3', 'G3'], ['Ab2', 'C3', 'Eb3'], ['G2', 'Bb2', 'Eb3']],
    '4n'
  ).start(0);
  padSeq.loop = true;
  padSeq.loopEnd = '4m';

  const melodySeq = new Tone.Sequence(
    (time, note) => melodySynth.triggerAttackRelease(note, '8n', time),
    ['G4', 'Eb4', 'C4', 'Bb3', 'Ab3', 'C4', 'Eb4', 'G4', 'Bb4', 'G4', 'Eb4', 'C4', 'Eb4', 'G4', 'Bb4', 'C5'],
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
    bassChorus.dispose();
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
