# TicketFlow Deployment

This repo is configured for Render Blueprint deployment with:

- `ticketflow-api`: Express backend
- `ticketflow-frontend`: Next.js frontend
- `ticketflow-redis`: Redis for seat holds and cache

## Deploy On Render

1. Commit and push the latest repo changes to GitHub.
2. Open the Render Blueprint importer:
   `https://dashboard.render.com/blueprint/new?repo=https://github.com/smeethendre/TicketFlow`
3. Select the repo and apply `render.yaml`.
4. Fill these secret environment variables when Render prompts:
   - `DB_CONNECTION`: MongoDB connection string
   - `RAZORPAY_KEY_ID`: Razorpay key id
   - `RAZORPAY_KEY_SECRET`: Razorpay key secret
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay key id for browser checkout
5. Deploy the Blueprint.

The frontend receives the API host from the backend service automatically through `NEXT_PUBLIC_TICKETFLOW_API_HOST`.

## Local Development

Backend:

```bash
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

The frontend defaults to `http://localhost:5000/ta/api/v1`, matching the current backend `.env` port.
