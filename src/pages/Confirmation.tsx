import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Calendar, Clock, MapPin, Ticket, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { bookingsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import NotFound from "./NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ConfirmationContent = () => {
  const { id } = useParams();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingsApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <p className="container py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </p>
    );
  }

  if (!booking) return <NotFound />;

  return (
    <section className="container py-8 sm:py-12 max-w-2xl mx-auto w-full">
      <header className="text-center animate-scale-in">
        <span className="mx-auto flex h-14 sm:h-16 w-14 sm:w-16 items-center justify-center rounded-full bg-success/15 border border-success/30 mb-4 animate-glow-pulse">
          <CheckCircle2 className="h-7 sm:h-8 w-7 sm:w-8 text-success" />
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">Booking Confirmed!</h1>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base">
          Show this digital ticket at the cinema entrance.
        </p>
      </header>

      <article className="mt-8 rounded-2xl border border-border/60 overflow-hidden shadow-card-elegant">
        <section className="grid sm:grid-cols-[140px_1fr]">
          {booking.poster && (
            <img
              src={booking.poster}
              alt={`${booking.movieTitle} poster`}
              className="h-48 sm:h-full w-full object-cover aspect-[2/3] sm:aspect-auto"
            />
          )}
          <section className="p-5 bg-gradient-card">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Movie</p>
            <h2 className="text-lg sm:text-xl font-bold">{booking.movieTitle}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date
                </dt>
                <dd className="font-semibold">{format(parseISO(booking.date), "d MMM yyyy")}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Time
                </dt>
                <dd className="font-semibold">{booking.time}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Cinema
                </dt>
                <dd className="font-semibold">{booking.cinema} · {booking.screen}</dd>
              </div>
            </dl>
          </section>
        </section>

        <hr className="relative h-6 border-0 bg-gradient-card border-y border-dashed border-border/60 m-0" />

        <footer className="p-5 bg-gradient-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <section className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Booking ID</p>
            <p className="font-mono font-bold break-all">{booking.id}</p>
            <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">Seats</p>
            <p className="mt-1 flex flex-wrap gap-1.5">
              {booking.seats.map((s) => (
                <span
                  key={s}
                  className="rounded bg-primary/15 border border-primary/30 px-2 py-0.5 text-xs font-bold text-primary"
                >
                  {s}
                </span>
              ))}
            </p>
            <p className="mt-3 text-2xl font-extrabold text-gradient-primary">Rs {booking.total}</p>
          </section>
          <span
            className="shrink-0 h-20 w-20 sm:h-24 sm:w-24 rounded-md bg-foreground p-2 grid grid-cols-8 gap-[2px]"
            aria-hidden
          >
            {Array.from({ length: 64 }).map((_, i) => (
              <span
                key={i}
                className={
                  (i * 7 + booking.id.length) % 3 === 0 || i % 5 === 0 || [0, 7, 56, 63].includes(i)
                    ? "bg-background"
                    : "bg-foreground"
                }
              />
            ))}
          </span>
        </footer>
      </article>

      <nav className="mt-6 flex flex-wrap gap-3 justify-center">
        <Button asChild variant="outline">
          <Link to="/bookings">
            <Ticket className="h-4 w-4" /> My Bookings
          </Link>
        </Button>
        <Button asChild className="bg-gradient-primary shadow-glow">
          <Link to="/">Browse more movies</Link>
        </Button>
      </nav>
    </section>
  );
};

const Confirmation = () => (
  <ProtectedRoute>
    <ConfirmationContent />
  </ProtectedRoute>
);

export default Confirmation;
