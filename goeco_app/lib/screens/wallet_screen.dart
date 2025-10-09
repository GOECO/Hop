import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../main.dart';
import '../models/models.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  final _amountController = TextEditingController(text: '50000');
  bool _loading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<GoecoAppState>();
    final WalletSnapshot? wallet = state.wallet;
    return Scaffold(
      appBar: AppBar(title: const Text('GOECO Pay')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              color: Theme.of(context).colorScheme.primaryContainer,
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Số dư hiện tại', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 12),
                    Text(wallet != null ? '${wallet.balance}đ' : '0đ',
                        style: Theme.of(context).textTheme.headlineMedium),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text('Nạp tiền giả lập', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _amountController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Số tiền (đ)'),
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 8),
                      Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                    ],
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      icon: const Icon(Icons.add_card_outlined),
                      onPressed: _loading
                          ? null
                          : () async {
                              setState(() {
                                _loading = true;
                                _error = null;
                              });
                              try {
                                final amount = int.tryParse(_amountController.text) ?? 0;
                                await context.read<GoecoAppState>().topupWallet(amount);
                              } catch (err) {
                                setState(() => _error = err.toString());
                              } finally {
                                if (mounted) {
                                  setState(() {
                                    _loading = false;
                                  });
                                }
                              }
                            },
                      label: const Text('Nạp tiền'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async => context.read<GoecoAppState>().refreshWallet(),
                child: wallet == null || wallet.transactions.isEmpty
                    ? ListView(
                        children: const [
                          SizedBox(height: 40),
                          Center(child: Text('Chưa có giao dịch.')),
                        ],
                      )
                    : ListView.builder(
                        itemCount: wallet.transactions.length,
                        itemBuilder: (context, index) {
                          final tx = wallet.transactions[index];
                          return Card(
                            child: ListTile(
                              leading: Icon(
                                tx.type == 'credit'
                                    ? Icons.arrow_downward_outlined
                                    : Icons.arrow_upward_outlined,
                                color: tx.type == 'credit'
                                    ? Colors.green
                                    : Theme.of(context).colorScheme.error,
                              ),
                              title: Text('${tx.amount}đ'),
                              subtitle: Text('${tx.description}\n${tx.timestamp}'),
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
