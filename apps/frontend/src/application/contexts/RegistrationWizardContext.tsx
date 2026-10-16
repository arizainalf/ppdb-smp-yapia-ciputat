import React, { createContext, useContext, useState } from 'react';
import { RegistrationFormData } from '../../domain/models/CalonSiswaModel.js';

interface WizardContextType {
  currentStep: number;
  formData: Partial<RegistrationFormData>;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<RegistrationFormData>) => void;
}

const RegistrationWizardContext = createContext<WizardContextType | undefined>(undefined);

export const RegistrationWizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({
    gelombangId: 1,
    jalurPendaftaran: 'REGULER',
    pdpConsent: true,
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const setStep = (step: number) => setCurrentStep(step);

  const updateFormData = (data: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <RegistrationWizardContext.Provider
      value={{
        currentStep,
        formData,
        setStep,
        nextStep,
        prevStep,
        updateFormData,
      }}
    >
      {children}
    </RegistrationWizardContext.Provider>
  );
};

export function useRegistrationWizardContext(): WizardContextType {
  const ctx = useContext(RegistrationWizardContext);
  if (!ctx) {
    throw new Error('useRegistrationWizardContext must be used within RegistrationWizardProvider');
  }
  return ctx;
}
