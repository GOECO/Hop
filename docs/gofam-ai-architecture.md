# GOFAM AI – MVP kiến trúc & guide triển khai

## 1) Tổng quan kiến trúc hệ thống
```
[Flutter Mobile] --REST/GraphQL--> [API Gateway] --gRPC/Event--> [AI Services]
      |                                  |                        |-- CV Service (disease, growth)
      |                                  |                        |-- Reco/Decision Engine
      |                                  |                        |-- 3D Reconstruction (LiDAR/RGB)
      |                                  |--MQTT/WebSocket--> [IoT Ingestor] --Kafka--> [Time-series DB]
      |                                  |--REST--> [Farm Core Service] --SQL--> [Relational DB]
      |                                  |--REST--> [Traceability Service] --Object Storage--> [Evidence]
      |                                  |--REST--> [Robot/Drone Controller] --RTSP/WebRTC--> [Camera Streams]
      |--WebRTC/RTSP--> [Edge Camera Box]                                |--ROS/Drone SDK--> Robot/Drone
```
- Edge: gateway chạy tại nông trại (Nvidia Jetson/Raspberry Pi) nhận cảm biến, camera, gửi MQTT/RTSP.
- Cloud: API Gateway (Kong/NGINX) + microservices (NestJS/Express/FastAPI/Go) + DB.
- AI: tách service chuyên biệt, deploy bằng Docker/K8s, có GPU node cho CV/3D.
- Storage: PostgreSQL (quan hệ), TimescaleDB/InfluxDB (sensor), MinIO/S3 (ảnh/video/point cloud), Redis cache.
- Admin dashboard (React) + Mobile Flutter cho farmer/adopter.

## 2) Database schema (MVP, chuẩn hoá tối thiểu)
**Relational (PostgreSQL)**
- users(id, phone, password_hash, role ENUM['FARMER','ADMIN','ADOPTER'], full_name, locale, created_at)
- farms(id, owner_id FK users, name, location_geojson, size_ha, created_at)
- plots(id, farm_id FK farms, name, crop_type, area_m2, status, created_at)
- assets(id, farm_id, type ENUM['SENSOR','CAMERA','DRONE','ROBOT'], model, serial, metadata JSONB)
- adoptions(id, plot_id, adopter_id, start_date, end_date, revenue_share_pct, status)
- activities(id, plot_id, actor_id, type, payload JSONB, created_at)
- traceability_events(id, plot_id, stage ENUM['PLANT','CARE','HARVEST','PACK'], data JSONB, immutable_hash, created_at)
- commands(id, asset_id, command_type, payload JSONB, issued_by, status, evidence_url, created_at)

**Time-series (TimescaleDB/InfluxDB)**
- sensor_readings(time, farm_id, plot_id, asset_id, metric ENUM['SOIL_MOIST','SOIL_PH','SOIL_EC','AIR_TEMP','AIR_HUM','CO2','NH3','WATER_PH','WATER_TDS','WATER_DO'], value, unit)

**Object storage (MinIO/S3)**
- camera_uploads/:farmId/:date/:filename (ảnh/video)
- pointcloud/:farmId/:missionId.ply
- reports/:plotId/:timestamp.pdf

## 3) API design (REST, gợi ý GraphQL)
**Auth & User**
- `POST /api/auth/login` {phone,password} → {token, user}
- `POST /api/auth/signup` {phone,password,role}
- `GET /api/users/me`

**Farm & Plot**
- `POST /api/farms` {name, location_geojson, size_ha}
- `GET /api/farms/:id`
- `POST /api/farms/:id/plots` {name, crop_type, area_m2}
- `GET /api/plots/:id`

**IoT ingest & query**
- `POST /api/iot/readings` {farm_id, plot_id, asset_id, metric, value, unit, time?}
- `GET /api/iot/readings?plot_id=...&metric=...&from=...&to=...`
- WebSocket `/ws/realtime/:plotId` phát luồng mới nhất.

