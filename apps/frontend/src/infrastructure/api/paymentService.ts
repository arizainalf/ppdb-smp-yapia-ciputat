import { apiClient, ApiResponse } from './apiClient.js';
import { MetodePembayaran, StatusPembayaran } from '@yapia/shared';

export interface PaymentInfo {
  kodeTransaksi: string;
  metode: MetodePembayaran;
  status: StatusPembayaran;
  jumlahBayar: number;
  checkoutUrl?: string | null;
  payCode?: string | null;
  expiredAt?: string | null;
  buktiBayarUrl?: string | null;
  catatan?: string | null;
  tripayReference?: string;
  bank?: { nama: string; nomor: string; atasNama: string };
}

export interface RekeningBank {
  id: string;
  namaBank: string;
  nomorRekening: string;
  atasNama: string;
  isActive: boolean;
}

export const paymentService = {
  async create(nomorPendaftaran: string, metode: MetodePembayaran, rekeningId?: string): Promise<ApiResponse<PaymentInfo>> {
    return apiClient.post<PaymentInfo>('/api/v1/pembayaran/create', { nomorPendaftaran, metode, rekeningId });
  },

  async getStatus(nomorPendaftaran: string): Promise<ApiResponse<PaymentInfo>> {
    return apiClient.get<PaymentInfo>(`/api/v1/pembayaran/status/${encodeURIComponent(nomorPendaftaran)}`);
  },

  async konfirmasiManual(
    nomorPendaftaran: string,
    namaPengirim: string,
    buktiBayarUrl?: string,
    rekeningId?: string
  ): Promise<ApiResponse<PaymentInfo>> {
    return apiClient.post<PaymentInfo>('/api/v1/pembayaran/manual/konfirmasi', {
      nomorPendaftaran,
      namaPengirim,
      buktiBayarUrl: buktiBayarUrl || '',
      rekeningId: rekeningId || '',
    });
  },

  // ---- Master data rekening bank ----
  async listRekening(all = false): Promise<ApiResponse<RekeningBank[]>> {
    return apiClient.get<RekeningBank[]>(`/api/v1/pembayaran/rekening${all ? '?all=1' : ''}`);
  },

  async createRekening(data: Omit<RekeningBank, 'id'>): Promise<ApiResponse<{ id: string }>> {
    return apiClient.post<{ id: string }>('/api/v1/pembayaran/rekening', data);
  },

  async updateRekening(id: string, data: Omit<RekeningBank, 'id'>): Promise<ApiResponse<null>> {
    return apiClient.put<null>(`/api/v1/pembayaran/rekening/${id}`, data);
  },

  async deleteRekening(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/api/v1/pembayaran/rekening/${id}`);
  },
};
