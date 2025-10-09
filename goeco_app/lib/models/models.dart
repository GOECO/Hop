class GoecoUser {
  GoecoUser({required this.id, required this.phone, required this.name});

  final String id;
  final String phone;
  final String name;

  factory GoecoUser.fromJson(Map<String, dynamic> json) => GoecoUser(
        id: json['id'] as String,
        phone: json['phone'] as String,
        name: json['name'] as String,
      );
}

class ResidentProfile {
  ResidentProfile({
    required this.id,
    required this.buildingId,
    required this.unitNumber,
    required this.status,
    required this.verifiedAt,
  });

  final String id;
  final String buildingId;
  final String unitNumber;
  final String status;
  final DateTime verifiedAt;

  factory ResidentProfile.fromJson(Map<String, dynamic> json) => ResidentProfile(
        id: json['id'] as String,
        buildingId: json['buildingId'] as String,
        unitNumber: json['unitNumber'] as String,
        status: json['status'] as String,
        verifiedAt: DateTime.parse(json['verifiedAt'] as String),
      );
}

class StoredPackage {
  StoredPackage({
    required this.id,
    required this.residentId,
    required this.shelfCode,
    required this.status,
    required this.qrCode,
    required this.createdAt,
    this.carrier,
    this.notes,
    this.pickedUpAt,
  });

  final String id;
  final String residentId;
  final String shelfCode;
  final String status;
  final String qrCode;
  final DateTime createdAt;
  final String? carrier;
  final String? notes;
  final DateTime? pickedUpAt;

  factory StoredPackage.fromJson(Map<String, dynamic> json) => StoredPackage(
        id: json['id'] as String,
        residentId: json['residentId'] as String,
        shelfCode: json['shelfCode'] as String,
        status: json['status'] as String,
        qrCode: json['qrCode'] as String,
        createdAt: DateTime.parse(json['createdAt'] as String),
        carrier: json['carrier'] as String?,
        notes: json['notes'] as String?,
        pickedUpAt: json['pickedUpAt'] != null
            ? DateTime.parse(json['pickedUpAt'] as String)
            : null,
      );
}

class ShipmentOrder {
  ShipmentOrder({
    required this.id,
    required this.origin,
    required this.destination,
    required this.amount,
    required this.status,
    required this.createdAt,
    required this.speed,
    required this.weightKg,
    required this.insurance,
  });

  final String id;
  final String origin;
  final String destination;
  final int amount;
  final String status;
  final DateTime createdAt;
  final String speed;
  final double weightKg;
  final bool insurance;

  factory ShipmentOrder.fromJson(Map<String, dynamic> json) => ShipmentOrder(
        id: json['id'] as String,
        origin: json['origin'] as String,
        destination: json['destination'] as String,
        amount: json['amount'] as int,
        status: json['status'] as String,
        createdAt: DateTime.parse(json['createdAt'] as String),
        speed: json['speed'] as String,
        weightKg: (json['weightKg'] as num).toDouble(),
        insurance: json['insurance'] as bool,
      );
}

class WalletSnapshot {
  WalletSnapshot({required this.balance, required this.transactions});

  final int balance;
  final List<WalletTransaction> transactions;

  factory WalletSnapshot.fromJson(Map<String, dynamic> json) => WalletSnapshot(
        balance: json['balance'] as int,
        transactions: (json['transactions'] as List<dynamic>)
            .map((item) => WalletTransaction.fromJson(item as Map<String, dynamic>))
            .toList(),
      );
}

class WalletTransaction {
  WalletTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.description,
    required this.timestamp,
  });

  final String id;
  final String type;
  final int amount;
  final String description;
  final DateTime timestamp;

  factory WalletTransaction.fromJson(Map<String, dynamic> json) => WalletTransaction(
        id: json['id'] as String,
        type: json['type'] as String,
        amount: json['amount'] as int,
        description: json['description'] as String,
        timestamp: DateTime.parse(json['timestamp'] as String),
      );
}

class TimelineEvent {
  TimelineEvent({
    required this.id,
    required this.type,
    required this.message,
    required this.timestamp,
  });

  final int id;
  final String type;
  final String message;
  final DateTime timestamp;

  factory TimelineEvent.fromJson(Map<String, dynamic> json) => TimelineEvent(
        id: json['id'] as int,
        type: json['type'] as String,
        message: json['message'] as String,
        timestamp: DateTime.parse(json['timestamp'] as String),
      );
}
