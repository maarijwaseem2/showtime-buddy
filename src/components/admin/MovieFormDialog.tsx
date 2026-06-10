import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
import { toast } from "sonner";

const slugify = (t: string) =>
  t
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

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

const MovieFormDialog = ({ open, onOpenChange, movie, onSuccess }: Props) => {
  const isEdit = !!movie;
  const [form, setForm] = useState<MovieFormData>(emptyForm());
  const [genreText, setGenreText] = useState("");
  const [castText, setCastText] = useState("");
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
      setGenreText(movie.genre.join(", "));
      setCastText(movie.cast.join(", "));
    } else {
      setForm(emptyForm());
      setGenreText("");
      setCastText("");
    }
    setPosterFile(null);
  }, [open, movie]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: MovieFormData = {
        ...form,
        slug: isEdit ? form.slug : form.slug || slugify(form.title),
        genre: genreText.split(",").map((g) => g.trim()).filter(Boolean),
        cast: castText.split(",").map((c) => c.trim()).filter(Boolean),
      };
      if (!payload.title || !payload.slug) {
        throw new Error("Title is required");
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
              <Label>Language</Label>
              <Input
                value={form.language}
                onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                className="bg-secondary"
              />
            </fieldset>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <fieldset className="space-y-1 border-0 p-0 m-0">
              <Label>Duration</Label>
              <Input
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="bg-secondary"
                placeholder="2h 15m"
              />
            </fieldset>
            <fieldset className="space-y-1 border-0 p-0 m-0">
              <Label>Rating</Label>
              <Input
                type="number"
                step="0.1"
                min={0}
                max={10}
                value={form.rating}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rating: parseFloat(e.target.value) || 0 }))
                }
                className="bg-secondary"
              />
            </fieldset>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <fieldset className="space-y-1 border-0 p-0 m-0">
              <Label>Age rating</Label>
              <Input
                value={form.ageRating}
                onChange={(e) => setForm((f) => ({ ...f, ageRating: e.target.value }))}
                className="bg-secondary"
              />
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
            <Label>Genres (comma separated)</Label>
            <Input
              value={genreText}
              onChange={(e) => setGenreText(e.target.value)}
              className="bg-secondary"
              placeholder="Action, Thriller"
            />
          </fieldset>

          <fieldset className="space-y-1 border-0 p-0 m-0">
            <Label>Director</Label>
            <Input
              value={form.director}
              onChange={(e) => setForm((f) => ({ ...f, director: e.target.value }))}
              className="bg-secondary"
            />
          </fieldset>

          <fieldset className="space-y-1 border-0 p-0 m-0">
            <Label>Cast (comma separated)</Label>
            <Input
              value={castText}
              onChange={(e) => setCastText(e.target.value)}
              className="bg-secondary"
            />
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
