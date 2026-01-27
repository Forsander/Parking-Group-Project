import { Link, useLocation } from "react-router-dom";
import { Search, Calendar, ParkingSquare, User } from "lucide-react";

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Search, label: "Browse" },
    { path: "/bookings", icon: Calendar, label: "Bookings" },
    { path: "/my-spots", icon: ParkingSquare, label: "My Spots" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
      <div className="mx-auto flex max-w-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
