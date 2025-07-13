import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useVoiceRecording } from "@/hooks/use-voice-recording";
import { Mic, Square, Play, Pause, X, Check, Volume2 } from "lucide-react";

interface EnhancedVoiceRecordingProps {
  onSave: (audioData: Blob, transcription: string) => void;
  onCancel: () => void;
}

export function EnhancedVoiceRecording({ onSave, onCancel }: EnhancedVoiceRecordingProps) {
  const [transcription, setTranscription] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [maxDuration] = useState(300); // 5 minutes max
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

  // Simulate real-time transcription during recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      const interval = setInterval(() => {
        // Simulate transcription chunks appearing
        const sampleTexts = [
          "I'm recording my thoughts today...",
          "The weather is really nice and I feel great.",
          "I want to remember this moment because it's special.",
          "Life has been treating me well lately.",
          "I'm grateful for all the wonderful experiences.",
          "Today I learned something new and exciting.",
          "The world seems full of possibilities right now."
        ];
        
        if (duration > 2 && transcription.length < 200) {
          const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
          if (!transcription.includes(randomText.slice(0, 10))) {
            setTranscription(prev => prev + (prev ? " " : "") + randomText);
          }
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isRecording, isPaused, duration, transcription]);

  // Handle audio playback time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime || 0);
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('ended', () => setIsPlaying(false));
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      onSave(audioBlob, transcription);
    }
  };

  const handleCancel = () => {
    clearRecording();
    setTranscription("");
    onCancel();
  };

  const progressPercentage = (duration / maxDuration) * 100;
  const isMaxDurationReached = duration >= maxDuration;

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-sm border-green-200/50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* Recording Status */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              {isRecording && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
              <span className="text-lg font-semibold text-green-700 dark:text-green-300">
                {isRecording ? (isPaused ? "Recording Paused" : "Recording...") : audioBlob ? "Recording Complete" : "Ready to Record"}
              </span>
            </div>

            {/* Duration and Progress */}
            <div className="space-y-2">
              <div className="text-2xl font-mono font-bold text-green-600 dark:text-green-400">
                {formatTime(duration)} / {formatTime(maxDuration)}
              </div>
              <Progress 
                value={progressPercentage} 
                className="w-full h-2 bg-green-100 dark:bg-green-900/50"
              />
              {isMaxDurationReached && (
                <p className="text-sm text-red-500">Maximum recording duration reached</p>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex justify-center space-x-4">
              {!audioBlob && (
                <>
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
                    >
                      <Mic className="w-8 h-8 text-white" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={isPaused ? resumeRecording : pauseRecording}
                        variant="outline"
                        className="w-12 h-12 rounded-full"
                      >
                        {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                      </Button>
                      <Button
                        onClick={stopRecording}
                        className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600"
                      >
                        <Square className="w-6 h-6 text-white" />
                      </Button>
                    </>
                  )}
                </>
              )}

              {audioBlob && (
                <div className="flex space-x-2">
                  <Button
                    onClick={handlePlayPause}
                    variant="outline"
                    className="w-12 h-12 rounded-full"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </Button>
                  <Button
                    onClick={clearRecording}
                    variant="outline"
                    className="w-12 h-12 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              )}
            </div>

            {audioUrl && (
              <>
                <audio ref={audioRef} src={audioUrl} preload="metadata" />
                {audioBlob && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Volume2 className="w-4 h-4" />
                    <Progress 
                      value={(currentTime / (audioRef.current?.duration || 1)) * 100} 
                      className="w-32 h-1"
                    />
                    <span className="font-mono">
                      {formatTime(currentTime)} / {formatTime(audioRef.current?.duration || 0)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Transcription */}
      {(isRecording || transcription) && (
        <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 backdrop-blur-sm border-blue-200/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4">
              Live Transcription
            </h3>
            <Textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder={isRecording ? "Transcription will appear here as you speak..." : "Edit your transcription if needed"}
              className="min-h-32 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-blue-200/50 focus:border-blue-400 resize-none"
              readOnly={isRecording}
            />
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {audioBlob && (
        <div className="flex justify-end space-x-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="px-6"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Recording
          </Button>
        </div>
      )}
    </div>
  );
}