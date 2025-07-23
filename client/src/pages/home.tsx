import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { FloatingActionButton } from "@/components/floating-action-button";
import { EntryCard } from "@/components/entry-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EntryWithMedia } from "@shared/schema";
import { format, isToday } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, PenTool, Mic, Camera, Layers, Heart, Bookmark, ChevronDown, ChevronUp, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Enhanced Entry Card Component with expand/collapse functionality
interface EnhancedEntryCardProps {
  entry: EntryWithMedia;
  isExpanded: boolean;
  onToggle: () => void;
}

function EnhancedEntryCard({ entry, isExpanded, onToggle }: EnhancedEntryCardProps) {
  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <PenTool className="w-4 h-4 text-white" />;
      case 'voice': return <Mic className="w-4 h-4 text-white" />;
      case 'photo': return <Camera className="w-4 h-4 text-white" />;
      case 'mixed': return <Layers className="w-4 h-4 text-white" />;
      default: return <PenTool className="w-4 h-4 text-white" />;
    }
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'from-blue-500 to-indigo-600';
      case 'voice': return 'from-purple-500 to-pink-600';
      case 'photo': return 'from-green-500 to-emerald-600';
      case 'mixed': return 'from-orange-500 to-red-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="glass-effect border-0 entry-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white/80 via-white/60 to-purple-50/40 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-indigo-800/40 backdrop-blur-lg rounded-2xl">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${getEntryTypeColor(entry.type)} rounded-full flex items-center justify-center shadow-lg`}>
              {getEntryTypeIcon(entry.type)}
            </div>
            <div className="text-xs bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-white/20 px-2 py-1 rounded-full text-muted-foreground">
              {entry.type}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground font-mono bg-white/30 dark:bg-gray-700/30 px-2 py-1 rounded-full">
              {format(new Date(entry.createdAt), 'h:mm a')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-6 w-6 p-0 rounded-full"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Title */}
        {entry.title && (
          <h3 className="font-bold text-xl mb-3 text-foreground bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {entry.title}
          </h3>
        )}

        {/* Content */}
        {entry.content && (
          <div className="mb-4">
            <p className="text-muted-foreground leading-relaxed">
              {isExpanded ? entry.content : truncateText(entry.content)}
            </p>
          </div>
        )}

        {/* Media Files */}
        {entry.mediaFiles.length > 0 && (
          <div className="space-y-3">
            {entry.mediaFiles.map((media) => (
              <div key={media.id} className="bg-white/30 dark:bg-gray-700/30 rounded-lg p-3">
                {media.mimeType.startsWith('image/') && (
                  <img 
                    src={media.url} 
                    alt={media.originalName}
                    className="w-full max-h-64 object-cover rounded-lg mb-2"
                  />
                )}
                {media.mimeType.startsWith('audio/') && (
                  <div className="bg-white/50 dark:bg-gray-600/50 rounded-lg p-2">
                    <p className="text-sm text-muted-foreground mb-2">🎵 {media.originalName}</p>
                    <audio controls className="w-full">
                      <source src={media.url} type={media.mimeType} />
                    </audio>
                  </div>
                )}
                {media.mimeType.startsWith('video/') && (
                  <video controls className="w-full max-h-64 rounded-lg">
                    <source src={media.url} type={media.mimeType} />
                  </video>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  
  const { data: entries, isLoading } = useQuery<EntryWithMedia[]>({
    queryKey: ['/api/entries'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: dateEntries } = useQuery<EntryWithMedia[]>({
    queryKey: ['/api/entries/date', format(selectedDate, 'yyyy-MM-dd')],
    staleTime: 1000 * 60 * 5,
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    const today = new Date();
    
    if (direction === 'next') {
      newDate.setDate(newDate.getDate() + 1);
      // Prevent navigating to future dates
      if (newDate > today) {
        return;
      }
    } else {
      newDate.setDate(newDate.getDate() - 1);
      // Limit to current year only
      const currentYear = today.getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      if (newDate < startOfYear) {
        return;
      }
    }
    
    setSelectedDate(newDate);
  };

  if (isLoading) {
    return (
      <div className="relative z-10 min-h-screen">
        <Header />
        <main className="pb-24">
          <div className="p-4 pt-6">
            <div className="grid grid-cols-3 gap-3 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-effect rounded-2xl p-3">
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-effect rounded-2xl p-4">
                  <Skeleton className="h-6 w-32 mb-3" />
                  <Skeleton className="h-32 w-full mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const totalEntries = entries?.length || 0;
  const voiceEntries = entries?.filter(e => e.type === 'voice' || e.type === 'mixed').length || 0;
  const photoEntries = entries?.filter(e => e.type === 'photo' || e.type === 'mixed').length || 0;
  const todayEntries = dateEntries?.length || 0;

  return (
    <div className="relative z-10 min-h-screen">
      <Header />
      <main className="pb-24">
        {/* Enhanced Date Navigation */}
        <div className="p-4 pt-6">
          <Card className="glass-effect border-0 mb-6 bg-gradient-to-r from-purple-50/80 via-pink-50/60 to-orange-50/80 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-orange-900/30 backdrop-blur-lg rounded-3xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                  className="w-12 h-12 p-0 rounded-full bg-white/20 hover:bg-white/30 dark:bg-gray-800/20 dark:hover:bg-gray-800/30 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </Button>
                
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'date';
                      input.max = format(new Date(), 'yyyy-MM-dd');
                      input.min = format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd');
                      input.value = format(selectedDate, 'yyyy-MM-dd');
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.value) {
                          const [year, month, day] = target.value.split('-').map(Number);
                          const localDate = new Date(year, month - 1, day);
                          const today = new Date();
                          const currentYear = today.getFullYear();
                          
                          if (localDate.getFullYear() === currentYear && localDate <= today) {
                            setSelectedDate(localDate);
                          }
                        }
                      };
                      input.click();
                    }}
                    className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  >
                    <Calendar className="w-6 h-6 text-white drop-shadow-sm" />
                  </Button>
                  <div className="text-center">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-orange-600 bg-clip-text text-transparent dark:from-purple-300 dark:via-pink-400 dark:to-orange-400">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </h2>
                    <p className="text-sm font-medium text-purple-600/80 dark:text-purple-400/80">
                      {isToday(selectedDate) ? '✨ Today' : format(selectedDate, 'EEEE')}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('next')}
                  disabled={isToday(selectedDate)}
                  className="w-12 h-12 p-0 rounded-full bg-white/20 hover:bg-white/30 dark:bg-gray-800/20 dark:hover:bg-gray-800/30 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card 
              className="glass-effect border-0 text-center bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/50 dark:to-indigo-900/50 backdrop-blur-lg rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
              onClick={() => setIsVoiceModalOpen(true)}
            >
              <CardContent className="p-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">{voiceEntries}</div>
                <div className="text-xs text-muted-foreground font-medium">Voices</div>
              </CardContent>
            </Card>
            <Card 
              className="glass-effect border-0 text-center bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/50 dark:to-pink-900/50 backdrop-blur-lg rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
              onClick={() => setIsTextModalOpen(true)}
            >
              <CardContent className="p-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">{entries?.filter(e => e.type === 'text').length || 0}</div>
                <div className="text-xs text-muted-foreground font-medium">Texts</div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-0 text-center bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/50 dark:to-teal-900/50 backdrop-blur-lg rounded-2xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">{todayEntries}</div>
                <div className="text-xs text-muted-foreground font-medium">{isToday(selectedDate) ? "Today's" : "Selected"}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Date Entries */}
        <div className="space-y-4">
          <h2 className="text-xl font-playfair font-semibold text-foreground px-4">
            {isToday(selectedDate) ? 'Today\'s Journal' : `Journal from ${format(selectedDate, 'MMM d')}`}
          </h2>
          {dateEntries && dateEntries.length > 0 ? (
            dateEntries.map((entry) => (
              <div key={entry.id} className="px-4">
                <EnhancedEntryCard 
                  entry={entry} 
                  isExpanded={expandedEntry === entry.id}
                  onToggle={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                />
              </div>
            ))
          ) : (
            <Card className="glass-effect border-0 mx-4">
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No memories captured</h3>
                  <p className="text-sm">Click the + button to start your journal for this day!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <FloatingActionButton currentDate={selectedDate} />
      <BottomNavigation />
      
      {/* Voice Entries Modal */}
      <Dialog open={isVoiceModalOpen} onOpenChange={setIsVoiceModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white/95 via-white/90 to-purple-50/80 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-indigo-900/80 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              <Mic className="w-5 h-5 text-blue-600" />
              Voice Entries
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {entries?.filter(entry => entry.type === 'voice' || entry.type === 'mixed').map((entry) => (
              <Card key={entry.id} className="glass-effect border-0 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{entry.title}</h3>
                    <span className="text-xs text-muted-foreground">{format(new Date(entry.createdAt), 'MMM d')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{entry.content}</p>
                  {entry.mediaFiles.length > 0 && (
                    <div className="text-xs text-blue-600 font-medium">
                      🎙️ {entry.mediaFiles.length} audio file(s)
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {entries?.filter(entry => entry.type === 'voice' || entry.type === 'mixed').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No voice entries yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Text Entries Modal */}
      <Dialog open={isTextModalOpen} onOpenChange={setIsTextModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white/95 via-white/90 to-purple-50/80 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-indigo-900/80 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              <PenTool className="w-5 h-5 text-purple-600" />
              Text Entries
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {entries?.filter(entry => entry.type === 'text').map((entry) => (
              <Card key={entry.id} className="glass-effect border-0 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{entry.title}</h3>
                    <span className="text-xs text-muted-foreground">{format(new Date(entry.createdAt), 'MMM d')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
                </CardContent>
              </Card>
            ))}
            {entries?.filter(entry => entry.type === 'text').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <PenTool className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No text entries yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
