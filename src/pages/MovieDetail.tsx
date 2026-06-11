import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { Star, Clock, Calendar as CalendarIcon, MapPin, ChevronLeft, Loader2 } from "lucide-react";
import { moviesApi, posterSrc } from "@/lib/api";
import { Button } from "@/components/ui/button";
import NotFound from "./NotFound";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => moviesApi.get(id!),
    enabled: !!id,
  });

  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ["showtimes", id, dateStr],
    queryFn: () => moviesApi.showtimes(id!, dateStr),
    enabled: !!id && movie?.status === "now-showing",
  });

  if (movieLoading) {
    return (
      <p className="container py-20 flex justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </p>
    );
  }

  if (!movie) return <NotFound />;

  const goBook = (slotId: string) => {
    navigate(`/book/${movie.id}/${slotId}?date=${dateStr}`, {
      state: { from: `/movies/${movie.id}` },
    });
  };

  return (
    <>
      <section className="relative">
        <figure className="absolute inset-0 m-0">
          {movie.poster && (
            <img
              src={posterSrc(movie.poster)}
              alt=""
              aria-hidden
              className="h-full w-full object-cover blur-2xl opacity-30"
            />
          )}
          <span className="absolute inset-0 bg-gradient-hero" aria-hidden />
        </figure>
        <article className="container relative z-10 pt-6 pb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-smooth"
          >
            <ChevronLeft className="h-4 w-4" /> Back to movies
          </Link>

          <section className="mt-6 grid md:grid-cols-[minmax(200px,280px)_1fr] gap-6 md:gap-8 items-start">
            {movie.poster && (
              <figure className="rounded-xl overflow-hidden shadow-card-elegant border border-border/60 max-w-[280px] mx-auto md:mx-0">
                <img
                  src={posterSrc(movie.poster)}
                  alt={`${movie.title} poster`}
                  width={768}
                  height={1152}
                  className="w-full h-auto"
                />
              </figure>
            )}

            <section className="animate-fade-in min-w-0">
              <ul className="flex flex-wrap gap-2 mb-3 list-none p-0">
                {movie.genre.map((g) => (
                  <li key={g} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {g}
                  </li>
                ))}
              </ul>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">{movie.title}</h1>

              <p className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
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
              </p>

              <p className="mt-5 text-base text-muted-foreground max-w-2xl leading-relaxed">
                {movie.description}
              </p>

              <section className="mt-6 grid sm:grid-cols-2 gap-4 max-w-2xl">
                <p>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground block">Director</span>
                  <span className="font-medium">{movie.director}</span>
                </p>
                <p>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground block">Cast</span>
                  <span className="font-medium">{movie.cast.join(", ")}</span>
                </p>
              </section>
            </section>
          </section>
        </article>
      </section>

      {movie.status === "now-showing" && (
        <section className="container py-10">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Choose date
          </h2>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Select date">
            {dates.map((d) => {
              const active = format(d, "yyyy-MM-dd") === dateStr;
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`flex flex-col items-center min-w-[72px] rounded-xl border px-4 py-3 transition-smooth shrink-0 ${
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
          </nav>

          <h2 className="mt-10 text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Available slots
          </h2>

          {slotsLoading ? (
            <p className="mt-8 text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading slots...
            </p>
          ) : slots.length === 0 ? (
            <p className="mt-8 text-muted-foreground">No available slots for this date.</p>
          ) : (
            <ul className="mt-4 grid gap-3 md:grid-cols-2 list-none p-0">
              {slots.map((s) => {
                const isFull = s.status === "full";
                return (
                  <li
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/60 bg-gradient-card p-4 transition-smooth hover:border-primary/40"
                  >
                    <section className="min-w-0">
                      <p className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl sm:text-2xl font-bold">{s.time}</span>
                        {s.status === "available" && (
                          <span className="text-xs font-semibold text-success">Available</span>
                        )}
                        {s.status === "almost-full" && (
                          <span className="text-xs font-semibold text-gold">Filling fast</span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {s.cinema} · {s.screen}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        From <span className="text-foreground font-semibold">Rs {s.priceStandard}</span>
                      </p>
                    </section>
                    <Button
                      onClick={() => goBook(s.id)}
                      disabled={isFull}
                      className="bg-gradient-primary shadow-glow hover:opacity-90 w-full sm:w-auto"
                    >
                      Book Now
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {movie.status === "upcoming" && (
        <p className="container py-12 text-center text-muted-foreground">
          Coming soon — booking opens when the movie releases.
        </p>
      )}
    </>
  );
};

export default MovieDetail;
