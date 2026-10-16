import { Link } from "react-router-dom";
import { Film } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/60 mt-12 sm:mt-20 pb-[env(safe-area-inset-bottom)]">
    <section className="container py-8 sm:py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3 text-sm text-muted-foreground">
      <section>
        <Link to="/" className="flex items-center gap-2 mb-3 w-fit">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
            <Film className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="text-lg font-bold text-foreground">
            Show<span className="text-gradient-primary">Seat</span>
          </span>
        </Link>
        <p className="max-w-xs">Book the best seats at your favorite cinemas in seconds.</p>
      </section>
      <section>
        <p className="text-foreground font-semibold mb-2">Explore</p>
        <ul className="space-y-2 list-none p-0 m-0">
          <li>
            <Link to="/" className="hover:text-foreground transition-smooth">
              Now Showing
            </Link>
          </li>
          <li>
            <Link to="/" className="hover:text-foreground transition-smooth">
              Upcoming
            </Link>
          </li>
          <li>
            <Link to="/bookings" className="hover:text-foreground transition-smooth">
              My Bookings
            </Link>
          </li>
        </ul>
      </section>
      <section className="sm:col-span-2 md:col-span-1">
        <p className="text-foreground font-semibold mb-2">Account</p>
        <ul className="space-y-2 list-none p-0 m-0">
          <li>
            <Link to="/login" className="hover:text-foreground transition-smooth">
              Sign in
            </Link>
          </li>
          <li>
            <Link to="/signup" className="hover:text-foreground transition-smooth">
              Create account
            </Link>
          </li>
        </ul>
      </section>
    </section>
    <p className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground container">
      © 2026 ShowSeat. All rights reserved.
    </p>
  </footer>
);

export default Footer;
