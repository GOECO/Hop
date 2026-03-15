import { BadRequestException, Injectable } from '@nestjs/common';

export type ParcelStatus =
  | 'CREATED'
  | 'CHECKED_IN'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'DISPUTED'
  | 'CLOSED';

interface ParcelAggregate {
  id: string;
  tenantId: string;
  buildingId: string;
  residentId: string;
  status: ParcelStatus;
  qrCode: string;
  pickupOtpHash: string;
}

@Injectable()
export class DeliveryService {
  async verifyQrAndPickup(parcel: ParcelAggregate, scannedQr: string, otpHash: string): Promise<ParcelAggregate> {
    if (parcel.status !== 'READY_FOR_PICKUP') {
      throw new BadRequestException('Parcel is not ready for pickup');
    }

    if (parcel.qrCode !== scannedQr) {
      throw new BadRequestException('QR verification failed');
    }

    if (parcel.pickupOtpHash !== otpHash) {
      throw new BadRequestException('OTP verification failed');
    }

    const updated = { ...parcel, status: 'PICKED_UP' as const };
    await this.appendEvent(parcel.id, 'parcel.status.changed', {
      from: parcel.status,
      to: updated.status,
      reason: 'QR_OTP_VERIFIED',
    });
    return updated;
  }

  async handleSmartLockerOpenEvent(parcelId: string, lockerId: string, openAt: string): Promise<void> {
    await this.appendEvent(parcelId, 'locker.opened', {
      lockerId,
      openAt,
    });
  }

  async raiseDispute(parcelId: string, reason: string, raisedBy: string): Promise<void> {
    await this.appendEvent(parcelId, 'parcel.dispute.raised', {
      reason,
      raisedBy,
    });
  }

  private async appendEvent(aggregateId: string, type: string, payload: Record<string, unknown>): Promise<void> {
    void aggregateId;
    void type;
    void payload;
  }
}
