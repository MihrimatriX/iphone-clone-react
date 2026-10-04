import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { whoosh } from "../../lib/sound";
import { cx, fmtTime } from "../../lib/util";
import { useOS, type Msg, type Thread } from "../../os/store";
import { AppFrame } from "../../ui/AppFrame";
import { Avatar } from "../../ui/Avatar";
import { Glass } from "../../ui/Glass";
import { Icon } from "../../ui/icons";
import { spring } from "../../ui/motion";
import s from "./Messages.module.css";
import { autoReply } from "./replies";

const DELAY = { typing: 700, reply: 1500 };

function append(threadId: string, msg: Msg) {
  useOS.setState(st => ({ threads: st.threads.map(t => (t.id === threadId ? { ...t, msgs: [...t.msgs, msg] } : t)) }));
}

/** Rule-based reply after a "typing…" pause; a notification arrives if the user has left the app. */
function scheduleReply(thread: Thread, text: string, setTyping: (on: boolean) => void) {
  const reply = autoReply(text);
  if (!reply) return;
  setTimeout(() => setTyping(true), DELAY.typing);
  setTimeout(() => {
    setTyping(false);
    append(thread.id, { me: false, text: reply, at: Date.now() });
    useOS.getState().notify({ app: "messages", title: thread.name, body: reply });
  }, DELAY.typing + DELAY.reply);
}

export function Conversation({ thread, onBack }: { thread: Thread; onBack: () => void }) {
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Block body on purpose: newer Chrome returns a Promise from scrollIntoView, which React would treat as a cleanup.
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [thread.msgs.length, typing]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    whoosh();
    append(thread.id, { me: true, text, at: Date.now() });
    setDraft("");
    scheduleReply(thread, text, setTyping);
  };

  return (
    <AppFrame
      onBack={onBack}
      backLabel="Mesajlar"
      trailing={<Avatar name={thread.name} size={40} />}
      footer={
        <form className={s.composer} onSubmit={send}>
          <Glass shape="pill" className={s.field}>
            <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="iMessage" aria-label="Mesaj" />
          </Glass>
          <button type="submit" className={s.send} disabled={!draft.trim()} aria-label="Gönder">
            <Icon name="arrowUp" size={20} />
          </button>
        </form>
      }
    >
      <h2 className={s.threadName}>{thread.name}</h2>
      <div className={s.bubbles}>
        <AnimatePresence initial={false}>
          {thread.msgs.map((m, i) => {
            const lastOfGroup = thread.msgs[i + 1]?.me !== m.me;
            return (
              <motion.div
                key={`${m.at}-${i}`}
                className={cx(s.bubble, m.me ? s.me : s.them, lastOfGroup && s.tail)}
                initial={{ opacity: 0, y: 24, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={spring()}
                title={fmtTime(m.at)}
              >
                {m.text}
              </motion.div>
            );
          })}
          {typing && (
            <motion.div key="typing" className={cx(s.bubble, s.them, s.tail, s.typing)} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} aria-label="Yazıyor">
              <i /><i /><i />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={end} />
      </div>
    </AppFrame>
  );
}
