import { useState } from "react";
import { haptic } from "../../lib/haptics";
import { useOS, type Contact } from "../../os/store";
import { AppFrame } from "../../ui/AppFrame";
import { Avatar } from "../../ui/Avatar";
import { Glass } from "../../ui/Glass";
import { Icon, type IconName } from "../../ui/icons";
import { Row, Section } from "../../ui/List";
import { Sheet } from "../../ui/Sheet";
import { openConversation } from "../messages/open";
import { callAndShow } from "../phone/call";
import { ContactForm } from "./ContactForm";
import s from "./Contacts.module.css";

const setContacts = (fn: (all: Contact[]) => Contact[]) => useOS.setState(st => ({ contacts: fn(st.contacts) }));

function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Glass interactive className={s.action} onClick={onPress}>
      <Icon name={icon} size={22} />
      <span>{label}</span>
    </Glass>
  );
}

export function Detail({ contact, onBack }: { contact: Contact; onBack: () => void }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const update = (patch: Partial<Contact>) => setContacts(all => all.map(c => (c.id === contact.id ? { ...c, ...patch } : c)));
  const toggleFav = () => {
    haptic("light");
    update({ fav: !contact.fav });
  };
  const remove = () => {
    haptic("warning");
    setContacts(all => all.filter(c => c.id !== contact.id));
    onBack();
  };

  return (
    <AppFrame
      onBack={onBack}
      backLabel="Kişiler"
      trailing={
        <Glass interactive shape="pill" className={s.edit} onClick={() => setEditing(true)}>
          Düzenle
        </Glass>
      }
    >
      <div className={s.hero}>
        <Avatar name={contact.name} size={104} />
        <h1>{contact.name}</h1>
      </div>
      <div className={s.actions}>
        <Action icon="message" label="mesaj" onPress={() => openConversation(contact.name)} />
        <Action icon="phone" label="ara" onPress={() => callAndShow(contact.name)} />
        <Action icon={contact.fav ? "starFill" : "star"} label={contact.fav ? "favori" : "favori ekle"} onPress={toggleFav} />
      </div>
      <Section>
        <Row label={<span className={s.phone}>{contact.phone || "Numara yok"}</span>} sub="cep" onClick={contact.phone ? () => callAndShow(contact.name) : undefined} />
      </Section>
      <Section>
        <Row label="Kişiyi Sil" destructive onClick={() => setConfirming(true)} />
      </Section>
      <ContactForm open={editing} title="Kişiyi Düzenle" initial={contact} onClose={() => setEditing(false)} onSave={update} />
      <Sheet open={confirming} onClose={() => setConfirming(false)} title={`${contact.name} silinsin mi?`}>
        <button className={s.danger} onClick={remove}>Kişiyi Sil</button>
      </Sheet>
    </AppFrame>
  );
}
