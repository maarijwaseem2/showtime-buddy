# ShowSeat — Real-Time Cinema Seat Booking

ShowSeat is a cinema booking web app: browse what is playing, pick a showtime, and reserve seats on an interactive seat map. Admins manage the catalog, schedules, and bookings from the same app. This repository is the frontend. The API lives in a separate repo and is not renamed here.

[![Live demo](https://img.shields.io/badge/live_demo-ShowSeat-e11d48?style=for-the-badge)](https://maarijwaseem2-showtime-buddy.vercel.app)
[![React](https://img.shields.io/badge/React-18-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

## Live demo

**https://maarijwaseem2-showtime-buddy.vercel.app**

The demo talks to the deployed API. For local work, run this app against a local API (see [Local setup](#local-setup)).

## Screenshots

Replace the placeholders in [`docs/screenshots/`](docs/screenshots/) with captures from the live app. Paths below are what the README expects.

| Home | Showtimes |
| --- | --- |
| ![ShowSeat home placeholder](docs/screenshots/home.svg) | ![ShowSeat showtimes placeholder](docs/screenshots/showtimes.svg) |

| Seat map | Admin |
| --- | --- |
| ![ShowSeat seat map placeholder](docs/screenshots/seat-map.svg) | ![ShowSeat admin placeholder](docs/screenshots/admin.svg) |

## Features

Verified against this frontend and the [backend](https://github.com/maarijwaseem2/showtime-buddy-backend).

**Browse movies and showtimes**

- Now showing and upcoming catalogs, with search plus genre and language filters.
- Movie detail page with poster, cast, and a seven-day date strip.
- Showtimes for the selected date, including cinema, screen, standard and VIP prices, and how full the show is.

**Seat map**

- Interactive map for a showtime: available, selected, VIP, and already booked seats.
- Availability is loaded from `GET /showtimes/:id/seats` when the map opens, so the grid matches seats booked so far.
- Standard and VIP prices are totaled before confirm. Creating a booking requires a signed-in user.
- The API rejects a seat that was taken in the meantime, inside a database transaction.
- Confirmation page, a personal bookings list, and cancellation.

**Admin panel** (signed-in users with the `ADMIN` role)

- Overview: total bookings, seats sold, revenue, and most-booked titles.
- Movies: create, edit, delete, and upload a poster.
- Schedules: add or remove showtimes on an existing screen (date, start time, standard price, VIP price).
- Bookings table across customers.

**Screen layouts**

Each screen in the API stores its rows, column count, and VIP rows (defaults are rows A–H, 10 seats across, VIP on A and B). The booking page renders that default grid and paints VIP rows from the seats response. The admin panel assigns a showtime to an existing screen. It does not yet edit the grid itself.

Accounts also include sign up, sign in, and a reset-code password flow.

## Architecture

```mermaid
flowchart LR
  subgraph client ["This repo · showtime-buddy"]
    UI["ShowSeat UI<br/>React, Vite, TypeScript"]
  end

  subgraph api ["showtime-buddy-backend"]
    Nest["NestJS REST API<br/>/api"]
    DB[("PostgreSQL<br/>TypeORM")]
    Media["Poster files"]
  end

  Browser["Browser"] --> UI
  UI -->|"JSON + Bearer JWT<br/>VITE_API_URL"| Nest
  Nest --> DB
  Nest --> Media
  UI -->|"poster URLs"| Media
```

| Piece | Where it lives |
| --- | --- |
| Frontend (this repo) | [maarijwaseem2/showtime-buddy](https://github.com/maarijwaseem2/showtime-buddy), deployed on Vercel |
| API | [maarijwaseem2/showtime-buddy-backend](https://github.com/maarijwaseem2/showtime-buddy-backend) (NestJS) |
| Data | PostgreSQL via TypeORM. Movies, users, cinemas, screens, showtimes, and bookings |
| Auth | JWT access token stored in the client. Admin routes require the `ADMIN` role |

The UI never talks to the database directly. `VITE_API_URL` points at the API (default `http://localhost:3000/api`). In dev, Vite also proxies `/uploads` to the API so poster images resolve locally.

## Tech stack

**Frontend**

- React 18 and TypeScript
- Vite 5
- Tailwind CSS and Radix UI
- React Router
- TanStack Query
- Zustand
- React Hook Form and Zod

**Backend** (separate repository)

- NestJS
- TypeORM and PostgreSQL
- JWT and bcrypt
- Poster uploads

## Local setup

Requirements: Node.js 20+ and npm. The API from [showtime-buddy-backend](https://github.com/maarijwaseem2/showtime-buddy-backend) should be running if you want live data. Its own README covers database setup.

```bash
npm install
cp .env.example .env
npm run dev
```

The dev server listens on port **8080**.

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

## Environment variables

Names only. Copy `.env.example` and set values locally or in the host. Do not commit `.env`.

| Name | Used by |
| --- | --- |
| `VITE_API_URL` | This frontend. Base URL of the API, including the `/api` prefix |

The API process has its own variables (database URL, JWT secret, CORS origins, and admin seed identity). Those belong in the backend repo, not here.

## Roadmap

- Admin editor for screen layouts (rows, columns, VIP rows), and a seat map that follows a non-default layout.
- Seat-map refresh while the page is open, so other bookings appear without a reload.
- Checkout hold so a selected seat is reserved for a short window before payment.
- Card or wallet payments.
- Email delivery for password-reset codes.

## Author

**Syed Abdul Maarij**

- GitHub: [maarijwaseem2](https://github.com/maarijwaseem2)
- LinkedIn: [linkedin.com/in/maarijwaseem2](https://www.linkedin.com/in/maarijwaseem2)
