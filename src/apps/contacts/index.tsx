import { useState } from "react";
import { haptic } from "../../lib/haptics";
import { useOS, type Contact } from "../../os/store";
import { AppFrame } from "../../ui/AppFrame";
import { Avatar } from "../../ui/Avatar";
import { Glass } from "../../ui/Glass";
import { Icon } from "../../ui/icons";
import { Row, Section } from "../../ui/List";
import { ContactForm } from "./ContactForm";
import s from "./Contacts.module.css";
import { Detail } from "./Detail";

const normalize = (text: string) => text.toLocaleLowerCase("tr-TR").replace(/\s/g, "");
const letterOf = (name: string) => name.trim().charAt(0).toLocaleUpperCase("tr-TR") || "#";

/** Sorted by Turkish collation and bucketed by first letter (Ç, İ, Ö, Ş, Ü stay separate). */
function groupByLetter(contacts: Contact[]): [string, Contact[]][] {
  const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name, "tr"));
  const groups = new Map<string, Contact[]>();
  for (const c of sorted) {
    const letter = letterOf(c.name);
    groups.set(letter, [...(groups.get(letter) ?? []), c]);
  }
  return [...groups];
}

export default function Contacts() {
  const contacts = useOS(st => st.contacts);
  const openId = useOS(st => st.contactId);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const open = contacts.find(c => c.id === openId);
  const setOpen = (contactId: string | null) => useOS.setState({ contactId });

  if (open) return <Detail contact={open} onBack={() => setOpen(null)} />;

  const q = normalize(query);
  const shown = contacts.filter(c => normalize(c.name).includes(q) || normalize(c.phone).includes(q));
  const add = ({ name, phone }: { name: string; phone: string }) => {
    const contact = { id: crypto.randomUUID(), name, phone, fav: false };
    useOS.setState(st => ({ contacts: [...st.contacts, contact] }));
    haptic("success");
    setOpen(contact.id);
  };

  return (
    <AppFrame
      title="Kişiler"
      trailing={
        <Glass interactive shape="circle" className={s.add} aria-label="Kişi ekle" onClick={() => setAdding(true)}>
          <Icon name="plus" size={20} />
        </Glass>
      }
    >
      <Glass shape="pill" className={s.search}>
        <Icon name="search" size={16} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ara" aria-label="Kişilerde ara" />
      </Glass>
      {groupByLetter(shown).map(([letter, people]) => (
        <Section key={letter} header={letter}>
          {people.map(c => (
            <Row
              key={c.id}
              label={
                <span className={s.person}>
                  <Avatar name={c.name} size={32} />
                  {c.name}
                  {c.fav && <Icon name="starFill" size={13} className={s.star} />}
                </span>
              }
              onClick={() => setOpen(c.id)}
            />
          ))}
        </Section>
      ))}
      {shown.length === 0 && <p className={s.empty}>{query ? "Sonuç yok" : "Kişi yok"}</p>}
      <p className={s.empty}>{contacts.length} kişi</p>
      <ContactForm open={adding} title="Yeni Kişi" onClose={() => setAdding(false)} onSave={add} />
    </AppFrame>
  );
}
