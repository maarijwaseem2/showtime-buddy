import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Film, Ticket, Shield, LogIn, LogOut, User, Menu, UserPlus } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === "ADMIN";

  const navCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "text-sm font-medium transition-smooth hover:text-foreground py-2",
      isActive ? "text-foreground" : "text-muted-foreground"
    );

  const mobileNavCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-smooth",
      isActive
        ? "bg-primary/15 text-primary"
        : "text-foreground hover:bg-secondary"
    );

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 pt-[env(safe-area-inset-top)]">
      <section className="container flex h-14 sm:h-16 items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 group shrink-0 min-w-0">
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow transition-smooth group-hover:scale-105">
            <Film className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
          </span>
          <span className="text-base sm:text-xl font-bold tracking-tight truncate">
            Cine<span className="text-gradient-primary">Slot</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main">
          <NavLink to="/" end className={navCls}>Movies</NavLink>
          {user && <NavLink to="/bookings" className={navCls}>My Bookings</NavLink>}
          {isAdmin && (
            <NavLink to="/admin" className={navCls}>
              <span className="inline-flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Admin
              </span>
            </NavLink>
          )}
        </nav>

        <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
          {isAdmin && (
            <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold">
              <Shield className="h-3 w-3" /> Admin
            </span>
          )}

          {/* Desktop auth actions */}
          <section className="hidden md:flex items-center gap-1.5 sm:gap-2">
            {user ? (
              <>
                <span className="hidden lg:inline-flex items-center gap-1 text-xs text-muted-foreground max-w-[120px] xl:max-w-[160px] truncate">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  {user.fullName}
                </span>
                <Link
                  to="/bookings"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-medium hover:bg-muted transition-smooth"
                >
                  <Ticket className="h-4 w-4" />
                  Tickets
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()} className="h-9">
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="h-9">
                  <Link to="/login">
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Link>
                </Button>
                <Button asChild size="sm" className="h-9 bg-gradient-primary shadow-glow">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </section>

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden h-9 w-9 shrink-0"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,320px)] flex flex-col">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-left">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                    <Film className="h-4 w-4 text-primary-foreground" />
                  </span>
                  CineSlot
                </SheetTitle>
              </SheetHeader>

              {user && (
                <p className="text-sm text-muted-foreground px-1 -mt-2 truncate">
                  {user.fullName} · {user.email}
                </p>
              )}

              <nav className="flex flex-col gap-1 mt-4 flex-1" aria-label="Mobile">
                <SheetClose asChild>
                  <NavLink to="/" end className={mobileNavCls} onClick={closeMenu}>
                    Movies
                  </NavLink>
                </SheetClose>
                {user && (
                  <SheetClose asChild>
                    <NavLink to="/bookings" className={mobileNavCls} onClick={closeMenu}>
                      <Ticket className="h-5 w-5" /> My Bookings
                    </NavLink>
                  </SheetClose>
                )}
                {isAdmin && (
                  <SheetClose asChild>
                    <NavLink to="/admin" className={mobileNavCls} onClick={closeMenu}>
                      <Shield className="h-5 w-5" /> Admin Dashboard
                    </NavLink>
                  </SheetClose>
                )}
              </nav>

              <footer className="mt-auto pt-4 border-t border-border/60 flex flex-col gap-2">
                {user ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </Button>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/login" onClick={closeMenu}>
                          <LogIn className="h-4 w-4" /> Sign in
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full bg-gradient-primary shadow-glow">
                        <Link to="/signup" onClick={closeMenu}>
                          <UserPlus className="h-4 w-4" /> Create account
                        </Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </footer>
            </SheetContent>
          </Sheet>
        </nav>
      </section>
    </header>
  );
};

export default Header;
