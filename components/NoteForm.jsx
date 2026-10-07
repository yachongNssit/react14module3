"use client";
import { useState } from "react";
import { useNotes } from "../context/NotesContext.jsx";

export default function NoteForm() {
  const { addNote } = useNotes();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await addNote(text);
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card stack-tight">
      <div className="row">
        <input
          placeholder="Add a note…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
