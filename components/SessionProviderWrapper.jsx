"use client";
import { SessionProvider } from "next-auth/react";

// next-auth's SessionProvider is itself a Client Component (it uses
// React Context internally) — it has to be wrapped in its own
// "use client" file like this one, since app/layout.js (a Server
// Component) cannot use a hook-based provider directly.
export default function SessionProviderWrapper({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
