import { haptic } from "../../lib/haptics";
import { useOS } from "../../os/store";
import { AppFrame } from "../../ui/AppFrame";
import { AppIcon } from "../../ui/AppIcon";
import { Row, Section } from "../../ui/List";
import { Chips } from "../projects/Chips";
import { profile, type Project } from "../projects/data";
import s from "./AppStore.module.css";
import { GetButton, uninstall } from "./GetButton";

/** Product page. Uninstalling lives here: the home screen has no jiggle-mode delete badge. */
export function Product({ project, onBack }: { project: Project; onBack: () => void }) {
  const installed = useOS(st => st.installed.includes(project.id));
  const remove = () => {
    haptic("warning");
    uninstall(project.id);
  };

  return (
    <AppFrame onBack={onBack} backLabel="Bugün">
      <div className={s.head}>
        <AppIcon icon={project.icon} accent={project.accent} size={112} />
        <div className={s.headText}>
          <h1>{project.name}</h1>
          <p>{project.tagline}</p>
          <GetButton id={project.id} />
        </div>
      </div>
      <Section>
        <p className={s.para}>{project.description}</p>
      </Section>
      <Section header="Yenilikler">
        {project.features.map(f => (
          <Row key={f} label={<span className={s.wrap}>{f}</span>} icon="check" iconColor="var(--tint)" />
        ))}
      </Section>
      <Section header="Teknolojiler">
        <div className={s.para}>
          <Chips tech={project.tech} />
        </div>
      </Section>
      <Section header="Bilgiler">
        <Row label="Geliştirici" detail={profile.name} />
        <Row label="Yıl" detail={project.year} />
        <Row label="Fiyat" detail="Ücretsiz" />
      </Section>
      {installed && (
        <Section footer="Ana ekrandaki simgesi de kaldırılır.">
          <Row label="Uygulamayı Kaldır" destructive onClick={remove} />
        </Section>
      )}
    </AppFrame>
  );
}
