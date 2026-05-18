import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { Movie } from "@/types";

const MovieCard = ({ movie }: { movie: Movie }) => (
  <Link
    to={`/movies/${movie.id}`}
    className="group block animate-fade-in h-full"
  >
    <article className="relative overflow-hidden rounded-xl bg-gradient-card border border-border/60 shadow-card-elegant transition-smooth hover:border-primary/40 hover:shadow-glow h-full flex flex-col">
      <figure className="aspect-[2/3] overflow-hidden m-0">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            width={768}
            height={1152}
            loading="lazy"
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground text-sm">
            No poster
          </span>
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-90 pointer-events-none" />
      </figure>

      <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2 py-1 text-xs font-semibold">
        <Star className="h-3 w-3 fill-gold text-gold" />
        {movie.rating}
      </span>

      {movie.status === "upcoming" && (
        <span className="absolute top-3 right-3 rounded-full bg-gradient-gold px-2.5 py-1 text-xs font-bold text-gold-foreground">
          Upcoming
        </span>
      )}

      <footer className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-2">{movie.title}</h3>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{movie.genre[0]}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {movie.duration}
          </span>
          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold">
            {movie.ageRating}
          </span>
        </p>
      </footer>
    </article>
  </Link>
);

export default MovieCard;
