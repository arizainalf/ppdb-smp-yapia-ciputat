import { useState } from 'react';
import { useRegistrationWizardContext } from '../contexts/RegistrationWizardContext.js';
import { calonSiswaService } from '../../infrastructure/api/calonSiswaService.js';
import { CreateCalonSiswaInput } from '@yapia/shared';

export function useRegistrationWizard() {
  const wizard = useRegistrationWizardContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitStep1 = async (data: CreateCalonSiswaInput) => {
    setIsLoading(true);
    setError(null);
    try {
      wizard.updateFormData(data);
      // Simpan draft data ke backend Hono
      await calonSiswaService.register(data);
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
