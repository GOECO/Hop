# GOECO Core (NestJS Blueprint)

This folder contains a production-oriented blueprint for the GOECO core backend.

## Modules
- `auth`: JWT, refresh rotation, OTP.
- `delivery`: parcel lifecycle, QR/OTP verification, locker and dispute events.
- `wallet`: idempotent transfers with double-entry ledger guarantees.
- `uvfl`: contribution scoring, tiering (F1/F2/F3), capped distribution.

## Notes
- Code is intentionally concise and intended as starter reference implementation.
- Plug repositories, DTOs, and controllers into each module for full runtime delivery.
