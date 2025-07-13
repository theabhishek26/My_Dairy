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
    <Card className="glass-effect border-0 entry-card">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 bg-gradient-to-r ${getEntryTypeColor(entry.type)} rounded-full flex items-center justify-center`}>
              {getEntryTypeIcon(entry.type)}
            </div>
            <Badge variant="secondary" className="text-xs">
              {entry.type}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {format(new Date(entry.createdAt), 'h:mm a')}
          </span>
        </div>

        {/* Title */}
        {entry.title && (
          <h3 className="font-playfair font-semibold text-lg mb-2 text-foreground">
            {entry.title}
          </h3>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div className={`mb-3 rounded-xl overflow-hidden ${images.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
            {images.slice(0, 4).map((image, index) => (
              <img
                key={image.id}
                src={image.url}
                alt={image.originalName}
                className={`w-full object-cover ${images.length === 1 ? 'h-32' : 'h-24'}`}
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
          <p className="text-sm text-foreground mb-3 leading-relaxed">
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
