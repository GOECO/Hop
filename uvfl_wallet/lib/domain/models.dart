class ValueRecord {
  const ValueRecord({
    required this.id,
    required this.amount,
    required this.currency,
    required this.status,
  });

  final String id;
  final num amount;
  final String currency;
  final String status;
}
