import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Minus, Plus } from "lucide-react";
import { Movie, MovieFormData } from "@/types";
import { adminApi, ApiError } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "sonner";

const LANGUAGES = [
  "English",
  "Urdu",
  "Hindi",
  "Punjabi",
  "Pashto",
  "Sindhi",
  "Arabic",
  "Turkish",
  "French",
  "Spanish",
  "German",
  "Italian",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Bengali",
  "Persian",
];

const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Sport",
  "Thriller",
  "War",
  "Western",
];

const AGE_RATINGS = ["G", "PG", "PG-13", "R", "16+", "18+"];

const ACTORS = [
  "Fawad Khan",
  "Mahira Khan",
  "Humayun Saeed",
  "Mehwish Hayat",
  "Bilal Ashraf",
  "Maya Ali",
  "Sheheryar Munawar",
  "Sajal Aly",
  "Shah Rukh Khan",
  "Salman Khan",
  "Aamir Khan",
  "Akshay Kumar",
  "Hrithik Roshan",
  "Ranbir Kapoor",
  "Ranveer Singh",
  "Deepika Padukone",
  "Alia Bhatt",
  "Priyanka Chopra",
  "Katrina Kaif",
  "Leonardo DiCaprio",
  "Tom Cruise",
  "Brad Pitt",
  "Robert Downey Jr.",
  "Scarlett Johansson",
  "Tom Hanks",
  "Dwayne Johnson",
  "Chris Hemsworth",
  "Chris Evans",
  "Emma Watson",
  "Jennifer Lawrence",
  "Margot Robbie",
  "Timothee Chalamet",
  "Zendaya",
  "Keanu Reeves",
  "Will Smith",
  "Angelina Jolie",
  "Gal Gadot",
  "Henry Cavill",
  "Cillian Murphy",
  "Florence Pugh",
  "Anne Hathaway",
  "Christian Bale",
  "Joaquin Phoenix",
  "Morgan Freeman",
  "Samuel L. Jackson",
];

const RATINGS = Array.from({ length: 19 }, (_, i) => (i + 2) / 2); // 1 to 10 step 0.5

const slugify = (t: string) =>
  t
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const parseDuration = (duration: string): { hours: number; minutes: number } => {
  const h = duration.match(/(\d+)\s*h/i);
  const m = duration.match(/(\d+)\s*m/i);
  return {
    hours: h ? parseInt(h[1], 10) : 2,
    minutes: m ? parseInt(m[1], 10) : 0,
  };
};

const formatDuration = (hours: number, minutes: number) =>
  `${hours}h ${String(minutes).padStart(2, "0")}m`;

