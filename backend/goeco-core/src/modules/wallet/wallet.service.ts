import { BadRequestException, Injectable } from '@nestjs/common';

interface TransferInput {
  tenantId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  idempotencyKey: string;
}

interface LedgerEntry {
  accountId: string;
  direction: 'DEBIT' | 'CREDIT';
  amount: number;
}

@Injectable()
export class WalletService {
  async transfer(input: TransferInput): Promise<{ referenceNo: string }> {
    if (input.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const existing = await this.getByIdempotencyKey(input.tenantId, input.idempotencyKey);
    if (existing) {
      return { referenceNo: existing.referenceNo };
    }

    const referenceNo = `WAL-${Date.now()}`;

    await this.withSerializableTx(async () => {
      const fromBalance = await this.getLockedBalance(input.fromAccountId);
      if (fromBalance < input.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const entries: LedgerEntry[] = [
        { accountId: input.fromAccountId, direction: 'DEBIT', amount: input.amount },
        { accountId: input.toAccountId, direction: 'CREDIT', amount: input.amount },
      ];

      await this.postDoubleEntry(referenceNo, entries);
      await this.persistIdempotencyResult(input.tenantId, input.idempotencyKey, { referenceNo });
    });

    return { referenceNo };
  }

  private async withSerializableTx(callback: () => Promise<void>): Promise<void> {
    await callback();
  }

  private async getLockedBalance(accountId: string): Promise<number> {
    void accountId;
    return 1_000_000;
  }

  private async postDoubleEntry(referenceNo: string, entries: LedgerEntry[]): Promise<void> {
    const totalDebit = entries.filter((it) => it.direction === 'DEBIT').reduce((sum, it) => sum + it.amount, 0);
    const totalCredit = entries.filter((it) => it.direction === 'CREDIT').reduce((sum, it) => sum + it.amount, 0);

    if (totalDebit !== totalCredit) {
      throw new BadRequestException('Ledger is unbalanced');
    }

    void referenceNo;
  }

  private async getByIdempotencyKey(tenantId: string, key: string): Promise<{ referenceNo: string } | null> {
    void tenantId;
    void key;
    return null;
  }

  private async persistIdempotencyResult(tenantId: string, key: string, result: { referenceNo: string }): Promise<void> {
    void tenantId;
    void key;
    void result;
  }
}
