import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  NotebookPen, 
  Wallet, 
  Clock, 
  Settings as SettingsIcon
} from "lucide-react";

const navigationItems = [
  { path: "/", icon: NotebookPen, label: "Notes" },
  { path: "/expenses", icon: Wallet, label: "Expenses" },
  { path: "/reminders", icon: Clock, label: "Reminders" },
  { path: "/settings", icon: SettingsIcon, label: "Settings" },
];

export function BottomNavigation() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card dark:bg-card border-t border-border z-50">
      <div className="max-w-sm mx-auto flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "navigation-item flex flex-col items-center py-2 px-4 rounded-lg transition-colors",
                isActive && "active"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
