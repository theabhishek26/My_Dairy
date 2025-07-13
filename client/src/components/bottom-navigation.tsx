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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-10">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around py-3">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
