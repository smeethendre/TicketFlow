export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type User = {
  _id: string;
  userName?: string;
  email: string;
  role?: string;
  phoneNumber?: number;
  avatar?: string;
  mfaEnabled?: boolean;
};

export type Movie = {
  _id: string;
  movieName: string;
  runtimeMinutes: number;
  movieDescription: string;
  movieCast: string[];
  movieTrailerUrl: string;
  movieLanguage: string;
  releaseDate: string;
};

export type Theatre = {
  _id: string;
  theatreName: string;
  theatreCapacity: number;
  theatreCity: string;
  theatrePincode: number;
  theatreLocationUrl: string;
  theatreRunningMovies?: Movie[];
};

export type Show = {
  _id: string;
  movie: Movie | string;
  theatre: Theatre | string;
  showDate: string;
  showTime: string;
  totalSeats: number;
  availableSeats: number;
  ticketPrice: number;
  status: "scheduled" | "cancelled" | "completed";
};

export type Seat = {
  _id: string;
  seatNumber: string;
  status: "available" | "held" | "booked";
  heldBy?: string | null;
  bookedBy?: string | null;
};

export type Booking = {
  _id: string;
  user: User | string;
  show: Show;
  seats: Seat[];
  totalAmount: number;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentId?: string | null;
  razorpayOrderId?: string | null;
  bookingStatus: "pending" | "confirmed" | "cancelled";
  createdAt?: string;
};

export type AuthPayload = {
  user: User;
  accessToken: string;
};

export type HoldResponse = {
  message: string;
  heldSeats: string[];
  expiresInSeconds: number;
};

export type PaymentOrder = {
  orderId: string;
  amount: number;
  currency: string;
  bookingId: string;
};
