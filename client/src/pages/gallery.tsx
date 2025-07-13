import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { PhotoViewer } from "@/components/photo-viewer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EntryWithMedia } from "@shared/schema";
import { format } from "date-fns";
import { Grid, List, Image, Mic, Video, FileText } from "lucide-react";

export default function Gallery() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video' | 'audio'>('all');

  const { data: entries } = useQuery<EntryWithMedia[]>({
    queryKey: ['/api/entries'],
    staleTime: 1000 * 60 * 5,
  });

  const mediaEntries = entries?.filter(entry => 
    entry.mediaFiles.length > 0 && 
    (filterType === 'all' || entry.type === filterType || entry.type === 'mixed')
  ) || [];

  const allMediaFiles = mediaEntries.flatMap(entry => 
    entry.mediaFiles.map(media => ({ ...media, entry }))
  );

  const photoFiles = allMediaFiles.filter(media => media.mimeType.startsWith('image/'));
  const videoFiles = allMediaFiles.filter(media => media.mimeType.startsWith('video/'));
  const audioFiles = allMediaFiles.filter(media => media.mimeType.startsWith('audio/'));

  const getMediaIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (mimeType.startsWith('audio/')) return <Mic className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getMediaTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'from-secondary to-secondary-light';
    if (mimeType.startsWith('video/')) return 'from-purple-500 to-pink-500';
    if (mimeType.startsWith('audio/')) return 'from-accent to-accent-blue';
    return 'from-primary to-primary-light';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative z-10 min-h-screen">
      <Header />
      <main className="pb-24">
        <div className="p-4 pt-6">
          {/* Gallery Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-playfair font-semibold text-foreground">Gallery</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="w-10 h-10 p-0 rounded-full"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="w-10 h-10 p-0 rounded-full"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            <Button
              variant={filterType === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('all')}
              className="rounded-full glass-effect"
            >
              All ({allMediaFiles.length})
            </Button>
            <Button
              variant={filterType === 'photo' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('photo')}
              className="rounded-full glass-effect"
            >
              <Image className="w-4 h-4 mr-2" />
              Photos ({photoFiles.length})
            </Button>
            <Button
              variant={filterType === 'video' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('video')}
              className="rounded-full glass-effect"
            >
              <Video className="w-4 h-4 mr-2" />
              Videos ({videoFiles.length})
            </Button>
            <Button
              variant={filterType === 'audio' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('audio')}
              className="rounded-full glass-effect"
            >
              <Mic className="w-4 h-4 mr-2" />
              Audio ({audioFiles.length})
            </Button>
          </div>

          {/* Gallery Content */}
          {allMediaFiles.length === 0 ? (
            <Card className="glass-effect border-0 text-center py-12">
              <CardContent className="p-6">
                <div className="text-muted-foreground">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <Image className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-playfair font-semibold text-lg mb-2">No Media Files</h3>
                  <p className="text-sm">Start creating entries with photos, videos, or audio recordings.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-3">
                  {allMediaFiles.map((media) => (
                    <Card 
                      key={media.id} 
                      className="glass-effect border-0 entry-card cursor-pointer"
                      onClick={() => setSelectedMedia(media)}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square relative overflow-hidden rounded-t-lg">
                          {media.mimeType.startsWith('image/') ? (
                            <img 
                              src={media.url} 
                              alt={media.originalName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-r ${getMediaTypeColor(media.mimeType)} flex items-center justify-center`}>
                              {getMediaIcon(media.mimeType)}
                            </div>
                          )}
                          
                          {/* Media Type Badge */}
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-xs">
                              {media.mimeType.split('/')[0]}
                            </Badge>
                          </div>
                          
                          {/* Duration for audio/video */}
                          {media.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                              {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3">
                          <p className="text-sm font-medium mb-1 truncate">{media.originalName}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatFileSize(media.size)}</span>
                            <span>{format(new Date(media.createdAt), 'MMM d')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {allMediaFiles.map((media) => (
                    <Card 
                      key={media.id} 
                      className="glass-effect border-0 entry-card cursor-pointer"
                      onClick={() => setSelectedMedia(media)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            {media.mimeType.startsWith('image/') ? (
                              <img 
                                src={media.url} 
                                alt={media.originalName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-r ${getMediaTypeColor(media.mimeType)} flex items-center justify-center`}>
                                {getMediaIcon(media.mimeType)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium mb-1 truncate">{media.originalName}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>{formatFileSize(media.size)}</span>
                              <span>{format(new Date(media.createdAt), 'MMM d, yyyy')}</span>
                              {media.duration && (
                                <span>{Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}</span>
                              )}
                            </div>
                          </div>
                          
                          <Badge variant="secondary" className="text-xs">
                            {media.mimeType.split('/')[0]}
                          </Badge>
                        </div>
                        
                        {media.caption && (
                          <p className="text-sm text-muted-foreground mt-3 truncate">{media.caption}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {selectedMedia && (
        <PhotoViewer
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
      
      <BottomNavigation />
    </div>
  );
}
