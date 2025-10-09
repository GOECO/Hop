import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/models.dart';

class GoecoApiService {
  GoecoApiService({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        _baseUrl = baseUrl ?? 'http://localhost:4000';

  final http.Client _client;
  final String _baseUrl;

  Future<String> requestOtp(String phone) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/api/auth/request-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone}),
    );
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) {
      throw Exception(data['error']);
    }
    return data['code'] as String;
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String code, String name) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/api/auth/verify-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone, 'code': code, 'name': name}),
    );
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) {
      throw Exception(data['error']);
    }
    return data;
  }

  Future<ResidentProfile> verifyResident({
    required String token,
    required String buildingId,
    required String unitNumber,
  }) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/api/residents/verify'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': token,
        'buildingId': buildingId,
        'unitNumber': unitNumber,
      }),
    );
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) {
      throw Exception(data['error']);
    }
    return ResidentProfile.fromJson(data['resident'] as Map<String, dynamic>);
  }

  Future<List<StoredPackage>> listPackages() async {
    final response = await _client.get(Uri.parse('$_baseUrl/api/packages'));
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return (data['packages'] as List<dynamic>)
        .map((item) => StoredPackage.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<StoredPackage> createPackage({
    required String token,
    required String residentId,
    required String shelfCode,
    String? carrier,
    String? notes,
  }) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/api/packages'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': token,
        'residentId': residentId,
        'shelfCode': shelfCode,
        'carrier': carrier,
        'notes': notes,
      }),
    );
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 201) {
      throw Exception(data['error']);
    }
    return StoredPackage.fromJson(data['package'] as Map<String, dynamic>);
  }

  Future<void> markPackagePicked(String id, String token) async {
    final response = await _client.patch(
      Uri.parse('$_baseUrl/api/packages/$id/pickup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'token': token}),
    );
    if (response.statusCode != 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(data['error']);
    }
  }

  Future<int> getQuote({
    required double weightKg,
    required String speed,
    required bool insurance,
  }) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/api/shipments/quote'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'weightKg': weightKg,
        'speed': speed,
        'insurance': insurance,
      }),
    );
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return data['amount'] as int;
  }

  Future<ShipmentOrder> createShipment({
    required String token,
    required String origin,
    required String destination,
    required double weightKg,
    required String speed,
    required bool insurance,
    required String paymentMethod,
  }) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/api/shipments'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': token,
        'origin': origin,
        'destination': destination,
        'weightKg': weightKg,
        'speed': speed,
        'insurance': insurance,
        'paymentMethod': paymentMethod,
      }),
    );
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 201) {
      throw Exception(data['error']);
    }
    return ShipmentOrder.fromJson(data['shipment'] as Map<String, dynamic>);
  }

  Future<List<ShipmentOrder>> listShipments() async {
    final response = await _client.get(Uri.parse('$_baseUrl/api/shipments'));
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return (data['shipments'] as List<dynamic>)
        .map((item) => ShipmentOrder.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<WalletSnapshot> fetchWallet(String token) async {
    final response = await _client.get(
      Uri.parse('$_baseUrl/api/wallet?token=$token'),
    );
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) {
      throw Exception(data['error']);
    }
    return WalletSnapshot.fromJson(data);
  }

  Future<WalletSnapshot> topupWallet(String token, int amount) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/api/wallet/topup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'token': token, 'amount': amount}),
    );
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode != 200) {
      throw Exception(data['error']);
    }
    return WalletSnapshot.fromJson(data['wallet'] as Map<String, dynamic>);
  }

  Future<List<TimelineEvent>> listEvents() async {
    final response = await _client.get(Uri.parse('$_baseUrl/api/events'));
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return (data['events'] as List<dynamic>)
        .map((item) => TimelineEvent.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
