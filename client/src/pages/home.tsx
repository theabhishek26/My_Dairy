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
import { Calendar, ChevronLeft, ChevronRight, PenTool, Mic, Camera, Layers, Heart, Bookmark, ChevronDown, ChevronUp } from "lucide-react";

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
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
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
        {/* Date Navigation */}
        <div className="p-4 pt-6">
          <Card className="glass-effect border-0 mb-6 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/30 dark:to-pink-900/30 backdrop-blur-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                  className="w-10 h-10 p-0 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </h2>
                    <p className="text-sm text-purple-600/70 dark:text-purple-400/70">
                      {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
                    </p>
                  </div>
                  <Input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        const [year, month, day] = dateValue.split('-').map(Number);
                        const localDate = new Date(year, month - 1, day);
                        setSelectedDate(localDate);
                      }
                    }}
                    className="w-32 text-xs bg-white/70 dark:bg-gray-800/70 border-purple-200 dark:border-purple-700"
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('next')}
                  className="w-10 h-10 p-0 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="glass-effect border-0 text-center bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/50 dark:to-pink-900/50 backdrop-blur-lg rounded-2xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">{totalEntries}</div>
                <div className="text-xs text-muted-foreground font-medium">Total Entries</div>
              </CardContent>
            </Card>
            <Card className="glass-effect border-0 text-center bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/50 dark:to-indigo-900/50 backdrop-blur-lg rounded-2xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">{voiceEntries}</div>
                <div className="text-xs text-muted-foreground font-medium">Voice Notes</div>
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
            {isToday(selectedDate) ? 'Today\'s Entries' : `Entries for ${format(selectedDate, 'MMM d')}`}
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
                  <h3 className="text-lg font-medium mb-2">No entries for this date</h3>
                  <p className="text-sm">Click the + button to create your first entry for this day!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <FloatingActionButton />
      <BottomNavigation />
    </div>
  );
}
