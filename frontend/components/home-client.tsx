"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Movie, Theatre } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function buildPosterStyle(movie: Movie) {
  const hue = (movie.movieName.length * 31) % 360;
  return {
    background: `linear-gradient(135deg, hsl(${hue} 76% 54%), hsl(${(hue + 55) % 360} 78% 26%))`,
  };
}

export function HomeClient() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [movieData, theatreData] = await Promise.all([
          api.getMovies(),
          api.getTheatres(),
        ]);
        setMovies(movieData);
        setTheatres(theatreData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load TicketFlow data");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const cities = useMemo(
    () => Array.from(new Set(theatres.map((theatre) => theatre.theatreCity))),
    [theatres],
  );

  return (
    <main className="page-stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Movie booking, reimagined from your backend outward</p>
          <h1>TicketFlow turns concurrency and payment rigor into a front-end experience people can feel.</h1>
          <p className="hero-text">
            Your backend already does the hard part: seat holds, protected payments, role-aware actions,
            and production-minded security. This frontend translates that into a high-trust booking journey.
          </p>
          <div className="hero-actions">
            <Link href="/auth" className="primary-button">
              Start Booking
            </Link>
            <a href="#experience" className="ghost-button">
              See the flow
            </a>
          </div>
        </div>

        <div className="hero-stat-grid">
          <article>
            <span>10 min</span>
            <p>Redis seat lock window to stop double-booking chaos.</p>
          </article>
          <article>
            <span>3 roles</span>
            <p>User, admin, and superadmin flows are already supported by the API.</p>
          </article>
          <article>
            <span>INR checkout</span>
            <p>Razorpay payment order creation and verification are wired in.</p>
          </article>
        </div>
      </section>

      <section id="experience" className="section-shell">
        <div className="section-heading">
          <p className="eyebrow">Now showing</p>
          <h2>Current catalog from your API</h2>
          <p>These cards come directly from `GET /movies` and are styled around language, cast, and release timing.</p>
        </div>

        {loading ? <p className="status-card">Loading movies and theatres from TicketFlow...</p> : null}
        {error ? <p className="status-card error">{error}</p> : null}

        <div className="movie-grid">
          {movies.map((movie) => (
            <article key={movie._id} className="movie-card">
              <div className="movie-poster" style={buildPosterStyle(movie)}>
                <span>{movie.movieLanguage}</span>
                <strong>{movie.movieName}</strong>
              </div>
              <div className="movie-card-body">
                <div className="movie-meta-row">
                  <span>{movie.runtimeMinutes} min</span>
                  <span>{formatDate(movie.releaseDate)}</span>
                </div>
                <p>{movie.movieDescription}</p>
                <div className="cast-cloud">
                  {movie.movieCast.slice(0, 4).map((name) => (
                    <span key={name}>{name}</span>
                  ))}
                </div>
                <div className="card-actions">
                  <Link href={`/movies/${movie._id}`} className="primary-button small">
                    View shows
                  </Link>
                  <a className="ghost-button small" href={movie.movieTrailerUrl} target="_blank" rel="noreferrer">
                    Watch trailer
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell split-band">
        <div>
          <p className="eyebrow">City footprint</p>
          <h2>Theatres are ready for location-based discovery</h2>
          <p>
            Your theatre API is already enough for a location-first browsing layer. The frontend highlights
            active cities and theatre capacities so the experience feels grounded in place.
          </p>
          <div className="city-tags">
            {cities.length ? cities.map((city) => <span key={city}>{city}</span>) : <span>Waiting for theatre data</span>}
          </div>
        </div>

        <div className="theatre-list">
          {theatres.slice(0, 5).map((theatre) => (
            <article key={theatre._id}>
              <strong>{theatre.theatreName}</strong>
              <p>
                {theatre.theatreCity} · {theatre.theatreCapacity} seats · {theatre.theatrePincode}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell process-band">
        <div className="section-heading">
          <p className="eyebrow">Why this frontend fits your backend</p>
          <h2>The UI is centered on trust, tempo, and seat certainty</h2>
        </div>

        <div className="process-grid">
          <article>
            <strong>1. Browse with confidence</strong>
            <p>Movie-first discovery keeps the experience cinematic instead of looking like an admin dashboard.</p>
          </article>
          <article>
            <strong>2. Lock seats fast</strong>
            <p>The seat map makes held and booked states obvious, which shows off your Redis concurrency logic.</p>
          </article>
          <article>
            <strong>3. Close the loop</strong>
            <p>Booking history and payment status are visible after checkout so the system feels reliable.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
