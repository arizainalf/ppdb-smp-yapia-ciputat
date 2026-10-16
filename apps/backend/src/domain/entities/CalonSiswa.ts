import { StatusPendaftaran, StatusPendaftaranType } from '../value-objects/StatusPendaftaran.js';
import { ValidationError } from '../errors/DomainError.js';

export interface CalonSiswaProps {
  id: string;
  userId?: string;
  gelombangId: number;
  nomorPendaftaran: string;
  namaLengkap: string;
  email?: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  noHpSiswa?: string;
  statusPendaftaran?: StatusPendaftaranType;
  jalurPendaftaran?: 'REGULER' | 'AFIRMASI' | 'PRESTASI';
  nomorKipSktm?: string;
  pdpConsent?: boolean;
  verifikasiFisik?: {
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    notes?: string;
  };
  observasi?: {
    kemampuanQuran?: string;
    catatanPendampingan?: string;
    catatanWawancara?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export class CalonSiswa {
  private props: CalonSiswaProps;
  private _status: StatusPendaftaran;

  constructor(props: CalonSiswaProps) {
    if (!props.namaLengkap || props.namaLengkap.trim().length < 3) {
      throw new ValidationError('Nama lengkap minimal 3 karakter.');
    }
    if (!['L', 'P'].includes(props.jenisKelamin)) {
      throw new ValidationError('Jenis kelamin harus L (Laki-laki) atau P (Perempuan).');
    }

    this.props = {
      ...props,
      statusPendaftaran: props.statusPendaftaran ?? 'DRAFT',
      jalurPendaftaran: props.jalurPendaftaran ?? 'REGULER',
      pdpConsent: props.pdpConsent ?? true,
      createdAt: props.createdAt ?? new Date().toISOString(),
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    };

    this._status = new StatusPendaftaran(this.props.statusPendaftaran!);
  }

  public get id(): string {
    return this.props.id;
  }

  public get userId(): string | undefined {
    return this.props.userId;
  }

  public get gelombangId(): number {
    return this.props.gelombangId;
  }

  public get nomorPendaftaran(): string {
    return this.props.nomorPendaftaran;
  }

  public get namaLengkap(): string {
    return this.props.namaLengkap;
  }

  public get jenisKelamin(): 'L' | 'P' {
    return this.props.jenisKelamin;
  }

  public get status(): StatusPendaftaranType {
    return this._status.getValue();
  }

  public updateStatus(nextStatus: StatusPendaftaranType): void {
    if (!this._status.canTransitionTo(nextStatus)) {
      throw new ValidationError(
        `Transisi status tidak valid dari '${this.status}' ke '${nextStatus}'.`
      );
    }
    this._status = new StatusPendaftaran(nextStatus);
    this.props.statusPendaftaran = nextStatus;
    this.props.updatedAt = new Date().toISOString();
  }

  public toJSON(): CalonSiswaProps {
    return {
      ...this.props,
      statusPendaftaran: this._status.getValue(),
    };
  }
}
