import { useAuthStore } from "@/store/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function posterSrc(
  poster?: string | null
): string | undefined {
  if (!poster) return undefined;
  const idx = poster.indexOf("/uploads/");
  if (idx >= 0) return `${API_ORIGIN}${poster.slice(idx)}`;
  if (/^https?:\/\//.test(poster)) return poster;
  return `${API_ORIGIN}${poster.startsWith("/") ? "" : "/"}${poster}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: HeadersInit = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      (Array.isArray(data?.message) ? data.message.join(", ") : null) ||
      res.statusText;
    throw new ApiError(String(message), res.status, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export const authApi = {
  register: (body: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => api.post<import("@/types").AuthResponse>("/auth/register", body),
  login: (body: { email: string; password: string }) =>
    api.post<import("@/types").AuthResponse>("/auth/login", body),
  me: () => api.get<import("@/types").User>("/auth/me"),
  forgotPassword: (email: string) =>
    api.post<{ message: string; resetCode?: string }>(
      "/auth/forgot-password",
      { email }
    ),
  resetPassword: (body: { email: string; code: string; newPassword: string }) =>
    api.post<{ message: string }>("/auth/reset-password", body),
};

export const moviesApi = {
  list: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return api.get<import("@/types").Movie[]>(`/movies${q ? `?${q}` : ""}`);
  },
  get: (slug: string) => api.get<import("@/types").Movie>(`/movies/${slug}`),
  filters: () => api.get<import("@/types").FiltersMeta>("/movies/filters/meta"),
  showtimes: (slug: string, date: string) =>
    api.get<import("@/types").Slot[]>(
      `/movies/${slug}/showtimes?date=${date}`
    ),
};

export const showtimesApi = {
  seats: (id: string) =>
    api.get<import("@/types").SeatAvailability>(`/showtimes/${id}/seats`),
};

export const bookingsApi = {
  create: (showtimeId: string, seats: string[]) =>
    api.post<import("@/types").Booking>("/bookings", { showtimeId, seats }),
  mine: () => api.get<import("@/types").Booking[]>("/bookings/me"),
  get: (code: string) => api.get<import("@/types").Booking>(`/bookings/${code}`),
  cancel: (code: string) =>
    api.patch<import("@/types").Booking>(`/bookings/${code}/cancel`),
};

export const adminApi = {
  stats: () => api.get<{
    totalBookings: number;
    seatsSold: number;
    revenue: number;
    topMovies: { title: string; seats: number }[];
  }>("/admin/stats"),
  bookings: () => api.get<import("@/types").Booking[]>("/admin/bookings"),
  movies: () => api.get<import("@/types").Movie[]>("/admin/movies"),
  cinemas: () => api.get<import("@/types").AdminCinema[]>("/admin/cinemas"),
  createMovie: (body: import("@/types").MovieFormData) =>
    api.post<import("@/types").Movie>("/admin/movies", body),
  updateMovie: (slug: string, body: Partial<import("@/types").MovieFormData>) =>
    api.patch<import("@/types").Movie>(`/admin/movies/${slug}`, body),
  deleteMovie: (slug: string) => api.delete(`/admin/movies/${slug}`),
  uploadPoster: (slug: string, file: File) => {
    const fd = new FormData();
    fd.append("poster", file);
    return request<import("@/types").Movie>(`/admin/movies/${slug}/poster`, {
      method: "POST",
      body: fd,
    });
  },
  showtimes: (slug: string, date: string) =>
    api.get<import("@/types").Slot[]>(
      `/admin/movies/${slug}/showtimes?date=${date}`
    ),
  createShowtime: (
    slug: string,
    body: {
      screenId: string;
      showDate: string;
      startTime: string;
      priceStandard: number;
      priceVip: number;
    }
  ) => api.post(`/admin/movies/${slug}/showtimes`, body),
  deleteShowtime: (id: string) => api.delete(`/admin/showtimes/${id}`),
};
