import { CalonSiswa } from '../../domain/entities/CalonSiswa.js';

export interface ICalonSiswaRepository {
  findById(id: string): Promise<CalonSiswa | null>;
  findByNomorPendaftaran(nomorPendaftaran: string): Promise<CalonSiswa | null>;
  findAll(): Promise<CalonSiswa[]>;
  save(calonSiswa: CalonSiswa): Promise<void>;
  update(calonSiswa: CalonSiswa): Promise<void>;
  generateNomorPendaftaran(gelombangId: number): Promise<string>;
}
