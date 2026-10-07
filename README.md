# Module 11 — Database Integration and CRUD Operations (App Router Edition)

The same Notes app from Module 10's App Router edition, connected to a
real MySQL server instead of SQLite, with validation and error
handling made explicit throughout.

## Module Objectives

By the end of this module, participants should be able to:

1. **Connect Next.js to a database (MongoDB, MySQL)** — a real,
   networked database server, not an embedded file.
2. **Implement CRUD operations** — carried over from Module 10,
   confirmed still working against the new database.
3. **Handle data validation and error handling** — reject bad input
   with clear messages, and turn real failures into safe responses
   instead of crashes.

## Run it

1. **Start MAMP**, confirm MySQL is running.
2. ```bash
   npm install
   cp .env.local.example .env.local
   # replace the placeholder secret with: openssl rand -base64 32
   # check MYSQL_* values against MAMP's own connection panel
   npm run dev
   ```

Open `http://localhost:3000` — redirects to `/signin`.
**Demo credentials:** `trainer` / `hands-on`

Nothing to create in MySQL first — the app creates its own database
(`nextjs_notes_demo` by default) and table on first request.

## What actually changed from Module 10

| | Module 10 | Module 11 |
|---|---|---|
| Database | SQLite (`data/app.db`, a local file) | MySQL (a real server, tested against MAMP) |
| Driver | `better-sqlite3`, synchronous | `mysql2`, asynchronous — every function needs `await` |
| Validation | One inline check (non-empty text) | A dedicated `lib/validation.js` — length, type, and id checks |
| Error handling | Implicit — an unhandled throw would crash the request | Explicit `try/catch` around every database call, safe error responses, real errors logged server-side |
| Auth, Context, UI | — | Unchanged, reused exactly as built in Modules 9–10 |

## How each objective maps to the code

### 1. Connecting to MongoDB/MySQL → `lib/db.js`

```js
pool = mysql.createPool({ host, port, user, password, database, connectionLimit: 5 });
```

A connection **pool**, not a single connection — MySQL can genuinely
serve several requests at once. The app auto-creates its own database
and table on first use, the same zero-manual-setup idea as Module 10's
SQLite file, just pointed at a real server instead.

**The one thing that's genuinely different, not just relocated:**
every function in `lib/db.js` is now `async`. SQLite was a local
file — near-instant. MySQL is a separate server process, reached over
the network (even `127.0.0.1` is a real round trip) — every query
actually waits on I/O.

### 2. CRUD operations → unchanged, reconfirmed working

Same four functions, same routes, same UI as Module 10 — verified
directly against the real database: create, edit, and delete all
tested through a live browser session, plus a full reload to confirm
the change was actually persisted, not just held in React state.

### 3. Data validation and error handling → `lib/validation.js` + every Route Handler

**Validation**, pulled into its own module and checked at the API
boundary, before anything reaches the database:

```js
export function validateText(text) {
  if (typeof text !== "string") return "Text must be a string";
  const trimmed = text.trim();
  if (trimmed.length === 0) return "Text is required";
  if (trimmed.length > 200) return "Text must be 200 characters or fewer";
  return null;
}
```

Every case tested directly against the running app, not just written
and assumed:

| Situation | Response |
|---|---|
| Empty text | `400 { error: "Text is required" }` |
| Text over 200 characters | `400 { error: "Text must be 200 characters or fewer" }` |
| Non-string text | `400 { error: "Text must be a string" }` |
| Non-numeric id in the URL | `400 { error: "Note id must be a number" }` |
| Valid id, no matching note | `404 { error: "Note not found" }` |
| No session | `401 { error: "Not authenticated" }` |

**Error handling** — wrapped around every database call, catching
failures the caller had no control over (as opposed to validation,
which catches the caller's own mistakes):

```js
try {
  return NextResponse.json(await getAllNotes());
} catch (err) {
  console.error("GET /api/notes failed:", err);
  return NextResponse.json({ error: "Could not load notes" }, { status: 500 });
}
```

**Tested against a real failure, not a staged one:** dropped the
`notes` table live, with the server still running — confirmed a clean
`500` reached the client while the *real* error
(`Table 'nextjs_notes_demo.notes' doesn't exist`) was logged
server-side only. Restarted the server afterward and confirmed the
table (and seed data) came back automatically.

**Surfacing validation errors in the UI required zero new code** —
`NotesContext.jsx`'s `addNote`/`editNote` already threw on a non-2xx
response (built in Module 10), and `NoteForm.jsx` already caught and
displayed it. Server-side validation error messages appear inline
automatically, the same path already in place.

## Suggested exploration

- Try adding a note with 201 characters directly in the UI — the
  client never blocks it, so what you see is the server's own
  validation response, round-tripped back into the page.
- Run `npm run db:inspect` while `npm run dev` is running, then again
  after adding a note in the browser — watch the new row appear
  without restarting anything.
- Open MAMP's phpMyAdmin next to the running app and watch a row
  change in real time as you edit a note in the browser.
