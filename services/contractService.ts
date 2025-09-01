import { contractRepository } from '@/repositories/contractRepository';
import { userRepository } from '@/repositories/userRepository';
import { 
  ContractLog,
  ContractStatus,
  SignatureFormData,
  ContractOperationResponse,
  CreateContractRequest,
  ValidateContractRequest,
  AdminSignContractRequest,
  Student,
  ContractValidationError
} from '@/components/contract/contrato-types';

export class ContractService {
  private readonly ADMIN_DATA = {
    name: 'Matheus de Souza Fernandes',
    cpf: '70625181158',
    birthDate: '1999-10-02'
  };

  /**
   * Get contract status and data for a student
   */
  async getStudentContract(userId: string): Promise<{
    student: Student | null;
    contractStatus: ContractStatus | null;
    contractLog: ContractLog | null;
  }> {
    try {
      // Get student data
      const userData = await userRepository.findById(userId);
      if (!userData) {
        throw new Error('Student not found');
      }
      const student = userData as Student;

      // Get contract status
      const contractStatus = await contractRepository.getContractStatus(userId);
      
      // Get contract log if exists
      let contractLog: ContractLog | null = null;
      if (contractStatus?.logId) {
        contractLog = await contractRepository.getContractLog(userId, contractStatus.logId);
      }

      // Check contract validity
      if (contractStatus && contractStatus.signed && contractStatus.signedAt) {
        const isValid = this.isContractValid(contractStatus.signedAt);
        if (!isValid && contractStatus.isValid !== false) {
          // Contract is expired, invalidate it
          await this.invalidateExpiredContract(userId);
          return {
            student,
            contractStatus: {
              signed: false,
              signedByAdmin: false,
              isValid: false
            },
            contractLog: null
          };
        }
      }

      return { student, contractStatus, contractLog };
    } catch (error) {
      console.error('Error getting student contract:', error);
      throw error;
    }
  }

