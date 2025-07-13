import { useEffect, useState } from "react";

interface WaveformVisualizerProps {
  isRecording: boolean;
}

export function WaveformVisualizer({ isRecording }: WaveformVisualizerProps) {
  const [bars, setBars] = useState<number[]>(new Array(8).fill(4));

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setBars(prevBars => 
          prevBars.map(() => Math.floor(Math.random() * 16) + 4)
        );
      }, 150);

      return () => clearInterval(interval);
    } else {
      setBars(new Array(8).fill(4));
    }
  }, [isRecording]);

  return (
    <div className="flex items-center justify-center space-x-2">
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-2 bg-white rounded-full transition-all duration-150 ease-in-out"
          style={{
            height: `${height}px`,
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
