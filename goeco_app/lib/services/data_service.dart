import 'dart:async';

import '../models/sensor_data.dart';

class DataService {
  Future<SensorData> fetchRealtimeSensorData(String parcelId) async {
    await Future.delayed(const Duration(seconds: 1));
    final mockJson = {
      'temperature': 29.5,
      'humidity': 68.2,
      'ph': 6.2,
      'co2': 780,
      'timestamp': DateTime.now().toIso8601String(),
    };
    return SensorData.fromJson(mockJson);
  }

  Future<Recommendation> fetchLatestRecommendation(String parcelId) async {
    await Future.delayed(const Duration(milliseconds: 800));
    final mockJson = {
      'action': 'IRRIGATE',
      'method': 'BIO',
      'dosage': '15ml/m2',
      'reason': 'Soil moisture trending down, forecasted heatwave in 2h.',
      'status': 'PENDING',
    };
    return Recommendation.fromJson(mockJson);
  }
}
