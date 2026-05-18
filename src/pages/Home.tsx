import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Sparkles, Clapperboard, Loader2 } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import { moviesApi } from "@/lib/api";
import MovieCard from "@/components/movies/MovieCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string>("all");
  const [language, setLanguage] = useState<string>("all");
  const [tab, setTab] = useState<"now-showing" | "upcoming">("now-showing");

  const { data: filters } = useQuery({
    queryKey: ["filters"],
    queryFn: () => moviesApi.filters(),
  });

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies", tab, genre, language, query],
    queryFn: () =>
      moviesApi.list({
        status: tab,
        ...(genre !== "all" ? { genre } : {}),
        ...(language !== "all" ? { language } : {}),
        ...(query ? { q: query } : {}),
      }),
  });

  const featured = useMemo(
    () => movies.find((m) => m.status === "now-showing") ?? movies[0],
    [movies]
  );

  return (
    <>
      <section className="relative overflow-hidden">
        <figure className="absolute inset-0 m-0">
          <img
            src={heroBanner}
            alt="Cinema theater with red velvet seats"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-gradient-hero" aria-hidden />
        </figure>

        <section className="container relative z-10 py-16 sm:py-20 md:py-28 lg:py-36">
          <header className="max-w-2xl animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary mb-5">
              <Sparkles className="h-3 w-3" /> Now booking · May 2026
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              Pick your seat. <br />
              <span className="text-gradient-primary">Own the show.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl">
              Browse the latest blockbusters, choose your perfect slot, and reserve seats in seconds — no queues, no hassle.
            </p>
            {featured && (
              <nav className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-gradient-primary shadow-glow hover:opacity-90">
                  <Link to={`/movies/${featured.id}`}>
                    <Clapperboard className="h-5 w-5" />
                    Book {featured.title}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-border/80">
                  <a href="#movies">Browse all movies</a>
                </Button>
              </nav>
            )}
          </header>
        </section>
      </section>

      <section id="movies" className="container py-10 sm:py-12">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <section>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Find your movie</h2>
            <p className="text-muted-foreground mt-1">Filter by genre, language or just search.</p>
          </section>

          <nav className="flex flex-wrap gap-2" aria-label="Movie tabs">
            <button
              type="button"
              onClick={() => setTab("now-showing")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-smooth ${
                tab === "now-showing"
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Now Showing
            </button>
            <button
              type="button"
              onClick={() => setTab("upcoming")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-smooth ${
                tab === "upcoming"
                  ? "bg-gradient-gold text-gold-foreground shadow-gold-glow"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Upcoming
            </button>
          </nav>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-secondary border-border/60 h-11 w-full"
            />
          </label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="w-full h-11 bg-secondary border-border/60">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genres</SelectItem>
              {(filters?.genres ?? []).map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full h-11 bg-secondary border-border/60">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {(filters?.languages ?? []).map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {isLoading ? (
          <p className="mt-16 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading movies...
          </p>
        ) : (
          <ul className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 list-none p-0 m-0">
            {movies.map((m) => (
              <li key={m.id}>
                <MovieCard movie={m} />
              </li>
            ))}
          </ul>
        )}

        {!isLoading && movies.length === 0 && (
          <p className="text-center py-20 text-muted-foreground">
            No movies match your filters.
          </p>
        )}
      </section>
    </>
  );
};

export default Home;
