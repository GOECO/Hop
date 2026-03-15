# GOECO Super App Platform Blueprint

## 1) Full System Architecture

### 1.1 High-level architecture
- **Client layer**
  - Flutter mobile super app (resident + workforce + partner experiences).
  - Next.js admin dashboard (operations, finance, growth, UVFL controls).
- **Edge/API layer**
  - API Gateway (NestJS) exposing `/api/v1/*` REST endpoints.
  - WebSocket gateway for real-time status updates (delivery, rides, IoT events).
- **Core domain services (NestJS modular monolith, extraction-ready)**
  - Auth & IAM, Delivery, GOFAST, Marketplace, GOFAM, GOHOLIDAY, GOLAND, Wallet, UVFL, Notification, Audit.
- **AI services (FastAPI)**
  - Face verification hook, document OCR/reconciliation, itinerary generation, anomaly/fraud scoring.
- **Data & infra**
  - PostgreSQL (multi-tenant schema + strong ledger consistency).
  - Redis (cache, distributed lock, queue broker).
  - S3-compatible object storage (evidence images, KYC docs, media assets).
  - Firebase Cloud Messaging for push notifications.

### 1.2 Integration patterns
- **REST for commands and queries**, with strict versioning (`/api/v1`).
- **Domain events** for lifecycle tracking:
  - `parcel.status.changed`, `ride.status.changed`, `wallet.transaction.posted`, `uvfl.distribution.completed`.
- **Outbox pattern** from PostgreSQL to queue workers for reliable async dispatch.
- **Device event ingestion** for smart locker/camera events with signature validation.

### 1.3 Multi-tenant strategy
- `tenant_id` + `building_id` propagated on all business entities.
- Row-level tenancy checks in repository/service guards.
- Tenant-aware RBAC and data partitioning policies.

---

## 2) Backend Folder Structure (NestJS)

```text
backend/goeco-core/
  src/
    main.ts
    app.module.ts
    config/
      app.config.ts
      jwt.config.ts
      redis.config.ts
    common/
      decorators/
        current-user.decorator.ts
      guards/
        jwt-auth.guard.ts
        roles.guard.ts
      events/
        domain-event.interface.ts
    database/
      migrations/
      entities/
    modules/
      auth/
      users/
      tenant/
      delivery/
      transport/
      services-marketplace/
      gofam/
      goholiday/
      goland/
      wallet/
      uvfl/
      ai-integration/
      iot/
      analytics/
      audit/
      notification/
```

---

## 3) Database Schema Proposal (PostgreSQL)

### 3.1 IAM and tenancy
- `tenants(id, code, name, status, created_at)`
- `buildings(id, tenant_id, code, name, address, timezone, metadata)`
- `users(id, tenant_id, phone, email, password_hash, status, last_login_at)`
- `roles(id, code, name)`
- `permissions(id, code, description)`
- `user_roles(user_id, role_id, building_id nullable)`
- `role_permissions(role_id, permission_id)`
- `otp_sessions(id, user_id nullable, channel, target, code_hash, expires_at, attempts, status)`
- `refresh_tokens(id, user_id, token_hash, device_id, expires_at, revoked_at)`

### 3.2 Delivery & smart receiving
- `parcels(id, tenant_id, building_id, resident_id, courier_name, tracking_no, status, qr_code, pickup_otp_hash, locker_id nullable)`
- `parcel_events(id, parcel_id, event_type, actor_type, actor_id, payload_json, created_at)`
- `parcel_evidence(id, parcel_id, type, object_key, mime_type, captured_by, created_at)`
- `delivery_disputes(id, parcel_id, raised_by, reason, status, resolution_note, resolved_at)`
- `smart_locker_events(id, locker_id, parcel_id nullable, event_type, raw_payload, signature_valid, created_at)`

### 3.3 GOFAST transport
- `rides(id, tenant_id, rider_id, driver_id nullable, pickup_geo, dropoff_geo, fare_quote, status)`
- `ride_events(id, ride_id, event_type, payload_json, created_at)`

### 3.4 Wallet ledger
- `wallet_accounts(id, tenant_id, user_id, currency, status, created_at)`
- `wallet_transactions(id, tenant_id, reference_no, type, status, created_at, posted_at)`
- `wallet_entries(id, transaction_id, wallet_account_id, direction, amount, balance_before, balance_after)`
- `wallet_limits(id, tenant_id, role_code, daily_limit, monthly_limit)`

### 3.5 UVFL engine
- `uvfl_members(id, tenant_id, user_id, current_tier, active_flag)`
- `uvfl_contributions(id, member_id, source_type, source_ref_id, contribution_value, kpi_score, period_key)`
- `uvfl_profit_pools(id, tenant_id, period_key, pool_amount, status, closed_at)`
- `uvfl_distributions(id, pool_id, member_id, gross_amount, capped_amount, rule_snapshot_json, created_at)`
- `uvfl_tier_history(id, member_id, old_tier, new_tier, reason, created_at)`
- `uvfl_anti_abuse_flags(id, member_id, rule_code, severity, action, created_at)`

### 3.6 Governance
- `audit_logs(id, tenant_id, actor_id, actor_role, action, entity_type, entity_id, before_json, after_json, ip, created_at)`
- `idempotency_keys(id, tenant_id, key, request_hash, response_json, expires_at)`

