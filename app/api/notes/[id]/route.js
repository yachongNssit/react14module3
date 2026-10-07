import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { updateNote, deleteNote } from "../../../../lib/db";
import { validateText, isValidId } from "../../../../lib/validation";
import { NextResponse } from "next/server";

// OBJECTIVE: Implementing CRUD operations — Update
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params; // Route Handler params are a Promise in Next.js 15+

  // OBJECTIVE: Data validation and error handling — the id itself
  if (!isValidId(id)) {
    return NextResponse.json({ error: "Note id must be a number" }, { status: 400 });
  }

  const body = await request.json();
  const validationError = validateText(body?.text);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const updated = await updateNote(id, body.text.trim());
    if (!updated) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    console.error(`PUT /api/notes/${id} failed:`, err);
    return NextResponse.json({ error: "Could not update note" }, { status: 500 });
  }
}

// OBJECTIVE: Implementing CRUD operations — Delete
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Note id must be a number" }, { status: 400 });
  }

  try {
    const ok = await deleteNote(id);
    if (!ok) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/notes/${id} failed:`, err);
    return NextResponse.json({ error: "Could not delete note" }, { status: 500 });
  }
}
