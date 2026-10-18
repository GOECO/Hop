# GOECO POTS Integration Gateway (backend prototype)

This is a **separate GOECO/Hop backend feature**, not a change to existing GOECO app UI.
It receives signed events from GOECO/vietcore-pots-ai's durable outbox.

## Config (all REQUIRED to enable the receiver)

Node.js 24+ (for built-in node:sqlite); Express dependencies from backend/package.json.

GOECO_POTS_SYNC_SECRET = **the same independently generated 32+ character secret**
as POTS GOECO_SYNC_SECRET.
GOECO_POTS_ADMIN_SECRET = a **different** independently generated 32+ character secret.
GOECO_POTS_INBOX_DB = path to persistent private SQLite database.
No endpoint accepts events unless both secrets are configured.

Run: npm --prefix backend install && node backend/server.js

POST /api/integrations/pots/events
Headers: X-POTS-Event-ID, X-POTS-Timestamp, X-POTS-Signature
HMAC-SHA256(secret, timestamp + "." + exact request body bytes), within +/- 60 seconds.
Authenticated, validated events are persisted transactionally with event_id dedup.
Same ID + changed signed bytes -> 409. No guest phone, customer name or FaceID fields.
GET /api/integrations/pots/orders requires X-GOECO-POTS-Admin secret (temporary demo admin auth).

**No live endpoint has been deployed.** POTS outbound GOECO_SYNC_ENABLED remains 0
until a full HTTPS integration test with this receiver, deployment access controls,
key management and database backup/restore validation.

Known MVP limitations:
- Single-store, no tenant/store mapping; sender currently has no store_id.
- Node sqlite prototype, not PostgreSQL for scale.
- Receiver applies event lifecycle precedence and stores an immutable inbox; for
  conflicts it returns 409 and requires human reconciliation.
- CORS in GOECO/Hop backend is broad. Set a restricted reverse proxy allowlist
  for this endpoint in production. Do not run on the open Internet as-is.
- POTS worker uses at-least-once retries. Receiver idempotency prevents duplicate events,
  but business processing needs versioned order state when deployed at scale.
- No e-invoice, payment gateway, actual GOECO wallet posting or live merchant dashboard
  has been wired through this module.

CI: npm --prefix backend ci (when a package-lock exists) OR npm --prefix backend install,
then node --test backend/tests/potsEvents.test.js.
