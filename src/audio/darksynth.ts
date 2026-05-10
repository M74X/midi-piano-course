import * as Tone from 'tone';

export function playBass(): () => void {
  Tone.Transport.bpm.value = 140;
  const synth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.002, decay: 0.08, sustain: 0.35, release: 0.15 },
  });
  const filter = new Tone.Filter(3500, 'lowpass');
  const distortion = new Tone.Distortion(0.55).toDestination();
  synth.connect(filter);
  filter.connect(distortion);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '8n', time),
    ['C2', 'D2', 'Eb2', 'C2', 'F2', 'D2', 'Eb2', 'G2', 'C2', 'D2', 'Eb2', 'F2', 'G2', 'Eb2', 'D2', 'C2'],
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
  Tone.Transport.bpm.value = 140;
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.002, decay: 0.1, sustain: 0.3, release: 0.2 },
  });
  const filter = new Tone.Filter(3500, 'lowpass');
  const distortion = new Tone.Distortion(0.5).toDestination();
  synth.connect(filter);
  filter.connect(distortion);
  const sequence = new Tone.Sequence(
    (time, chord) => synth.triggerAttackRelease(chord, '4n', time),
    [['C2', 'Eb2', 'G2', 'Bb2'], ['D2', 'F2', 'Ab2', 'C3'], ['Eb2', 'G2', 'Bb2', 'Db3'], ['F2', 'Ab2', 'C3', 'Eb3']],
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

export function playMelody(): () => void {
  Tone.Transport.bpm.value = 140;
  const synth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.002, decay: 0.05, sustain: 0.4, release: 0.12 },
  });
  const filter = new Tone.Filter(4000, 'lowpass');
  const distortion = new Tone.Distortion(0.55).toDestination();
  synth.connect(filter);
  filter.connect(distortion);
  const sequence = new Tone.Sequence(
    (time, note) => synth.triggerAttackRelease(note, '8n', time),
    ['G4', 'Ab4', 'Bb4', 'C5', 'Db5', 'Eb5', 'F5', 'G5', 'Eb5', 'Db5', 'C5', 'Bb4', 'Ab4', 'G4', 'Eb4', 'C4'],
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

export function playFull(): () => void {
  Tone.Transport.bpm.value = 140;
  const bassSynth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.002, decay: 0.08, sustain: 0.35, release: 0.15 },
  });
  const bassFilter = new Tone.Filter(3500, 'lowpass');
  const bassDist = new Tone.Distortion(0.55).toDestination();
  bassSynth.connect(bassFilter);
  bassFilter.connect(bassDist);

  const padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.002, decay: 0.1, sustain: 0.3, release: 0.2 },
  });
  const padFilter = new Tone.Filter(3500, 'lowpass');
  const padDist = new Tone.Distortion(0.5).toDestination();
  padSynth.connect(padFilter);
  padFilter.connect(padDist);

  const melodySynth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.002, decay: 0.05, sustain: 0.4, release: 0.12 },
  });
  const melodyFilter = new Tone.Filter(4000, 'lowpass');
  const melodyDist = new Tone.Distortion(0.55).toDestination();
  melodySynth.connect(melodyFilter);
  melodyFilter.connect(melodyDist);

  const bassSeq = new Tone.Sequence(
    (time, note) => bassSynth.triggerAttackRelease(note, '8n', time),
    ['C2', 'D2', 'Eb2', 'C2', 'F2', 'D2', 'Eb2', 'G2', 'C2', 'D2', 'Eb2', 'F2', 'G2', 'Eb2', 'D2', 'C2'],
    '4n'
  ).start(0);
  bassSeq.loop = true;
  bassSeq.loopEnd = '4m';

  const padSeq = new Tone.Sequence(
    (time, chord) => padSynth.triggerAttackRelease(chord, '4n', time),
    [['C2', 'Eb2', 'G2', 'Bb2'], ['D2', 'F2', 'Ab2', 'C3'], ['Eb2', 'G2', 'Bb2', 'Db3'], ['F2', 'Ab2', 'C3', 'Eb3']],
    '4n'
  ).start(0);
  padSeq.loop = true;
  padSeq.loopEnd = '4m';

  const melodySeq = new Tone.Sequence(
    (time, note) => melodySynth.triggerAttackRelease(note, '8n', time),
    ['G4', 'Ab4', 'Bb4', 'C5', 'Db5', 'Eb5', 'F5', 'G5', 'Eb5', 'Db5', 'C5', 'Bb4', 'Ab4', 'G4', 'Eb4', 'C4'],
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
    padDist.dispose();
    melodySynth.dispose();
    melodyFilter.dispose();
    melodyDist.dispose();
    bassSeq.dispose();
    padSeq.dispose();
    melodySeq.dispose();
  };
}
