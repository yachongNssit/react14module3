import CredentialsProvider from "next-auth/providers/credentials";

// OBJECTIVE: Implementing authentication with NextAuth.js
//
// DEMO ONLY: a single hardcoded user. In a real app, authorize()
// would look this user up in a database and compare a HASHED
// password — never a plain string like below.
const DEMO_USER = {
  id: "1",
  name: "Trainer",
  username: "trainer",
  password: "hands-on",
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const isValid =
          credentials?.username === DEMO_USER.username &&
          credentials?.password === DEMO_USER.password;

        if (!isValid) return null; // null = failed login
        return { id: DEMO_USER.id, name: DEMO_USER.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  callbacks: {
    // The default session callback copies fields from the token onto
    // session.user as an explicit `undefined` for anything not set —
    // rebuilding it here keeps the session object predictable.
    async session({ session, token }) {
      session.user = { id: token.sub, name: token.name ?? null };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
