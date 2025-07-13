import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Share2, ZoomIn, ZoomOut } from "lucide-react";

interface PhotoViewerProps {
  media: any;
  onClose: () => void;
}

export function PhotoViewer({ media, onClose }: PhotoViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.originalName;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: media.originalName,
          text: media.caption || 'Shared from diary',
          url: media.url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(media.url);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - translate.x,
        y: e.clientY - translate.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setTranslate({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="text-white">
          <h3 className="font-medium">{media.originalName}</h3>
          <p className="text-sm text-white/70">{media.caption}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="text-white hover:bg-white/10"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="text-white hover:bg-white/10"
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-white hover:bg-white/10"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Image Container */}
      <div
        ref={imageRef}
        className="relative max-w-full max-h-full flex items-center justify-center cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {media.mimeType.startsWith('image/') ? (
          <img
            src={media.url}
            alt={media.originalName}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) translate(${translate.x / zoom}px, ${translate.y / zoom}px)`,
            }}
            draggable={false}
          />
        ) : media.mimeType.startsWith('video/') ? (
          <video
            src={media.url}
            controls
            className="max-w-full max-h-full"
            style={{
              transform: `scale(${zoom}) translate(${translate.x / zoom}px, ${translate.y / zoom}px)`,
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <Card className="glass-effect border-0 p-8">
            <CardContent className="text-center text-white">
              <div className="text-4xl mb-4">🎵</div>
              <p>Audio file: {media.originalName}</p>
              <audio src={media.url} controls className="mt-4" />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Zoom Indicator */}
      {zoom !== 1 && (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
}
