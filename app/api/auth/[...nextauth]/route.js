import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth";

// The App Router equivalent of pages/api/auth/[...nextauth].js — same
// authOptions, but exported as named GET/POST functions (a Route
// Handler convention) instead of a single default-exported (req, res)
// handler function.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
