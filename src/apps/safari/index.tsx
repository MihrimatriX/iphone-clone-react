import { useState, type FormEvent } from "react";
import { AppFrame } from "../../ui/AppFrame";
import { Glass } from "../../ui/Glass";
import { Icon } from "../../ui/icons";
import { Sheet } from "../../ui/Sheet";
import { hostOf, Page, toUrl } from "./Page";
import s from "./Safari.module.css";

type BrowserTab = { id: string; stack: (string | null)[]; pos: number };

const newTab = (): BrowserTab => ({ id: crypto.randomUUID(), stack: [null], pos: 0 });
const current = (tab: BrowserTab) => tab.stack[tab.pos] ?? null;
const PLACEHOLDER = "Ara veya web sitesi adı girin";

/** Glass address pill: shows the host, turns into an input on tap. */
function AddressBar({ url, onGo }: { url: string | null; onGo: (url: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (draft.trim()) onGo(toUrl(draft));
    setEditing(false);
  };
  const startEditing = () => {
    setDraft(url ?? "");
    setEditing(true);
  };
  if (editing) {
    return (
      <form onSubmit={submit}>
        <Glass shape="pill" className={s.address}>
          <input autoFocus value={draft} onChange={e => setDraft(e.target.value)} onBlur={() => setEditing(false)} placeholder={PLACEHOLDER} aria-label="Adres" />
        </Glass>
      </form>
    );
  }
  return (
    <Glass interactive shape="pill" className={s.address} onClick={startEditing}>
      <Icon name={url ? "lock" : "search"} size={14} />
      <span>{url ? hostOf(url) : PLACEHOLDER}</span>
    </Glass>
  );
}

export default function Safari() {
  const [tabs, setTabs] = useState<BrowserTab[]>(() => [newTab()]);
  const [activeId, setActiveId] = useState(() => tabs[0]!.id);
  const [showTabs, setShowTabs] = useState(false);
  const tab = tabs.find(t => t.id === activeId) ?? tabs[0]!;
  const url = current(tab);

  const update = (fn: (t: BrowserTab) => BrowserTab) => setTabs(all => all.map(t => (t.id === tab.id ? fn(t) : t)));
  const open = (next: string | null) => update(t => ({ ...t, stack: [...t.stack.slice(0, t.pos + 1), next], pos: t.pos + 1 }));
  const go = (delta: number) => update(t => ({ ...t, pos: Math.min(t.stack.length - 1, Math.max(0, t.pos + delta)) }));
  const addTab = () => {
    const t = newTab();
    setTabs(all => [...all, t]);
    setActiveId(t.id);
    setShowTabs(false);
  };
  const selectTab = (id: string) => {
    setActiveId(id);
    setShowTabs(false);
  };
  const closeTab = (id: string) => setTabs(all => (all.length > 1 ? all.filter(t => t.id !== id) : [newTab()]));

  const chrome = (
    <div className={s.chrome}>
      <AddressBar url={url} onGo={open} />
      <div className={s.toolbar}>
        <button aria-label="Geri" disabled={tab.pos === 0} onClick={() => go(-1)}><Icon name="chevronLeft" size={22} /></button>
        <button aria-label="İleri" disabled={tab.pos >= tab.stack.length - 1} onClick={() => go(1)}><Icon name="chevronRight" size={22} /></button>
        <button aria-label="Başlangıç sayfası" onClick={() => open(null)}><Icon name="book" size={22} /></button>
        <button aria-label={`Sekmeler (${tabs.length})`} className={s.tabCount} onClick={() => setShowTabs(true)}>{tabs.length}</button>
      </div>
    </div>
  );

  return (
    <AppFrame footer={chrome}>
      <Page url={url} onOpen={open} />
      <Sheet open={showTabs} onClose={() => setShowTabs(false)} title={`${tabs.length} Sekme`}>
        <div className={s.tabs}>
          {tabs.map(t => {
            const tabUrl = current(t);
            return (
              <div key={t.id} className={s.tabCard} data-active={t.id === tab.id}>
                <button onClick={() => selectTab(t.id)}>{tabUrl ? hostOf(tabUrl) : "Başlangıç Sayfası"}</button>
                <button aria-label="Sekmeyi kapat" onClick={() => closeTab(t.id)}><Icon name="xmark" size={14} /></button>
              </div>
            );
          })}
        </div>
        <button className={s.newTab} onClick={addTab}><Icon name="plus" size={18} /> Yeni Sekme</button>
      </Sheet>
    </AppFrame>
  );
}