const emptyForm = (): MovieFormData => ({
  slug: "",
  title: "",
  genre: [],
  language: "English",
  duration: "2h 00m",
  rating: 7,
  ageRating: "PG-13",
  releaseDate: new Date().toISOString().slice(0, 10),
  description: "",
  cast: [],
  director: "",
  status: "now-showing",
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movie?: Movie | null;
  onSuccess: () => void;
};

const Counter = ({
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
}) => (
  <span className="flex items-center gap-1 flex-1 min-w-0">
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-10 w-9 shrink-0"
      onClick={() => onChange(Math.max(min, value - step))}
    >
      <Minus className="h-3 w-3" />
    </Button>
    <span className="flex-1 h-10 rounded-md bg-secondary border border-input flex items-center justify-center text-sm font-semibold tabular-nums min-w-0">
      {value}
      <span className="ml-0.5 text-muted-foreground font-normal">{suffix}</span>
    </span>
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-10 w-9 shrink-0"
      onClick={() => onChange(Math.min(max, value + step))}
    >
      <Plus className="h-3 w-3" />
    </Button>
  </span>
);

const MovieFormDialog = ({ open, onOpenChange, movie, onSuccess }: Props) => {
  const isEdit = !!movie;
  const [form, setForm] = useState<MovieFormData>(emptyForm());
  const [genres, setGenres] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [cast, setCast] = useState<string[]>([]);
  const [hours, setHours] = useState(2);
  const [minutes, setMinutes] = useState(0);
  const [posterFile, setPosterFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    if (movie) {
      setForm({
        slug: movie.id,
        title: movie.title,
        genre: movie.genre,
        language: movie.language,
        duration: movie.duration,
        rating: movie.rating,
        ageRating: movie.ageRating,
        releaseDate: movie.releaseDate,
        description: movie.description,
        cast: movie.cast,
        director: movie.director,
        status: movie.status,
      });
      setGenres(movie.genre);
      setLanguages(
        movie.language.split(",").map((l) => l.trim()).filter(Boolean)
      );
      setCast(movie.cast);
      const d = parseDuration(movie.duration);
      setHours(d.hours);
      setMinutes(d.minutes);
    } else {
      setForm(emptyForm());
      setGenres([]);
      setLanguages(["English"]);
      setCast([]);
      setHours(2);
      setMinutes(0);
    }
    setPosterFile(null);
  }, [open, movie]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: MovieFormData = {
        ...form,
        slug: isEdit ? form.slug : form.slug || slugify(form.title),
        genre: genres,
        language: languages.join(", "),
        duration: formatDuration(hours, minutes),
        cast,
      };
      if (!payload.title || !payload.slug) {
        throw new Error("Title is required");
      }
      if (genres.length === 0) {
        throw new Error("Select at least one genre");
      }
      if (languages.length === 0) {
        throw new Error("Select at least one language");
      }
      const saved = isEdit
        ? await adminApi.updateMovie(movie!.id, payload)
        : await adminApi.createMovie(payload);

      let posterFailed = false;
      if (posterFile) {
        try {
          await adminApi.uploadPoster(saved.id, posterFile);
        } catch {
          posterFailed = true;
        }
      }
      return { saved, posterFailed };
    },
    onSuccess: ({ posterFailed }) => {
      if (posterFailed) {
        toast.warning(isEdit ? "Movie updated — poster upload failed, try again" : "Movie added — poster upload failed, try again");
      } else {
        toast.success(isEdit ? "Movie updated" : "Movie added");
      }
      onSuccess();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed"
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit movie" : "Add new movie"}</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          <fieldset className="space-y-1 border-0 p-0 m-0">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({
                  ...f,
                  title,
                  slug: isEdit ? f.slug : slugify(title),
                }));
              }}
              className="bg-secondary"
              required
            />
          </fieldset>

          <fieldset className="space-y-1 border-0 p-0 m-0">
            <Label>Slug (URL id)</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="bg-secondary font-mono text-sm"
              required
              disabled={isEdit}
            />
          </fieldset>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <fieldset className="space-y-1 border-0 p-0 m-0">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v: "now-showing" | "upcoming") =>
                  setForm((f) => ({ ...f, status: v }))
                }
              >
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now-showing">Now showing</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </fieldset>
            <fieldset className="space-y-1 border-0 p-0 m-0">
              <Label>Release date</Label>
              <Input
                type="date"
                value={form.releaseDate}
                onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))}
                className="bg-secondary"
              />
            </fieldset>
          </section>

          <fieldset className="space-y-1 border-0 p-0 m-0">
            <Label>Languages *</Label>
            <MultiSelect
              options={LANGUAGES}
              selected={languages}
              onChange={setLanguages}
              placeholder="Select languages"
            />
          </fieldset>

          <fieldset className="space-y-1 border-0 p-0 m-0">
            <Label>Genres *</Label>
            <MultiSelect
              options={GENRES}
              selected={genres}
              onChange={setGenres}
              placeholder="Select genres"
            />
          </fieldset>

          <fieldset className="space-y-1 border-0 p-0 m-0">
            <Label>Duration</Label>
            <span className="flex gap-2">
              <Counter value={hours} onChange={setHours} min={0} max={6} step={1} suffix="h" />
              <Counter value={minutes} onChange={setMinutes} min={0} max={55} step={5} suffix="m" />
            </span>
          </fieldset>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <fieldset className="space-y-1 border-0 p-0 m-0">
              <Label>Rating (out of 10)</Label>
              <Select
                value={String(form.rating)}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, rating: parseFloat(v) }))
                }
              >
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {RATINGS.map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r.toFixed(1)} / 10
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </fieldset>
            <fieldset className="space-y-1 border-0 p-0 m-0">
              <Label>Age rating</Label>
              <Select
                value={form.ageRating}
                onValueChange={(v) => setForm((f) => ({ ...f, ageRating: v }))}
              >
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Select age rating" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_RATINGS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </fieldset>
          </section>

          <fieldset className="space-y-1 border-0 p-0 m-0">
            <Label>Director</Label>
            <Input
              value={form.director}
              onChange={(e) => setForm((f) => ({ ...f, director: e.target.value }))}
              className="bg-secondary"
            />
          </fieldset>

          <fieldset className="space-y-1 border-0 p-0 m-0">
            <Label>Cast</Label>
            <MultiSelect
              options={ACTORS}
              selected={cast}
              onChange={setCast}
              placeholder="Select cast members"
              searchable
              allowCustom
            />
            <p className="text-[11px] text-muted-foreground">
              Not in the list? Type the name and click &quot;Add&quot;
            </p>
          </fieldset>

          <fieldset className="space-y-1 border-0 p-0 m-0">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="bg-secondary min-h-[80px]"
              required
            />
          </fieldset>

          <fieldset className="space-y-1 border-0 p-0 m-0">
            <Label>Poster image {isEdit ? "(optional)" : ""}</Label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
              className="bg-secondary"
            />
          </fieldset>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add movie"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MovieFormDialog;
