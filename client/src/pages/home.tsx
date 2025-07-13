import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { FloatingActionButton } from "@/components/floating-action-button";
import { EntryCard } from "@/components/entry-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EntryWithMedia } from "@shared/schema";
import { format } from "date-fns";

export default function Home() {
  const { data: entries, isLoading } = useQuery<EntryWithMedia[]>({
    queryKey: ['/api/entries'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: todayEntries } = useQuery<EntryWithMedia[]>({
    queryKey: ['/api/entries/date', format(new Date(), 'yyyy-MM-dd')],
    staleTime: 1000 * 60 * 5,
  });

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
  const recentEntries = entries?.slice(0, 10) || [];

  return (
    <div className="relative z-10 min-h-screen">
      <Header />
      <main className="pb-24">
        {/* Quick Stats */}
        <div className="p-4 pt-6">
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
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">{photoEntries}</div>
                <div className="text-xs text-muted-foreground font-medium">Photos</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="px-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">✨ Recent Entries</h2>
          
          {recentEntries.length === 0 ? (
            <Card className="glass-effect border-0 text-center py-16 bg-gradient-to-br from-white/70 via-blue-50/60 to-purple-50/70 dark:from-gray-800/70 dark:via-indigo-800/60 dark:to-purple-800/70 backdrop-blur-lg rounded-2xl">
              <CardContent className="p-8">
                <div className="text-muted-foreground mb-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-xl mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">🌟 Start Your Journey</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Create your first diary entry to begin capturing your memories and experiences.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentEntries.map((entry, index) => (
                <div key={entry.id} className="slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <EntryCard entry={entry} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Entries Preview */}
        {todayEntries && todayEntries.length > 0 && (
          <div className="px-4 pt-6">
            <h2 className="text-lg font-playfair font-semibold text-foreground mb-4">Today's Entries</h2>
            <div className="grid grid-cols-2 gap-3">
              {todayEntries.slice(0, 4).map((entry) => (
                <Card key={entry.id} className="glass-effect border-0 p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {format(new Date(entry.createdAt), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">
                    {entry.title || entry.content || 'Untitled Entry'}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <FloatingActionButton />
      <BottomNavigation />
    </div>
  );
}
