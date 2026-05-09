import { useEffect, useRef } from 'react';

interface WaveformDisplayProps {
  isPlaying: boolean;
  compact?: boolean;
}

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ isPlaying, compact = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const draw = () => {
      const { width, height } = canvas;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, 0, width, height);

      for (let layer = 0; layer < 3; layer++) {
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, `hsla(${280 + layer * 30},80%,60%,0.8)`);
        grad.addColorStop(0.5, `hsla(${320 + layer * 30},80%,60%,0.8)`);
        grad.addColorStop(1, `hsla(${180 + layer * 30},80%,60%,0.8)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = compact ? 1 : 2 - layer * 0.5;
        ctx.shadowColor = isPlaying ? '#ec4899' : '#6366f1';
        ctx.shadowBlur = isPlaying ? (compact ? 6 : 20) : (compact ? 3 : 10);
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const freq = 0.02 + layer * 0.005;
          const amp = (height / 4) * (0.5 + Math.random() * 0.1);
          const y = height / 2 + Math.sin((x + phase) * freq + layer) * amp * Math.sin(phase * 0.01);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(236,72,153,0.25)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      phase += isPlaying ? 5 : 1;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, compact]);

  if (compact) {
    return (
      <canvas
        ref={canvasRef}
        width={140}
        height={36}
        className="rounded-lg bg-black/60"
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }

  return (
    <div className="bg-black rounded-xl p-3 border border-purple-500/20 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={80}
        className="w-full rounded-lg bg-black/50"
        style={{ height: 80 }}
      />
    </div>
  );
};

export default WaveformDisplay;