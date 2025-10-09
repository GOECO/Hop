import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../main.dart';
import 'events_screen.dart';
import 'receive_screen.dart';
import 'resident_screen.dart';
import 'send_screen.dart';
import 'wallet_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final tabs = [
      ResidentScreen(onSwitchTab: _switchTo),
      const ReceiveScreen(),
      const SendScreen(),
      const WalletScreen(),
      EventsScreen(onRefresh: () => context.read<GoecoAppState>().refreshEvents()),
    ];
    final destinations = const [
      NavigationDestination(icon: Icon(Icons.badge_outlined), label: 'Cư dân'),
      NavigationDestination(icon: Icon(Icons.inventory_2_outlined), label: 'Nhận hộ'),
      NavigationDestination(icon: Icon(Icons.local_shipping_outlined), label: 'Gửi hàng'),
      NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), label: 'GOECO Pay'),
      NavigationDestination(icon: Icon(Icons.notifications_none), label: 'Nhật ký'),
    ];
    return Scaffold(
      body: SafeArea(
        child: IndexedStack(
          index: _index,
          children: tabs,
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) {
          setState(() {
            _index = value;
          });
        },
        destinations: destinations,
      ),
    );
  }

  void _switchTo(int value) {
    setState(() {
      _index = value;
    });
  }
}
