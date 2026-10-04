import { useState } from "react";
import { haptic } from "../../lib/haptics";
import { fmtAgo } from "../../lib/util";
import { useOS, type Note } from "../../os/store";
import { AppFrame } from "../../ui/AppFrame";
import { Glass } from "../../ui/Glass";
import { Icon } from "../../ui/icons";
import { Row, Section } from "../../ui/List";
import s from "./Notes.module.css";

const titleOf = (note: Note) => note.text.split("\n")[0]?.trim() || "Yeni Not";
const previewOf = (note: Note) => note.text.split("\n").slice(1).join(" ").trim() || "Ek metin yok";
const setNotes = (fn: (notes: Note[]) => Note[]) => useOS.setState(st => ({ notes: fn(st.notes) }));

function Editor({ note, onBack }: { note: Note; onBack: () => void }) {
  // Every keystroke is saved straight into the persisted store, so there is no save button.
  const save = (text: string) => setNotes(notes => notes.map(n => (n.id === note.id ? { ...n, text, updated: Date.now() } : n)));
  const remove = () => {
    haptic("warning");
    setNotes(notes => notes.filter(n => n.id !== note.id));
    onBack();
  };
  const back = () => {
    if (!note.text.trim()) setNotes(notes => notes.filter(n => n.id !== note.id));
    onBack();
  };
  return (
    <AppFrame
      onBack={back}
      backLabel="Notlar"
      trailing={
        <Glass interactive shape="circle" className={s.navButton} aria-label="Notu sil" onClick={remove}>
          <Icon name="trash" size={18} />
        </Glass>
      }
    >
      <textarea
        className={s.editor}
        autoFocus={!note.text}
        value={note.text}
        placeholder="Yazmaya başlayın…"
        aria-label="Not metni"
        onChange={e => save(e.target.value)}
      />
    </AppFrame>
  );
}

export default function Notes() {
  const notes = useOS(st => st.notes);
  const openId = useOS(st => st.noteId);
  const [query, setQuery] = useState("");
  const open = notes.find(n => n.id === openId);
  const setOpen = (noteId: string | null) => useOS.setState({ noteId });

  if (open) return <Editor note={open} onBack={() => setOpen(null)} />;

  const create = () => {
    const note = { id: crypto.randomUUID(), text: "", updated: Date.now() };
    setNotes(list => [note, ...list]);
    setOpen(note.id);
  };
  const q = query.toLocaleLowerCase("tr-TR");
  const shown = [...notes]
    .filter(n => n.text.toLocaleLowerCase("tr-TR").includes(q))
    .sort((a, b) => b.updated - a.updated);

  return (
    <AppFrame
      title="Notlar"
      footer={
        <div className={s.footer}>
          <span>{notes.length} not</span>
          <Glass interactive shape="circle" className={s.compose} aria-label="Yeni not" onClick={create}>
            <Icon name="compose" size={20} />
          </Glass>
        </div>
      }
    >
      <Glass shape="pill" className={s.search}>
        <Icon name="search" size={16} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ara" aria-label="Notlarda ara" />
      </Glass>
      <Section>
        {shown.map(n => (
          <Row key={n.id} label={<b>{titleOf(n)}</b>} sub={`${fmtAgo(n.updated)}  ${previewOf(n)}`} onClick={() => setOpen(n.id)} />
        ))}
        {shown.length === 0 && <Row label={query ? "Sonuç yok" : "Not yok"} />}
      </Section>
    </AppFrame>
  );
}