---

## 4) API Contract List (`/api/v1`)

### 4.1 Auth & user management
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/otp/send`
- `POST /auth/otp/verify`
- `GET /users/me`
- `PATCH /users/me`
- `POST /users/:id/roles`

### 4.2 Delivery
- `POST /delivery/parcels`
- `GET /delivery/parcels`
- `GET /delivery/parcels/:id`
- `POST /delivery/parcels/:id/check-in`
- `POST /delivery/parcels/:id/verify-qr`
- `POST /delivery/parcels/:id/verify-otp`
- `POST /delivery/parcels/:id/face-verify-hook`
- `POST /delivery/parcels/:id/locker-open-event`
- `POST /delivery/parcels/:id/evidence`
- `POST /delivery/parcels/:id/disputes`

### 4.3 GOFAST
- `POST /gofast/rides`
- `POST /gofast/rides/:id/accept`
- `POST /gofast/rides/:id/status`
- `GET /gofast/rides/:id/timeline`

### 4.4 Wallet
- `GET /wallet/accounts/me`
- `POST /wallet/topup`
- `POST /wallet/transfer`
- `POST /wallet/payout`
- `GET /wallet/transactions`

### 4.5 UVFL
- `POST /uvfl/contributions`
- `POST /uvfl/pools/:period/close`
- `POST /uvfl/distribute/:period`
- `GET /uvfl/members/:id/statement`
- `POST /uvfl/members/:id/recalculate-tier`

### 4.6 Admin
- `GET /admin/metrics/overview`
- `GET /admin/audit-logs`
- `GET /admin/tenants/:id/buildings`

---

## 5) Flutter App Screen List

- Onboarding + language selection.
- Login/Register + OTP verification.
- Role-aware Home hub (resident/driver/shipper/provider/merchant/etc).
- Smart parcel dashboard:
  - Incoming parcels list.
  - Parcel details + QR/OTP pickup flow.
  - Dispute submission.
- GOFAST ride booking and live tracking.
- In-house services marketplace + booking.
- GOFAM product catalog, cart, checkout.
- GOHOLIDAY booking + AI itinerary planner.
- GOLAND listings + lead chat.
- GOECO Pay wallet (balance, statement, transfer).
- UVFL statement, tier progress, history.
- Notifications center.
- Profile, KYC, and security settings.

---

## 6) Admin Dashboard Screen List (Next.js)

- Tenant and building operations console.
- User and RBAC management.
- Parcel command center with SLA and dispute queue.
- GOFAST fleet and trip monitoring.
- Marketplace order/service provider operations.
- GOFAM merchant and product governance.
- GOHOLIDAY booking oversight.
- GOLAND listing moderation + broker leads.
- Wallet treasury and reconciliation dashboard.
- UVFL engine dashboard:
  - pool configuration,
  - tier simulation,
  - anti-abuse review.
- AI/IoT device health, camera hooks, locker events.
- Audit logs explorer and export.
- KPI analytics and cohort trends.

---

## 7) Core Entity Models (Domain-level)

- **User**: identity + tenant scope + role assignments.
- **Parcel**: lifecycle aggregate with verification and evidence.
- **Ride**: transport aggregate with immutable event timeline.
- **WalletAccount/WalletTransaction**: double-entry accounting aggregate.
- **UVFLMember**: contribution-driven status and reward capacity.
- **UVFLDistribution**: period-based allocation with policy snapshot.
- **AuditLog**: immutable compliance trail.

---

## 8) Sample Code Areas Implemented

- Auth service with JWT + refresh token rotation + OTP verification.
- Delivery service with lifecycle transitions, QR/OTP checks, locker event hook, dispute handling.
- Wallet service with idempotent double-entry posting and balance lock protection.
- UVFL service with F1/F2/F3 tiering, capped distribution, anti-abuse filtering.

(See `backend/goeco-core/src/modules/*` for reference implementations.)

---

## 9) Deployment Guide

### 9.1 Environments
- `dev`, `staging`, `prod` with separate DB, Redis, object storage buckets, and FCM projects.

### 9.2 Runtime
- Containerize services (Docker).
- Deploy on Kubernetes with:
  - HPA for API and workers.
  - Dedicated worker deployment for queues.
  - Separate AI FastAPI deployment with GPU-enabled node pool if needed.

### 9.3 CI/CD
- Pipeline: lint -> unit tests -> integration tests -> security scan -> migration check -> deploy.
- Blue/green or canary rollout for backend and admin web.

### 9.4 Operations
- OpenTelemetry traces + centralized logs.
- DB PITR backups + disaster recovery runbook.
- Secret management via cloud secret manager.

---

## 10) Testing Strategy

- **Unit tests** for all domain services and policy engines.
- **Integration tests** for repository + transaction boundaries.
- **Contract tests** for REST and webhook payload compatibility.
- **E2E tests**
  - Auth login/refresh/OTP flows,
  - Parcel lifecycle with dispute,
  - Wallet transfer and reconciliation,
  - UVFL pool close and distribution.
- **Load tests** for peak parcel scans, ride updates, and wallet posting throughput.
- **Security tests**: auth hardening, privilege escalation checks, anti-fraud scenarios.
