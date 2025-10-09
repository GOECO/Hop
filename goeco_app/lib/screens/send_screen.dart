import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../main.dart';
import '../models/models.dart';

class SendScreen extends StatefulWidget {
  const SendScreen({super.key});

  @override
  State<SendScreen> createState() => _SendScreenState();
}

class _SendScreenState extends State<SendScreen> {
  final _originController = TextEditingController();
  final _destinationController = TextEditingController();
  final _weightController = TextEditingController(text: '1.0');
  bool _express = false;
  bool _insurance = false;
  String _payment = 'wallet';
  int? _quote;
  bool _loading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<GoecoAppState>();
    final shipments = state.shipments;
    final resident = state.resident;
    return Scaffold(
      appBar: AppBar(title: const Text('Gửi hàng - GOECO Logistics')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            if (resident == null)
              Card(
                child: ListTile(
                  leading: const Icon(Icons.house_outlined),
                  title: const Text('Cần xác thực cư dân'),
                  subtitle: const Text('Xác thực hồ sơ để lên đơn gửi hàng.'),
                ),
              )
            else
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text('Tạo đơn gửi', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _originController,
                        decoration: const InputDecoration(labelText: 'Điểm gửi'),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _destinationController,
                        decoration: const InputDecoration(labelText: 'Điểm nhận'),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _weightController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: const InputDecoration(labelText: 'Khối lượng (kg)'),
                      ),
                      SwitchListTile(
                        value: _express,
                        onChanged: (value) => setState(() => _express = value),
                        title: const Text('Giao hỏa tốc'),
                      ),
                      SwitchListTile(
                        value: _insurance,
                        onChanged: (value) => setState(() => _insurance = value),
                        title: const Text('Bảo hiểm hàng hóa'),
                      ),
                      DropdownButtonFormField<String>(
                        value: _payment,
                        items: const [
                          DropdownMenuItem(value: 'wallet', child: Text('Thanh toán ví GOECO Pay')),
                          DropdownMenuItem(value: 'cod', child: Text('Thu hộ (COD)')),
                        ],
                        onChanged: (value) => setState(() => _payment = value ?? 'wallet'),
                        decoration: const InputDecoration(labelText: 'Phương thức thanh toán'),
                      ),
                      if (_error != null) ...[
                        const SizedBox(height: 8),
                        Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                      ],
                      const SizedBox(height: 12),
                      Wrap(
                        alignment: WrapAlignment.spaceBetween,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Text(_quote != null ? 'Báo giá: ${_quote}đ' : 'Chưa báo giá'),
                          FilledButton(
                            onPressed: _loading
                                ? null
                                : () async {
                                    setState(() {
                                      _error = null;
                                      _loading = true;
                                    });
                                    try {
                                      final weight = double.tryParse(_weightController.text) ?? 1.0;
                                      final amount = await state.getQuote(
                                        weightKg: weight,
                                        speed: _express ? 'express' : 'standard',
                                        insurance: _insurance,
                                      );
                                      setState(() => _quote = amount);
                                    } catch (err) {
                                      setState(() => _error = err.toString());
                                    } finally {
                                      setState(() => _loading = false);
                                    }
                                  },
                            child: const Text('Báo giá'),
                          ),
                          FilledButton.icon(
                            icon: const Icon(Icons.send_outlined),
                            onPressed: _loading
                                ? null
                                : () async {
                                    setState(() {
                                      _error = null;
                                      _loading = true;
                                    });
                                    try {
                                      final weight = double.tryParse(_weightController.text) ?? 1.0;
                                      await state.createShipment(
                                        origin: _originController.text,
                                        destination: _destinationController.text,
                                        weightKg: weight,
                                        speed: _express ? 'express' : 'standard',
                                        insurance: _insurance,
                                        paymentMethod: _payment,
                                      );
                                      _quote = null;
                                    } catch (err) {
                                      setState(() => _error = err.toString());
                                    } finally {
                                      setState(() => _loading = false);
                                    }
                                  },
                            label: const Text('Tạo đơn'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 16),
            Expanded(
              child: RefreshIndicator(
                onRefresh: state.refreshShipments,
                child: shipments.isEmpty
                    ? ListView(
                        children: const [
                          SizedBox(height: 40),
                          Center(child: Text('Chưa có đơn gửi hàng.')),
                        ],
                      )
                    : ListView.builder(
                        itemCount: shipments.length,
                        itemBuilder: (context, index) {
                          final ShipmentOrder order = shipments[index];
                          return Card(
                            child: ListTile(
                              leading: const Icon(Icons.local_shipping_outlined),
                              title: Text('Đơn #${order.id} • ${order.amount}đ'),
                              subtitle: Text('${order.origin} → ${order.destination}\nTrạng thái: ${order.status}'),
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
}
