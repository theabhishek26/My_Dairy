import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WaveformVisualizer } from "./waveform-visualizer";
import { useVoiceRecording } from "@/hooks/use-voice-recording";
import { Mic, Square, Play, Pause, X, Check } from "lucide-react";

interface VoiceRecordingInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (audioData: Blob) => void;
}

export function VoiceRecordingInterface({ isOpen, onClose, onSave }: VoiceRecordingInterfaceProps) {
  const [transcription, setTranscription] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  } = useVoiceRecording();

  useEffect(() => {
    if (audioBlob) {
      // TODO: Implement speech-to-text transcription
      setTranscription("This is a placeholder transcription. Speech-to-text integration would go here.");
    }
  }, [audioBlob]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSave = () => {
    if (audioBlob) {
      onSave(audioBlob);
    }
  };

  const handleCancel = () => {
    clearRecording();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/90 to-primary-light/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 glass-effect border-0 text-white">
        <CardContent className="p-8 text-center">
          <div className="mb-8">
            <h2 className="text-2xl font-playfair font-semibold mb-2">Voice Recording</h2>
            <p className="text-sm opacity-80">
              {!isRecording && !audioBlob ? "Tap to start recording your thoughts" : 
               isRecording ? "Recording in progress..." : "Recording completed"}
            </p>
          </div>

          {/* Main Recording Button */}
          <div className="relative mb-8">
            {!isRecording && !audioBlob ? (
              <Button
                onClick={startRecording}
                className="w-32 h-32 bg-white/20 rounded-full border-4 border-white/30 hover:bg-white/30 transition-all duration-300 pulse-glow"
              >
                <Mic className="w-12 h-12" />
              </Button>
            ) : isRecording ? (
              <Button
                onClick={stopRecording}
                className="w-32 h-32 bg-red-500/80 rounded-full border-4 border-red-400/50 hover:bg-red-500/90 transition-all duration-300 animate-pulse"
              >
                <Square className="w-12 h-12" />
              </Button>
            ) : (
              <Button
                onClick={handlePlayPause}
                className="w-32 h-32 bg-white/20 rounded-full border-4 border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                {isPlaying ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12" />}
              </Button>
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Waveform Visualization */}
          <div className="mb-8">
            <WaveformVisualizer isRecording={isRecording} />
          </div>

          {/* Recording Timer */}
          <div className="text-2xl font-mono font-bold mb-8">
            {formatTime(duration)}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <Button
              onClick={handleCancel}
              variant="ghost"
              className="w-12 h-12 p-0 bg-white/20 rounded-full hover:bg-white/30"
            >
              <X className="w-6 h-6" />
            </Button>

            {isRecording && (
              <Button
                onClick={isPaused ? resumeRecording : pauseRecording}
                variant="ghost"
                className="w-12 h-12 p-0 bg-white/20 rounded-full hover:bg-white/30"
              >
                {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
              </Button>
            )}

            {audioBlob && (
              <Button
                onClick={handleSave}
                variant="ghost"
                className="w-12 h-12 p-0 bg-green-500/80 rounded-full hover:bg-green-500/90"
              >
                <Check className="w-6 h-6" />
              </Button>
            )}
          </div>

          {/* Transcription Preview */}
          {transcription && (
            <div className="bg-white/10 rounded-xl p-4 text-left">
              <h4 className="text-sm font-medium mb-2 opacity-80">Live Transcription</h4>
              <p className="text-sm">{transcription}</p>
            </div>
          )}

          {/* Audio Element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
