enum RecordStatus {
  draft,
  pendingValidation,
  validated,
  disputed,
  distributed,
}

class UvflStateMachine {
  const UvflStateMachine();

  bool canValidate(RecordStatus status) =>
      status == RecordStatus.pendingValidation;

  bool canDistribute(RecordStatus status) =>
      status == RecordStatus.validated;

  RecordStatus onCreated() => RecordStatus.pendingValidation;

  RecordStatus onValidationApproved() => RecordStatus.validated;

  RecordStatus onValidationDisputed() => RecordStatus.disputed;

  RecordStatus onDistributed() => RecordStatus.distributed;
}
