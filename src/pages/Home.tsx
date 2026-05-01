import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, Clapperboard } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import { movies, allGenres, allLanguages } from "@/data/movies";
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

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      if (m.status !== tab) return false;
      if (query && !m.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (genre !== "all" && !m.genre.includes(genre)) return false;
      if (language !== "all" && m.language !== language) return false;
      return true;
    });
  }, [query, genre, language, tab]);

  const featured = movies[0];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Cinema theater with red velvet seats"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>

        <div className="container relative z-10 py-20 md:py-28 lg:py-36">
          <div className="max-w-2xl animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary mb-5">
              <Sparkles className="h-3 w-3" /> Now booking · May 2026
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              Pick your seat. <br />
              <span className="text-gradient-primary">Own the show.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Browse the latest blockbusters, choose your perfect slot, and reserve seats in seconds — no queues, no hassle.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-primary shadow-glow hover:opacity-90">
                <Link to={`/movies/${featured.id}`}>
                  <Clapperboard className="h-5 w-5" />
                  Book {featured.title}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border/80">
                <a href="#movies">Browse all movies</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters + Tabs */}
      <section id="movies" className="container py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">Find your movie</h2>
            <p className="text-muted-foreground mt-1">Filter by genre, language or just search.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
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
              onClick={() => setTab("upcoming")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-smooth ${
                tab === "upcoming"
                  ? "bg-gradient-gold text-gold-foreground shadow-gold-glow"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-secondary border-border/60 h-11"
            />
          </div>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="w-full md:w-44 h-11 bg-secondary border-border/60">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genres</SelectItem>
              {allGenres.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full md:w-44 h-11 bg-secondary border-border/60">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {allLanguages.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filtered.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No movies match your filters.
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
