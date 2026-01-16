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

## 7) Luật (rules) nằm ở đâu?

**Nguyên tắc phân tách**
- **Backend là source of truth**: rule engine đầy đủ, tính validation result, distribution, trust score và audit log để tránh gian lận.
- **App chỉ hiển thị + mô phỏng**: không quyết định kết quả cuối cùng, chỉ giúp người dùng hiểu.

**Rule engine nhẹ trên app (để đảm bảo UX minh bạch)**
- **Lock flow**: không cho phát distribution nếu record chưa `validated`.
- **Simulator**: mô phỏng phân phối theo rule set hiện hành để minh bạch (display-only).

**Gợi ý cấu trúc code trong `uvfl_wallet/`**
- `domain/rules/`: rule set nhẹ phục vụ simulator + kiểm tra trạng thái flow.
- `data/remote_api/`: gọi backend rule engine để lấy kết quả chính thức.

**Ví dụ state machine (Dart) cho lock flow**
```dart
enum RecordStatus {
  draft,
  pendingValidation,
  validated,
  disputed,
  distributed,
}

class UvflStateMachine {
  static bool canValidate(RecordStatus s) =>
      s == RecordStatus.pendingValidation;

  static bool canDistribute(RecordStatus s) =>
      s == RecordStatus.validated;

  static RecordStatus onCreated() => RecordStatus.pendingValidation;

  static RecordStatus onValidationApproved() => RecordStatus.validated;

  static RecordStatus onValidationDisputed() => RecordStatus.disputed;

  static RecordStatus onDistributed() => RecordStatus.distributed;
}
```

**Ví dụ hash audit (Dart, SHA-256)**
```dart
import 'dart:convert';
import 'package:crypto/crypto.dart';

String sha256Hex(String input) =>
    sha256.convert(utf8.encode(input)).toString();

String makeAuditHash({
  required String prevHash,
  required String action,
  required String actorId,
  required String payloadJson,
  required String isoTime,
}) {
  return sha256Hex('$prevHash|$action|$actorId|$payloadJson|$isoTime');
}
```

**Ví dụ repository interface (Dart)**
```dart
abstract class ValueRecordRepository {
  Future<String> createRecord(ValueRecordDraft draft); // returns local id
  Future<void> attachEvidence(String localId, String filePath);
  Future<void> requestSync(String localId);
  Stream<List<ValueRecord>> watchMyRecords();
  Future<ValueRecord> getById(String id);
}
```

**Ví dụ Riverpod providers (Dart)**
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

final valueRecordRepoProvider = Provider<ValueRecordRepository>((ref) {
  throw UnimplementedError();
});

final myRecordsProvider = StreamProvider((ref) {
  final repo = ref.watch(valueRecordRepoProvider);
  return repo.watchMyRecords();
});
```

## 8) Màn hình cốt lõi (UI flow) – code định hướng

### 8.1 Create Value Screen (offline-first)
- Form nhập **amount**, **type**, **description**.
- Pick evidence (image/pdf).
- Generate QR (cho offline).
- **Luật UI**: bấm “Create” → status = `pendingValidation`.

### 8.2 Validation Center Screen
- List pending records.
- Record detail: evidence viewer + validators list.
- Approve / Dispute (tạo `Validation` entity).
- Sync ngay nếu có mạng.

### 8.3 Distribution Screen
- **Chỉ bật nút “Distribute” khi `validated`**.
- Gọi server: `POST /records/{id}/distribute`.
- Nhận breakdown donut + ledger.

### 8.4 Roles Screen
- Hiển thị role hiện tại (Creator/Operator/Guide).
- Checklist KPI chu kỳ.
- Lịch sử upgrade/demotion (timeline).
