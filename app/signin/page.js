"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // OBJECTIVE: Implementing authentication with NextAuth.js
    const res = await signIn("credentials", { username, password, redirect: false });

    if (res?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="app">
      <div className="wrap narrow">
        <p className="tag">NextAuth.js — App Router</p>
        <h1>Sign in</h1>

        <form onSubmit={handleSubmit} className="card stack">
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit">Sign in</button>
        </form>

        <p className="hint">
          Demo credentials: <code>trainer</code> / <code>hands-on</code>
        </p>
      </div>
    </div>
  );
}
