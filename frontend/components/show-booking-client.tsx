"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import type { Seat, Show } from "@/lib/types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function ShowBookingClient({ showId }: { showId: string }) {
  const { token, user } = useAuth();
  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("Loading show...");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [showData, seatData] = await Promise.all([
          api.getShow(showId),
          api.getShowSeats(showId),
        ]);
        setShow(showData);
        setSeats(seatData);
        setStatus("Select seats to begin your hold window.");
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Unable to load show");
      }
    }

    void load();
  }, [showId]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const selectedSeats = useMemo(
    () => seats.filter((seat) => selectedSeatIds.includes(seat._id)),
    [seats, selectedSeatIds],
  );

  const totalAmount = show ? selectedSeatIds.length * show.ticketPrice : 0;

  function toggleSeat(seat: Seat) {
    if (seat.status === "booked") {
      return;
    }

    setSelectedSeatIds((current) =>
      current.includes(seat._id)
        ? current.filter((id) => id !== seat._id)
        : [...current, seat._id],
    );
  }

  async function startBooking() {
    if (!token || !user) {
      setStatus("Sign in before trying to hold seats.");
      return;
    }

    if (!selectedSeatIds.length) {
      setStatus("Choose at least one seat before continuing.");
      return;
    }

    try {
      setBusy(true);
      const hold = await api.holdSeats(token, { showId, seatIds: selectedSeatIds });
      setStatus(`Seats held for ${Math.floor(hold.expiresInSeconds / 60)} minutes. Creating booking...`);

      const booking = await api.createBooking(token, { showId, seatIds: selectedSeatIds });
      const order = await api.createPaymentOrder(token, { bookingId: booking._id });
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey || !window.Razorpay) {
        setStatus(
          `Booking ${booking._id} created in pending state. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to enable checkout.`,
        );
        return;
      }

      const razorpay = new window.Razorpay({
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "TicketFlow",
        description: `Booking for ${typeof show?.movie === "string" ? "movie show" : show?.movie.movieName}`,
        order_id: order.orderId,
        theme: { color: "#ff6b2c" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verified = await api.verifyPayment(token, {
              ...response,
              bookingId: booking._id,
            });
            setStatus(`Payment verified. Booking ${verified._id} is confirmed.`);
          } catch (err) {
            setStatus(err instanceof Error ? err.message : "Payment verification failed");
          }
        },
        prefill: {
          email: user.email,
          name: user.userName ?? user.email.split("@")[0],
        },
      });

      razorpay.open();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Booking flow failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page-stack detail-page">
      <section className="detail-hero">
        <div>
          <p className="eyebrow">Seat lock experience</p>
          <h1>
            {show && typeof show.movie !== "string" ? show.movie.movieName : "Show booking"}
          </h1>
          <p className="hero-text">
            This screen is built around your strongest backend feature: short-lived Redis seat holds that
            protect users from double-booking.
          </p>
          {show ? (
            <div className="detail-meta">
              <span>{formatDate(show.showDate)}</span>
              <span>{show.showTime}</span>
              <span>Rs. {show.ticketPrice} per seat</span>
              <span>{show.availableSeats} seats available</span>
            </div>
          ) : null}
        </div>

        <aside className="signal-panel">
          <strong>{selectedSeatIds.length}</strong>
          <p>selected seats</p>
          <strong>Rs. {totalAmount}</strong>
          <p>current booking total</p>
        </aside>
      </section>

      <section className="section-shell booking-layout">
        <div className="seat-zone">
          <div className="screen-arc">Cinema screen</div>
          <div className="seat-grid">
            {seats.map((seat) => {
              const selected = selectedSeatIds.includes(seat._id);
              return (
                <button
                  key={seat._id}
                  className={`seat-button ${seat.status} ${selected ? "selected" : ""}`}
                  disabled={seat.status === "booked" || busy}
                  onClick={() => toggleSeat(seat)}
                  type="button"
                >
                  {seat.seatNumber}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="booking-sidebar">
          <div className="legend-row">
            <span><i className="legend-box available" /> Available</span>
            <span><i className="legend-box selected" /> Selected</span>
            <span><i className="legend-box booked" /> Booked</span>
          </div>

          <div className="summary-card">
            <h2>Booking summary</h2>
            <p>{status}</p>
            <div className="selected-tags">
              {selectedSeats.map((seat) => (
                <span key={seat._id}>{seat.seatNumber}</span>
              ))}
              {!selectedSeats.length ? <span>No seats selected yet</span> : null}
            </div>
            <button className="primary-button" type="button" onClick={startBooking} disabled={busy}>
              {busy ? "Processing..." : "Hold seats and continue"}
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
