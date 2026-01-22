class AuditHasher {
  const AuditHasher();

  String buildHash({
    required String prevHash,
    required String action,
    required String actorId,
    required String payloadJson,
    required String isoTime,
  }) {
    return '$prevHash|$action|$actorId|$payloadJson|$isoTime';
  }
}
