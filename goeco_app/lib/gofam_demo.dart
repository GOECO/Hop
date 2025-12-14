import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

class GofamDemoScreen extends StatefulWidget {
  const GofamDemoScreen({super.key});

  @override
  State<GofamDemoScreen> createState() => _GofamDemoScreenState();
}

class _GofamDemoScreenState extends State<GofamDemoScreen> {
  Map<String, double> latest = {};
  bool sending = false;
  late Timer _timer;

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
    final uri = Uri.parse('http://localhost:4000/api/gofam/farms/demo-farm/sensors');
    final res = await http.get(uri);
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      final List<dynamic> readings = data['latest'] as List<dynamic>;
      setState(() {
        latest = {
          for (final entry in readings.take(5))
            entry['metric'] as String: (entry['value'] as num).toDouble()
        };
      });
    }
  }

  Future<void> _sendIrrigate() async {
    setState(() => sending = true);
    final uri = Uri.parse('http://localhost:4000/api/gofam/robots/commands');
    await http.post(uri, body: jsonEncode({
      'asset_id': 'drone-01',
      'action': 'IRRIGATE',
      'volume': '8L/m2',
      'plot_id': 'demo-plot'
    }), headers: {'Content-Type': 'application/json'});
    setState(() => sending = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('GOFAM AI demo')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Realtime vitals', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (latest.isEmpty) const Text('Đang lấy dữ liệu...'),
            Wrap(
              spacing: 8,
              children: latest.entries
                  .map((e) => Chip(label: Text('${e.key}: ${e.value.toStringAsFixed(2)}')))
                  .toList(),
            ),
            const SizedBox(height: 16),
            Text('Cập nhật: ${DateFormat.Hms().format(DateTime.now())}'),
            const Spacer(),
            FilledButton.icon(
              onPressed: sending ? null : _sendIrrigate,
              icon: sending
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.agriculture),
              label: Text(sending ? 'Đang gửi lệnh...' : 'Tưới nhỏ giọt tự động'),
            )
          ],
        ),
      ),
    );
  }
}
