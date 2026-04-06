# TicketFlow 🎬

> Production-grade movie ticket booking API — built with enterprise security, Redis-backed concurrency control, and NIST 800-53 / ISO 27001 compliance controls implemented in code.

**Node.js · Express · MongoDB · Redis · Razorpay · AWS · JWT · RBAC**

---

## What Makes This Different

Most ticket booking projects are basic CRUD. This one isn't.

| Feature | What Was Built |
|---|---|
| **Concurrent Seat Booking** | Redis-backed 10-min seat holds — prevents double booking under simultaneous load |
| **NIST 800-53 Compliance** | 8 security controls implemented in actual code, not just documented |
| **3-Role RBAC** | User / Admin / Superadmin — each admin owns and manages only their theatre |
| **Payment Security** | Razorpay HMAC SHA256 signature verification — tamper-proof payment flow |
| **Token Security** | Short-lived JWT + refresh token rotation + blacklist on logout |
| **Cache Layer** | Redis caching with automatic invalidation on mutations |
| **MFA** | TOTP-based two-factor auth for admin roles via speakeasy |
| **Service Architecture** | Clean Controller → Service → Model separation throughout |

---

## NIST 800-53 / ISO 27001 — Implemented Controls

These are not just mentioned — they are built into the codebase.

| Control | Standard | How It's Implemented |
|---|---|---|
| Access Control | NIST AC-2, AC-3 | 3-role RBAC — `verifyRole()` middleware on every protected route |
| Authentication | NIST IA-2, IA-5 | JWT access token (30d) + refresh token (180d) with rotation |
| Session Termination | NIST AC-12 | Refresh token set to `null` in DB on logout — token blacklisted |
| Rate Limiting | NIST SC-5 | `express-rate-limit` — per-IP request throttling |
| Input Validation | NIST SI-10 | Zod schema validation on all request bodies before hitting service layer |
| Security Headers | NIST SC-8 | Helmet.js — sets 14 HTTP security headers including CSP, HSTS |
| Audit Logging | NIST AU-2, AU-3 | Every request logged with IP, userId, action, timestamp via Morgan |
| MFA | NIST IA-2(1) | TOTP via speakeasy enforced for admin role |
| Encryption in Transit | NIST SC-8 | HTTPS via AWS ALB + ACM certificate |
| Secrets Management | NIST SC-28 | All secrets in `.env` — never hardcoded, `.env` in `.gitignore` |

---

## Seat Hold & Concurrency Control

The hardest problem in ticketing — two users booking the same seat at the same time.

**How it's solved:**

```
User A clicks Seat 5
       ↓
Redis: SET seat_hold:{seatId} = userA_id  EX 600   ← atomic, 10 min TTL
       ↓
User B clicks Seat 5
       ↓
Redis GET → already held by User A → 409 Conflict returned instantly
       ↓
User A pays → Razorpay order → HMAC SHA256 verified → seat BOOKED in MongoDB
Redis hold key deleted. availableSeats decremented atomically.
       ↓
User A abandons → Redis TTL expires automatically after 10 min
Seat released back to available. No cron job needed.
```

**Why Redis and not MongoDB:**
MongoDB writes are slower and not atomic enough for millisecond-level race conditions. Redis `SET EX` is atomic by design — the check and set happen in one operation. No two users can hold the same seat simultaneously.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v22 (ESM modules) |
| Framework | Express.js |
| Primary DB | MongoDB Atlas + Mongoose |
| Cache / Holds | Redis |
| Auth | JWT + bcrypt |
| Payments | Razorpay |
| Validation | Zod |
| Security Headers | Helmet.js |
| Rate Limiting | express-rate-limit |
| MFA | speakeasy |
| Deployment | AWS |

---

## Architecture

```
Request
   ↓
Rate Limiter + Helmet (every request)
   ↓
Router
   ↓
verifyUser → verifyRole (protected routes)
   ↓
Cache Middleware (Redis — GET routes)
   ↓
Controller  ← request/response only
   ↓
Service     ← all business logic lives here
   ↓
Model       ← MongoDB via Mongoose
```

---

## RBAC — Who Can Do What

| Action | User | Admin | Superadmin |
|---|---|---|---|
| View movies / theatres / shows | ✅ | ✅ | ✅ |
| Book tickets | ✅ | ❌ | ✅ |
| Add / edit / delete movies | ❌ | ✅ | ✅ |
| Create / schedule shows | ❌ | ✅ | ✅ |
| Add movies to own theatre only | ❌ | ✅ | ✅ |
| Create / delete theatres | ❌ | ❌ | ✅ |
| Promote user to admin | ❌ | ❌ | ✅ |
| Assign admin to theatre | ❌ | ❌ | ✅ |

Admin is assigned to exactly one theatre by superadmin. They can only manage their own theatre — attempting to modify another theatre returns 403.

---

## API Endpoints

### User / Auth
```
POST   /ta/api/v1/user/register              Public
POST   /ta/api/v1/user/login                 Public
POST   /ta/api/v1/user/logout                User
GET    /ta/api/v1/user/profile               User
PATCH  /ta/api/v1/user/:userId/promote       Superadmin
POST   /ta/api/v1/user/assign-theatre        Superadmin
```

### Movies
```
GET    /ta/api/v1/movies                     Public (cached)
GET    /ta/api/v1/movies/:id                 Public (cached)
POST   /ta/api/v1/movies                     Admin
PATCH  /ta/api/v1/movies/:id                 Admin
DELETE /ta/api/v1/movies/:id                 Admin
```

### Theatres
```
GET    /ta/api/v1/theatre                    Public (cached)
GET    /ta/api/v1/theatre/:id                Public (cached)
GET    /ta/api/v1/theatre/:id/movies         Public
GET    /ta/api/v1/theatre/movie/:movieId     Public
POST   /ta/api/v1/theatre                    Superadmin
PATCH  /ta/api/v1/theatre/:id/movies         Admin (own theatre only)
DELETE /ta/api/v1/theatre/:id                Superadmin
```

### Shows & Seats
```
GET    /ta/api/v1/show/:id                   Public
GET    /ta/api/v1/show/:id/seats             Public
GET    /ta/api/v1/show/movie/:movieId        Public
POST   /ta/api/v1/show                       Admin (auto-generates seats)
DELETE /ta/api/v1/show/:id                   Admin
```

### Booking
```
POST   /ta/api/v1/booking/hold               User (Redis hold, 10 min TTL)
POST   /ta/api/v1/booking/release            User
POST   /ta/api/v1/booking/create             User (pending state)
POST   /ta/api/v1/booking/confirm            User (post payment)
DELETE /ta/api/v1/booking/:id/cancel         User (auto refund if paid)
GET    /ta/api/v1/booking/my-bookings        User
```

### Payments
```
POST   /ta/api/v1/payment/order              User (creates Razorpay order)
POST   /ta/api/v1/payment/verify             User (HMAC SHA256 verification)
POST   /ta/api/v1/payment/refund/:bookingId  User
```

---

## Local Setup

```bash
git clone https://github.com/smeethendre/TicketFlow.git
cd TicketFlow
npm install
```

Create `.env` — see `.env.example`:
```
PORT=6000
DB_CONNECTION=your_mongodb_uri
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXP=30d
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXP=180d
REDIS_URL=redis://localhost:6379
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NODE_ENV=development
```

```bash
# start Redis first
redis-server

# then
npm run dev
```

---

## Author

**Smeet Hendre** — Electronics & Computer Science, Final Year
Backend Developer · Space Club (LEAP) Member
GitHub: [@smeethendre](https://github.com/smeethendre)
