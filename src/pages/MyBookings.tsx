import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Ticket, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useBookingStore } from "@/store/booking";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MyBookings = () => {
  const bookings = useBookingStore((s) => s.bookings);
  const cancel = useBookingStore((s) => s.cancelBooking);

  return (
    <div className="container py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold">My Bookings</h1>
      <p className="text-muted-foreground mt-1">All your tickets in one place.</p>

      {bookings.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-border/60 bg-gradient-card p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-3">
            <Ticket className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold">No bookings yet</h2>
          <p className="text-muted-foreground mt-1">Book your first show to see it here.</p>
          <Button asChild className="mt-5 bg-gradient-primary shadow-glow">
            <Link to="/">Browse movies</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-border/60 bg-gradient-card overflow-hidden flex animate-fade-in"
            >
              <img src={b.poster} alt={b.movieTitle} className="w-28 object-cover" />
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold">{b.movieTitle}</h3>
                    <p className="font-mono text-[11px] text-muted-foreground">{b.id}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase rounded-full px-2 py-1 ${
                      b.status === "confirmed"
                        ? "bg-success/15 text-success border border-success/30"
                        : "bg-destructive/15 text-destructive border border-destructive/30"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> {format(parseISO(b.date), "d MMM yyyy")}
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> {b.time}
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> {b.cinema} · {b.screen}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {b.seats.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-primary/15 border border-primary/30 px-1.5 py-0.5 text-[10px] font-bold text-primary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <span className="font-bold text-gradient-primary">Rs {b.total}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                    <Link to={`/confirmation/${b.id}`}>View Ticket</Link>
                  </Button>
                  {b.status === "confirmed" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-destructive hover:text-destructive"
                      onClick={() => {
                        cancel(b.id);
                        toast.success("Booking cancelled");
                      }}
                    >
                      <X className="h-3 w-3" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
