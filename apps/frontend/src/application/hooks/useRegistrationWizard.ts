import { useState } from 'react';
import { useRegistrationWizardContext } from '../contexts/RegistrationWizardContext.js';
import { CreateCalonSiswaInput } from '@yapia/shared';
import type { RegistrationFormData } from '../../domain/models/CalonSiswaModel.js';

export function useRegistrationWizard() {
  const wizard = useRegistrationWizardContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitStep1 = (data: CreateCalonSiswaInput) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simpan data ke context form wizard tanpa request draft ke backend.
      // Tipe "tinggalBersama" pada skema zod berupa string bebas, sedangkan
      // model form memakai union pilihan — nilai valid dikontrol oleh form.
      wizard.updateFormData(data as Partial<RegistrationFormData>);
      wizard.nextStep();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data calon siswa');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...wizard,
    isLoading,
    error,
    submitStep1,
  };
}
