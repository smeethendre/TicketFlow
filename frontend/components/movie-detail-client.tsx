"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Movie, Show, Theatre } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function MovieDetailClient({ movieId }: { movieId: string }) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [movieData, showData, theatreData] = await Promise.all([
          api.getMovie(movieId),
          api.getShowsByMovie(movieId),
          api.getTheatresByMovie(movieId).catch(() => []),
        ]);
        setMovie(movieData);
        setShows(showData);
        setTheatres(theatreData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load movie details");
      }
    }

    void load();
  }, [movieId]);

  const groupedShows = useMemo(() => {
    return shows.reduce<Record<string, Show[]>>((acc, show) => {
      const theatreName =
        typeof show.theatre === "string" ? "Unknown theatre" : show.theatre.theatreName;
      acc[theatreName] = [...(acc[theatreName] ?? []), show];
      return acc;
    }, {});
  }, [shows]);

  if (error) {
    return <p className="status-card error">{error}</p>;
  }

  if (!movie) {
    return <p className="status-card">Loading movie details...</p>;
  }

  return (
    <main className="page-stack detail-page">
      <section className="detail-hero">
        <div>
          <p className="eyebrow">{movie.movieLanguage} release</p>
          <h1>{movie.movieName}</h1>
          <p className="hero-text">{movie.movieDescription}</p>
          <div className="detail-meta">
            <span>{movie.runtimeMinutes} minutes</span>
            <span>{formatDate(movie.releaseDate)}</span>
            <span>{movie.movieCast.join(", ")}</span>
          </div>
          <div className="hero-actions">
            <a href={movie.movieTrailerUrl} className="primary-button" target="_blank" rel="noreferrer">
              Watch trailer
            </a>
            <Link href="/" className="ghost-button">
              Back to home
            </Link>
          </div>
        </div>

        <aside className="signal-panel">
          <strong>{shows.length}</strong>
          <p>scheduled shows available</p>
          <strong>{theatres.length}</strong>
          <p>theatres currently listing this movie</p>
        </aside>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <p className="eyebrow">Showtimes</p>
          <h2>Choose a theatre and lock your seats</h2>
        </div>

        <div className="show-groups">
          {Object.entries(groupedShows).map(([theatreName, theatreShows]) => (
            <article key={theatreName} className="show-group-card">
              <header>
                <h3>{theatreName}</h3>
                <p>
                  {typeof theatreShows[0].theatre === "string"
                    ? "Details unavailable"
                    : `${theatreShows[0].theatre.theatreCity} · ${theatreShows[0].theatre.theatreCapacity} seats`}
                </p>
              </header>
              <div className="show-chip-row">
                {theatreShows.map((show) => (
                  <Link key={show._id} href={`/shows/${show._id}`} className="show-chip">
                    <strong>{show.showTime}</strong>
                    <span>{formatDate(show.showDate)}</span>
                    <span>{show.availableSeats} left</span>
                    <span>Rs. {show.ticketPrice}</span>
                  </Link>
                ))}
              </div>
            </article>
          ))}
          {!shows.length ? <p className="status-card">No scheduled shows found for this movie yet.</p> : null}
        </div>
      </section>
    </main>
  );
}
