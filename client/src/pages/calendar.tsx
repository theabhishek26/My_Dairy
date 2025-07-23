import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModernEntryCreationModal } from "@/components/modern-entry-creation-modal";
import { EntryWithMedia } from "@shared/schema";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Mic, Camera, PenTool, Plus } from "lucide-react";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryDate, setEntryDate] = useState<Date>(new Date());

  const { data: entries } = useQuery<EntryWithMedia[]>({
    queryKey: ['/api/entries'],
    staleTime: 1000 * 60 * 5,
  });

  const { data: selectedDateEntries } = useQuery<EntryWithMedia[]>({
    queryKey: ['/api/entries/date', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''],
    enabled: !!selectedDate,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEntriesForDate = (date: Date) => {
    return entries?.filter(entry => 
      isSameDay(new Date(entry.entryDate), date)
    ) || [];
  };

  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return <Mic className="w-3 h-3 text-white" />;
      case 'photo':
        return <Camera className="w-3 h-3 text-white" />;
      case 'text':
        return <PenTool className="w-3 h-3 text-white" />;
      default:
        return <CalendarIcon className="w-3 h-3 text-white" />;
    }
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'voice':
        return 'from-accent to-accent-blue';
      case 'photo':
        return 'from-secondary to-secondary-light';
      case 'text':
        return 'from-primary to-primary-light';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const today = new Date();
    const currentYear = today.getFullYear();
    
    if (direction === 'next') {
      newDate.setMonth(newDate.getMonth() + 1);
      // Prevent navigating beyond current month/year
      if (newDate.getFullYear() > currentYear || 
          (newDate.getFullYear() === currentYear && newDate.getMonth() > today.getMonth())) {
        return;
      }
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
      // Limit to current year only
      if (newDate.getFullYear() < currentYear) {
        return;
      }
    }
    
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    const today = new Date();
    // Only allow selecting dates that are not in the future
    if (date <= today) {
      setSelectedDate(date);
    }
  };

  const handleAddEntry = (date: Date) => {
    const today = new Date();
    // Only allow adding entries for today or past dates
    if (date <= today) {
      setEntryDate(date);
      setIsEntryModalOpen(true);
    }
  };

  return (
    <div className="relative z-10 min-h-screen">
      <Header />
      <main className="pb-24">
        <div className="p-4 pt-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="w-10 h-10 p-0 rounded-full glass-effect"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <h2 className="text-xl font-playfair font-semibold text-foreground">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={currentDate.getFullYear() === new Date().getFullYear() && currentDate.getMonth() >= new Date().getMonth()}
              className="w-10 h-10 p-0 rounded-full glass-effect disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <Card className="glass-effect border-0">
            <CardContent className="p-4">
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={`weekday-${index}`} className="text-center text-xs text-muted-foreground font-medium py-2">
                    {day.charAt(0)}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const dayEntries = getEntriesForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isCurrentDay = isToday(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isFutureDate = day > new Date();

                  return (
                    <div
                      key={`calendar-day-${day.getTime()}`}
                      className={`
                        relative text-sm py-2 px-1 rounded-lg transition-all duration-200 min-h-[40px] group
                        ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                        ${isCurrentDay ? 'bg-gradient-to-r from-primary to-primary-light text-white font-medium' : ''}
                        ${isSelected ? 'bg-gradient-to-r from-accent to-accent-blue text-white' : ''}
                        ${!isCurrentDay && !isSelected && !isFutureDate ? 'hover:bg-muted' : ''}
                        ${dayEntries.length > 0 && !isCurrentDay && !isSelected ? 'bg-gradient-to-r from-secondary/20 to-secondary-light/20' : ''}
                        ${isFutureDate ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <button 
                        onClick={() => handleDateClick(day)}
                        disabled={isFutureDate}
                        className="w-full h-full disabled:cursor-not-allowed"
                      >
                        <div className="text-center">
                          {format(day, 'd')}
                        </div>
                        
                        {/* Entry Indicators */}
                        {dayEntries.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                            {dayEntries.slice(0, 3).map((entry, index) => (
                              <div
                                key={`entry-indicator-${entry.id}-${index}`}
                                className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${getEntryTypeColor(entry.type)}`}
                              />
                            ))}
                            {dayEntries.length > 3 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-gray-400 to-gray-500" />
                            )}
                          </div>
                        )}
                      </button>
                      
                      {/* Add Entry Button - Only show for current/past dates */}
                      {!isFutureDate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddEntry(day);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110 border border-white/30"
                        >
                          <Plus className="w-3 h-3 text-white font-bold stroke-[3]" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Entries - Highlights Only */}
          {selectedDate && selectedDateEntries && selectedDateEntries.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-playfair font-semibold text-foreground mb-4">
                📔 {format(selectedDate, 'MMMM d, yyyy')} ({selectedDateEntries.length} {selectedDateEntries.length === 1 ? 'entry' : 'entries'})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDateEntries.slice(0, 4).map((entry) => (
                  <Card key={entry.id} className="glass-effect border-0 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 bg-gradient-to-r ${getEntryTypeColor(entry.type)} rounded-full flex items-center justify-center`}>
                          {getEntryTypeIcon(entry.type)}
                        </div>
                        <h4 className="font-medium text-sm truncate flex-1">{entry.title}</h4>
                        <span className="text-xs text-muted-foreground">{format(new Date(entry.createdAt), 'h:mm a')}</span>
                      </div>
                      
                      {entry.content && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {entry.content}
                        </p>
                      )}
                      
                      {entry.mediaFiles.length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="flex space-x-1">
                            {entry.mediaFiles.slice(0, 2).map((media) => (
                              <div key={media.id} className="w-4 h-4 bg-muted rounded flex items-center justify-center">
                                {media.mimeType.startsWith('image/') ? (
                                  <Camera className="w-2 h-2" />
                                ) : (
                                  <Mic className="w-2 h-2" />
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground ml-1">
                            {entry.mediaFiles.length} file{entry.mediaFiles.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {selectedDateEntries.length > 4 && (
                <Card className="glass-effect border-0 mt-3">
                  <CardContent className="p-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      +{selectedDateEntries.length - 4} more entries for this day
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation />
      
      {/* Entry Creation Modal */}
      <ModernEntryCreationModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        initialDate={entryDate}
      />
    </div>
  );
}
