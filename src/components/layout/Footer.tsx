import { Film } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/60 mt-20">
    <div className="container py-10 grid gap-6 md:grid-cols-3 text-sm text-muted-foreground">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
            <Film className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Cine<span className="text-gradient-primary">Slot</span>
          </span>
        </div>
        <p>Book the best seats at your favorite cinemas in seconds.</p>
      </div>
      <div>
        <p className="text-foreground font-semibold mb-2">Explore</p>
        <ul className="space-y-1.5">
          <li>Now Showing</li>
          <li>Upcoming</li>
          <li>Cinemas</li>
        </ul>
      </div>
      <div>
        <p className="text-foreground font-semibold mb-2">Support</p>
        <ul className="space-y-1.5">
          <li>Help Center</li>
          <li>Refund Policy</li>
          <li>Contact</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
      © 2026 CineSlot. All rights reserved.
    </div>
  </footer>
);

export default Footer;
