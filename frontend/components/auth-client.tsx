"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

type Mode = "login" | "register";

export function AuthClient() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [status, setStatus] = useState("Use the same API your backend already exposes.");
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(
    () => (mode === "login" ? "Return to your account" : "Create your TicketFlow account"),
    [mode],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const userName = String(formData.get("userName") ?? "");
    const phoneNumber = String(formData.get("phoneNumber") ?? "");
    const mfaToken = String(formData.get("mfaToken") ?? "");

    try {
      setSubmitting(true);

      if (mode === "register") {
        await api.register({
          userName,
          email,
          password,
          phoneNumber: phoneNumber ? Number(phoneNumber) : undefined,
        });
        setStatus("Account created. Logging you in next...");
      }

      const auth = await api.login({
        email,
        password,
        mfaToken: mfaToken || undefined,
      });

      setSession(auth.accessToken, auth.user);
      setStatus("Signed in successfully.");
      router.push("/");
      router.refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-stack auth-page">
      <section className="auth-shell">
        <div className="auth-panel intro">
          <p className="eyebrow">Access layer</p>
          <h1>{title}</h1>
          <p>
            This frontend talks directly to your `/user/register`, `/user/login`, and `/user/profile`
            routes, keeping the experience aligned with the backend you already built.
          </p>
          <div className="auth-points">
            <span>JWT-based session</span>
            <span>Optional admin MFA support</span>
            <span>Booking history after login</span>
          </div>
        </div>

        <form className="auth-panel form" onSubmit={onSubmit}>
          <div className="mode-switch">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
              Sign in
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          {mode === "register" ? (
            <>
              <label>
                Username
                <input name="userName" placeholder="Smeet" required={mode === "register"} />
              </label>
              <label>
                Phone number
                <input name="phoneNumber" placeholder="9876543210" />
              </label>
            </>
          ) : null}

          <label>
            Email
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>

          <label>
            Password
            <input name="password" type="password" placeholder="Enter password" required />
          </label>

          <label>
            MFA code
            <input name="mfaToken" placeholder="Admins only if enabled" />
          </label>

          <p className="form-status">{status}</p>

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
