export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  diseases: string[];
  allergies: string[];
  bloodGroup: string;
  emergencyContact: string;
  medications: string[];
  smokingStatus: 'never' | 'former' | 'current';
  alcoholConsumption: 'never' | 'occasional' | 'regular';
  exerciseFrequency: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietaryPreferences: string[];
  familyHistory: string[];
  occupation: string;
  createdAt: Date;
  profileCompleted: boolean;
}

export interface HealthVital {
  id: string;
  userId: string;
  date: Date;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  oxygenSaturation: number;
  bloodSugar: number;
  temperature: number;
  weight: number;
  notes?: string;
}

export interface SymptomAnalysis {
  id: string;
  userId: string;
  symptoms: string;
  duration: string;
  severity: string;
  additionalInfo: string;
  diagnosis: string[];
  recommendation: string;
  urgency: 'low' | 'medium' | 'high';
  detailedAnalysis: string;
  riskFactors: string[];
  followUpActions: string[];
  timestamp: Date;
}

export interface MedicalReport {
  id: string;
  userId: string;
  fileName: string;
  reportType: string;
  extractedData: Record<string, any>;
  analysis: string;
  uploadDate: Date;
}

export interface DietPlan {
  id: string;
  userId: string;
  targetCalories: number;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string[];
  };
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  message: string;
  isBot: boolean;
  timestamp: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  isLoading: boolean;
}