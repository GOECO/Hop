# GOECO Super App (Demo)

Dự án minh họa ứng dụng Flutter (iOS/Android) và backend REST cho hệ sinh thái cư dân GOECO.

## Thành phần

- **goeco_app**: Ứng dụng Flutter quản lý 6 luồng nghiệp vụ (OTP, xác thực cư dân, nhận/gửi hàng, ví GOECO Pay, nhật ký).
- **backend**: API REST Node.js (Express) mô phỏng dữ liệu in-memory, phục vụ cho mobile app thử nghiệm.

## Chạy backend

```bash
cd backend
npm install
npm run dev
```

API lắng nghe tại `http://localhost:4000`.

## Chạy ứng dụng Flutter

```bash
cd goeco_app
flutter pub get
flutter run
```

Ứng dụng mặc định trỏ tới backend cục bộ. Các luồng demo sử dụng dữ liệu mô phỏng và hiển thị OTP trực tiếp trên UI để tiện thử nghiệm.

## Tài liệu tham khảo

- [Tổng quan nền tảng Goland.ai](docs/goland-ai-overview.md)
