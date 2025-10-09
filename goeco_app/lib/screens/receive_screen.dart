import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../main.dart';
import '../models/models.dart';

class ReceiveScreen extends StatefulWidget {
  const ReceiveScreen({super.key});

  @override
  State<ReceiveScreen> createState() => _ReceiveScreenState();
}

class _ReceiveScreenState extends State<ReceiveScreen> {
  final _shelfController = TextEditingController();
  final _carrierController = TextEditingController();
  final _notesController = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<GoecoAppState>();
    final packages = state.packages;
    final resident = state.resident;
    return Scaffold(
      appBar: AppBar(title: const Text('Nhận hộ - Gán kệ')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            if (resident == null)
              Card(
                child: ListTile(
                  leading: const Icon(Icons.info_outline),
                  title: const Text('Cần xác thực cư dân'),
                  subtitle: const Text('Xác thực hồ sơ cư dân để bắt đầu nhận bưu phẩm.'),
                ),
              )
            else
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text('Tạo phiếu nhận hộ', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 12),
                      Text('Cư dân: ${resident.id}'),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _shelfController,
                        decoration: const InputDecoration(labelText: 'Mã kệ'),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _carrierController,
                        decoration: const InputDecoration(labelText: 'Đơn vị vận chuyển (tùy chọn)'),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _notesController,
                        decoration: const InputDecoration(labelText: 'Ghi chú'),
                      ),
                      if (_error != null) ...[
                        const SizedBox(height: 8),
                        Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                      ],
                      const SizedBox(height: 12),
                      FilledButton.icon(
                        icon: const Icon(Icons.inventory_2_outlined),
                        onPressed: _loading
                            ? null
                            : () async {
                                setState(() {
                                  _loading = true;
                                  _error = null;
                                });
                                try {
                                  await state.createPackage(
                                    residentId: resident.id,
                                    shelfCode: _shelfController.text,
                                    carrier: _carrierController.text.isEmpty
                                        ? null
                                        : _carrierController.text,
                                    notes: _notesController.text.isEmpty
                                        ? null
                                        : _notesController.text,
                                  );
                                  _shelfController.clear();
                                  _carrierController.clear();
                                  _notesController.clear();
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
                        label: const Text('Nhập kiện & gán kệ'),
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 16),
            Expanded(
              child: RefreshIndicator(
                onRefresh: state.refreshPackages,
                child: packages.isEmpty
                    ? ListView(
                        children: const [
                          SizedBox(height: 40),
                          Center(child: Text('Chưa có bưu phẩm.')), 
                        ],
                      )
                    : ListView.builder(
                        itemCount: packages.length,
                        itemBuilder: (context, index) {
                          final StoredPackage pkg = packages[index];
                          return Card(
                            child: ListTile(
                              leading: CircleAvatar(child: Text(pkg.shelfCode)),
                              title: Text('Bưu phẩm #${pkg.id}'),
                              subtitle: Text('Kệ: ${pkg.shelfCode} • Trạng thái: ${pkg.status}'),
                              trailing: pkg.status == 'stored'
                                  ? IconButton(
                                      icon: const Icon(Icons.qr_code_scanner),
                                      onPressed: () => _confirmPickup(context, pkg),
                                    )
                                  : Text(pkg.pickedUpAt != null
                                      ? 'Đã lấy ${_formatTime(pkg.pickedUpAt!)}'
                                      : 'Hoàn tất'),
                            ),
                          );
                        },
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmPickup(BuildContext context, StoredPackage pkg) {
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Quét QR mở kệ', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Text('Mã QR: ${pkg.qrCode}'),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () async {
                  await context.read<GoecoAppState>().markPackagePicked(pkg.id);
                  if (context.mounted) Navigator.pop(context);
                },
                child: const Text('Xác nhận đã lấy hàng'),
              ),
            ],
          ),
        );
      },
    );
  }

  String _formatTime(DateTime time) => '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
}
