import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../main.dart';

class ResidentScreen extends StatefulWidget {
  const ResidentScreen({super.key, required this.onSwitchTab});

  final void Function(int index) onSwitchTab;

  @override
  State<ResidentScreen> createState() => _ResidentScreenState();
}

class _ResidentScreenState extends State<ResidentScreen> {
  final _buildingController = TextEditingController();
  final _unitController = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<GoecoAppState>();
    final resident = state.resident;
    return Scaffold(
      appBar: AppBar(title: const Text('Hồ sơ cư dân')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: ListTile(
                leading: const CircleAvatar(child: Icon(Icons.person)),
                title: Text(state.user?.name ?? 'Cư dân'),
                subtitle: Text('SĐT: ${state.user?.phone ?? '-'}'),
              ),
            ),
            const SizedBox(height: 16),
            if (resident != null)
              Card(
                child: ListTile(
                  leading: Icon(Icons.verified, color: Theme.of(context).colorScheme.primary),
                  title: Text('${resident.buildingId} • Căn ${resident.unitNumber}'),
                  subtitle: Text('Trạng thái: ${resident.status}'),
                  trailing: TextButton(
                    onPressed: () => widget.onSwitchTab(1),
                    child: const Text('Nhận bưu phẩm'),
                  ),
                ),
              )
            else
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text('Xác thực cư dân', style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _buildingController,
                        decoration: const InputDecoration(labelText: 'Mã tòa nhà'),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _unitController,
                        decoration: const InputDecoration(labelText: 'Căn hộ'),
                      ),
                      if (_error != null) ...[
                        const SizedBox(height: 8),
                        Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                      ],
                      const SizedBox(height: 12),
                      FilledButton.icon(
                        icon: const Icon(Icons.verified_outlined),
                        onPressed: _loading
                            ? null
                            : () async {
                                setState(() {
                                  _error = null;
                                  _loading = true;
                                });
                                try {
                                  await context.read<GoecoAppState>().verifyResident(
                                        _buildingController.text,
                                        _unitController.text,
                                      );
                                } catch (err) {
                                  setState(() {
                                    _error = err.toString();
                                  });
                                } finally {
                                  if (mounted) {
                                    setState(() {
                                      _loading = false;
                                    });
                                  }
                                }
                              },
                        label: const Text('Xác thực'),
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
