import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { Movie } from "@/data/movies";

const MovieCard = ({ movie }: { movie: Movie }) => (
  <Link
    to={`/movies/${movie.id}`}
    className="group block animate-fade-in"
  >
    <div className="relative overflow-hidden rounded-xl bg-gradient-card border border-border/60 shadow-card-elegant transition-smooth hover:border-primary/40 hover:shadow-glow">
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={movie.poster}
          alt={`${movie.title} poster`}
          width={768}
          height={1152}
          loading="lazy"
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-90" />
      </div>

      <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2 py-1 text-xs font-semibold">
        <Star className="h-3 w-3 fill-gold text-gold" />
        {movie.rating}
      </div>

      {movie.status === "upcoming" && (
        <div className="absolute top-3 right-3 rounded-full bg-gradient-gold px-2.5 py-1 text-xs font-bold text-gold-foreground">
          Upcoming
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-bold text-lg leading-tight line-clamp-1">{movie.title}</h3>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{movie.genre[0]}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {movie.duration}
          </span>
          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold">
            {movie.ageRating}
          </span>
        </div>
      </div>
    </div>
  </Link>
);

export default MovieCard;
