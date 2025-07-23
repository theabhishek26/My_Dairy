import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Calendar, Image, Settings } from "lucide-react";

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/gallery", icon: Image, label: "Gallery" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white/95 via-purple-50/90 to-pink-50/95 dark:from-gray-900/95 dark:via-purple-900/90 dark:to-pink-900/95 backdrop-blur-xl border-t border-purple-200/30 dark:border-purple-700/30 z-10 shadow-lg">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around py-4">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center space-y-1 h-auto py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-sm' : ''}`} />
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
