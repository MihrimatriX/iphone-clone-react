import { haptic } from "../../lib/haptics";
import { AppFrame } from "../../ui/AppFrame";
import { Glass } from "../../ui/Glass";
import { Icon } from "../../ui/icons";
import { Row, Section } from "../../ui/List";
import { Chips } from "./Chips";
import { openUrl, type Project } from "./data";
import s from "./Projects.module.css";

export function Detail({ project, onBack }: { project: Project; onBack: () => void }) {
  const openRepo = (repo: string) => {
    haptic("light");
    openUrl(repo);
  };

  return (
    <AppFrame onBack={onBack} backLabel="Projelerim">
      <div className={s.hero} style={{ background: project.accent }} data-tone="dark">
        <Icon name={project.icon} size={72} />
        <h1>{project.name}</h1>
        <p>{project.tagline}</p>
        {project.repo && (
          <Glass interactive shape="pill" className={s.heroButton} onClick={() => openRepo(project.repo!)}>
            <Icon name="globe" size={18} />
            GitHub'da aç
          </Glass>
        )}
      </div>
      <Section header="Hakkında">
        <p className={s.para}>{project.description}</p>
      </Section>
      <Section header="Özellikler">
        {project.features.map(f => (
          <Row key={f} label={<span className={s.wrap}>{f}</span>} icon="check" iconColor="var(--green)" />
        ))}
      </Section>
      <Section header="Teknolojiler">
        <div className={s.para}>
          <Chips tech={project.tech} />
        </div>
      </Section>
      <Section>
        <Row label="Yıl" detail={project.year} />
        <Row label="Kaynak kod" detail={project.repo ? "GitHub" : "Özel"} />
      </Section>
    </AppFrame>
  );
}
