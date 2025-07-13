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
    <header className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-purple-100">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center floating-animation">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-playfair font-bold text-foreground">My Diary</h1>
            <p className="text-xs text-muted-foreground font-mono">
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
                className="w-8 h-8 p-0 bg-gradient-to-r from-accent to-accent-blue rounded-full text-white hover:opacity-80"
              >
                <Search className="w-4 h-4" />
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 bg-gradient-to-r from-secondary to-secondary-light rounded-full text-white hover:opacity-80"
                  >
                    <User className="w-4 h-4" />
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
