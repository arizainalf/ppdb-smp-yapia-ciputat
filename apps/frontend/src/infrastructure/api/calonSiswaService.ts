import { apiClient, ApiResponse } from './apiClient.js';
import { CalonSiswaModel } from '../../domain/models/CalonSiswaModel.js';
import { CreateCalonSiswaInput } from '@yapia/shared';

export const calonSiswaService = {
  async register(data: CreateCalonSiswaInput): Promise<ApiResponse<CalonSiswaModel>> {
    return apiClient.post<CalonSiswaModel>('/api/v1/calon-siswa', data);
  },

  async getDetail(id: string): Promise<ApiResponse<CalonSiswaModel>> {
    return apiClient.get<CalonSiswaModel>(`/api/v1/calon-siswa/${id}`);
  },
};
