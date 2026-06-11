import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { AlertTriangle, Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { Movie, Slot } from "@/types";
import { adminApi } from "@/lib/api";
import { isSlotExpired } from "@/lib/utils";
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
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "sonner";

// 09:00 AM to 11:30 PM, 30-minute steps
const TIME_OPTIONS: string[] = [];
for (let h = 9; h <= 23; h++) {
  for (const m of [0, 30]) {
    const hh12 = ((h + 11) % 12) + 1;
    const ampm = h < 12 ? "AM" : "PM";
    TIME_OPTIONS.push(
      `${String(hh12).padStart(2, "0")}:${m === 0 ? "00" : "30"} ${ampm}`
    );
  }
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movie: Movie | null;
};

const ShowtimeManagerDialog = ({ open, onOpenChange, movie }: Props) => {
  const queryClient = useQueryClient();
  const minDate = format(new Date(), "yyyy-MM-dd");
  const maxDate = format(addDays(new Date(), 6), "yyyy-MM-dd");
  const [date, setDate] = useState(minDate);
  const dateOutOfRange = date < minDate || date > maxDate;
  const [screenId, setScreenId] = useState("");
  const [times, setTimes] = useState<string[]>([]);
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
    mutationFn: async () => {
      const results = await Promise.allSettled(
        times.map((t) =>
          adminApi.createShowtime(movie!.id, {
            screenId,
            showDate: date,
            startTime: t,
            priceStandard,
            priceVip,
          })
        )
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      return { added: times.length - failed, failed };
    },
    onSuccess: ({ added, failed }) => {
      if (failed > 0) {
        toast.warning(`${added} slot(s) added, ${failed} failed`);
      } else {
        toast.success(`${added} slot(s) added`);
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "showtimes", movie?.id] });
      setTimes([]);
    },
    onError: () => {
      toast.error("Failed to add showtimes");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteShowtime(id),
    onSuccess: () => {
      toast.success("Showtime removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "showtimes", movie?.id] });
    },
    onError: () => {
      toast.error("Failed to delete");
    },
  });

  const statusLabel = (s: Slot) => {
    if (s.status === "full") return "Full";
    if (s.status === "almost-full") return "Filling fast";
    return "Available";
  };

  const expiredSlots = showtimes.filter((s) => isSlotExpired(date, s.time));
  const fullSlots = showtimes.filter((s) => s.status === "full");
  const allUnavailable =
    showtimes.length > 0 &&
    showtimes.every((s) => s.status === "full" || isSlotExpired(date, s.time));

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
            min={minDate}
            max={maxDate}
            onChange={(e) => setDate(e.target.value)}
            className="bg-secondary"
          />
          <p className="text-[11px] text-muted-foreground">
            Slots can only be added for the next 7 days ({minDate} to {maxDate})
          </p>
          {dateOutOfRange && (
            <p className="text-[11px] text-destructive font-semibold">
              This date is outside the 7-day window — pick a date between {minDate} and {maxDate}.
            </p>
          )}
        </fieldset>

        {expiredSlots.length > 0 && (
          <p className="flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs text-gold">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            Time has passed for {expiredSlots.length} slot(s) on this date —
            please add new slots for upcoming hours.
          </p>
        )}
        {fullSlots.length > 0 && (
          <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            {allUnavailable
              ? "All slots are fully booked or expired — add more showtimes so customers can book."
              : `${fullSlots.length} slot(s) fully booked (seats full).`}
          </p>
        )}

        <section className="mt-2 rounded-xl border border-border/60 p-4 space-y-3 bg-secondary/30">
          <p className="text-sm font-semibold">Add showtimes</p>
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

          <fieldset className="space-y-1 border-0 p-0 m-0">
            <Label>Times (select one or more)</Label>
            <MultiSelect
              options={TIME_OPTIONS}
              selected={times}
              onChange={setTimes}
              placeholder="Select times"
            />
          </fieldset>

          <section className="grid grid-cols-2 gap-2">
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
            disabled={
              !screenId ||
              times.length === 0 ||
              dateOutOfRange ||
              addMutation.isPending
            }
            onClick={() => addMutation.mutate()}
          >
            {addMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add {times.length > 1 ? `${times.length} slots` : "slot"}
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
              {showtimes.map((s) => {
                const expired = isSlotExpired(date, s.time);
                return (
                  <li
                    key={s.id}
                    className={`flex items-center justify-between gap-2 rounded-lg border p-3 text-sm ${
                      expired
                        ? "border-gold/40 bg-gold/5"
                        : s.status === "full"
                          ? "border-destructive/40 bg-destructive/5"
                          : "border-border/60"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="font-bold flex items-center gap-2 flex-wrap">
                        <Clock className="h-3.5 w-3.5" /> {s.time}
                        {expired && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-gold/15 text-gold">
                            Time passed
                          </span>
                        )}
                        {!expired && s.status === "full" && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive">
                            Seats full
                          </span>
                        )}
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
                );
              })}
            </ul>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default ShowtimeManagerDialog;
