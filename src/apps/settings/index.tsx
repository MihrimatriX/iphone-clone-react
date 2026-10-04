import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { haptic } from "../../lib/haptics";
import { useOS, type OS } from "../../os/store";
import { AppFrame } from "../../ui/AppFrame";
import { Avatar } from "../../ui/Avatar";
import { Icon, type IconName } from "../../ui/icons";
import { Row, Section } from "../../ui/List";
import { Sheet } from "../../ui/Sheet";
import { Slider } from "../../ui/Slider";
import { Toggle } from "../../ui/Toggle";
import { About, Account, PROFILE, Wallpapers } from "./Pages";
import s from "./Settings.module.css";

type Page = "root" | "wallpaper" | "about" | "account";
type BoolKey = "airplane" | "wifi" | "bluetooth" | "focus" | "sound" | "haptics" | "silent" | "dark" | "lowPower";
type Entry = { label: string; icon: IconName; color: string; k?: BoolKey; go?: Page };
const TEXT_SCALE = { min: 0.85, max: 1.3 };

/** Every switch and sub-page row, shared by the grouped list and the search results. */
const E = {
  airplane: { label: "Uçak Modu", icon: "airplane", color: "var(--orange)", k: "airplane" },
  wifi: { label: "Wi-Fi", icon: "wifi", color: "var(--tint)", k: "wifi" },
  bluetooth: { label: "Bluetooth", icon: "bluetooth", color: "var(--tint)", k: "bluetooth" },
  focus: { label: "Odak", icon: "moon", color: "#5e5ce6", k: "focus" },
  sound: { label: "Sistem Sesleri", icon: "speaker", color: "#ff2d55", k: "sound" },
  haptics: { label: "Dokunsal Geri Bildirim", icon: "hand", color: "#ff2d55", k: "haptics" },
  silent: { label: "Sessiz Mod", icon: "bellSlash", color: "var(--red)", k: "silent" },
  dark: { label: "Karanlık Mod", icon: "textSize", color: "var(--tint)", k: "dark" },
  lowPower: { label: "Düşük Güç Modu", icon: "bolt", color: "var(--green)", k: "lowPower" },
  wallpaper: { label: "Duvar Kağıdı", icon: "palette", color: "#32ade6", go: "wallpaper" },
  about: { label: "Hakkında", icon: "info", color: "var(--gray)", go: "about" },
} satisfies Record<string, Entry>;

const set = (patch: Partial<OS>) => useOS.setState(patch);
const normalize = (text: string) => text.toLocaleLowerCase("tr-TR");

function EntryRow({ e, go }: { e: Entry; go: (p: Page) => void }) {
  const on = useOS(st => (e.k ? st[e.k] : false));
  if (!e.k) return <Row label={e.label} icon={e.icon} iconColor={e.color} chevron onClick={() => e.go && go(e.go)} />;
  const k = e.k;
  return (
    <Row label={e.label} icon={e.icon} iconColor={e.color}>
      <Toggle on={on} label={e.label} onChange={v => set({ [k]: v })} />
    </Row>
  );
}

function resetEverything() {
  haptic("warning");
  localStorage.removeItem("iphone-os");
  indexedDB.deleteDatabase("iphone-photos");
  indexedDB.deleteDatabase("iphone-meta");
  location.reload();
}

function SearchField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className={s.search}>
      <Icon name="search" size={17} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder="Ara" aria-label="Ayarlarda ara" />
      {value && <button aria-label="Temizle" className={s.clear} onClick={() => onChange("")}><Icon name="xmark" size={10} /></button>}
    </label>
  );
}

export default function Settings() {
  const [page, setPage] = useState<Page>("root");
  const [query, setQuery] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const os = useOS(useShallow(st => ({ volume: st.volume, brightness: st.brightness, textScale: st.textScale, action: st.actionButton })));
  const back = () => setPage("root");
  if (page === "wallpaper") return <Wallpapers onBack={back} />;
  if (page === "about") return <About onBack={back} />;
  if (page === "account") return <Account onBack={back} />;
  const textValue = (os.textScale - TEXT_SCALE.min) / (TEXT_SCALE.max - TEXT_SCALE.min);
  const q = normalize(query.trim());
  const hits = Object.values(E).filter(e => normalize(e.label).includes(q));
  const row = (e: Entry) => <EntryRow key={e.label} e={e} go={setPage} />;

  return (
    <AppFrame title="Ayarlar">
      <SearchField value={query} onChange={setQuery} />
      {q ? (
        hits.length ? <Section>{hits.map(row)}</Section> : <p className={s.noResults}>“{query.trim()}” için sonuç yok</p>
      ) : (
        <>
          <Section>
            <button className={s.profile} onClick={() => setPage("account")}>
              <Avatar name={PROFILE.name} size={60} />
              <span>
                <b>{PROFILE.name}</b>
                <small>{PROFILE.sub}</small>
              </span>
              <Icon name="chevronRight" size={16} className={s.chevron} />
            </button>
          </Section>
          <Section>{[E.airplane, E.wifi, E.bluetooth].map(row)}</Section>
          <Section header="Ses ve Dokunuş">
            {[E.sound, E.haptics, E.silent].map(row)}
            <Row label={<Slider label="Ses düzeyi" value={os.volume} ends={["speakerSlash", "speaker"]} onChange={volume => set({ volume })} />} />
          </Section>
          <Section>{[E.focus].map(row)}</Section>
          <Section header="Ekran ve Parlaklık">
            {[E.dark].map(row)}
            <Row label={<Slider label="Parlaklık" value={os.brightness} ends={["sun", "sun"]} onChange={brightness => set({ brightness })} />} />
            <Row label={<Slider label="Metin boyutu" value={textValue} ends={["textSize", "textSize"]} onChange={v => set({ textScale: TEXT_SCALE.min + v * (TEXT_SCALE.max - TEXT_SCALE.min) })} />} />
          </Section>
          <Section header="Pil" footer="Düşük Güç Modu, pil şarj edilene kadar arka plan etkinliğini azaltır.">{[E.lowPower].map(row)}</Section>
          <Section header="Kişiselleştirme" footer="Eylem düğmesi, telefonun sol yanındaki üst tuştur (klavyede M).">
            {row(E.wallpaper)}
            <Row label="Eylem Düğmesi" icon="bolt" iconColor="var(--orange)">
              <select className={s.select} value={os.action} aria-label="Eylem düğmesi" onChange={e => set({ actionButton: e.target.value === "flashlight" ? "flashlight" : "silent" })}>
                <option value="silent">Sessiz Mod</option>
                <option value="flashlight">El Feneri</option>
              </select>
            </Row>
          </Section>
          <Section header="Genel">
            {row(E.about)}
            <Row label="Tüm verileri sıfırla" destructive onClick={() => setConfirmReset(true)} />
          </Section>
        </>
      )}
      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)} title="Her şey silinsin mi?">
        <p className={s.warn}>Ayarlar, notlar, mesajlar ve fotoğraflar kalıcı olarak silinir.</p>
        <button className={s.danger} onClick={resetEverything}>Sıfırla</button>
      </Sheet>
    </AppFrame>
  );
}
