import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Movie, Slot } from "@/data/movies";

export interface Booking {
  id: string;
  movieId: string;
  movieTitle: string;
  poster: string;
  cinema: string;
  screen: string;
  date: string; // ISO date
  time: string;
  seats: string[];
  total: number;
  status: "confirmed" | "cancelled";
  createdAt: number;
}

interface BookingState {
  bookings: Booking[];
  isAdmin: boolean;
  setAdmin: (v: boolean) => void;
  addBooking: (b: Omit<Booking, "id" | "createdAt" | "status">) => Booking;
  cancelBooking: (id: string) => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: [],
      isAdmin: false,
      setAdmin: (v) => set({ isAdmin: v }),
      addBooking: (b) => {
        const booking: Booking = {
          ...b,
          id: `BK-${Date.now().toString(36).toUpperCase()}`,
          createdAt: Date.now(),
          status: "confirmed",
        };
        set({ bookings: [booking, ...get().bookings] });
        return booking;
      },
      cancelBooking: (id) =>
        set({
          bookings: get().bookings.map((b) =>
            b.id === id ? { ...b, status: "cancelled" } : b
          ),
        }),
    }),
    { name: "cineslot-bookings" }
  )
);

export const seatsForBooking = (movie: Movie, slot: Slot, dateISO: string) => {
  // collect already-booked seats for the same movie/slot/date from local bookings
  const local = useBookingStore.getState().bookings
    .filter(
      (b) =>
        b.status === "confirmed" &&
        b.movieId === movie.id &&
        b.time === slot.time &&
        b.date === dateISO
    )
    .flatMap((b) => b.seats);
  return new Set([...slot.bookedSeats, ...local]);
};
