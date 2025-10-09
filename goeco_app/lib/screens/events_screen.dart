import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../main.dart';
import '../models/models.dart';

class EventsScreen extends StatelessWidget {
  const EventsScreen({super.key, required this.onRefresh});

  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    final events = context.watch<GoecoAppState>().events;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nhật ký & thông báo'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => onRefresh(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: onRefresh,
        child: events.isEmpty
            ? ListView(
                children: const [
                  SizedBox(height: 40),
                  Center(child: Text('Chưa có sự kiện nào.')),
                ],
              )
            : ListView.builder(
                itemCount: events.length,
                itemBuilder: (context, index) {
                  final TimelineEvent event = events[index];
                  return ListTile(
                    leading: const Icon(Icons.notifications_active_outlined),
                    title: Text(event.message),
                    subtitle: Text('${event.type} • ${event.timestamp}'),
                  );
                },
              ),
      ),
    );
  }
}
