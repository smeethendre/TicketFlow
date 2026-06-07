"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

const links = [
  { href: "/", label: "Home" },
  { href: "/bookings", label: "My Bookings" },
  { href: "/auth", label: "Sign In" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="shell-header">
      <Link href="/" className="brand-lockup">
        <span className="brand-badge">TF</span>
        <span>
          <strong>TicketFlow</strong>
          <small>Seat locks. Secure checkout. Real movie nights.</small>
        </span>
      </Link>

      <nav className="top-nav">
        {links.map((link) => {
          if (link.href === "/auth" && user) {
            return null;
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "nav-link active" : "nav-link"}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="account-strip">
        {user ? (
          <>
            <div className="user-chip">
              <span>{user.userName ?? user.email.split("@")[0]}</span>
              <small>{user.role ?? "User"}</small>
            </div>
            <button className="ghost-button" onClick={logout} type="button">
              Sign out
            </button>
          </>
        ) : (
          <Link href="/auth" className="primary-button small">
            Join now
          </Link>
        )}
      </div>
    </header>
  );
}
