import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'models/models.dart';
import 'screens/auth_screen.dart';
import 'screens/dashboard_screen.dart';
import 'services/goeco_api_service.dart';

void main() {
  runApp(const GoecoApp());
}

class GoecoApp extends StatelessWidget {
  const GoecoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => GoecoAppState(),
      child: MaterialApp(
        title: 'GOECO',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
          useMaterial3: true,
        ),
        home: const RootView(),
      ),
    );
  }
}

class RootView extends StatelessWidget {
  const RootView({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<GoecoAppState>();
    if (!state.isAuthenticated) {
      return const AuthScreen();
    }
    return const DashboardScreen();
  }
}

class GoecoAppState extends ChangeNotifier {
  GoecoAppState() : _api = GoecoApiService();

  final GoecoApiService _api;
  String? _token;
  GoecoUser? _user;
  ResidentProfile? _resident;
  List<StoredPackage> _packages = [];
  List<ShipmentOrder> _shipments = [];
  WalletSnapshot? _wallet;
  List<TimelineEvent> _events = [];

  String? phone;
  String? lastOtpCode;

  bool get isAuthenticated => _token != null;
  GoecoUser? get user => _user;
  ResidentProfile? get resident => _resident;
  List<StoredPackage> get packages => _packages;
  List<ShipmentOrder> get shipments => _shipments;
  WalletSnapshot? get wallet => _wallet;
  List<TimelineEvent> get events => _events;
  String? get token => _token;

  Future<void> requestOtp(String phoneNumber) async {
    phone = phoneNumber;
    lastOtpCode = await _api.requestOtp(phoneNumber);
    notifyListeners();
  }

  Future<void> verifyOtp(String code, String name) async {
    if (phone == null) {
      throw Exception('Phone number missing');
    }
    final result = await _api.verifyOtp(phone!, code, name);
    _token = result['token'] as String;
    _user = GoecoUser.fromJson(result['user'] as Map<String, dynamic>);
    await Future.wait([
      refreshPackages(),
      refreshShipments(),
      refreshEvents(),
      refreshWallet(),
    ]);
    notifyListeners();
  }

  Future<void> verifyResident(String buildingId, String unitNumber) async {
    if (_token == null) {
      throw Exception('Not authenticated');
    }
    _resident = await _api.verifyResident(
      token: _token!,
      buildingId: buildingId,
      unitNumber: unitNumber,
    );
    await refreshEvents();
    notifyListeners();
  }

  Future<void> refreshPackages() async {
    _packages = await _api.listPackages();
    notifyListeners();
  }

  Future<void> createPackage({
    required String residentId,
    required String shelfCode,
    String? carrier,
    String? notes,
  }) async {
    if (_token == null) {
      throw Exception('Not authenticated');
    }
    await _api.createPackage(
      token: _token!,
      residentId: residentId,
      shelfCode: shelfCode,
      carrier: carrier,
      notes: notes,
    );
    await refreshPackages();
    await refreshEvents();
  }

  Future<void> markPackagePicked(String id) async {
    if (_token == null) {
      throw Exception('Not authenticated');
    }
    await _api.markPackagePicked(id, _token!);
    await refreshPackages();
    await refreshEvents();
  }

  Future<int> getQuote({
    required double weightKg,
    required String speed,
    required bool insurance,
  }) {
    return _api.getQuote(weightKg: weightKg, speed: speed, insurance: insurance);
  }

  Future<void> createShipment({
    required String origin,
    required String destination,
    required double weightKg,
    required String speed,
    required bool insurance,
    required String paymentMethod,
  }) async {
    if (_token == null) {
      throw Exception('Not authenticated');
    }
    await _api.createShipment(
      token: _token!,
      origin: origin,
      destination: destination,
      weightKg: weightKg,
      speed: speed,
      insurance: insurance,
      paymentMethod: paymentMethod,
    );
    await refreshShipments();
    await refreshWallet();
    await refreshEvents();
  }

  Future<void> refreshShipments() async {
    _shipments = await _api.listShipments();
    notifyListeners();
  }

  Future<void> refreshWallet() async {
    if (_token == null) {
      return;
    }
    _wallet = await _api.fetchWallet(_token!);
    notifyListeners();
  }

  Future<void> topupWallet(int amount) async {
    if (_token == null) {
      throw Exception('Not authenticated');
    }
    _wallet = await _api.topupWallet(_token!, amount);
    await refreshEvents();
    notifyListeners();
  }

  Future<void> refreshEvents() async {
    _events = await _api.listEvents();
    notifyListeners();
  }
}
