import { useEffect, useState } from "react";
import { Glass } from "../../ui/Glass";
import { Icon } from "../../ui/icons";
import s from "./Safari.module.css";

type Check = "checking" | "ok" | "blocked";

const FAVORITES = [
  { name: "Vikipedi", url: "https://tr.m.wikipedia.org/wiki/Anasayfa", color: "#55565a" },
  { name: "Harita", url: "https://www.openstreetmap.org/export/embed.html?bbox=28.90,40.99,29.06,41.06&layer=mapnik", color: "#5f9e4a" },
  { name: "Example", url: "https://example.com", color: "#5f6caf" },
  { name: "GitHub", url: "https://github.com", color: "#24292f" },
  { name: "MDN", url: "https://developer.mozilla.org", color: "#1b1b1b" },
  { name: "Bun", url: "https://bun.sh", color: "#c9a26b" },
];

export const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, "");

/** Typed text -> URL: full URLs pass, bare domains get https, anything else searches Wikipedia. */
export function toUrl(input: string): string {
  const text = input.trim();
  if (/^https?:\/\//i.test(text)) return text;
  if (/^[^\s]+\.[a-z]{2,}(\/.*)?$/i.test(text)) return `https://${text}`;
  return `https://tr.m.wikipedia.org/w/index.php?search=${encodeURIComponent(text)}`;
}

/** Sites with X-Frame-Options / frame-ancestors can't be framed; the dev server checks headers for us. */
function useFrameCheck(url: string | null): Check {
  const [check, setCheck] = useState<Check>("checking");
  useEffect(() => {
    if (!url) return;
    let alive = true;
    setCheck("checking");
    fetch(`/api/frame-check?url=${encodeURIComponent(url)}`)
      .then(res => (res.ok ? (res.json() as Promise<{ embeddable: boolean }>) : { embeddable: true }))
      .catch(() => ({ embeddable: true }))
      .then(({ embeddable }) => {
        if (alive) setCheck(embeddable ? "ok" : "blocked");
      });
    return () => {
      alive = false;
    };
  }, [url]);
  return check;
}

export function Page({ url, onOpen }: { url: string | null; onOpen: (url: string) => void }) {
  const check = useFrameCheck(url);
  if (!url) {
    return (
      <div className={s.start}>
        <h2>Favoriler</h2>
        <div className={s.favorites}>
          {FAVORITES.map(f => (
            <button key={f.name} className={s.favorite} onClick={() => onOpen(f.url)}>
              <span style={{ background: f.color }}>{f.name[0]}</span>
              {f.name}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (check === "checking") return <p className={s.status}>Yükleniyor…</p>;
  if (check === "blocked") {
    return (
      <Glass className={s.blocked}>
        <Icon name="lock" size={30} />
        <b>{hostOf(url)} burada açılamıyor</b>
        <span>Site, başka sayfaların içine gömülmeyi X-Frame-Options / CSP ile engelliyor.</span>
        <a href={url} target="_blank" rel="noreferrer">Yeni sekmede aç</a>
      </Glass>
    );
  }
  return <iframe className={s.frame} src={url} title={hostOf(url)} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" referrerPolicy="no-referrer" />;
}
