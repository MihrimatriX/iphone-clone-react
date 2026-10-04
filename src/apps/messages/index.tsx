import { useState } from "react";
import { fmtAgo } from "../../lib/util";
import { useOS } from "../../os/store";
import { AppFrame } from "../../ui/AppFrame";
import { Avatar } from "../../ui/Avatar";
import { Glass } from "../../ui/Glass";
import { Icon } from "../../ui/icons";
import { Row, Section } from "../../ui/List";
import { Sheet } from "../../ui/Sheet";
import { Conversation } from "./Conversation";
import s from "./Messages.module.css";
import { openConversation } from "./open";

/** Pick a contact to start (or jump to) a conversation. */
function NewMessage({ open, onClose }: { open: boolean; onClose: () => void }) {
  const contacts = useOS(st => st.contacts);
  const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name, "tr"));
  return (
    <Sheet open={open} onClose={onClose} title="Yeni Mesaj">
      <Section>
        {sorted.map(c => (
          <Row
            key={c.id}
            label={<span className={s.person}><Avatar name={c.name} size={32} />{c.name}</span>}
            onClick={() => {
              onClose();
              openConversation(c.name);
            }}
          />
        ))}
      </Section>
    </Sheet>
  );
}

export default function Messages() {
  const threads = useOS(st => st.threads);
  const openId = useOS(st => st.threadId);
  const [composing, setComposing] = useState(false);
  const open = threads.find(t => t.id === openId);
  const setOpen = (threadId: string | null) => useOS.setState({ threadId });
  if (open) return <Conversation thread={open} onBack={() => setOpen(null)} />;

  // Conversations started but never written to stay out of the list.
  const sorted = threads.filter(t => t.msgs.length > 0).sort((a, b) => (b.msgs.at(-1)?.at ?? 0) - (a.msgs.at(-1)?.at ?? 0));
  return (
    <AppFrame
      title="Mesajlar"
      trailing={
        <Glass interactive shape="circle" className={s.compose} aria-label="Yeni mesaj" onClick={() => setComposing(true)}>
          <Icon name="compose" size={20} />
        </Glass>
      }
    >
      <ul className={s.list}>
        {sorted.map(t => {
          const last = t.msgs.at(-1);
          return (
            <li key={t.id}>
              <button className={s.thread} onClick={() => setOpen(t.id)}>
                <Avatar name={t.name} size={50} />
                <span className={s.threadText}>
                  <span className={s.threadTop}>
                    <b>{t.name}</b>
                    <small>{last ? fmtAgo(last.at) : ""}</small>
                  </span>
                  <span className={s.preview}>{last?.text}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <NewMessage open={composing} onClose={() => setComposing(false)} />
    </AppFrame>
  );
}
