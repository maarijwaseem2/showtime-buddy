import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { Movie, Slot } from "@/types";
import { adminApi, ApiError } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movie: Movie | null;
};

const ShowtimeManagerDialog = ({ open, onOpenChange, movie }: Props) => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [screenId, setScreenId] = useState("");
  const [startTime, setStartTime] = useState("06:00 PM");
  const [priceStandard, setPriceStandard] = useState(800);
  const [priceVip, setPriceVip] = useState(1200);

  const { data: cinemas = [] } = useQuery({
    queryKey: ["admin", "cinemas"],
    queryFn: () => adminApi.cinemas(),
    enabled: open,
  });

  const screenOptions = cinemas.flatMap((c) => c.screens);

  const { data: showtimes = [], isLoading } = useQuery({
    queryKey: ["admin", "showtimes", movie?.id, date],
    queryFn: () => adminApi.showtimes(movie!.id, date),
    enabled: open && !!movie,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      adminApi.createShowtime(movie!.id, {
        screenId,
        showDate: date,
        startTime,
        priceStandard,
        priceVip,
      }),
    onSuccess: () => {
      toast.success("Showtime added");
      queryClient.invalidateQueries({ queryKey: ["admin", "showtimes", movie?.id] });
      setScreenId("");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to add showtime");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteShowtime(id),
    onSuccess: () => {
      toast.success("Showtime removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "showtimes", movie?.id] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete");
    },
  });

  const statusLabel = (s: Slot) => {
    if (s.status === "full") return "Full";
    if (s.status === "almost-full") return "Filling fast";
    return "Available";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Showtimes — {movie?.title}</DialogTitle>
        </DialogHeader>

        <fieldset className="space-y-1 border-0 p-0 m-0">
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-secondary"
          />
        </fieldset>

        <section className="mt-4 rounded-xl border border-border/60 p-4 space-y-3 bg-secondary/30">
          <p className="text-sm font-semibold">Add showtime</p>
          <fieldset className="space-y-1 border-0 p-0 m-0">
            <Label>Screen / cinema</Label>
            <Select value={screenId} onValueChange={setScreenId}>
              <SelectTrigger className="bg-secondary">
                <SelectValue placeholder="Select screen" />
              </SelectTrigger>
              <SelectContent>
                {screenOptions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </fieldset>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <fieldset className="space-y-1 border-0 p-0 m-0 sm:col-span-1">
              <Label>Time</Label>
              <Input
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-secondary"
                placeholder="06:00 PM"
              />
            </fieldset>
            <fieldset className="space-y-1 border-0 p-0 m-0">
              <Label>Standard Rs</Label>
              <Input
                type="number"
                value={priceStandard}
                onChange={(e) => setPriceStandard(Number(e.target.value))}
                className="bg-secondary"
              />
            </fieldset>
            <fieldset className="space-y-1 border-0 p-0 m-0">
              <Label>VIP Rs</Label>
              <Input
                type="number"
                value={priceVip}
                onChange={(e) => setPriceVip(Number(e.target.value))}
                className="bg-secondary"
              />
            </fieldset>
          </section>
          <Button
            type="button"
            className="w-full bg-gradient-primary"
            disabled={!screenId || addMutation.isPending}
            onClick={() => addMutation.mutate()}
          >
            {addMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add slot
          </Button>
        </section>

        <section className="mt-4">
          <p className="text-sm font-semibold mb-2">Slots on {date}</p>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          ) : showtimes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No showtimes for this date.</p>
          ) : (
            <ul className="space-y-2 list-none p-0">
              {showtimes.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-bold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {s.time}
                    </span>
                    <span className="text-xs text-muted-foreground block truncate">
                      {s.cinema} · {s.screen} · {statusLabel(s)} · {s.bookedSeats.length} booked
                    </span>
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-destructive shrink-0"
                    onClick={() => deleteMutation.mutate(s.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default ShowtimeManagerDialog;
