// src/components/Carousel/types.ts
export interface Stage {
  id: number;
  numeroStageAnts: string;
  price: number;
  lieu: string;
  description: string;
  startDate: string; // ou Date si vous préférez
  endDate: string;   // ou Date
  location: string;
  capacity: number;
  instructorId: number;
  psychologueId: number;
  instructor: {
    firstName: string;
    lastName: string;
    numeroAutorisationPrefectorale: number;
  };
  psychologue: {
    firstName: string;
    lastName: string;
    numeroAutorisationPrefectorale: number;
  };
}

export interface RegistrationInfo {
  civilite: string;
  nom: string;
  prenom: string;
  prenom1?: string;
  prenom2?: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  email: string;
  confirmationEmail: string;
  nationalite: string;
  dateNaissance: string;
  lieuNaissance?: string;
  codePostalNaissance: string;
  numeroPermis: string;
  dateDelivrancePermis: string;
  prefecture: string;
  etatPermis: string;
  casStage: string;
  infractionDate: string | null;
  infractionTime: string | null;
  infractionPlace: string | null;
  parquetNumber: string | null;
  judgmentDate: string | null;
  id_recto: string | null;
  id_verso: string | null;
  permis_recto: string | null;
  permis_verso: string | null;
  letter_48N: string | null;
  extraDocument: string | null;
  acceptConditions: boolean;
  commitToUpload?: boolean;
}

export interface DrivingLicenseInfo {
  numeroPermis: string;
  dateObtention: string;
  categoriePermis: string;
  // ajoutez d'autres champs selon vos besoins
}

export interface AddressSuggestion {
  properties: {
    name: string;
    postcode: string;
    city: string;
    label: string;
    street?: string;
    context?: string;
  };
}

export interface PersonalInfo {
  civilite: string;
  nom: string;
  prenom: string;
  prenom1?: string;
  prenom2?: string;
  adresse: string;
  codePostal: string;
  ville: string;
  dateNaissance: string;
  codePostalNaissance: string;
  nationalite: string;
  telephone: string;
  email: string;
  confirmationEmail: string;
}

export interface UserFormData {
  civilite: string;
  nom: string;
  prenom: string;
  prenom1: string;
  prenom2: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  email: string;
  confirmationEmail: string;
  nationalite: string;
  dateNaissance: string;
  lieuNaissance: string;
  codePostalNaissance: string;
  numeroPermis: string;
  dateDelivrancePermis: string;
  prefecture: string;
  etatPermis: string;
  casStage: string;
  infractionDate: string | null;
  infractionTime: string | null;
  infractionPlace: string | null;
  parquetNumber: string | null;
  judgmentDate: string | null;
  id_recto: string | null;
  id_verso: string | null;
  permis_recto: string | null;
  permis_verso: string | null;
  letter_48N: string | null;
  extraDocument: string | null;
  commentaire: string | null;
}

export interface PaymentStepProps {
  selectedStage: Stage;
  clientSecret: string;
  sessionId: number; // Add sessionId
  userId: number;
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
  onConfirm: () => Promise<void>;
}
export type FormDataType = any; // Remplacez par le type approprié si nécessaire