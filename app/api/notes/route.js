import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { getAllNotes, createNote } from "../../../lib/db";
import { validateText } from "../../../lib/validation";
import { NextResponse } from "next/server";

// OBJECTIVE: Securing API routes and data (Module 9, reused here)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // OBJECTIVE: Data validation and error handling
  // Even a read can fail — a dropped connection, a locked table. This
  // try/catch turns a real database failure into a clean 500 instead
  // of crashing the request or leaking an internal stack trace.
  try {
    return NextResponse.json(await getAllNotes());
  } catch (err) {
    console.error("GET /api/notes failed:", err);
    return NextResponse.json({ error: "Could not load notes" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  // OBJECTIVE: Data validation and error handling
  // Rejected here, before ever reaching the database — a validation
  // failure is the CALLER's mistake, so it's a 400, not a 500.
  const validationError = validateText(body?.text);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const note = await createNote(body.text.trim());
    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    console.error("POST /api/notes failed:", err);
    return NextResponse.json({ error: "Could not create note" }, { status: 500 });
  }
}
