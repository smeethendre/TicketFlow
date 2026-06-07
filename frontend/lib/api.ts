import type {
  ApiEnvelope,
  AuthPayload,
  Booking,
  HoldResponse,
  Movie,
  PaymentOrder,
  Seat,
  Show,
  Theatre,
  User,
} from "@/lib/types";

const API_BASE =
  process.env.NEXT_PUBLIC_TICKETFLOW_API_URL ??
  (process.env.NEXT_PUBLIC_TICKETFLOW_API_HOST
    ? `https://${process.env.NEXT_PUBLIC_TICKETFLOW_API_HOST}/ta/api/v1`
    : "http://localhost:5000/ta/api/v1");

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? `Request failed with status ${response.status}`);
  }

  if (!payload || !("data" in payload)) {
    throw new Error("Unexpected API response shape");
  }

  return payload.data;
}

export const api = {
  baseUrl: API_BASE,
  getMovies: () => request<Movie[]>("/movies"),
  getMovie: (id: string) => request<Movie>(`/movies/${id}`),
  getTheatres: () => request<Theatre[]>("/theatre"),
  getTheatresByMovie: (movieId: string) => request<Theatre[]>(`/theatre/movie/${movieId}`),
  getShowsByMovie: (movieId: string) => request<Show[]>(`/show/movie/${movieId}`),
  getShow: (showId: string) => request<Show>(`/show/${showId}`),
  getShowSeats: (showId: string) => request<Seat[]>(`/show/${showId}/seats`),
  register: (body: {
    userName: string;
    email: string;
    password: string;
    phoneNumber?: number;
  }) => request<User>("/user/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string; mfaToken?: string }) =>
    request<AuthPayload>("/user/login", { method: "POST", body: JSON.stringify(body) }),
  profile: (token: string) => request<User>("/user/profile", { token }),
  getBookings: (token: string) => request<Booking[]>("/booking/my-bookings", { token }),
  holdSeats: (token: string, body: { showId: string; seatIds: string[] }) =>
    request<HoldResponse>("/booking/hold", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),
  releaseHold: (token: string, body: { showId: string; seatIds: string[] }) =>
    request<{ message: string }>("/booking/release", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),
  createBooking: (token: string, body: { showId: string; seatIds: string[] }) =>
    request<Booking>("/booking/create", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),
  createPaymentOrder: (token: string, body: { bookingId: string }) =>
    request<PaymentOrder>("/payment/order", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),
  verifyPayment: (
    token: string,
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      bookingId: string;
    },
  ) =>
    request<Booking>("/payment/verify", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),
};
