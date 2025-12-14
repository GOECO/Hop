class SensorData {
  SensorData({
    required this.temperature,
    required this.humidity,
    required this.ph,
    required this.co2,
    required this.timestamp,
  });

  final double temperature;
  final double humidity;
  final double ph;
  final int co2;
  final String timestamp;

  factory SensorData.fromJson(Map<String, dynamic> json) => SensorData(
        temperature: (json['temperature'] as num).toDouble(),
        humidity: (json['humidity'] as num).toDouble(),
        ph: (json['ph'] as num).toDouble(),
        co2: json['co2'] as int,
        timestamp: json['timestamp'] as String,
      );
}

class Recommendation {
  Recommendation({
    required this.action,
    required this.method,
    required this.dosage,
    required this.reason,
    required this.status,
  });

  final String action;
  final String method;
  final String dosage;
  final String reason;
  final String status;

  factory Recommendation.fromJson(Map<String, dynamic> json) => Recommendation(
        action: json['action'] as String,
        method: json['method'] as String,
        dosage: json['dosage'] as String,
        reason: json['reason'] as String,
        status: json['status'] as String,
      );
}
