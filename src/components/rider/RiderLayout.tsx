import { ReactNode } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { useRiderCheck } from "@/hooks/useRiderCheck";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bike, LayoutDashboard, Package, User, LogOut } from "lucide-react";

interface RiderLayoutProps {
  children: ReactNode;
  title?: string;
}

const navItems = [
  { title: "Dashboard", url: "/rider", icon: LayoutDashboard },
  { title: "Orders", url: "/rider/orders", icon: Package },
  { title: "Profile", url: "/rider/profile", icon: User },
];

export default function RiderLayout({ children, title }: RiderLayoutProps) {
  const { isRider, loading, user } = useRiderCheck();
  const { signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/rider/login" replace />;
  if (!isRider) return <Navigate to="/" replace />;

  const isActive = (path: string) =>
    path === "/rider" ? location.pathname === "/rider" : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top nav */}
      <header className="h-14 flex items-center border-b border-border px-4 gap-4 bg-card shrink-0">
        <Bike className="w-6 h-6 text-primary" />
        <span className="font-heading font-bold text-foreground">Rider Panel</span>
        <div className="flex-1" />
        {title && <span className="text-sm font-medium text-muted-foreground hidden sm:block">{title}</span>}
      </header>

      <div className="flex flex-1">
        {/* Side nav */}
        <nav className="w-16 md:w-52 border-r border-border bg-card flex flex-col py-4 shrink-0">
          {navItems.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                isActive(item.url)
                  ? "bg-primary/10 text-primary font-semibold border-r-2 border-primary"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="hidden md:inline">{item.title}</span>
            </Link>
          ))}
          <div className="flex-1" />
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </nav>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around py-2 z-50">
        {navItems.map((item) => (
          <Link
            key={item.url}
            to={item.url}
            className={`flex flex-col items-center gap-0.5 text-xs ${
              isActive(item.url) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
