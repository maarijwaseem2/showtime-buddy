import { Link, NavLink } from "react-router-dom";
import { Film, Ticket, Shield } from "lucide-react";
import { useBookingStore } from "@/store/booking";
import { cn } from "@/lib/utils";

const Header = () => {
  const isAdmin = useBookingStore((s) => s.isAdmin);

  const navCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "text-sm font-medium transition-smooth hover:text-foreground",
      isActive ? "text-foreground" : "text-muted-foreground"
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow transition-smooth group-hover:scale-105">
            <Film className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Cine<span className="text-gradient-primary">Slot</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navCls}>Movies</NavLink>
          <NavLink to="/bookings" className={navCls}>My Bookings</NavLink>
          <NavLink to="/admin" className={navCls}>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Admin
            </span>
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">
              <Shield className="h-3 w-3" /> Admin
            </span>
          )}
          <Link
            to="/bookings"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium hover:bg-muted transition-smooth"
            aria-label="My bookings"
          >
            <Ticket className="h-4 w-4" />
            <span className="hidden sm:inline">Tickets</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
