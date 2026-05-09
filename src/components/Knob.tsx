import { useRef, useState } from 'react';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  format?: (v: number) => string;
  color?: string;
  size?: number;
}

let _knobId = 0;

const Knob: React.FC<KnobProps> = ({
  value, min, max, onChange, label,
  format = v => v.toFixed(2),
  color = '#ec4899',
  size = 52,
}) => {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const dragRef = useRef<{ startY: number; startVal: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const gradIdRef = useRef(`kgr${_knobId++}`);
  const gradId = gradIdRef.current;

  const norm = Math.max(0, Math.min(1, (value - min) / (max - min)));
  // clamp arc norm to avoid degenerate SVG arcs at exact 0 and 1
  const arcNorm = Math.max(0.004, Math.min(0.996, norm));

  const half = size / 2;
  const r = half - 4;

  const toXY = (deg: number, rad: number) => ({
    x: half + rad * Math.cos((deg * Math.PI) / 180),
    y: half + rad * Math.sin((deg * Math.PI) / 180),
  });

  // Track: 135° (7 o'clock) → 45° (5 o'clock), CW = 270° range
  const bgS = toXY(135, r);
  const bgE = toXY(45, r);
  const valAngle = 135 + arcNorm * 270;
  const valE = toXY(valAngle, r);
  const largeArc = arcNorm > 2 / 3 ? 1 : 0;
  const pIn = toXY(valAngle, r * 0.2);
  const pOut = toXY(valAngle, r * 0.78);

  const fmt = (x: number) => x.toFixed(2);

  const startDrag = (startY: number, startVal: number) => {
    dragRef.current = { startY, startVal };
    const onMove = (clientY: number) => {
      if (!dragRef.current) return;
      const dy = dragRef.current.startY - clientY;
      onChange(Math.max(min, Math.min(max,
        dragRef.current.startVal + (dy / 200) * (max - min)
      )));
    };
    const onMouseMove = (e: MouseEvent) => onMove(e.clientY);
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); onMove(e.touches[0].clientY); };
    const cleanup = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', cleanup);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', cleanup);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', cleanup);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', cleanup);
  };

  const commitEdit = () => {
    const n = parseFloat(inputVal);
    if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
    setEditing(false);
  };

  return (
    <div className="flex flex-col items-center select-none" style={{ width: size + 8 }}>
      <svg
        width={size} height={size}
        style={{ cursor: 'ns-resize', touchAction: 'none', overflow: 'visible' }}
        onMouseDown={e => { e.preventDefault(); startDrag(e.clientY, value); }}
        onTouchStart={e => { e.preventDefault(); startDrag(e.touches[0].clientY, value); }}
      >
        <defs>
          <radialGradient id={gradId} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Track groove */}
        <path
          d={`M ${fmt(bgS.x)} ${fmt(bgS.y)} A ${r} ${r} 0 1 1 ${fmt(bgE.x)} ${fmt(bgE.y)}`}
          fill="none" stroke="#1f2937" strokeWidth={3.5} strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${fmt(bgS.x)} ${fmt(bgS.y)} A ${r} ${r} 0 ${largeArc} 1 ${fmt(valE.x)} ${fmt(valE.y)}`}
          fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}90)` }}
        />
        {/* Knob face */}
        <circle cx={half} cy={half} r={r - 5} fill="#0d1117" />
        <circle cx={half} cy={half} r={r - 5} fill={`url(#${gradId})`} />
        {/* Pointer */}
        <line
          x1={fmt(pIn.x)} y1={fmt(pIn.y)} x2={fmt(pOut.x)} y2={fmt(pOut.y)}
          stroke={color} strokeWidth={2} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${color})` }}
        />
      </svg>

      {editing ? (
        <input
          ref={inputRef}
          autoFocus
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') setEditing(false);
          }}
          className="text-center text-[10px] bg-gray-900 border border-purple-500/60 rounded px-0.5 py-0.5 text-white outline-none mt-0.5"
          style={{ width: size + 8 }}
        />
      ) : (
        <button
          onClick={() => { setInputVal(String(value)); setEditing(true); }}
          className="text-[10px] font-mono mt-0.5 leading-none transition-all hover:brightness-125"
          style={{ color, width: size + 8, textAlign: 'center' }}
        >
          {format(value)}
        </button>
      )}

      <span className="text-[8px] font-bold tracking-widest text-gray-600 uppercase mt-0.5 leading-none text-center">
        {label}
      </span>
    </div>
  );
};

export default Knob;