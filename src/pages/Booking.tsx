import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, MapPin, Clock, Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { movies } from "@/data/movies";
import { useBookingStore, seatsForBooking } from "@/store/booking";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NotFound from "./NotFound";
import { cn } from "@/lib/utils";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COLS = Array.from({ length: 10 }, (_, i) => i + 1);
const VIP_ROWS = new Set(["A", "B"]);

const Booking = () => {
  const { movieId, slotId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dateISO = params.get("date") || format(new Date(), "yyyy-MM-dd");
  const addBooking = useBookingStore((s) => s.addBooking);

  const movie = movies.find((m) => m.id === movieId);
  const slot = movie?.slots.find((s) => s.id === slotId);

  const bookedSet = useMemo(
    () => (movie && slot ? seatsForBooking(movie, slot, dateISO) : new Set<string>()),
    [movie, slot, dateISO]
  );

  const [selected, setSelected] = useState<string[]>([]);

  if (!movie || !slot) return <NotFound />;

  const toggle = (id: string) => {
    if (bookedSet.has(id)) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const priceFor = (id: string) =>
    VIP_ROWS.has(id[0]) ? slot.priceVip : slot.priceStandard;
  const total = selected.reduce((sum, id) => sum + priceFor(id), 0);

  const confirm = () => {
    if (selected.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }
    const booking = addBooking({
      movieId: movie.id,
      movieTitle: movie.title,
      poster: movie.poster,
      cinema: slot.cinema,
      screen: slot.screen,
      date: dateISO,
      time: slot.time,
      seats: selected,
      total,
    });
    navigate(`/confirmation/${booking.id}`);
  };

  return (
    <div className="container py-8">
      <Link
        to={`/movies/${movie.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-smooth"
      >
        <ChevronLeft className="h-4 w-4" /> Back to {movie.title}
      </Link>

      <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Seat layout */}
        <div className="rounded-2xl border border-border/60 bg-gradient-card p-6 md:p-10 shadow-card-elegant">
          <div className="mb-8">
            <div className="mx-auto h-2 w-3/4 rounded-full bg-gradient-primary opacity-80 shadow-glow" />
            <p className="mt-3 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Screen
            </p>
          </div>

          <div className="flex flex-col items-center gap-2.5">
            {ROWS.map((row) => (
              <div key={row} className="flex items-center gap-2">
                <span className="w-5 text-xs font-semibold text-muted-foreground">{row}</span>
                <div className="flex gap-1.5">
                  {COLS.map((col) => {
                    const id = `${row}${col}`;
                    const isBooked = bookedSet.has(id);
                    const isSelected = selected.includes(id);
                    const isVip = VIP_ROWS.has(row);
                    return (
                      <button
                        key={id}
                        onClick={() => toggle(id)}
                        disabled={isBooked}
                        aria-label={`Seat ${id}${isBooked ? " (booked)" : ""}`}
                        className={cn(
                          "h-7 w-7 md:h-8 md:w-8 rounded-md text-[10px] font-semibold transition-smooth",
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
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
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
          </div>
        </div>

        {/* Summary */}
        <aside className="rounded-2xl border border-border/60 bg-card p-6 h-fit lg:sticky lg:top-24 shadow-card-elegant">
          <h2 className="text-xl font-bold">{movie.title}</h2>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {slot.cinema} · {slot.screen}
            </p>
            <p className="inline-flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" /> {format(parseISO(dateISO), "EEE, d MMM yyyy")}
            </p>
            <p className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" /> {slot.time}
            </p>
          </div>

          <div className="mt-5 border-t border-border/60 pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Selected Seats
            </p>
            {selected.length === 0 ? (
              <p className="text-sm text-muted-foreground">No seats selected yet</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selected.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-primary/15 border border-primary/30 px-2 py-1 text-xs font-semibold text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Standard ({selected.filter((s) => !VIP_ROWS.has(s[0])).length}× Rs {slot.priceStandard})</span>
              <span>Rs {selected.filter((s) => !VIP_ROWS.has(s[0])).length * slot.priceStandard}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VIP ({selected.filter((s) => VIP_ROWS.has(s[0])).length}× Rs {slot.priceVip})</span>
              <span>Rs {selected.filter((s) => VIP_ROWS.has(s[0])).length * slot.priceVip}</span>
            </div>
          </div>

          <div className="mt-4 border-t border-border/60 pt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-extrabold text-gradient-primary">Rs {total}</span>
          </div>

          <Button
            onClick={confirm}
            size="lg"
            className="mt-5 w-full bg-gradient-primary shadow-glow hover:opacity-90"
          >
            Confirm Booking
          </Button>
          <p className="mt-3 text-[11px] text-center text-muted-foreground">
            Demo mode — no payment required
          </p>
        </aside>
      </div>
    </div>
  );
};

export default Booking;
