# Hop – Nền tảng giao nhận chung cư đa kênh

Ứng dụng web tĩnh mô phỏng hệ thống Hop với bảng điều hành, app cư dân và app nhân viên giao nhận để xử lý kiện hàng tại kệ/tủ trong chung cư – nay được tinh chỉnh với phong cách xanh thân thiện lấy cảm hứng từ app GoEco.

## Tính năng chính

- **Bảng điều phối**: theo dõi trạng thái từng kiện hàng, vị trí lưu trữ, gói phí và hành động nhanh (báo cư dân, giao tận cửa, mở tủ, hoàn tất).
- **Form tạo phiếu**: tạo đơn giao nhận mới gắn với cư dân, kệ/tủ lưu trữ, gói phí và bắt buộc nhập mã vận đơn kèm ảnh nhãn khi nhập kho.
- **Kho ảnh & mã vận đơn**: xem lại ảnh nhãn, ảnh kiện khi gửi/nhận trong modal chứng từ, mở nhanh từ bảng điều phối và ứng dụng mô phỏng.
- **Ứng dụng cư dân (mockup di động)**: xác nhận đã nhận, yêu cầu giao tận cửa, mở tủ và xem lịch sử ngay trong giao diện mô phỏng điện thoại.
- **Ứng dụng nhân viên**: danh sách nhiệm vụ trong ngày, trạng thái lưu kho và nút mở tủ/kệ ngay trên thiết bị di động.
- **Phong cách GoEco**: thanh điều hướng xanh lá, thẻ thống kê dạng gradient và khung điện thoại với thanh trạng thái, thanh điều hướng đáy mô phỏng trải nghiệm GoEco.
- **Quản lý kệ & tủ**: thêm vị trí lưu trữ, xem sức chứa và số lượng đang chứa thực tế.
- **Quản lý gói phí**: tạo gói tính phí theo lượt hoặc theo tháng và sử dụng khi tạo phiếu.
- **Ảnh xác nhận giao nhận**: lưu ảnh khi cư dân nhận hàng, xem lại trong bảng điều phối và modal chi tiết.
- **Ví OnPay không tiền mặt**: theo dõi số dư, lịch sử nạp, nạp nhanh và tự động trừ phí khi cư dân xác nhận nhận hàng.
- **Thống kê thời gian thực**: tổng kiện chờ xử lý, hoàn tất trong ngày và đơn quá 24 giờ.

## Cách chạy

Ứng dụng là trang HTML tĩnh. Có thể mở trực tiếp `index.html` trong trình duyệt hoặc khởi chạy máy chủ tĩnh:

```bash
python -m http.server 8000
```

Sau đó truy cập `http://localhost:8000` để sử dụng.
