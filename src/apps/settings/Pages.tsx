import { useShallow } from "zustand/react/shallow";
import { useOS } from "../../os/store";
import { wallpapers } from "../../os/wallpapers";
import { AppFrame } from "../../ui/AppFrame";
import { Avatar } from "../../ui/Avatar";
import { Row, Section } from "../../ui/List";
import s from "./Settings.module.css";

export const PROFILE = { name: "AFU", sub: "Hesap, iCloud, medya ve satın alımlar" };

export function Wallpapers({ onBack }: { onBack: () => void }) {
  const current = useOS(st => st.wallpaper);
  return (
    <AppFrame title="Duvar Kağıdı" onBack={onBack} backLabel="Ayarlar">
      <div className={s.walls}>
        {wallpapers.map((w, i) => (
          <button key={w.name} className={s.wall} aria-pressed={i === current} onClick={() => useOS.setState({ wallpaper: i })}>
            <span style={{ background: w.css }} />
            {w.name}
          </button>
        ))}
      </div>
    </AppFrame>
  );
}

export function About({ onBack }: { onBack: () => void }) {
  const { notes, threads } = useOS(useShallow(st => ({ notes: st.notes.length, threads: st.threads.length })));
  return (
    <AppFrame title="Hakkında" onBack={onBack} backLabel="Ayarlar">
      <Section>
        <Row label="Ad" detail="iPhone Clone" />
        <Row label="Yazılım" detail="iOS 26 (web)" />
        <Row label="Motor" detail="React 19 · Three.js" />
        <Row label="Notlar" detail={notes} />
        <Row label="Sohbetler" detail={threads} />
      </Section>
    </AppFrame>
  );
}

/** Apple Account page: display only, like a signed-in demo device. */
export function Account({ onBack }: { onBack: () => void }) {
  return (
    <AppFrame title="Apple Hesabı" onBack={onBack} backLabel="Ayarlar">
      <div className={s.hero}>
        <Avatar name={PROFILE.name} size={88} />
        <h2>{PROFILE.name}</h2>
      </div>
      <Section>
        <Row label="Kişisel Bilgiler" icon="person" iconColor="var(--gray)" chevron />
        <Row label="Oturum Açma ve Güvenlik" icon="lock" iconColor="var(--gray)" chevron />
        <Row label="Ödeme ve Gönderim" icon="tray" iconColor="var(--gray)" chevron />
        <Row label="Abonelikler" icon="refresh" iconColor="var(--gray)" chevron />
      </Section>
      <Section>
        <Row label="iCloud" icon="cloud" iconColor="#32ade6" detail="5 GB" chevron />
        <Row label="Medya ve Satın Alımlar" icon="appStore" iconColor="var(--tint)" chevron />
        <Row label="Bul" icon="location" iconColor="var(--green)" chevron />
        <Row label="Aile Paylaşımı" icon="person" iconColor="#32ade6" detail="Ayarla" chevron />
      </Section>
    </AppFrame>
  );
}
