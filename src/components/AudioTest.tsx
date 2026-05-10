import { useState, useRef } from 'react';
import { playFull as playDarkambient } from '../audio/darkambient';
import { playFull as playDarkwave } from '../audio/darkwave';
import { playFull as playSynthwave } from '../audio/synthwave';
import { playFull as playDarksynth } from '../audio/darksynth';
import { playFull as playDarkphonk } from '../audio/darkphonk';
import { playFull as playWitchhouse } from '../audio/witchhouse';
import { playFull as playIndustrial } from '../audio/industrial';

type Genre = 'darkambient' | 'darkwave' | 'synthwave' | 'darksynth' | 'darkphonk' | 'witchhouse' | 'industrial';

const GENRES: { id: Genre; label: string; fn: () => () => void }[] = [
  { id: 'darkambient', label: '🌫 Dark Ambient', fn: playDarkambient },
  { id: 'darkwave',    label: '🌙 Darkwave',     fn: playDarkwave    },
  { id: 'synthwave',   label: '⚡ Synthwave',    fn: playSynthwave   },
  { id: 'darksynth',   label: '🔥 Dark Synth',   fn: playDarksynth   },
  { id: 'darkphonk',   label: '💀 Dark Phonk',   fn: playDarkphonk   },
  { id: 'witchhouse',  label: '🕸 Witch House',  fn: playWitchhouse  },
  { id: 'industrial',  label: '⚙️ Industrial',   fn: playIndustrial  },
];

export default function AudioTest() {
  const [active, setActive] = useState<Genre | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const handleClick = (genre: Genre, fn: () => () => void) => {
    if (active === genre) {
      stopRef.current?.();
      stopRef.current = null;
      setActive(null);
    } else {
      stopRef.current?.();
      stopRef.current = fn();
      setActive(genre);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 p-3 bg-black/90 border border-purple-900/50 rounded-xl backdrop-blur-sm">
      <p className="text-[9px] font-bold text-purple-600 tracking-widest mb-1">AUDIO TEST</p>
      {GENRES.map(({ id, label, fn }) => (
        <button
          key={id}
          onClick={() => handleClick(id, fn)}
          className={`px-3 py-1.5 rounded text-[11px] font-bold text-left transition-all ${
            active === id
              ? 'bg-pink-500/30 text-pink-300 border border-pink-500/50'
              : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800'
          }`}
        >
          {active === id ? '■ ' : '▶ '}{label}
        </button>
      ))}
      {active && (
        <p className="text-[9px] text-gray-600 text-center mt-1">sonando: {active}</p>
      )}
    </div>
  );
}
