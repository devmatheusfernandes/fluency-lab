// repositories/index.ts
// Instâncias singleton centralizadas para todos os repositórios
// Resolve o problema de instanciação duplicada identificado no relatório de auditoria

import { UserRepository } from './userRepository';
import { UserAdminRepository } from './user.admin.repository';
import { ClassRepository } from './classRepository';
import { ClassTemplateRepository } from './ClassTemplateRepository';
import { AvailabilityRepository } from './availabilityRepository';
import { PaymentRepository } from './paymentRepository';
import { PlacementRepository } from './placementRepository';

// ============================================================================
// INSTÂNCIAS SINGLETON CENTRALIZADAS
// ============================================================================

/**
 * Repositório principal de usuários (operações básicas)
 */
export const userRepository = new UserRepository();

/**
 * Repositório administrativo de usuários (operações avançadas)
 */
export const userAdminRepository = new UserAdminRepository();

/**
 * Repositório de aulas
 */
export const classRepository = new ClassRepository();

/**
 * Repositório de templates de aulas
 */
export const classTemplateRepository = new ClassTemplateRepository();

/**
 * Repositório de disponibilidade
 */
export const availabilityRepository = new AvailabilityRepository();

/**
 * Repositório de pagamentos
 */
export const paymentRepository = new PaymentRepository();

/**
 * Repositório de testes de nivelamento
 */
export const placementRepository = new PlacementRepository();

// ============================================================================
// EXPORTAÇÕES LEGACY (para compatibilidade)
// ============================================================================

// Re-exporta as instâncias existentes para manter compatibilidade
export { userRepository as legacyUserRepository } from './userRepository';
export { classTemplateRepository as legacyClassTemplateRepository } from './ClassTemplateRepository';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type RepositoryInstances = {
  userRepository: UserRepository;
  userAdminRepository: UserAdminRepository;
  classRepository: ClassRepository;
  classTemplateRepository: ClassTemplateRepository;
  availabilityRepository: AvailabilityRepository;
  paymentRepository: PaymentRepository;
  placementRepository: PlacementRepository;
};

/**
 * Função utilitária para obter todas as instâncias de repositórios
 * Útil para injeção de dependência ou testes
 */
export function getAllRepositories(): RepositoryInstances {
  return {
    userRepository,
    userAdminRepository,
    classRepository,
    classTemplateRepository,
    availabilityRepository,
    paymentRepository,
    placementRepository,
  };
}

/**
 * Função para validar se todas as instâncias estão inicializadas
 * Útil para health checks
 */
export function validateRepositoryInstances(): boolean {
  const repositories = getAllRepositories();
  
  return Object.values(repositories).every(repo => {
    return repo && typeof repo === 'object';
  });
}

// ============================================================================
// DOCUMENTAÇÃO
// ============================================================================

/**
 * COMO USAR:
 * 
 * // Ao invés de:
 * const userAdminRepo = new UserAdminRepository();
 * 
 * // Use:
 * import { userAdminRepository } from '@/repositories';
 * 
 * // Ou para múltiplos repositórios:
 * import { 
 *   userRepository, 
 *   classRepository, 
 *   paymentRepository 
 * } from '@/repositories';
 * 
 * BENEFÍCIOS:
 * - Evita instanciação duplicada
 * - Melhora performance (reutilização de conexões)
 * - Facilita testes (injeção de dependência)
 * - Centraliza configuração
 * - Reduz uso de memória
 */