**Camera AI**
- `POST /api/vision/analyze` {image_url|base64, crop_type} → {disease, severity, affected_area, growth_stage}
- `POST /api/vision/video-hook` (callback từ edge camera với RTSP URL + metadata)

**AI Decision Engine**
- `POST /api/ai/decision` {plot_id, env_summary, disease?, forecast?} → {action, method, chemical, dosage, time}
- `POST /api/ai/recommendation` {plot_id} → danh sách hành động ưu tiên.

**Robot/Drone control**
- `POST /api/robots/commands` {asset_id, action, path?, payload}
- `GET /api/robots/commands/:id` trạng thái + evidence.

**3D scan**
- `POST /api/scan/mission` {asset_id, plot_id, type: 'DRONE'|'ROBOT', sensors: ['RGB','MULTI','LIDAR']}
- `POST /api/scan/mission/:id/upload` (multipart) lưu point cloud.
- `GET /api/scan/mission/:id` metadata + URL model.

**Traceability**
- `POST /api/trace/:plot_id/event` {stage, data}
- `GET /api/trace/:plot_id/export?format=pdf|xlsx&lang=vi,en` trả link + QR content.

**Adopt farming**
- `POST /api/adoptions` {plot_id, months, revenue_share_pct}
- `GET /api/adoptions/:id/insights` trả camera feed, dữ liệu, lợi nhuận dự báo.

**GraphQL gợi ý**: /graphql với schema Farm, Plot, Reading, Recommendation cho truy vấn tổng hợp mobile.

## 4) Luồng dữ liệu AI (MVP)
1. Edge gateway gửi sensor qua MQTT → IoT ingestor → TimescaleDB.
2. Camera box gửi ảnh định kỳ/trigger → Vision service (YOLOv8/Segment Anything) → trả JSON {disease,severity,area}.
3. Scheduler gom dữ liệu 15 phút: truy vấn reading + kết quả vision → Decision Engine (rule-based + ML) → khuyến nghị.
4. Nếu action cần robot/drone: Controller dịch sang lệnh SDK (DJI, ROS2), gửi và chờ ack; log kết quả + video.
5. Traceability service ghi immutable event + hash (kèm evidence URL) → export QR/PDF.
6. Mobile/Flutter subscribe WebSocket để hiện realtime + alert push.

## 5) Code mẫu Flutter (UI + logic, có thể ghép vào goeco_app)
```dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class RealtimeSensorCard extends StatefulWidget {
  const RealtimeSensorCard({super.key, required this.plotId, required this.token});
  final String plotId;
  final String token;

  @override
  State<RealtimeSensorCard> createState() => _RealtimeSensorCardState();
}

class _RealtimeSensorCardState extends State<RealtimeSensorCard> {
  late Timer _timer;
  Map<String, double> latest = {};

  @override
  void initState() {
    super.initState();
    _poll();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => _poll());
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  Future<void> _poll() async {
    final uri = Uri.parse('http://localhost:4000/api/iot/readings?plot_id=${widget.plotId}&limit=1');
    final res = await http.get(uri, headers: {'Authorization': 'Bearer ${widget.token}'});
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      setState(() {
        for (final entry in data['latest']) {
          latest[entry['metric'] as String] = (entry['value'] as num).toDouble();
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Realtime vitals', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (latest.isEmpty) const Text('Đang lấy dữ liệu...'),
            Wrap(
              spacing: 12,
              children: latest.entries
                  .map((e) => Chip(label: Text('${e.key}: ${e.value.toStringAsFixed(2)}')))
                  .toList(),
            ),
            Text('Cập nhật: ${DateFormat.Hms().format(DateTime.now())}'),
          ],
        ),
      ),
    );
  }
}
```
- Ghép `RealtimeSensorCard(plotId: 'plot-123', token: state.token!)` vào dashboard.
- Token lấy từ bước đăng nhập.

