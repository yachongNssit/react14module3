import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import { getAllNotes } from "../../lib/db";
import { NotesProvider } from "../../context/NotesContext.jsx";
import NoteForm from "../../components/NoteForm.jsx";
import NoteList from "../../components/NoteList.jsx";
import SignOutButton from "../../components/SignOutButton.jsx";

// OBJECTIVE: Implementing authentication with NextAuth.js
// OBJECTIVE: Securing API routes and data
//
// This Server Component checks the session directly — no req/res
// arguments needed, unlike the Pages Router's
// getServerSession(req, res, authOptions). If there's no session, the
// redirect happens before any of this page's HTML — or its data — is
// ever built.
export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/signin");
  }

  // Reading data directly here, server-side — the App Router
  // equivalent of the Pages Router's getServerSideProps data fetch.
  const notes = await getAllNotes();

  return (
    // OBJECTIVE: Managing global application state with the Context API
    <NotesProvider initialNotes={notes}>
      <div className="app">
        <div className="wrap">
          <header className="topbar">
            <div>
              <p className="tag">Module 11 — App Router</p>
              <h1>Notes</h1>
            </div>
            <div className="who">
              <span>
                Signed in as <strong>{session.user.name}</strong>
              </span>
              <SignOutButton />
            </div>
          </header>

          <NoteForm />
          <NoteList />

          <footer>
            Every add/edit/delete above calls a secured Route Handler
            under <code>app/api/notes/</code>, which validates the
            input, then reads and writes a real MySQL database — with
            every operation wrapped in error handling that turns a
            real failure into a clean response instead of a crash.
          </footer>
        </div>
      </div>
    </NotesProvider>
  );
}
