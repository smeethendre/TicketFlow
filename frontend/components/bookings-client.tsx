"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import type { Booking } from "@/lib/types";

function formatDateTime(value?: string) {
  if (!value) {
    return "Recent";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function BookingsClient() {
  const { token, user, loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState("Loading your bookings...");

  useEffect(() => {
    async function load() {
      if (!token) {
        setStatus("Sign in to view your booking history.");
        return;
      }

      try {
        const data = await api.getBookings(token);
        setBookings(data);
        setStatus(data.length ? "Your latest bookings are ready." : "No bookings yet.");
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Unable to load bookings");
      }
    }

    void load();
  }, [token]);

  if (loading) {
    return <p className="status-card">Checking your session...</p>;
  }

  if (!user) {
    return (
      <main className="page-stack section-shell">
        <div className="section-heading">
          <p className="eyebrow">Account required</p>
          <h1>Bookings live behind your authenticated user flow</h1>
          <p>{status}</p>
          <Link href="/auth" className="primary-button">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-stack section-shell">
      <div className="section-heading">
        <p className="eyebrow">My bookings</p>
        <h1>Track confirmations, pending payments, and cancellations</h1>
        <p>{status}</p>
      </div>

      <div className="booking-history">
        {bookings.map((booking) => (
          <article key={booking._id} className="history-card">
            <div>
              <strong>
                {typeof booking.show.movie === "string"
                  ? "Movie booking"
                  : booking.show.movie.movieName}
              </strong>
              <p>{formatDateTime(booking.createdAt)}</p>
            </div>
            <div className="history-pills">
              <span>{booking.bookingStatus}</span>
              <span>{booking.paymentStatus}</span>
              <span>Rs. {booking.totalAmount}</span>
              <span>{booking.seats.map((seat) => seat.seatNumber).join(", ")}</span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
