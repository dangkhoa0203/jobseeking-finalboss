import { useState, type FormEvent } from "react";
import type { Contact } from "../api/types";
import { api, ApiError } from "../api/client";
import styles from "./NewDealModal.module.scss";

interface Props {
  contacts: Contact[];
  onClose(): void;
  onCreated(): void;
}

export function NewDealModal({ contacts, onClose, onCreated }: Props) {
  const [mode, setMode] = useState<"existing" | "new">(contacts.length > 0 ? "existing" : "new");
  const [contactId, setContactId] = useState<number | "">(contacts[0]?.id ?? "");
  const [company, setCompany] = useState("");
  const [person, setPerson] = useState("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const valueCents = Math.round(Number(value) * 100);
    if (!valueCents || valueCents <= 0) {
      setError("Enter a deal value greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      let targetContactId = contactId;
      if (mode === "new") {
        if (!company.trim() || !person.trim()) {
          setError("Company and contact name are required.");
          setSubmitting(false);
          return;
        }
        const contact = await api.createContact({ company, person, title: title || undefined });
        targetContactId = contact.id;
      }
      if (!targetContactId) {
        setError("Pick a contact.");
        setSubmitting(false);
        return;
      }

      await api.createDeal({ contactId: Number(targetContactId), valueCents, note: note || undefined });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>New deal</h2>

        <div className={styles.toggleRow}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${mode === "existing" ? styles.active : ""}`}
            onClick={() => setMode("existing")}
            disabled={contacts.length === 0}
          >
            Existing contact
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${mode === "new" ? styles.active : ""}`}
            onClick={() => setMode("new")}
          >
            New contact
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {mode === "existing" ? (
            <div className={styles.field}>
              <label htmlFor="deal-contact">Contact</label>
              <select
                id="deal-contact"
                value={contactId}
                onChange={(e) => setContactId(Number(e.target.value))}
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} — {c.person}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className={styles.field}>
                <label htmlFor="deal-company">Company</label>
                <input id="deal-company" value={company} onChange={(e) => setCompany(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label htmlFor="deal-person">Contact name</label>
                <input id="deal-person" value={person} onChange={(e) => setPerson(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label htmlFor="deal-title">Title (optional)</label>
                <input id="deal-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
            </>
          )}

          <div className={styles.field}>
            <label htmlFor="deal-value">Deal value (EUR)</label>
            <input
              id="deal-value"
              type="number"
              min="0"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="deal-note">Note (optional)</label>
            <textarea id="deal-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? "Adding..." : "Add deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
