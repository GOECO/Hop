import 'dart:async';

import 'package:flutter/material.dart';

import '../models/sensor_data.dart';
import '../services/data_service.dart';

class ParcelDashboardScreen extends StatefulWidget {
  const ParcelDashboardScreen({super.key, required this.parcelId});

  final String parcelId;

  @override
  State<ParcelDashboardScreen> createState() => _ParcelDashboardScreenState();
}

class _ParcelDashboardScreenState extends State<ParcelDashboardScreen> {
  final DataService _dataService = DataService();
  SensorData? _sensorData;
  Recommendation? _recommendation;
  Timer? _timer;
  bool _executingAction = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
    _timer = Timer.periodic(const Duration(seconds: 5), (_) => _refreshSensor());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    await Future.wait([
      _refreshSensor(),
      _fetchRecommendation(),
    ]);
  }

  Future<void> _refreshSensor() async {
    try {
      final data = await _dataService.fetchRealtimeSensorData(widget.parcelId);
      if (mounted) {
        setState(() {
          _sensorData = data;
          _errorMessage = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Không thể tải dữ liệu cảm biến: $e';
        });
      }
    }
  }

  Future<void> _fetchRecommendation() async {
    try {
      final rec = await _dataService.fetchLatestRecommendation(widget.parcelId);
      if (mounted) {
        setState(() {
          _recommendation = rec;
          _errorMessage = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Không thể tải khuyến nghị: $e';
        });
      }
    }
  }

  Future<void> _executeAction() async {
    if (_recommendation == null) return;
    setState(() {
      _executingAction = true;
    });
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) {
      setState(() {
        _recommendation = Recommendation(
          action: _recommendation!.action,
          method: _recommendation!.method,
          dosage: _recommendation!.dosage,
          reason: _recommendation!.reason,
          status: 'EXECUTED',
        );
        _executingAction = false;
      });
    }
  }

  Color _metricColor({
    required double value,
    double? min,
    double? max,
  }) {
    if ((min != null && value < min) || (max != null && value > max)) {
      return Colors.red; // ngoài ngưỡng an toàn
    }
    if (max != null && value > (max - 1)) {
      return Colors.orange;
    }
    return Colors.green;
  }

  Widget _buildSensorCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: Theme.of(context).textTheme.titleSmall),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: Theme.of(context)
                      .textTheme
                      .headlineSmall
                      ?.copyWith(color: color, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final sensor = _sensorData;
    final recommendation = _recommendation;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Parcel Dashboard'),
      ),
      body: RefreshIndicator(
        onRefresh: _loadInitialData,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              'Lô: ${widget.parcelId}',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            if (_errorMessage != null)
              Card(
                color: Theme.of(context).colorScheme.errorContainer,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    _errorMessage!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onErrorContainer,
                    ),
                  ),
                ),
              ),
            Text(
              'Cảm biến (real-time)',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            if (sensor == null)
              const Center(child: CircularProgressIndicator())
            else
              Column(
                children: [
                  _buildSensorCard(
                    icon: Icons.thermostat,
                    label: 'Nhiệt độ',
                    value: '${sensor.temperature.toStringAsFixed(1)}°C',
                    color: _metricColor(value: sensor.temperature, max: 30, min: 18),
                  ),
                  _buildSensorCard(
                    icon: Icons.water_drop,
                    label: 'Độ ẩm',
                    value: '${sensor.humidity.toStringAsFixed(1)}%',
                    color: _metricColor(value: sensor.humidity, min: 40, max: 80),
                  ),
                  _buildSensorCard(
                    icon: Icons.science,
                    label: 'Độ pH',
                    value: sensor.ph.toStringAsFixed(1),
                    color: _metricColor(value: sensor.ph, min: 5.5, max: 7.5),
                  ),
                  _buildSensorCard(
                    icon: Icons.co2,
                    label: 'CO₂',
                    value: '${sensor.co2} ppm',
                    color: _metricColor(value: sensor.co2.toDouble(), max: 1000),
                  ),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Text(
                      'Cập nhật: ${sensor.timestamp}',
                      style: Theme.of(context)
                          .textTheme
                          .bodySmall
                          ?.copyWith(color: Colors.grey[600]),
                    ),
                  ),
                ],
              ),
            const SizedBox(height: 16),
            Text(
              'Khuyến nghị AI',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            if (recommendation == null)
              const Center(child: CircularProgressIndicator())
            else
              Card(
                color: recommendation.status == 'PENDING'
                    ? Colors.yellow.shade100
                    : Colors.green.shade100,
                elevation: 3,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.assistant,
                            color: recommendation.status == 'PENDING'
                                ? Colors.orange
                                : Colors.green,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            recommendation.action,
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const Spacer(),
                          Chip(
                            label: Text(recommendation.status),
                            backgroundColor: recommendation.status == 'PENDING'
                                ? Colors.orange.shade200
                                : Colors.green.shade200,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Phương pháp: ${recommendation.method}'),
                      Text('Liều lượng: ${recommendation.dosage}'),
                      const SizedBox(height: 8),
                      Text(
                        recommendation.reason,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        onPressed: recommendation.status == 'EXECUTED'
                            ? null
                            : (_executingAction ? null : _executeAction),
                        icon: _executingAction
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.play_arrow),
                        label: Text(
                          recommendation.status == 'EXECUTED'
                              ? 'Đã thực thi'
                              : 'Execute Action',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
