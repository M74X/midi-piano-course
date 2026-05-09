import { useEffect, useRef } from 'react';

interface WaveformDisplayProps {
  isPlaying: boolean;
}

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Draw multiple wave layers
      const layers = 3;
      for (let layer = 0; layer < layers; layer++) {
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, `hsla(${280 + layer * 30}, 80%, 60%, 0.8)`);
        gradient.addColorStop(0.5, `hsla(${320 + layer * 30}, 80%, 60%, 0.8)`);
        gradient.addColorStop(1, `hsla(${180 + layer * 30}, 80%, 60%, 0.8)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 - layer * 0.5;
        ctx.shadowColor = isPlaying ? '#ec4899' : '#6366f1';
        ctx.shadowBlur = isPlaying ? 20 : 10;

        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const frequency = 0.02 + layer * 0.005;
          const amplitude = (height / 4) * (0.5 + Math.random() * 0.1);
          const y = height / 2 + Math.sin((x + phase) * frequency + layer) * amplitude * Math.sin(phase * 0.01);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      // Draw center line
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      phase += isPlaying ? 5 : 1;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  return (
    <div className="mb-6 bg-black rounded-xl p-4 border border-purple-500/30 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-purple-400 font-bold">🌊 WAVEFORM VISUALIZER</span>
        <span className={`text-xs px-2 py-1 rounded ${isPlaying ? 'bg-green-500/30 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
          {isPlaying ? 'LIVE' : 'IDLE'}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={120}
        className="w-full h-32 rounded-lg bg-black/50"
      />
    </div>
  );
};

export default WaveformDisplay;