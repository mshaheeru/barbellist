"use client";

import { useState, useTransition } from "react";
import {
  addStaffNote,
  editStaffNote,
  removeStaffNote,
} from "@/app/actions/staff";
import type { MemberNote } from "@/lib/members/notes";
import { formatShortDate } from "@/lib/members/format";
import styles from "../staff-profile.module.css";

type StaffNotesTabProps = {
  staffId: string;
  initialNotes: MemberNote[];
};

export function StaffNotesTab({ staffId, initialNotes }: StaffNotesTabProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!text.trim()) return;
    setError(null);
    startTransition(async () => {
      const { error: err } = await addStaffNote(staffId, text);
      if (err) {
        setError(err);
        return;
      }
      const now = new Date().toISOString();
      setNotes((prev) => [
        {
          id: crypto.randomUUID(),
          text: text.trim(),
          created_at: now,
          updated_at: now,
        },
        ...prev,
      ]);
      setText("");
    });
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editText.trim()) return;
    setError(null);
    startTransition(async () => {
      const { error: err } = await editStaffNote(staffId, noteId, editText);
      if (err) {
        setError(err);
        return;
      }
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? { ...n, text: editText.trim(), updated_at: new Date().toISOString() }
            : n,
        ),
      );
      setEditingId(null);
    });
  };

  const handleDelete = (noteId: string) => {
    setError(null);
    startTransition(async () => {
      const { error: err } = await removeStaffNote(staffId, noteId);
      if (err) {
        setError(err);
        return;
      }
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Notes</div>

      {error ? (
        <div style={{ color: "#B0453A", fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      <div className={styles.noteForm}>
        <textarea
          className={styles.noteTextarea}
          placeholder="Add a note about this staff member…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={pending}
        />
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          style={{ width: "auto", alignSelf: "flex-start" }}
          onClick={handleAdd}
          disabled={pending || !text.trim()}
        >
          Add Note
        </button>
      </div>

      <div className={styles.notesList}>
        {notes.length === 0 ? (
          <p style={{ color: "#8A8A80", fontSize: 14 }}>No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={styles.noteItem}>
              {editingId === note.id ? (
                <>
                  <textarea
                    className={styles.noteTextarea}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    disabled={pending}
                  />
                  <div className={styles.noteActions}>
                    <button
                      type="button"
                      className={styles.noteActionBtn}
                      onClick={() => handleSaveEdit(note.id)}
                      disabled={pending}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className={styles.noteActionBtn}
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.noteText}>{note.text}</div>
                  <div className={styles.noteMeta}>
                    <span>{formatShortDate(note.updated_at)}</span>
                    <div className={styles.noteActions}>
                      <button
                        type="button"
                        className={styles.noteActionBtn}
                        onClick={() => {
                          setEditingId(note.id);
                          setEditText(note.text);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={styles.noteActionBtn}
                        style={{ color: "#B0453A" }}
                        onClick={() => handleDelete(note.id)}
                        disabled={pending}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
