import { useEffect, useState, type FormEvent } from "react";
import { Sheet } from "../../ui/Sheet";
import s from "./Contacts.module.css";

type Draft = { name: string; phone: string };
type ContactFormProps = { open: boolean; title: string; initial?: Draft; onClose: () => void; onSave: (draft: Draft) => void };

const PHONE_CHARS = /^[0-9 +()-]*$/;
const EMPTY: Draft = { name: "", phone: "" };

/** Add / edit sheet. A name is required; the number only accepts dial characters. */
export function ContactForm({ open, title, initial = EMPTY, onClose, onSave }: ContactFormProps) {
  const [draft, setDraft] = useState<Draft>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
    // `initial` is a fresh object each render; reset only when the sheet opens.
  }, [open]);

  const valid = draft.name.trim() !== "" && PHONE_CHARS.test(draft.phone);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSave({ name: draft.name.trim(), phone: draft.phone.trim() });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <form className={s.form} onSubmit={submit}>
        <input
          className={s.field}
          autoFocus
          value={draft.name}
          onChange={e => setDraft({ ...draft, name: e.target.value })}
          placeholder="Ad Soyad"
          aria-label="Ad"
        />
        <input
          className={s.field}
          type="tel"
          inputMode="tel"
          value={draft.phone}
          onChange={e => setDraft({ ...draft, phone: e.target.value })}
          placeholder="Telefon"
          aria-label="Telefon"
          aria-invalid={!PHONE_CHARS.test(draft.phone)}
        />
        <button type="submit" className={s.save} disabled={!valid}>Kaydet</button>
      </form>
    </Sheet>
  );
}
