import movie1 from "@/assets/movie-1.jpg";
import movie2 from "@/assets/movie-2.jpg";
import movie3 from "@/assets/movie-3.jpg";
import movie4 from "@/assets/movie-4.jpg";
import movie5 from "@/assets/movie-5.jpg";
import movie6 from "@/assets/movie-6.jpg";

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
}

export interface Movie {
  id: string;
  title: string;
  poster: string;
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
  slots: Slot[];
}

const mkSlots = (seed: number): Slot[] => [
  {
    id: `s${seed}-1`,
    time: "12:30 PM",
    status: "available",
    cinema: "Atrium Cinema",
    screen: "Screen 1",
    priceStandard: 800,
    priceVip: 1200,
    bookedSeats: ["A3", "B5", "D7"],
  },
  {
    id: `s${seed}-2`,
    time: "03:00 PM",
    status: "available",
    cinema: "Nueplex Cinema",
    screen: "VIP Hall",
    priceStandard: 900,
    priceVip: 1400,
    bookedSeats: ["C2", "C3", "F8", "G1"],
  },
  {
    id: `s${seed}-3`,
    time: "06:00 PM",
    status: "almost-full",
    cinema: "Cinepax",
    screen: "Screen 2",
    priceStandard: 1000,
    priceVip: 1500,
    bookedSeats: ["A1","A2","A3","A4","B1","B2","B3","C1","C2","D1","D2","E1","E2","F1","F2","F3","G1","G2","H1","H2","H3","H4","H5"],
  },
  {
    id: `s${seed}-4`,
    time: "09:30 PM",
    status: "full",
    cinema: "Universal Cinema",
    screen: "Screen 3",
    priceStandard: 1000,
    priceVip: 1500,
    bookedSeats: [],
  },
];

export const movies: Movie[] = [
  {
    id: "the-dark-night",
    title: "The Dark Night",
    poster: movie1,
    genre: ["Action", "Thriller"],
    language: "English",
    duration: "2h 32m",
    rating: 8.9,
    ageRating: "PG-13",
    releaseDate: "2026-05-01",
    description: "A vigilante battles a chaos-loving mastermind across a neon-soaked city in this gripping action thriller.",
    cast: ["Liam Carter", "Sofia Reyes", "Marcus Chen"],
    director: "Nora Black",
    status: "now-showing",
    slots: mkSlots(1),
  },
  {
    id: "starlight-promise",
    title: "Starlight Promise",
    poster: movie2,
    genre: ["Romance", "Drama"],
    language: "English",
    duration: "1h 58m",
    rating: 7.8,
    ageRating: "PG",
    releaseDate: "2026-04-22",
    description: "Two strangers meet under a meteor shower and discover a love that bends time itself.",
    cast: ["Ava Monroe", "Daniel Park"],
    director: "Iris Lane",
    status: "now-showing",
    slots: mkSlots(2),
  },
  {
    id: "faric-beyond",
    title: "Faric: Beyond",
    poster: movie3,
    genre: ["Sci-Fi", "Adventure"],
    language: "English",
    duration: "2h 18m",
    rating: 8.4,
    ageRating: "PG-13",
    releaseDate: "2026-05-10",
    description: "An astronaut crash-lands on a glowing alien world and must decode its secrets to make it home.",
    cast: ["Ethan Cole", "Maya Singh"],
    director: "Ravi Mehta",
    status: "now-showing",
    slots: mkSlots(3),
  },
  {
    id: "whispering-woods",
    title: "Whispering Woods",
    poster: movie4,
    genre: ["Horror", "Mystery"],
    language: "Urdu",
    duration: "1h 47m",
    rating: 7.2,
    ageRating: "R",
    releaseDate: "2026-05-15",
    description: "A team of paranormal investigators enters a forest where the trees remember every scream.",
    cast: ["Hira Khan", "Bilal Ahmed"],
    director: "Sara Tariq",
    status: "now-showing",
    slots: mkSlots(4),
  },
  {
    id: "dragon-realm",
    title: "Dragon Realm",
    poster: movie5,
    genre: ["Animation", "Family"],
    language: "English",
    duration: "1h 45m",
    rating: 8.1,
    ageRating: "U",
    releaseDate: "2026-06-01",
    description: "Two siblings befriend a fire-breathing dragon and journey across floating islands to save their kingdom.",
    cast: ["Voice: Lily Ross", "Voice: Sam Park"],
    director: "Toby Lin",
    status: "upcoming",
    slots: mkSlots(5),
  },
  {
    id: "road-trippers",
    title: "Road Trippers",
    poster: movie6,
    genre: ["Comedy"],
    language: "English",
    duration: "1h 52m",
    rating: 7.5,
    ageRating: "PG-13",
    releaseDate: "2026-05-20",
    description: "Four friends, one vintage convertible, and a road trip that goes hilariously off the rails.",
    cast: ["Jess Hill", "Omar Faruq", "Nina Tate", "Leo Park"],
    director: "Maya Diaz",
    status: "upcoming",
    slots: mkSlots(6),
  },
];

export const cinemas = [
  "Atrium Cinema",
  "Nueplex Cinema",
  "Cinepax",
  "Universal Cinema",
];

export const allGenres = Array.from(
  new Set(movies.flatMap((m) => m.genre))
).sort();

export const allLanguages = Array.from(
  new Set(movies.map((m) => m.language))
).sort();
