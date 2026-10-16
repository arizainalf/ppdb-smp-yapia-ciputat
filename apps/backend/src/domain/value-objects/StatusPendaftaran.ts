import { ValidationError } from '../errors/DomainError.js';

export type StatusPendaftaranType =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'LOLOS_SELEKSI'
  | 'MENGIKUTI_MPLS'
  | 'DITERIMA_RESMI'
  | 'REVISI'
  | 'REJECTED'
  | 'CADANGAN'
  | 'ACCEPTED';

export class StatusPendaftaran {
  private readonly value: StatusPendaftaranType;

  private static readonly VALID_STATUSES: StatusPendaftaranType[] = [
    'DRAFT',
    'SUBMITTED',
    'VERIFIED',
    'LOLOS_SELEKSI',
    'MENGIKUTI_MPLS',
    'DITERIMA_RESMI',
    'REVISI',
    'REJECTED',
    'CADANGAN',
    'ACCEPTED',
  ];

  constructor(value: StatusPendaftaranType) {
    if (!StatusPendaftaran.VALID_STATUSES.includes(value)) {
      throw new ValidationError(`Status pendaftaran '${value}' tidak valid.`);
    }
    this.value = value;
  }

  public getValue(): StatusPendaftaranType {
    return this.value;
  }

  public canTransitionTo(nextStatus: StatusPendaftaranType): boolean {
    const transitions: Record<StatusPendaftaranType, StatusPendaftaranType[]> = {
      DRAFT: ['SUBMITTED'],
      SUBMITTED: ['VERIFIED', 'REVISI', 'REJECTED'],
      REVISI: ['SUBMITTED'],
      VERIFIED: ['LOLOS_SELEKSI', 'CADANGAN', 'REJECTED', 'ACCEPTED'],
      CADANGAN: ['LOLOS_SELEKSI', 'REJECTED'],
      LOLOS_SELEKSI: ['MENGIKUTI_MPLS', 'REJECTED'],
      MENGIKUTI_MPLS: ['DITERIMA_RESMI', 'REJECTED'],
      DITERIMA_RESMI: [],
      REJECTED: ['SUBMITTED'], // Jika mengajukan banding/perbaikan berkas
      ACCEPTED: ['MENGIKUTI_MPLS', 'DITERIMA_RESMI'],
    };

    return transitions[this.value]?.includes(nextStatus) ?? false;
  }
}
