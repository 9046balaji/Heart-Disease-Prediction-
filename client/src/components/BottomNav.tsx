import { Home, Activity, Dumbbell, Utensils, User, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function BottomNav() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Activity, label: "Health", path: "/health" },
    { icon: Dumbbell, label: "Exercise", path: "/exercise" },
    { icon: Utensils, label: "Nutrition", path: "/nutrition" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-40" data-testid="nav-bottom">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-6 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors hover-elevate ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}