## 6) Code backend mẫu (Express, tái sử dụng backend/)
```js
// backend/routes/gofam.js
import express from 'express';
const router = express.Router();

const farms = new Map();
const sensorReadings = [];

router.post('/farms', (req, res) => {
  const id = `farm-${Date.now()}`;
  farms.set(id, { id, ...req.body });
  res.json(farms.get(id));
});

router.post('/farms/:id/sensors', (req, res) => {
  const { metric, value, unit, plot_id } = req.body;
  sensorReadings.push({
    time: new Date().toISOString(),
    farm_id: req.params.id,
    plot_id,
    metric,
    value,
    unit,
  });
  res.json({ status: 'stored' });
});

router.get('/farms/:id/sensors', (req, res) => {
  const filtered = sensorReadings.filter(r => r.farm_id === req.params.id);
  res.json({ latest: filtered.slice(-10).reverse() });
});

router.post('/ai/decision', (req, res) => {
  const { disease, env_summary } = req.body;
  if (disease?.severity >= 3) {
    return res.json({ action: 'SPRAY', method: 'BIO', chemical: 'Bio_Fungicide_A', dosage: '15ml/m2', time: '05:30' });
  }
  if ((env_summary?.soil_moist ?? 0) < 20) {
    return res.json({ action: 'IRRIGATE', method: 'DRIP', volume: '8L/m2', time: '06:00' });
  }
  return res.json({ action: 'MONITOR', notes: 'Ổn định, kiểm tra lại sau 12h' });
});

router.post('/robots/commands', (req, res) => {
  const id = `cmd-${Date.now()}`;
  res.json({ id, status: 'QUEUED', issued_at: new Date().toISOString(), payload: req.body });
});

export default router;
```
- Đăng ký router trong `server.js`: `import gofamRouter from './routes/gofam.js'; app.use('/api/gofam', gofamRouter);`
- POC: `curl -X POST http://localhost:4000/api/gofam/farms -H 'Content-Type: application/json' -d '{"name":"Demo farm"}'`.

## 7) AI pipeline (pseudo)
```
function analyze_frame(frame):
    crops = segment(frame)
    for crop in crops:
        disease = classify_disease(crop.patch)
        severity = estimate_severity(crop.patch)
    return aggregate_results(crops)

function decision_engine(plot_id):
    readings = query_sensor(plot_id, last_24h)
    vision = latest_vision(plot_id)
    features = featurize(readings, vision)
    risk = xgboost_model.predict(features)
    if risk > 0.7 or vision.severity>=3:
        return spray_bio_fungicide()
    if soil_moisture_low(readings):
        return irrigate_drip()
    return monitor()
```

## 8) Hướng dẫn deploy (MVP → production)
- **Dev/POC**: Docker Compose (api + postgres + timescaledb + minio + mosquitto). Expose 4000 REST, 8080 admin (e.g., Grafana).
- **Prod**: K8s trên cloud, dùng Helm chart cho TimescaleDB/MinIO/MQTT; GPU node cho AI service. Autoscale HPA theo CPU/GPU.
- **CI/CD**: GitHub Actions build Docker images, push registry, deploy ArgoCD.
- **Monitoring**: Prometheus + Grafana dashboards (sensor ingest rate, AI latency, robot success). Loki cho log, Jaeger trace.
- **Security**: JWT cho mobile/API, mTLS cho edge gateway, chữ ký Webhook từ camera box. Sao lưu S3 versioning + DB PITR.
- **Scalability**: phân shard Timescale theo farm_id, cache Redis cho dashboard, Kafka để fan-out AI/decision.

## 9) Mở rộng 10.000+ hộ
- Multi-tenant bằng trường tenant_id trong bảng/measurement.
- Partition table/time-series retention policy (chỉ giữ raw 90 ngày, summary 1h/1d).
- Edge filtering: chỉ đẩy sự kiện bất thường để giảm băng thông.
- Tách queue cho robot/drone control để cô lập SLA.