  /**
   * Create and sign a contract
   */
  async createContract(request: CreateContractRequest): Promise<ContractOperationResponse> {
    try {
      const { studentId, signatureData } = request;

      // Validate signature data
      const validationErrors = this.validateSignatureData(signatureData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Dados de assinatura inválidos',
          errors: validationErrors
        };
      }

      // Check if student already has a valid contract
      const existingStatus = await contractRepository.getContractStatus(studentId);
      if (existingStatus?.signed && existingStatus?.signedByAdmin && this.isContractValid(existingStatus.signedAt)) {
        return {
          success: false,
          message: 'Contrato já assinado e válido'
        };
      }

      // Get client IP and browser info
      const clientInfo = await this.getClientInfo();

      // Prepare contract log data
      const contractLogData: Omit<ContractLog, 'logID'> = {
        name: signatureData.name,
        cpf: signatureData.cpf,
        birthDate: signatureData.birthDate,
        address: signatureData.address,
        city: signatureData.city,
        state: signatureData.state,
        zipCode: signatureData.zipCode,
        ip: signatureData.ip || clientInfo.ip,
        browser: signatureData.browser || clientInfo.browser,
        viewedAt: new Date().toISOString(),
        signedAt: new Date().toISOString(),
        agreedToTerms: signatureData.agreedToTerms,
        // Auto-sign as admin
        adminSigned: true,
        adminName: this.ADMIN_DATA.name,
        adminCPF: this.ADMIN_DATA.cpf,
        adminIP: clientInfo.ip,
        adminBrowser: clientInfo.browser,
        adminSignedAt: new Date().toISOString()
      };

      // Create contract log
      const logId = await contractRepository.createContractLog(studentId, contractLogData);

      // Update contract status
      const contractStatus: ContractStatus = {
        signed: true,
        signedByAdmin: true,
        logId,
        signedAt: contractLogData.signedAt,
        adminSignedAt: contractLogData.adminSignedAt,
        isValid: true,
        expiresAt: this.calculateExpirationDate(contractLogData.signedAt),
        contractVersion: '1.0'
      };

      await contractRepository.updateContractStatus(studentId, contractStatus);

      return {
        success: true,
        message: 'Contrato assinado com sucesso',
        data: contractStatus
      };
    } catch (error) {
      console.error('Error creating contract:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Validate contract status
   */
  async validateContract(request: ValidateContractRequest): Promise<ContractOperationResponse> {
    try {
      const { studentId, contractId } = request;

      const contractStatus = await contractRepository.getContractStatus(studentId);
      
      if (!contractStatus) {
        return {
          success: false,
          message: 'Contrato não encontrado'
        };
      }

      const isValid = this.isContractValid(contractStatus.signedAt);
      
      if (!isValid) {
        await this.invalidateExpiredContract(studentId);
        return {
          success: false,
          message: 'Contrato expirado'
        };
      }

      return {
        success: true,
        message: 'Contrato válido',
        data: contractStatus
      };
    } catch (error) {
      console.error('Error validating contract:', error);
      return {
        success: false,
        message: 'Erro ao validar contrato'
      };
    }
  }

  /**
   * Admin sign contract (if needed separately)
   */
  async adminSignContract(request: AdminSignContractRequest): Promise<ContractOperationResponse> {
    try {
      const { studentId, contractId, adminData } = request;

      await contractRepository.signContractAsAdmin(studentId, contractId, adminData);

      const updatedStatus = await contractRepository.getContractStatus(studentId);

      return {
        success: true,
        message: 'Contrato assinado pelo administrador',
        data: updatedStatus || undefined
      };
    } catch (error) {
      console.error('Error admin signing contract:', error);
      return {
        success: false,
        message: 'Erro ao assinar contrato como administrador'
      };
    }
  }

  /**
   * Get all contracts for admin view
   */
  async getAllContracts(): Promise<{
    signed: any[];
    pending: any[];
    expired: any[];
  }> {
    try {
      // This would need a more comprehensive implementation
      // For now, return empty arrays
      return {
        signed: [],
        pending: [],
        expired: []
      };
    } catch (error) {
      console.error('Error getting all contracts:', error);
      throw error;
    }
  }

  /**
   * Invalidate expired contract
   */
  private async invalidateExpiredContract(userId: string): Promise<void> {
    try {
      await contractRepository.invalidateContract(userId);
      console.log('Contract expired and invalidated for user:', userId);
    } catch (error) {
      console.error('Error invalidating expired contract:', error);
      throw error;
    }
  }

  /**
   * Update user contract length in user document
   */
  async updateUserContractLength(userId: string, contractLengthMonths: number): Promise<void> {
    try {
      // This should be handled by the user repository or contract repository
      // For now, we'll leave this to be handled in the API route directly
      // since it's not part of the core contract functionality
    } catch (error) {
      console.error('Error updating user contract length:', error);
      throw error;
    }
  }

  /**
   * Check if contract is still valid (6 months)
   */
  private isContractValid(signedAt?: string): boolean {
    if (!signedAt) return false;

    const signedDate = new Date(signedAt);
    const currentDate = new Date();
    const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000;

    return currentDate.getTime() - signedDate.getTime() < sixMonthsInMs;
  }

  /**
   * Calculate contract expiration date (6 months from signature)
   */
  private calculateExpirationDate(signedAt: string): string {
    const signedDate = new Date(signedAt);
    const expirationDate = new Date(signedDate);
    expirationDate.setMonth(expirationDate.getMonth() + 6);
    return expirationDate.toISOString();
  }

  /**
   * Validate signature form data
   */
  private validateSignatureData(data: SignatureFormData): ContractValidationError[] {
    return contractRepository.validateContractData(data);
  }

  /**
   * Get client IP and browser information
   */
  private async getClientInfo(): Promise<{ ip: string; browser: string }> {
    let ip = 'N/A';
    let browser = 'N/A';

    try {
      // Try to get IP from external service
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        ip = ipData.ip;
      }
    } catch (error) {
      console.warn('Could not fetch IP address:', error);
    }

    // Browser info would typically come from client
    if (typeof window !== 'undefined') {
      browser = navigator.userAgent;
    }

    return { ip, browser };
  }

  /**
   * Check if user needs to sign contract
   */
  async shouldShowContractNotification(userId: string): Promise<boolean> {
    try {
      const contractStatus = await contractRepository.getContractStatus(userId);
      
      if (!contractStatus) return true;
      if (!contractStatus.signed) return true;
      if (!this.isContractValid(contractStatus.signedAt)) return true;

      return false;
    } catch (error) {
      console.error('Error checking contract notification status:', error);
      return true; // Show notification on error to be safe
    }
  }

  /**
   * Generate contract PDF data
   */
  async getContractPDFData(userId: string): Promise<{
    student: Student;
    contractStatus: ContractStatus | null;
    contractLog: ContractLog | null;
  }> {
    try {
      const result = await this.getStudentContract(userId);
      
      if (!result.student) {
        throw new Error('Student data not found');
      }

      return {
        student: result.student,
        contractStatus: result.contractStatus,
        contractLog: result.contractLog
      };
    } catch (error) {
      console.error('Error getting contract PDF data:', error);
      throw error;
    }
  }
}

export const contractService = new ContractService();