# GOECO Backend (REST)

Express REST API mô phỏng nghiệp vụ cư dân của nền tảng GOECO.

## Khởi chạy

```bash
npm install
npm run dev
```

Dịch vụ chạy tại `http://localhost:4000`.

## Các nhóm endpoint chính

- `POST /api/auth/request-otp` và `POST /api/auth/verify-otp`
- `POST /api/residents/verify`
- `POST /api/packages` để nhận hộ và gán kệ, `PATCH /api/packages/:id/pickup`
- `POST /api/shipments` để tạo đơn gửi, `POST /api/shipments/quote` báo giá, `PATCH /api/shipments/:id/status`
- `POST /api/wallet/topup` và `GET /api/wallet`
- `GET /api/events` nhật ký sự kiện
