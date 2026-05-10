import * as Tone from 'tone';

export interface ToneChain {
  synth: Tone.PolySynth;
  filter: Tone.Filter;
  distNode: Tone.Distortion;
  reverb: Tone.Reverb;
  delay: Tone.FeedbackDelay;
  chorus: Tone.Chorus;
}

export interface ChainParams {
  waveform: string;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filterCutoff: number;
  distortion: number;
  reverbMix: number;
  delayTime: number;
  delayMix: number;
  chorusRate: number;
}

export function buildToneChain(params: ChainParams): ToneChain {
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: params.waveform as any },
    envelope: {
      attack: params.attack,
      decay: params.decay,
      sustain: params.sustain,
      release: params.release,
    },
  });
  const filter = new Tone.Filter(params.filterCutoff, 'lowpass');
  const distNode = new Tone.Distortion(params.distortion);
  const reverb = new Tone.Reverb({ decay: 3, wet: params.reverbMix });
  const delay = new Tone.FeedbackDelay(params.delayTime, params.delayMix);
  const chorus = new Tone.Chorus(params.chorusRate, 3.5, 0.5);
  synth.chain(filter, distNode, delay, chorus, reverb);
  reverb.toDestination();
  chorus.start();
  return { synth, filter, distNode, reverb, delay, chorus };
}
