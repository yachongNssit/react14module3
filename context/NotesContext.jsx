"use client";
import { createContext, useContext, useState, useCallback } from "react";

// OBJECTIVE: Managing global application state with the Context API
//
// NoteForm and NoteList both need the same `notes` array. Without
// Context, it would have to be passed down as props from the
// dashboard page through any component in between — Context lets
// either one reach in directly instead.
const NotesContext = createContext(null);

export function NotesProvider({ initialNotes, children }) {
  const [notes, setNotes] = useState(initialNotes);

  const addNote = useCallback(async (text) => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Could not add note");
    }
    const newNote = await res.json();
    setNotes((prev) => [...prev, newNote]);
  }, []);

  const removeNote = useCallback(async (id) => {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  }, []);

  // OBJECTIVE: Implementing CRUD operations — Update
  const editNote = useCallback(async (id, text) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Could not update note");
    }
    const updated = await res.json();
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
  }, []);

  return (
    <NotesContext.Provider value={{ notes, addNote, removeNote, editNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) {
    throw new Error("useNotes must be used inside a <NotesProvider>");
  }
  return ctx;
}
