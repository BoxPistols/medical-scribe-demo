// 利用可能なOpenAIモデル
export const AVAILABLE_MODELS = [
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', description: '高速・コスト効率' },
  { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', description: '最速・最安' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: '高性能・バランス型' },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', description: '高速・要約向け' },
] as const;

export type ModelId = typeof AVAILABLE_MODELS[number]['id'];

export const DEFAULT_MODEL: ModelId = 'gpt-4.1-mini';

export interface SoapNote {
  summary: string;
  patientInfo: {
    chiefComplaint: string;
    duration: string;
  };
  soap: {
    subjective: {
      presentIllness: string;
      symptoms: string[];
      severity: string;
      onset: string;
      associatedSymptoms: string[];
      pastMedicalHistory: string;
      medications: string[];
    };
    objective: {
      vitalSigns: {
        bloodPressure: string;
        pulse: string;
        temperature: string;
        respiratoryRate: string;
      };
      physicalExam: string;
      laboratoryFindings: string;
    };
    assessment: {
      diagnosis: string;
      icd10: string;
      differentialDiagnosis: string[];
      clinicalImpression: string;
    };
    plan: {
      treatment: string;
      medications: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
      }>;
      tests: string[];
      referral: string;
      followUp: string;
      patientEducation: string;
    };
  };
}
