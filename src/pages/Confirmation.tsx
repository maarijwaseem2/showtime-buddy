import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useBookingStore } from "@/store/booking";
import { Button } from "@/components/ui/button";
import NotFound from "./NotFound";

const Confirmation = () => {
  const { id } = useParams();
  const booking = useBookingStore((s) => s.bookings.find((b) => b.id === id));

  if (!booking) return <NotFound />;

  return (
    <div className="container py-12 max-w-2xl">
      <div className="text-center animate-scale-in">
        <div className="mx-auto h-16 w-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mb-4 animate-glow-pulse">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold">Booking Confirmed!</h1>
        <p className="mt-2 text-muted-foreground">
          Show this digital ticket at the cinema entrance.
        </p>
      </div>

      {/* Ticket */}
      <div className="mt-8 rounded-2xl border border-border/60 overflow-hidden shadow-card-elegant">
        <div className="grid sm:grid-cols-[140px_1fr]">
          <img
            src={booking.poster}
            alt={`${booking.movieTitle} poster`}
            className="h-full w-full object-cover aspect-[2/3] sm:aspect-auto"
          />
          <div className="p-5 bg-gradient-card">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Movie</p>
            <h2 className="text-xl font-bold">{booking.movieTitle}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date
                </p>
                <p className="font-semibold">
                  {format(parseISO(booking.date), "d MMM yyyy")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Time
                </p>
                <p className="font-semibold">{booking.time}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Cinema
                </p>
                <p className="font-semibold">
                  {booking.cinema} · {booking.screen}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* perforation */}
        <div className="relative h-6 bg-gradient-card border-y border-dashed border-border/60">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-background" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-background" />
        </div>

        <div className="p-5 bg-gradient-card flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Booking ID
            </p>
            <p className="font-mono font-bold">{booking.id}</p>

            <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              Seats
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {booking.seats.map((s) => (
                <span
                  key={s}
                  className="rounded bg-primary/15 border border-primary/30 px-2 py-0.5 text-xs font-bold text-primary"
                >
                  {s}
                </span>
              ))}
            </div>

            <p className="mt-3 text-2xl font-extrabold text-gradient-primary">
              Rs {booking.total}
            </p>
          </div>

          {/* Faux QR */}
          <div className="shrink-0 h-24 w-24 rounded-md bg-foreground p-2">
            <div className="grid grid-cols-8 gap-[2px] h-full w-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className={
                    (i * 7 + booking.id.length) % 3 === 0 ||
                    i % 5 === 0 ||
                    i === 0 || i === 7 || i === 56 || i === 63
                      ? "bg-background"
                      : "bg-foreground"
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Button asChild variant="outline">
          <Link to="/bookings">
            <Ticket className="h-4 w-4" /> My Bookings
          </Link>
        </Button>
        <Button asChild className="bg-gradient-primary shadow-glow">
          <Link to="/">Browse more movies</Link>
        </Button>
      </div>
    </div>
  );
};

export default Confirmation;
