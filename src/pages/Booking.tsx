import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertTriangle, ChevronLeft, MapPin, Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { showtimesApi, bookingsApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NotFound from "./NotFound";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = Array.from({ length: 10 }, (_, i) => i + 1);

const BookingContent = () => {
  const { movieId, slotId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dateISO = params.get("date") || format(new Date(), "yyyy-MM-dd");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["seats", slotId],
    queryFn: () => showtimesApi.seats(slotId!),
    enabled: !!slotId,
  });

  const [selected, setSelected] = useState<string[]>([]);

  const bookMutation = useMutation({
    mutationFn: () => bookingsApi.create(slotId!, selected),
    onSuccess: (booking) => {
      navigate(`/confirmation/${booking.id}`);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Booking failed");
    },
  });

  if (isLoading) {
    return (
      <p className="container py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </p>
    );
  }

  if (isError || !data || data.movie.id !== movieId) return <NotFound />;

  const bookedSet = new Set(data.bookedSeats);
  const vipRows = new Set(data.vipRows?.length ? data.vipRows : ["A", "B"]);
  const seatsFull = data.availableSeats.length === 0;

  const toggle = (id: string) => {
    if (bookedSet.has(id)) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const priceFor = (seatId: string) =>
    vipRows.has(seatId[0]) ? data.priceVip : data.priceStandard;
  const total = selected.reduce((sum, id) => sum + priceFor(id), 0);

  const confirm = () => {
    if (selected.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }
    bookMutation.mutate();
  };

  return (
    <section className="container py-6 sm:py-8">
      <Link
        to={`/movies/${movieId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-smooth"
      >
        <ChevronLeft className="h-4 w-4" /> Back to {data.movie.title}
      </Link>

      {seatsFull && (
        <p className="mt-6 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive font-semibold">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          All seats for this showtime are fully booked. Please choose another
          slot or date.
        </p>
      )}

      <section className="mt-6 grid lg:grid-cols-[1fr_minmax(280px,360px)] gap-6 lg:gap-8">
        <article className="rounded-2xl border border-border/60 bg-gradient-card p-3 sm:p-6 md:p-10 shadow-card-elegant overflow-x-auto -mx-1 sm:mx-0">
          <header className="mb-6 sm:mb-8">
            <span className="mx-auto block h-2 w-3/4 max-w-md rounded-full bg-gradient-primary opacity-80 shadow-glow" />
            <p className="mt-3 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Screen
            </p>
          </header>

          <section className="flex flex-col items-center gap-2 min-w-[320px] sm:min-w-0">
            {ROWS.map((row) => (
              <p key={row} className="flex items-center gap-1.5 sm:gap-2 m-0">
                <span className="w-4 sm:w-5 text-xs font-semibold text-muted-foreground">{row}</span>
                <span className="flex gap-0.5 sm:gap-1.5">
                  {COLS.map((col) => {
                    const id = `${row}${col}`;
                    const isBooked = bookedSet.has(id);
                    const isSelected = selected.includes(id);
                    const isVip = vipRows.has(row);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggle(id)}
                        disabled={isBooked}
                        aria-label={`Seat ${id}${isBooked ? " (booked)" : ""}`}
                        className={cn(
                          "h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-md text-[9px] sm:text-[10px] font-semibold transition-smooth",
                          isBooked && "bg-seat-booked text-muted-foreground/40 cursor-not-allowed",
                          !isBooked && !isSelected && !isVip && "bg-seat-available hover:bg-muted text-muted-foreground hover:text-foreground",
                          !isBooked && !isSelected && isVip && "bg-seat-vip/30 hover:bg-seat-vip/60 text-gold border border-seat-vip/40",
                          isSelected && "bg-seat-selected text-primary-foreground shadow-glow scale-110"
                        )}
                      >
                        {col}
                      </button>
                    );
                  })}
                </span>
              </p>
            ))}
          </section>

          <footer className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-seat-available" /> Available
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-seat-selected shadow-glow" /> Selected
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-seat-vip/40 border border-seat-vip/60" /> VIP
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-seat-booked" /> Booked
            </span>
          </footer>
        </article>

        <aside className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 h-fit lg:sticky lg:top-24 shadow-card-elegant">
          <h2 className="text-lg sm:text-xl font-bold">{data.movie.title}</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-none p-0">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" /> {data.cinema} · {data.screen}
            </li>
            <li className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 shrink-0" /> {format(parseISO(dateISO), "EEE, d MMM yyyy")}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" /> {data.time}
            </li>
          </ul>

          <section className="mt-5 border-t border-border/60 pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Selected Seats
            </p>
            {selected.length === 0 ? (
              <p className="text-sm text-muted-foreground">No seats selected yet</p>
            ) : (
              <p className="flex flex-wrap gap-1.5">
                {selected.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-primary/15 border border-primary/30 px-2 py-1 text-xs font-semibold text-primary"
                  >
                    {s}
                  </span>
                ))}
              </p>
            )}
          </section>

          <p className="mt-5 text-2xl font-extrabold text-gradient-primary">Rs {total}</p>

          <Button
            onClick={confirm}
            size="lg"
            className="mt-5 w-full bg-gradient-primary shadow-glow hover:opacity-90"
            disabled={bookMutation.isPending || seatsFull}
          >
            {seatsFull
              ? "Seats Full"
              : bookMutation.isPending
                ? "Confirming..."
                : "Confirm Booking"}
          </Button>
        </aside>
      </section>
    </section>
  );
};

const Booking = () => (
  <ProtectedRoute>
    <BookingContent />
  </ProtectedRoute>
);

export default Booking;
