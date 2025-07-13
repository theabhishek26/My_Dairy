import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
  fileName?: string;
}

export function AudioPlayer({ audioUrl, duration, fileName }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setTotalDuration(audio.duration);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', () => setIsPlaying(false));
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, []);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    const newVolume = value[0];
    if (audio) {
      audio.volume = newVolume;
      setVolume(newVolume);
    }
  };

  return (
    <div className="bg-muted/50 rounded-xl p-3">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex items-center space-x-3 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlayPause}
          className="w-8 h-8 p-0 bg-gradient-to-r from-primary to-primary-light rounded-full"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white" />
          )}
        </Button>
        
        <div className="flex-1">
          <Slider
            value={[currentTime]}
            max={totalDuration}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
        </div>
        
        <span className="text-xs text-muted-foreground font-mono">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
          {fileName || "Audio Recording"}
        </span>
        
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-16"
          />
        </div>
      </div>
    </div>
  );
}
