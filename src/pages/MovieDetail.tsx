import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { Star, Clock, Calendar as CalendarIcon, MapPin, ChevronLeft } from "lucide-react";
import { movies } from "@/data/movies";
import { Button } from "@/components/ui/button";
import NotFound from "./NotFound";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const movie = movies.find((m) => m.id === id);

  const dates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)),
    []
  );
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);

  if (!movie) return <NotFound />;

  const goBook = (slotId: string) => {
    navigate(`/book/${movie.id}/${slotId}?date=${format(selectedDate, "yyyy-MM-dd")}`);
  };

  return (
    <div>
      {/* Backdrop */}
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src={movie.poster}
            alt=""
            aria-hidden
            className="h-full w-full object-cover blur-2xl opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div className="container relative z-10 pt-6 pb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-smooth"
          >
            <ChevronLeft className="h-4 w-4" /> Back to movies
          </Link>

          <div className="mt-6 grid md:grid-cols-[280px_1fr] gap-8 items-start">
            <div className="rounded-xl overflow-hidden shadow-card-elegant border border-border/60 max-w-[280px]">
              <img
                src={movie.poster}
                alt={`${movie.title} poster`}
                width={768}
                height={1152}
                className="w-full h-auto"
              />
            </div>

            <div className="animate-fade-in">
              <div className="flex flex-wrap gap-2 mb-3">
                {movie.genre.map((g) => (
                  <span key={g} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{movie.title}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="text-foreground font-semibold">{movie.rating}</span>/10
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {movie.duration}
                </span>
                <span className="rounded border border-border px-1.5 py-0.5 text-xs font-semibold text-foreground">
                  {movie.ageRating}
                </span>
                <span>{movie.language}</span>
              </div>

              <p className="mt-5 text-base text-muted-foreground max-w-2xl leading-relaxed">
                {movie.description}
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Director</p>
                  <p className="font-medium">{movie.director}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Cast</p>
                  <p className="font-medium">{movie.cast.join(", ")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Date selector */}
      <section className="container py-10">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Choose date
        </h2>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {dates.map((d) => {
            const active = format(d, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDate(d)}
                className={`flex flex-col items-center min-w-[72px] rounded-xl border px-4 py-3 transition-smooth ${
                  active
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border/60 bg-secondary hover:border-border"
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {format(d, "EEE")}
                </span>
                <span className="text-2xl font-bold">{format(d, "d")}</span>
                <span className="text-xs text-muted-foreground">{format(d, "MMM")}</span>
              </button>
            );
          })}
        </div>

        <h2 className="mt-10 text-2xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Available slots
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {movie.slots.map((s) => {
            const isFull = s.status === "full";
            return (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-gradient-card p-4 transition-smooth hover:border-primary/40"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{s.time}</span>
                    {s.status === "available" && (
                      <span className="text-xs font-semibold text-success">Available</span>
                    )}
                    {s.status === "almost-full" && (
                      <span className="text-xs font-semibold text-gold">Filling fast</span>
                    )}
                    {isFull && (
                      <span className="text-xs font-semibold text-destructive">Full</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {s.cinema} · {s.screen}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    From <span className="text-foreground font-semibold">Rs {s.priceStandard}</span>
                  </p>
                </div>
                <Button
                  onClick={() => goBook(s.id)}
                  disabled={isFull}
                  className="bg-gradient-primary shadow-glow hover:opacity-90"
                >
                  {isFull ? "Sold Out" : "Book Now"}
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default MovieDetail;
