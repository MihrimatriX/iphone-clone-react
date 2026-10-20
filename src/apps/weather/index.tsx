import { useEffect, useState } from "react";
import { useOS } from "../../os/store";
import { AppFrame } from "../../ui/AppFrame";
import { Glass } from "../../ui/Glass";
import { Icon } from "../../ui/icons";
import { condition, ISTANBUL, loadWeather } from "./api";
import s from "./Weather.module.css";

const GEO_TIMEOUT_MS = 6000;
type Status = "loading" | "ready" | "error";

/** Asks for location once per visit; falls back to Istanbul when denied or unavailable. */
function useLocatedWeather(): Status {
  const [status, setStatus] = useState<Status>(() => (useOS.getState().weather ? "ready" : "loading"));
  useEffect(() => {
    const fetchFor = (lat: number, lon: number, place: string) =>
      loadWeather(lat, lon, place)
        .then(() => setStatus("ready"))
        .catch(() => setStatus(useOS.getState().weather ? "ready" : "error"));
    const fallback = () => fetchFor(ISTANBUL.lat, ISTANBUL.lon, ISTANBUL.place);
    if (!navigator.geolocation) {
      void fallback();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => fetchFor(pos.coords.latitude, pos.coords.longitude, "Konumum"),
      fallback,
      { timeout: GEO_TIMEOUT_MS, maximumAge: 600_000 },
    );
  }, []);
  return status;
}

export default function Weather() {
  const status = useLocatedWeather();
  const weather = useOS(st => st.weather);
  const sky = condition(weather?.code ?? 0, weather?.isDay ?? true);
  const week = weather?.daily ?? [];
  const min = Math.min(...week.map(d => d.lo));
  const max = Math.max(...week.map(d => d.hi));

  return (
    <AppFrame dark background="#1b2a44">
      <div className={`${s.sky} ${s[sky.sky]} ${weather?.isDay === false ? s.night : ""}`} aria-hidden="true">
        <i /><i /><i />
      </div>
      {status === "error" && !weather && <p className={s.message}>Hava durumu alınamadı. İnternet bağlantınızı kontrol edin.</p>}
      {status === "loading" && !weather && <p className={s.message}>Yükleniyor…</p>}
      {weather && (
        <div className={s.content}>
          <header className={s.hero}>
            <h1>{weather.place}</h1>
            <span className={s.temp}>{weather.temp}°</span>
            <span>{sky.label}</span>
            {week[0] && <span>Y: {week[0].hi}°  D: {week[0].lo}°</span>}
          </header>
          <Glass className={s.card}>
            <h2>Saatlik tahmin</h2>
            <div className={s.hours}>
              {weather.hourly.map((h, i) => (
                <span key={h.hour} className={s.hour}>
                  <small>{i === 0 ? "Şimdi" : String(h.hour).padStart(2, "0")}</small>
                  <Icon name={condition(h.code).icon} size={22} />
                  <b>{h.temp}°</b>
                </span>
              ))}
            </div>
          </Glass>
          <Glass className={s.card}>
            <h2>7 günlük tahmin</h2>
            {week.map(d => (
              <div key={d.day} className={s.day}>
                <span className={s.dayName}>{d.day}</span>
                <Icon name={condition(d.code).icon} size={20} />
                <span className={s.lo}>{d.lo}°</span>
                <span className={s.bar}>
                  <i style={{ left: `${((d.lo - min) / (max - min || 1)) * 100}%`, right: `${((max - d.hi) / (max - min || 1)) * 100}%` }} />
                </span>
                <span>{d.hi}°</span>
              </div>
            ))}
          </Glass>
        </div>
      )}
    </AppFrame>
  );
}
