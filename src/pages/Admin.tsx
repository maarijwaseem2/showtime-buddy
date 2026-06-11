import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Film,
  Ticket,
  DollarSign,
  TrendingUp,
  Calendar,
  MapPin,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Clock,
  LayoutDashboard,
  Clapperboard,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { adminApi, ApiError, posterSrc } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MovieFormDialog from "@/components/admin/MovieFormDialog";
import ShowtimeManagerDialog from "@/components/admin/ShowtimeManagerDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Movie } from "@/types";
import { toast } from "sonner";

const Stat = ({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "gold" | "success";
}) => (
  <article className="rounded-xl border border-border/60 bg-gradient-card p-4 sm:p-5">
    <header className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <span
        className={`h-9 w-9 rounded-lg flex items-center justify-center ${
          accent === "gold"
            ? "bg-gold/15 text-gold"
            : accent === "success"
              ? "bg-success/15 text-success"
              : "bg-primary/15 text-primary"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
    </header>
    <p className="mt-3 text-2xl sm:text-3xl font-extrabold">{value}</p>
  </article>
);

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const [movieDialogOpen, setMovieDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [showtimeMovie, setShowtimeMovie] = useState<Movie | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Movie | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.stats(),
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => adminApi.bookings(),
  });

  const { data: movies = [], isLoading: moviesLoading } = useQuery({
    queryKey: ["admin", "movies"],
    queryFn: () => adminApi.movies(),
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => adminApi.deleteMovie(slug),
    onSuccess: () => {
      toast.success("Movie deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "movies"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    },
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["movies"] });
  };

  const openAdd = () => {
    setEditingMovie(null);
    setMovieDialogOpen(true);
  };

  const openEdit = (m: Movie) => {
    setEditingMovie(m);
    setMovieDialogOpen(true);
  };

  return (
    <section className="container py-6 sm:py-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            Admin portal
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {user?.fullName} · {user?.email}
          </p>
        </section>
        <nav className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <Clapperboard className="h-4 w-4" /> View site
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => logout()}>
            Sign out
          </Button>
        </nav>
      </header>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-secondary/80 p-1 overflow-x-auto">
          <TabsTrigger value="overview" className="flex-1 sm:flex-none gap-1.5">
            <LayoutDashboard className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="movies" className="flex-1 sm:flex-none gap-1.5">
            <Film className="h-4 w-4" /> Movies
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex-1 sm:flex-none gap-1.5">
            <Ticket className="h-4 w-4" /> Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {statsLoading ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto mt-12" />
          ) : (
            <>
              <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Stat label="Total Bookings" value={stats?.totalBookings ?? 0} icon={Ticket} accent="primary" />
                <Stat label="Seats Sold" value={stats?.seatsSold ?? 0} icon={TrendingUp} accent="success" />
                <Stat label="Revenue" value={`Rs ${(stats?.revenue ?? 0).toLocaleString()}`} icon={DollarSign} accent="gold" />
                <Stat label="Movies" value={movies.length} icon={Film} accent="primary" />
              </section>

              <section className="mt-8 grid gap-6 lg:grid-cols-2">
                <article className="rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
                  <h2 className="text-lg font-bold">Most booked movies</h2>
                  {(stats?.topMovies ?? []).length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">No bookings yet.</p>
                  ) : (
                    <ul className="mt-4 space-y-3 list-none p-0">
                      {stats!.topMovies.map((item, i) => (
                        <li key={item.title}>
                          <p className="flex justify-between text-sm gap-2">
                            <span className="font-medium truncate">
                              #{i + 1} {item.title}
                            </span>
                            <span className="text-muted-foreground shrink-0">{item.seats} seats</span>
                          </p>
                          <span className="mt-1 block h-1.5 bg-secondary rounded-full overflow-hidden">
                            <span
                              className="block h-full bg-gradient-primary"
                              style={{
                                width: `${stats!.topMovies[0].seats ? (item.seats / stats!.topMovies[0].seats) * 100 : 0}%`,
                              }}
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>

                <article className="rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
                  <h2 className="text-lg font-bold">Recent bookings</h2>
                  {bookingsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mt-6 mx-auto" />
                  ) : bookings.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">No bookings yet.</p>
                  ) : (
                    <ul className="mt-4 divide-y divide-border/60 list-none p-0 max-h-64 overflow-y-auto">
                      {bookings.slice(0, 6).map((b) => (
                        <li key={b.id} className="py-3 flex gap-3">
                          {b.poster && (
                            <img src={posterSrc(b.poster)} alt="" className="h-10 w-8 rounded object-cover shrink-0" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="font-semibold text-sm block truncate">{b.movieTitle}</span>
                            <span className="text-xs text-muted-foreground">
                              Rs {b.total} · {b.seats.length} seats
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </section>
            </>
          )}
        </TabsContent>

        <TabsContent value="movies" className="mt-6">
          <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold">Manage movies</h2>
            <Button className="bg-gradient-primary shadow-glow" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add movie
            </Button>
          </header>

          {moviesLoading ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto mt-8" />
          ) : movies.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No movies. Add your first movie.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 list-none p-0">
              {movies.map((m) => (
                <li
                  key={m.id}
                  className="rounded-xl border border-border/60 bg-gradient-card p-3 flex flex-col"
                >
                  <section className="flex gap-3">
                    {m.poster ? (
                      <img src={posterSrc(m.poster)} alt="" className="h-24 w-16 rounded object-cover shrink-0" />
                    ) : (
                      <span className="h-24 w-16 rounded bg-secondary shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                        No img
                      </span>
                    )}
                    <section className="min-w-0 flex-1">
                      <p className="font-bold truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{m.genre.join(", ")}</p>
                      <p className="mt-1 text-xs">
                        <span
                          className={
                            m.status === "now-showing" ? "text-success font-semibold" : "text-gold font-semibold"
                          }
                        >
                          {m.status}
                        </span>
                        {" · "}
                        {m.duration}
                      </p>
                    </section>
                  </section>
                  <nav className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-border/60">
                    <Button size="sm" variant="outline" className="h-8 flex-1" onClick={() => openEdit(m)}>
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 flex-1"
                      onClick={() => setShowtimeMovie(m)}
                    >
                      <Clock className="h-3 w-3" /> Slots
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(m)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </nav>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <h2 className="text-lg font-bold mb-4">All bookings</h2>
          {bookingsLoading ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          ) : bookings.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center">No bookings yet.</p>
          ) : (
            <section className="rounded-2xl border border-border/60 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-secondary/80 text-left">
                  <tr>
                    <th className="p-3 font-semibold">Movie</th>
                    <th className="p-3 font-semibold">Customer</th>
                    <th className="p-3 font-semibold">When</th>
                    <th className="p-3 font-semibold">Cinema</th>
                    <th className="p-3 font-semibold">Seats</th>
                    <th className="p-3 font-semibold text-right">Total</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-t border-border/60">
                      <td className="p-3 font-medium">{b.movieTitle}</td>
                      <td className="p-3 text-muted-foreground">
                        <span className="block text-foreground">{b.userName ?? "—"}</span>
                        <span className="text-xs">{b.userEmail ?? ""}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {format(parseISO(b.date), "d MMM yyyy")}
                        <br />
                        <span className="text-muted-foreground">{b.time}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {b.cinema}
                        <br />
                        <span className="text-xs">{b.screen}</span>
                      </td>
                      <td className="p-3">{b.seats.join(", ")}</td>
                      <td className="p-3 text-right font-bold">Rs {b.total}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            b.status === "confirmed"
                              ? "bg-success/15 text-success"
                              : "bg-destructive/15 text-destructive"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </TabsContent>
      </Tabs>

      <MovieFormDialog
        open={movieDialogOpen}
        onOpenChange={setMovieDialogOpen}
        movie={editingMovie}
        onSuccess={refreshAll}
      />

      <ShowtimeManagerDialog
        open={!!showtimeMovie}
        onOpenChange={(o) => !o && setShowtimeMovie(null)}
        movie={showtimeMovie}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete movie?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{deleteTarget?.title}&quot; and all its showtimes. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

const Admin = () => (
  <ProtectedRoute adminOnly>
    <AdminDashboard />
  </ProtectedRoute>
);

export default Admin;
