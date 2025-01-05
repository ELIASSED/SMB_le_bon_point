// components/Carousel/types.ts

export interface Stage {
    id: number;
    numeroStageAnts: string;
    startDate: string;
    endDate: string;
    location: string;
    capacity: number;
    price: number;
  }
  
  export interface PersonalInfo {
    nom: string;
    prenom: string;
    email: string;
    confirmationEmail: string;
    telephone: string;
    adresse: string;
    codePostal: string;
    ville: string;
    // ajoutez d'autres champs selon vos besoins
  }
  
  export interface DrivingLicenseInfo {
    numeroPermis: string;
    dateObtention: string;
    categoriePermis: string;
    // ajoutez d'autres champs selon vos besoins
  }
  