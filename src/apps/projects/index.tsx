import { useState } from "react";
import { haptic } from "../../lib/haptics";
import { useOS } from "../../os/store";
import { AppFrame } from "../../ui/AppFrame";
import { AppIcon } from "../../ui/AppIcon";
import { Icon } from "../../ui/icons";
import { Chips } from "./Chips";
import { projectById, projects } from "./data";
import { Detail } from "./Detail";
import s from "./Projects.module.css";
import { Resume } from "./Resume";

type View = "projects" | "resume";
const SEGMENTS: { id: View; label: string }[] = [
  { id: "projects", label: "Projeler" },
  { id: "resume", label: "Özgeçmiş" },
];

function ProjectList({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className={s.cards}>
      {projects.map(p => (
        <button key={p.id} className={s.card} onClick={() => onOpen(p.id)}>
          <AppIcon icon={p.icon} accent={p.accent} size={56} />
          <span className={s.cardText}>
            <b>{p.name}</b>
            <small>{p.tagline}</small>
            <Chips tech={p.tech.slice(0, 3)} />
          </span>
          <Icon name="chevronRight" size={16} className={s.chevron} />
        </button>
      ))}
    </div>
  );
}

export default function Projects() {
  const openId = useOS(st => st.projectId);
  const [view, setView] = useState<View>("projects");
  const open = projectById(openId);
  const setOpen = (projectId: string | null) => useOS.setState({ projectId });

  if (open) return <Detail project={open} onBack={() => setOpen(null)} />;

  const pick = (id: View) => {
    if (id !== view) haptic("selection");
    setView(id);
  };

  return (
    <AppFrame title="Projelerim">
      {/* iOS segmented control; the selected pill slides via data-view. */}
      <div className={s.segmented} role="tablist" data-view={view}>
        {SEGMENTS.map(seg => (
          <button key={seg.id} role="tab" aria-selected={seg.id === view} className={s.segment} onClick={() => pick(seg.id)}>
            {seg.label}
          </button>
        ))}
      </div>
      {view === "resume" ? <Resume /> : <ProjectList onOpen={setOpen} />}
    </AppFrame>
  );
}
