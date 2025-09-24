// Base student interface extending from User types
export interface Student {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  rg?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  birthDate?: string;
  phone?: string;
  level?: string;
  diaVencimento?: string;
  ContratosAssinados?: ContractStatus;
}

// Legacy alias for backward compatibility
export interface Aluno extends Student {}
export interface ContractLog {
  // Student signature data
  cpf: string;
  name: string;
  birthDate: string; // YYYY-MM-DD format
  ip: string;
  browser: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;

  // Signature metadata
  viewedAt: string; // ISO String Date
  signedAt: string; // ISO String Date
  agreedToTerms: boolean;
  logID?: string; // Firestore document ID

  // Admin signature data
  adminSigned?: boolean;
  adminCPF?: string;
  adminName?: string;
  adminIP?: string;
  adminBrowser?: string;
  adminSignedAt?: string; // ISO String Date

  // Contract validation
  isValid?: boolean;
  expiresAt?: string; // ISO String Date (6 months from signature)
  contractVersion?: string;
}

// Contract status stored in user document
export interface ContractStatus {
  signed: boolean; // Student signed
  signedByAdmin: boolean; // Admin signed
  logId?: string; // Reference to log document
  signedAt?: string; // ISO String Date
  adminSignedAt?: string; // ISO String Date
  isValid?: boolean; // Contract validity status
  expiresAt?: string; // Contract expiration date
  contractVersion?: string; // Contract version for tracking changes
}

// Extended student interface for admin operations
export interface StudentWithContractStatus extends Student {
  contractStatus?: ContractStatus;
  isSigning?: boolean; // UI loading state
  lastUpdated?: string;
  isActive?: boolean;
}

// Form data structure for contract signature
export interface SignatureFormData {
  cpf: string;
  name: string;
  birthDate: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  ip?: string; // Auto-filled
  browser?: string; // Auto-filled
  agreedToTerms: boolean;
}

// Contract validation errors
export interface ContractValidationError {
  field: string;
  message: string;
  code: string;
}

// Contract operation response
export interface ContractOperationResponse {
  success: boolean;
  message: string;
  data?: ContractStatus;
  errors?: ContractValidationError[];
}

// Contract notification data
export interface ContractNotification {
  userId: string;
  showNotification: boolean;
  contractStatus: ContractStatus;
  lastChecked: string;
}

// API request/response types
export interface CreateContractRequest {
  studentId: string;
  signatureData: SignatureFormData;
}

export interface ValidateContractRequest {
  studentId: string;
  contractId?: string;
}

export interface AdminSignContractRequest {
  studentId: string;
  contractId: string;
  adminData: {
    name: string;
    cpf: string;
    ip?: string;
    browser?: string;
  };
}
