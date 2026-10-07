"use client";
import { useState } from "react";
import { useNotes } from "../context/NotesContext.jsx";

export default function NoteList() {
  const { notes, removeNote, editNote } = useNotes();
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");

  if (notes.length === 0) {
    return <p className="hint">No notes yet — add one above.</p>;
  }

  function startEdit(note) {
    setEditingId(note.id);
    setDraft(note.text);
  }

  async function saveEdit(id) {
    if (!draft.trim()) return;
    await editNote(id, draft.trim());
    setEditingId(null);
  }

  return (
    <div className="card">
      {notes.map((note) => (
        <div key={note.id} className="note-row">
          {editingId === note.id ? (
            <>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
              />
              <div className="note-actions">
                <button onClick={() => saveEdit(note.id)}>Save</button>
                <button className="ghost" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <span>{note.text}</span>
              <div className="note-actions">
                <button className="ghost" onClick={() => startEdit(note)}>
                  Edit
                </button>
                <button className="ghost" onClick={() => removeNote(note.id)}>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
