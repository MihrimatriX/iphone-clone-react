import type { IconName } from "../../ui/icons";
import { useOS, type Weather } from "../../os/store";

export const ISTANBUL = { lat: 41.01, lon: 28.97, place: "İstanbul" };
const STALE_MS = 30 * 60_000;
let lastFetch = 0;

export type Sky = "clear" | "cloudy" | "rain" | "snow" | "storm" | "fog";

/** WMO weather code -> Turkish label, glyph and animated background kind. */
export function condition(code: number, isDay = true): { label: string; icon: IconName; sky: Sky } {
  if (code === 0) return { label: isDay ? "Güneşli" : "Açık", icon: isDay ? "sun" : "moon", sky: "clear" };
  if (code <= 3) return { label: "Parçalı Bulutlu", icon: "sunCloud", sky: "cloudy" };
  if (code <= 48) return { label: "Sisli", icon: "fog", sky: "fog" };
  if (code <= 67 || (code >= 80 && code <= 82)) return { label: "Yağmurlu", icon: "rain", sky: "rain" };
  if (code <= 77 || code === 85 || code === 86) return { label: "Karlı", icon: "snow", sky: "snow" };
  return { label: "Fırtınalı", icon: "bolt", sky: "storm" };
}

type ForecastResponse = {
  current: { temperature_2m: number; weather_code: number; is_day: number };
  hourly: { time: string[]; temperature_2m: number[]; weather_code: number[] };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
};

/** Fetches Open-Meteo (no API key) and stores the result for the app and the home widget. */
export async function loadWeather(lat: number, lon: number, place: string): Promise<void> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,weather_code,is_day",
    hourly: "temperature_2m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "7",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data = (await res.json()) as ForecastResponse;
  const nowHour = new Date().getHours();
  const from = Math.max(0, data.hourly.time.findIndex(t => new Date(t).getHours() === nowHour));
  const weather: Weather = {
    place,
    temp: Math.round(data.current.temperature_2m),
    code: data.current.weather_code,
    isDay: data.current.is_day === 1,
    hourly: data.hourly.time.slice(from, from + 12).map((t, i) => ({
      hour: new Date(t).getHours(),
      temp: Math.round(data.hourly.temperature_2m[from + i] ?? 0),
      code: data.hourly.weather_code[from + i] ?? 0,
    })),
    daily: data.daily.time.map((t, i) => ({
      day: i === 0 ? "Bugün" : new Date(t).toLocaleDateString("tr-TR", { weekday: "short" }),
      code: data.daily.weather_code[i] ?? 0,
      hi: Math.round(data.daily.temperature_2m_max[i] ?? 0),
      lo: Math.round(data.daily.temperature_2m_min[i] ?? 0),
    })),
  };
  lastFetch = Date.now();
  useOS.setState({ weather });
}

/** Widget refresh: Istanbul unless the app already resolved a location; never prompts for permission. */
export function refreshWeatherIfStale() {
  if (Date.now() - lastFetch < STALE_MS) return;
  lastFetch = Date.now();
  const place = useOS.getState().weather?.place;
  if (place && place !== ISTANBUL.place) return;
  loadWeather(ISTANBUL.lat, ISTANBUL.lon, ISTANBUL.place).catch(() => (lastFetch = 0));
}
