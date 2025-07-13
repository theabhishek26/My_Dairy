import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { format } from "date-fns";
import { BookOpen, Search, User, Menu, X } from "lucide-react";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Search query:", searchQuery);
    setIsSearchOpen(false);
  };

  return (
    <header className="relative z-10 bg-gradient-to-r from-white/90 via-purple-50/80 to-pink-50/90 dark:from-gray-900/90 dark:via-purple-900/80 dark:to-pink-900/90 backdrop-blur-xl border-b border-purple-200/50 shadow-lg">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">✨ My Diary</h1>
            <p className="text-sm text-muted-foreground font-medium bg-white/30 dark:bg-gray-700/30 px-2 py-1 rounded-full">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isSearchOpen ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 p-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-white hover:scale-110 transition-all duration-300 shadow-lg"
              >
                <Search className="w-5 h-5" />
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 p-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-white hover:scale-110 transition-all duration-300 shadow-lg"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 glass-effect border-0">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-playfair font-semibold">Diary User</h3>
                      <p className="text-sm text-muted-foreground">diary@example.com</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Profile Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Export Diary
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Menu className="w-4 h-4 mr-2" />
                      Preferences
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-32 h-8 text-sm"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
                className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
