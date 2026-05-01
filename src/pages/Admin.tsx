import { useState } from "react";
import { Shield, Lock, Film, Ticket, DollarSign, TrendingUp, Calendar, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useBookingStore } from "@/store/booking";
import { movies } from "@/data/movies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Stat = ({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: any;
  accent?: "primary" | "gold" | "success";
}) => (
  <div className="rounded-xl border border-border/60 bg-gradient-card p-5">
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div
        className={`h-9 w-9 rounded-lg flex items-center justify-center ${
          accent === "gold"
            ? "bg-gold/15 text-gold"
            : accent === "success"
            ? "bg-success/15 text-success"
            : "bg-primary/15 text-primary"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <p className="mt-3 text-3xl font-extrabold">{value}</p>
  </div>
);

const Admin = () => {
  const isAdmin = useBookingStore((s) => s.isAdmin);
  const setAdmin = useBookingStore((s) => s.setAdmin);
  const bookings = useBookingStore((s) => s.bookings);
  const [pwd, setPwd] = useState("");

  if (!isAdmin) {
    return (
      <div className="container py-20 max-w-md">
        <div className="rounded-2xl border border-border/60 bg-gradient-card p-8 shadow-card-elegant text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Demo password: <span className="font-mono font-bold text-foreground">admin123</span>
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pwd === "admin123") {
                setAdmin(true);
                toast.success("Welcome, admin");
              } else {
                toast.error("Incorrect password");
              }
            }}
            className="mt-6 text-left space-y-3"
          >
            <div>
              <Label htmlFor="pwd">Password</Label>
              <Input
                id="pwd"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Enter admin password"
                className="mt-1 bg-secondary border-border/60"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-primary shadow-glow">
              <Shield className="h-4 w-4" /> Sign in as Admin
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const revenue = confirmed.reduce((s, b) => s + b.total, 0);
  const totalSeats = confirmed.reduce((s, b) => s + b.seats.length, 0);

  // popularity
  const counts: Record<string, number> = {};
  confirmed.forEach((b) => (counts[b.movieTitle] = (counts[b.movieTitle] || 0) + b.seats.length));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage movies, slots and bookings.</p>
        </div>
        <Button variant="outline" onClick={() => { setAdmin(false); toast("Signed out"); }}>
          Sign out
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Bookings" value={bookings.length} icon={Ticket} accent="primary" />
        <Stat label="Seats Sold" value={totalSeats} icon={TrendingUp} accent="success" />
        <Stat label="Revenue" value={`Rs ${revenue.toLocaleString()}`} icon={DollarSign} accent="gold" />
        <Stat label="Active Movies" value={movies.length} icon={Film} accent="primary" />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {/* Recent bookings */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="text-lg font-bold">Recent Bookings</h2>
          {bookings.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <div className="mt-4 divide-y divide-border/60">
              {bookings.slice(0, 8).map((b) => (
                <div key={b.id} className="py-3 flex items-center gap-3">
                  <img src={b.poster} alt="" className="h-12 w-9 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{b.movieTitle}</p>
                    <p className="text-xs text-muted-foreground inline-flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {format(parseISO(b.date), "d MMM")}
                      </span>
                      <span>{b.time}</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {b.cinema}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">Rs {b.total}</p>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">
                      {b.seats.length} seat{b.seats.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top movies */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="text-lg font-bold">Most Booked</h2>
          {top.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {top.map(([title, count], i) => (
                <li key={title}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate">
                      <span className="text-muted-foreground mr-2">#{i + 1}</span>
                      {title}
                    </span>
                    <span className="text-xs text-muted-foreground">{count} seats</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary"
                      style={{ width: `${(count / top[0][1]) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Movies list */}
      <div className="mt-10 rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-bold">Movies</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((m) => (
            <div key={m.id} className="flex gap-3 rounded-xl border border-border/60 bg-gradient-card p-3">
              <img src={m.poster} alt="" className="h-20 w-14 rounded object-cover" />
              <div className="min-w-0">
                <p className="font-semibold truncate">{m.title}</p>
                <p className="text-xs text-muted-foreground">{m.genre.join(", ")} · {m.duration}</p>
                <p className="mt-1 text-xs">
                  <span className="text-muted-foreground">Slots: </span>
                  <span className="font-semibold">{m.slots.length}</span>
                  <span className="text-muted-foreground"> · Status: </span>
                  <span className={m.status === "now-showing" ? "text-success" : "text-gold"}>
                    {m.status}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Demo mode — add/edit/delete movies will be wired up when backend is connected.
        </p>
      </div>
    </div>
  );
};

export default Admin;
