# Relatório de Auditoria de Segurança - Sistema de Autorização

## Resumo Executivo

Esta auditoria identificou **problemas críticos de segurança** no sistema de autorização das APIs. Foram encontradas vulnerabilidades que permitem acesso não autorizado a recursos e operações sensíveis.

## 🚨 Problemas Críticos Identificados

### 1. **Falta de Validação de Ownership**

**Rotas Afetadas:**
- `/api/classes/[classId]/route.ts` (PATCH)
- `/api/classes/[classId]/reschedule/route.ts` (POST)
- `/api/student/classes/cancel/route.ts` (POST)
- `/api/student/classes/reschedule/route.ts` (POST)

**Problema:** Usuários podem modificar/cancelar/reagendar aulas que não pertencem a eles.

**Exemplo de Vulnerabilidade:**
```typescript
// Em /api/classes/[classId]/route.ts - VULNERÁVEL
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }
  // ❌ PROBLEMA: Não verifica se o usuário tem permissão para modificar esta aula específica
  const { classId } = await params;
  // Qualquer usuário autenticado pode modificar qualquer aula
}
```

### 2. **Validações de Role Inconsistentes**

**Rotas com Problemas:**
- `/api/my-classes/route.ts` - Permite apenas teacher/admin, mas deveria permitir students também
- `/api/student/my-classes/route.ts` - Não valida role, qualquer usuário autenticado pode acessar
- `/api/settings/route.ts` - Não valida se usuário pode modificar configurações específicas

### 3. **Falta de Validação de Contexto para Professores**

**Problema:** Professores podem cancelar aulas que não lecionam.

```typescript
// Em /api/teacher/cancel-class/route.ts
if (session.user.role !== 'teacher' && session.user.role !== 'admin' && session.user.role !== 'manager') {
  return NextResponse.json({ error: 'Apenas professores podem cancelar aulas.' }, { status: 403 });
}
// ❌ PROBLEMA: Não verifica se o professor leciona esta aula específica
```

### 4. **Ausência de Rate Limiting**

**Todas as rotas** carecem de proteção contra:
- Ataques de força bruta
- Spam de requisições
- Abuse de operações críticas (cancelamento/reagendamento)

### 5. **Instanciação Duplicada de Repositórios**

**Exemplo em `/api/admin/users/route.ts`:**
```typescript
const adminService = new AdminService();
const userService = new UserService();
// ❌ PROBLEMA: Múltiplas instâncias dos mesmos serviços em diferentes rotas
```

## 📊 Mapeamento de Validações Atuais

### ✅ Rotas com Validação Adequada
- `/api/admin/users/route.ts` - Valida role admin
- `/api/profile/route.ts` - Usa requireAuth() adequadamente

### ⚠️ Rotas com Validação Parcial
- `/api/student/classes/cancel/route.ts` - Valida role mas não ownership
- `/api/teacher/cancel-class/route.ts` - Valida role mas não contexto
- `/api/student/classes/reschedule/route.ts` - Valida role mas não ownership

### ❌ Rotas com Validação Inadequada
- `/api/classes/[classId]/route.ts` - Sem validação de ownership
- `/api/classes/[classId]/reschedule/route.ts` - Sem validação de ownership
- `/api/student/my-classes/route.ts` - Sem validação de role
- `/api/settings/route.ts` - Validação muito genérica

## 🎯 Regras de Negócio Identificadas

### **Cancelamento de Aulas**
- **STUDENT**: Pode cancelar apenas suas próprias aulas
- **TEACHER**: Pode cancelar apenas aulas que leciona
- **ADMIN/MANAGER**: Pode cancelar qualquer aula

### **Reagendamento de Aulas**
- **STUDENT**: Pode reagendar apenas suas próprias aulas (com limite mensal)
- **TEACHER**: Pode reagendar apenas aulas que leciona
- **ADMIN/MANAGER**: Pode reagendar qualquer aula

### **Visualização de Aulas**
- **STUDENT**: Pode ver apenas suas próprias aulas
- **TEACHER**: Pode ver apenas aulas que leciona
- **ADMIN/MANAGER**: Pode ver todas as aulas

### **Modificação de Status**
- **TEACHER**: Pode modificar status de aulas que leciona
- **ADMIN/MANAGER**: Pode modificar status de qualquer aula
- **STUDENT**: Não pode modificar status

## 🔧 Recomendações Imediatas

### 1. **Implementar Middleware de Autorização Centralizado**
```typescript
// Exemplo de implementação necessária
export async function withAuth(
  handler: NextApiHandler,
  options: {
    requiredRole?: UserRoles[];
    requiredPermissions?: UserPermission[];
    resourceOwnershipCheck?: (userId: string, resourceId: string) => Promise<boolean>;
  }
) {
  // Implementação centralizada
}
```

### 2. **Adicionar Validações de Ownership**
- Verificar se estudante é dono da aula antes de permitir cancelamento/reagendamento
- Verificar se professor leciona a aula antes de permitir modificações

### 3. **Implementar Rate Limiting Imediato**
- Cancelamento: 5 tentativas/hora por usuário
- Reagendamento: 10 tentativas/hora por usuário
- APIs gerais: 100 requests/min por usuário

### 4. **Unificar Instâncias de Serviços**
- Criar factory pattern para repositórios
- Implementar singleton para serviços

## 📈 Próximos Passos

1. **Fase 1**: Implementar middleware de autorização centralizado
2. **Fase 2**: Adicionar validações de ownership em rotas críticas
3. **Fase 3**: Implementar rate limiting
4. **Fase 4**: Refatorar instanciação de serviços
5. **Fase 5**: Testes de segurança abrangentes

---

**Data da Auditoria:** $(date)
**Auditor:** Sistema Automatizado
**Prioridade:** CRÍTICA
**Status:** REQUER AÇÃO IMEDIATA