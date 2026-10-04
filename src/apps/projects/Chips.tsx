import s from "./Projects.module.css";

/** Technology tags; Projelerim and App Store share them. */
export function Chips({ tech }: { tech: string[] }) {
  return (
    <span className={s.chips}>
      {tech.map(t => (
        <span key={t} className={s.chip}>{t}</span>
      ))}
    </span>
  );
}
