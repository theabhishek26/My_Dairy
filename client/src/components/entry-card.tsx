import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "./audio-player";
import { EntryWithMedia } from "@shared/schema";
import { PenTool, Mic, Camera, Layers, Heart, Bookmark } from "lucide-react";

interface EntryCardProps {
  entry: EntryWithMedia;
}

export function EntryCard({ entry }: EntryCardProps) {
  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <PenTool className="w-4 h-4 text-white" />;
      case 'voice':
        return <Mic className="w-4 h-4 text-white" />;
      case 'photo':
        return <Camera className="w-4 h-4 text-white" />;
      case 'mixed':
        return <Layers className="w-4 h-4 text-white" />;
      default:
        return <PenTool className="w-4 h-4 text-white" />;
    }
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'from-primary to-primary-light';
      case 'voice':
        return 'from-accent to-accent-blue';
      case 'photo':
        return 'from-secondary to-secondary-light';
      case 'mixed':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-primary to-primary-light';
    }
  };

  const images = entry.mediaFiles.filter(file => file.mimeType.startsWith('image/'));
  const audioFiles = entry.mediaFiles.filter(file => file.mimeType.startsWith('audio/'));
  const videoFiles = entry.mediaFiles.filter(file => file.mimeType.startsWith('video/'));

  return (
    <Card className="glass-effect border-0 entry-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white/80 via-white/60 to-purple-50/40 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-indigo-800/40 backdrop-blur-lg rounded-2xl">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${getEntryTypeColor(entry.type)} rounded-full flex items-center justify-center shadow-lg`}>
              {getEntryTypeIcon(entry.type)}
            </div>
            <Badge variant="secondary" className="text-xs bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-white/20">
              {entry.type}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground font-mono bg-white/30 dark:bg-gray-700/30 px-2 py-1 rounded-full">
              {format(new Date(entry.createdAt), 'h:mm a')}
            </span>
            {entry.isFavorite && <Heart className="w-4 h-4 text-red-500 fill-current" />}
            {entry.isBookmarked && <Bookmark className="w-4 h-4 text-blue-500 fill-current" />}
          </div>
        </div>

        {/* Title */}
        {entry.title && (
          <h3 className="font-bold text-xl mb-3 text-foreground bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {entry.title}
          </h3>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div className={`mb-4 rounded-2xl overflow-hidden shadow-lg ${images.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
            {images.slice(0, 4).map((image, index) => (
              <img
                key={image.id}
                src={image.url}
                alt={image.originalName}
                className={`w-full object-cover transition-transform duration-300 hover:scale-105 ${images.length === 1 ? 'h-40' : 'h-28'}`}
              />
            ))}
          </div>
        )}

        {/* Audio Players */}
        {audioFiles.length > 0 && (
          <div className="mb-3 space-y-2">
            {audioFiles.map((audio) => (
              <AudioPlayer
                key={audio.id}
                audioUrl={audio.url}
                duration={audio.duration}
                fileName={audio.originalName}
              />
            ))}
          </div>
        )}

        {/* Video Files */}
        {videoFiles.length > 0 && (
          <div className="mb-3 space-y-2">
            {videoFiles.map((video) => (
              <div key={video.id} className="bg-muted rounded-xl overflow-hidden">
                <video
                  src={video.url}
                  controls
                  className="w-full h-32 object-cover"
                  poster={video.thumbnailUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {entry.content && (
          <p className="text-sm text-foreground mb-4 leading-relaxed bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            {entry.content}
          </p>
        )}

        {/* Transcriptions */}
        {entry.mediaFiles.some(file => file.transcriptions?.length > 0) && (
          <div className="mb-3 bg-muted/50 rounded-xl p-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Transcription</h4>
            {entry.mediaFiles.map(file => 
              file.transcriptions?.map(transcription => (
                <p key={transcription.id} className="text-sm text-foreground italic">
                  "{transcription.text}"
                </p>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {entry.title ? entry.title : format(new Date(entry.entryDate), 'MMMM d, yyyy')}
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 hover:text-red-500 transition-colors"
            >
              <Heart className={`w-4 h-4 ${entry.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 hover:text-accent transition-colors"
            >
              <Bookmark className={`w-4 h-4 ${entry.isBookmarked ? 'fill-accent text-accent' : ''}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
