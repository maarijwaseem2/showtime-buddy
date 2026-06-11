import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Ticket, X, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { bookingsApi, ApiError, posterSrc } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const MyBookingsContent = () => {
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings", "me"],
    queryFn: () => bookingsApi.mine(),
  });

  const cancelMutation = useMutation({
    mutationFn: (code: string) => bookingsApi.cancel(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", "me"] });
      toast.success("Booking cancelled");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Cancel failed");
    },
  });

  return (
    <section className="container py-10 sm:py-12">
      <header>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">My Bookings</h1>
        <p className="text-muted-foreground mt-1">All your tickets in one place.</p>
      </header>

      {isLoading ? (
        <p className="mt-12 flex justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </p>
      ) : bookings.length === 0 ? (
        <article className="mt-12 rounded-2xl border border-border/60 bg-gradient-card p-8 sm:p-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary mb-3">
            <Ticket className="h-6 w-6 text-muted-foreground" />
          </span>
          <h2 className="text-xl font-bold">No bookings yet</h2>
          <p className="text-muted-foreground mt-1">Book your first show to see it here.</p>
          <Button asChild className="mt-5 bg-gradient-primary shadow-glow">
            <Link to="/">Browse movies</Link>
          </Button>
        </article>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2 list-none p-0">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="rounded-xl border border-border/60 bg-gradient-card overflow-hidden flex flex-col sm:flex-row animate-fade-in"
            >
              {b.poster && (
                <img src={posterSrc(b.poster)} alt={b.movieTitle} className="w-full sm:w-28 h-40 sm:h-auto object-cover" />
              )}
              <section className="flex-1 p-4 min-w-0">
                <header className="flex items-start justify-between gap-2">
                  <section className="min-w-0">
                    <h3 className="font-bold truncate">{b.movieTitle}</h3>
                    <p className="font-mono text-[11px] text-muted-foreground">{b.id}</p>
                  </section>
                  <span
                    className={`text-[10px] font-bold uppercase rounded-full px-2 py-1 shrink-0 ${
                      b.status === "confirmed"
                        ? "bg-success/15 text-success border border-success/30"
                        : "bg-destructive/15 text-destructive border border-destructive/30"
                    }`}
                  >
                    {b.status}
                  </span>
                </header>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-none p-0">
                  <li className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> {format(parseISO(b.date), "d MMM yyyy")}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> {b.time}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> {b.cinema} · {b.screen}
                  </li>
                </ul>
                <footer className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="flex flex-wrap gap-1">
                    {b.seats.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-primary/15 border border-primary/30 px-1.5 py-0.5 text-[10px] font-bold text-primary"
                      >
                        {s}
                      </span>
                    ))}
                  </p>
                  <span className="font-bold text-gradient-primary">Rs {b.total}</span>
                </footer>
                <nav className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                    <Link to={`/confirmation/${b.id}`}>View Ticket</Link>
                  </Button>
                  {b.status === "confirmed" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-destructive hover:text-destructive"
                      onClick={() => cancelMutation.mutate(b.id)}
                      disabled={cancelMutation.isPending}
                    >
                      <X className="h-3 w-3" /> Cancel
                    </Button>
                  )}
                </nav>
              </section>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const MyBookings = () => (
  <ProtectedRoute>
    <MyBookingsContent />
  </ProtectedRoute>
);

export default MyBookings;
