import { useState } from "react";
import { AppFrame } from "../../ui/AppFrame";
import { AppIcon } from "../../ui/AppIcon";
import { Icon } from "../../ui/icons";
import { projectById, projects, type Project } from "../projects/data";
import s from "./AppStore.module.css";
import { GetButton } from "./GetButton";
import { Product } from "./Product";

const FEATURED = "indie-valley";

/** Icon, name and tagline open the product page; the pill installs / opens. */
function AppRow({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <div className={s.row}>
      <button className={s.rowMain} onClick={onOpen}>
        <AppIcon icon={project.icon} accent={project.accent} size={56} />
        <span className={s.rowText}>
          <b>{project.name}</b>
          <small>{project.tagline}</small>
        </span>
      </button>
      <GetButton id={project.id} />
    </div>
  );
}

export default function AppStore() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = projectById(openId);
  if (open) return <Product project={open} onBack={() => setOpenId(null)} />;
  const featured = projectById(FEATURED) ?? projects[0]!;

  return (
    <AppFrame title="Bugün">
      <article className={s.featured}>
        <button className={s.cover} style={{ background: featured.accent }} onClick={() => setOpenId(featured.id)}>
          <small>GÜNÜN UYGULAMASI</small>
          <h2>{featured.name}</h2>
          <Icon name={featured.icon} size={150} className={s.coverGlyph} />
        </button>
        <AppRow project={featured} onOpen={() => setOpenId(featured.id)} />
      </article>
      <h2 className={s.heading}>Tüm Uygulamalar</h2>
      <div className={s.list}>
        {projects.map(p => (
          <AppRow key={p.id} project={p} onOpen={() => setOpenId(p.id)} />
        ))}
      </div>
    </AppFrame>
  );
}
