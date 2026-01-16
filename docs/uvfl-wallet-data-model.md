# UVFL Wallet – Minimal Data Model (ready for implementation)

Tài liệu này mô tả data model tối thiểu để triển khai trong cấu trúc `uvfl_wallet/`.
Các entity bên dưới đủ để code offline-first + validation + distribution + audit log.

## 1) Entity: ValueRecord

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Local UUID (primary key). |
| type | enum | `online` / `offline`. |
| amount | num | Số tiền. |
| currency | string | Ví dụ `VND`, `USD`. |
| description | string | Mô tả ngắn. |
| evidenceLocalPath | string | Local file path (offline). |
| evidenceRemoteUrl | string | URL sau khi sync. |
| status | enum | `draft` / `pending_validation` / `validated` / `disputed` / `distributed`. |
| creatorId | string | ID người tạo record. |
| operatorId | string? | Tùy chọn (nullable). |
| guideId | string? | Tùy chọn (nullable). |
| createdAt | datetime | Thời điểm tạo. |
| hash | string | Audit hash (SHA-256). |
| serverId | string? | ID server sau khi sync. |
| syncStatus | enum | `pending` / `synced` / `failed`. |

## 2) Entity: Validation

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Local UUID (primary key). |
| recordId | UUID | FK → ValueRecord.id. |
| validatorId | string | Người xác thực. |
| trustWeight | num | Lấy từ server hoặc cached. |
| decision | enum | `approve` / `dispute`. |
| note | string? | Tùy chọn (nullable). |
| createdAt | datetime | Thời điểm xác thực. |
| hash | string | Audit hash (SHA-256). |

## 3) Entity: Distribution

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Local UUID (primary key). |
| recordId | UUID | FK → ValueRecord.id. |
| creatorAmount | num | Phần của creator. |
| operatorAmount | num | Phần của operator. |
| guideAmount | num | Phần của guide. |
| systemAmount | num | Phần của system. |
| ceilingPercent | num | Giới hạn trần (%). |
| ruleVersion | string | Version bộ rule. |
| createdAt | datetime | Thời điểm tính phân phối. |

## 4) Entity: AuditLog (append-only)

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | Local UUID (primary key). |
| action | string | Ví dụ `RECORD_CREATED`, `VALIDATION_ADDED`. |
| actorId | string | ID người thực hiện. |
| recordId | UUID? | Tùy chọn, null nếu không gắn record. |
| payloadJson | string | JSON string (snapshot data). |
| timestamp | datetime | Thời điểm ghi log. |
| prevHash | string | Hash của log trước đó (chain). |
| hash | string | Hash hiện tại (SHA-256). |

## 5) Gợi ý quan hệ tối thiểu

- `ValueRecord (1) → (N) Validation`
- `ValueRecord (1) → (1) Distribution` (sau khi rule engine chạy)
- `ValueRecord (1) → (N) AuditLog`

## 6) Gợi ý enum

- `ValueRecordStatus`: `draft`, `pending_validation`, `validated`, `disputed`, `distributed`
- `SyncStatus`: `pending`, `synced`, `failed`
- `RecordType`: `online`, `offline`
- `ValidationDecision`: `approve`, `dispute`
