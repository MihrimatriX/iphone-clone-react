import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { projects } from "../apps/projects/data";
import { apps, iconProps } from "../apps/registry";
import { AppIcon } from "../ui/AppIcon";
import { Avatar } from "../ui/Avatar";
import { Glass } from "../ui/Glass";
import { Icon } from "../ui/icons";
import s from "./Spotlight.module.css";
import { useOS } from "./store";

const normalize = (text: string) => text.toLocaleLowerCase("tr-TR");
const close = () => useOS.setState({ overlay: null });

type Hit = { id: string; label: string; leading: ReactNode; open: () => void };

/** Deep link: set the id the app opens on, then launch it. */
const openIn = (app: string, patch: { noteId?: string; contactId?: string; projectId?: string }) => () => {
  useOS.setState(patch);
  useOS.getState().launch(app);
};

/** A titled glass list of search hits; hidden when empty. */
function Results({ title, hits }: { title: string; hits: Hit[] }) {
  if (hits.length === 0) return null;
  return (
    <section className={s.section}>
      <h3>{title}</h3>
      <Glass className={s.notes}>
        {hits.map(hit => (
          <button key={hit.id} className={s.note} onClick={hit.open}>
            {hit.leading}
            <span>{hit.label}</span>
          </button>
        ))}
      </Glass>
    </section>
  );
}

/** Pull-down search over apps, contacts, notes and projects. */
export function Spotlight() {
  const notes = useOS(st => st.notes);
  const contacts = useOS(st => st.contacts);
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());
  const appHits = q ? apps.filter(app => normalize(app.name).includes(q)) : apps.slice(0, 4);
  const contactHits: Hit[] = (q ? contacts.filter(c => normalize(c.name).includes(q)) : []).slice(0, 4).map(c => ({
    id: c.id,
    label: c.name,
    leading: <Avatar name={c.name} size={28} />,
    open: openIn("contacts", { contactId: c.id }),
  }));
  const noteHits: Hit[] = (q ? notes.filter(n => normalize(n.text).includes(q)) : []).slice(0, 5).map(n => ({
    id: n.id,
    label: n.text.split("\n")[0] ?? "",
    leading: <Icon name="note" size={18} />,
    open: openIn("notes", { noteId: n.id }),
  }));
  const projectHits: Hit[] = (q ? projects.filter(p => normalize(p.name).includes(q)) : []).slice(0, 4).map(p => ({
    id: p.id,
    label: p.name,
    leading: <AppIcon icon={p.icon} accent={p.accent} size={28} />,
    open: openIn("projects", { projectId: p.id }),
  }));

  return (
    <motion.div
      className={s.spotlight}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && close()}
    >
      <Glass shape="pill" className={s.field}>
        <Icon name="search" size={18} />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Escape" && close()}
          placeholder="Ara"
          aria-label="Spotlight araması"
        />
        <button onClick={close} className={s.cancel}>
          Vazgeç
        </button>
      </Glass>
      <section className={s.section}>
        <h3>{q ? "Uygulamalar" : "Siri Önerileri"}</h3>
        <div className={s.apps}>
          {appHits.map(app => (
            <button key={app.id} className={s.app} onClick={() => useOS.getState().launch(app.id)}>
              <AppIcon {...iconProps(app)} size={56} />
              <span>{app.name}</span>
            </button>
          ))}
          {appHits.length === 0 && <p className={s.empty}>Uygulama bulunamadı</p>}
        </div>
      </section>
      <Results title="Kişiler" hits={contactHits} />
      <Results title="Notlar" hits={noteHits} />
      <Results title="Projeler" hits={projectHits} />
    </motion.div>
  );
}
