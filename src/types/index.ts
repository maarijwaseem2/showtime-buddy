export type SlotStatus = "available" | "almost-full" | "full";

export interface Slot {
  id: string;
  time: string;
  status: SlotStatus;
  cinema: string;
  screen: string;
  priceStandard: number;
  priceVip: number;
  bookedSeats: string[];
  showDate?: string;
}

export interface Movie {
  id: string;
  title: string;
  poster: string | null;
  genre: string[];
  language: string;
  duration: string;
  rating: number;
  ageRating: string;
  releaseDate: string;
  description: string;
  cast: string[];
  director: string;
  status: "now-showing" | "upcoming";
  slots?: Slot[];
}

export interface Booking {
  id: string;
  movieId: string;
  movieTitle: string;
  poster: string | null;
  cinema: string;
  screen: string;
  date: string;
  time: string;
  seats: string[];
  total: number;
  status: "confirmed" | "cancelled";
  createdAt: number;
  userEmail?: string;
  userName?: string;
}

export interface AdminCinema {
  id: string;
  name: string;
  screens: { id: string; name: string; label: string }[];
}

export interface MovieFormData {
  slug: string;
  title: string;
  genre: string[];
  language: string;
  duration: string;
  rating: number;
  ageRating: string;
  releaseDate: string;
  description: string;
  cast: string[];
  director: string;
  status: "now-showing" | "upcoming";
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "USER" | "ADMIN";
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface SeatAvailability {
  showtimeId: string;
  bookedSeats: string[];
  availableSeats: string[];
  status: SlotStatus;
  vipRows: string[];
  priceStandard: number;
  priceVip: number;
  cinema: string;
  screen: string;
  time: string;
  showDate: string;
  movie: { id: string; title: string; poster: string | null };
}

export interface FiltersMeta {
  genres: string[];
  languages: string[];
  cinemas: string[];
}
