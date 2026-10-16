import { ICalonSiswaRepository } from '../ports/ICalonSiswaRepository.js';
import { CreateCalonSiswaInputDTO, CreateCalonSiswaOutputDTO } from '../dtos/CreateCalonSiswaDTO.js';
import { CalonSiswa } from '../../domain/entities/CalonSiswa.js';

export class CreateCalonSiswaUseCase {
  constructor(private readonly calonSiswaRepo: ICalonSiswaRepository) {}

  public async execute(input: CreateCalonSiswaInputDTO): Promise<CreateCalonSiswaOutputDTO> {
    // 1. Generate nomor pendaftaran resmi (misal: REG-2026-G1-0004)
    const nomorPendaftaran = await this.calonSiswaRepo.generateNomorPendaftaran(input.gelombangId);

    // 2. Buat ID unik entitas
    const id = crypto.randomUUID();

    // 3. Bersihkan userId dummy (seperti 'temp-user-id') agar tidak memicu pelanggaran foreign key
    const isValidUUID = (str?: string) =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str));

    const sanitizedUserId = isValidUUID(input.userId) ? input.userId : undefined;

    // 4. Instansiasi Domain Entity (termasuk validasi aturan bisnis internal)
    const calonSiswa = new CalonSiswa({
      id,
      userId: sanitizedUserId,
      gelombangId: input.gelombangId,
      nomorPendaftaran,
      namaLengkap: input.namaLengkap,
      email: input.email,
      jenisKelamin: input.jenisKelamin,
      tempatLahir: input.tempatLahir,
      tanggalLahir: input.tanggalLahir,
      agama: input.agama,
      noHpSiswa: input.noHpSiswa,
      statusPendaftaran: 'DRAFT',
      jalurPendaftaran: input.jalurPendaftaran ?? 'REGULER',
      nomorKipSktm: input.nomorKipSktm,
      pdpConsent: input.pdpConsent ?? true,
    });

    // 5. Simpan melalui Repository Port
    await this.calonSiswaRepo.save(calonSiswa);

    // 6. Kembalikan Output DTO
    return {
      id: calonSiswa.id,
      nomorPendaftaran: calonSiswa.nomorPendaftaran,
      namaLengkap: calonSiswa.namaLengkap,
      status: calonSiswa.status,
      createdAt: calonSiswa.toJSON().createdAt!,
    };
  }
}
