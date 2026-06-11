import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "04:30 PM" -> minutes since midnight, or null if unparseable */
export function parseTime12h(time: string): number | null {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + parseInt(m[2], 10);
}

/** True if the slot's date+time is already in the past (local time) */
export function isSlotExpired(dateStr: string, time: string): boolean {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;
  const mins = parseTime12h(time);
  if (mins === null) return false;
  return mins <= now.getHours() * 60 + now.getMinutes();
}
