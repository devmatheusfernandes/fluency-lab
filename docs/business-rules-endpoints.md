# Regras de Negócio por Endpoint - Sistema de Agendamento

## 📋 Visão Geral

Este documento define as regras de negócio específicas para cada endpoint da API, incluindo validações de autorização, ownership e contexto.

## 🎯 Regras Gerais de Autorização

### **Hierarquia de Roles**

```
ADMIN > MANAGER > TEACHER > STUDENT
```

### **Princípios de Acesso**

1. **Ownership**: Usuários só podem acessar recursos que possuem
2. **Context**: Professores só podem acessar aulas que lecionam
3. **Hierarchy**: Roles superiores herdam permissões dos inferiores
4. **Explicit Permissions**: Algumas operações requerem permissões específicas

---

## 📚 Regras por Endpoint

### **1. Cancelamento de Aulas**

#### `/api/student/classes/cancel` (POST)

**Regras Atuais:** ✅ Valida role STUDENT
**Regras Necessárias:**

- ✅ Usuário deve estar autenticado
- ✅ Usuário deve ter role STUDENT
- ❌ **FALTANDO**: Verificar se a aula pertence ao estudante
- ❌ **FALTANDO**: Verificar se aula pode ser cancelada (prazo mínimo)
- ❌ **FALTANDO**: Rate limiting (5 cancelamentos/hora)

```typescript
// Validação necessária
const isOwner = await schedulingService.isStudentOwnerOfClass(
  session.user.id,
  classId
);
const canCancel = await schedulingService.canCancelClass(classId);
```

#### `/api/teacher/cancel-class` (POST)

**Regras Atuais:** ✅ Valida roles TEACHER, ADMIN, MANAGER
**Regras Necessárias:**

- ✅ Usuário deve estar autenticado
- ✅ Usuário deve ter role TEACHER, ADMIN ou MANAGER
- ❌ **FALTANDO**: TEACHER só pode cancelar aulas que leciona
- ❌ **FALTANDO**: Verificar se aula pode ser cancelada
- ❌ **FALTANDO**: Rate limiting específico por role

```typescript
// Validação necessária para TEACHER
if (session.user.role === "teacher") {
  const isTeacherOfClass = await schedulingService.isTeacherOfClass(
    session.user.id,
    classId
  );
  if (!isTeacherOfClass) throw new Error("Professor não leciona esta aula");
}
```

### **2. Reagendamento de Aulas**

#### `/api/student/classes/reschedule` (POST)

**Regras Atuais:** ✅ Valida role STUDENT
**Regras Necessárias:**

- ✅ Usuário deve estar autenticado
- ✅ Usuário deve ter role STUDENT
- ❌ **FALTANDO**: Verificar ownership da aula
- ❌ **FALTANDO**: Verificar limite mensal de reagendamentos
- ❌ **FALTANDO**: Verificar prazo mínimo para reagendamento
- ❌ **FALTANDO**: Rate limiting (10 reagendamentos/hora)

```typescript
// Validações necessárias
const isOwner = await schedulingService.isStudentOwnerOfClass(
  session.user.id,
  classId
);
const monthlyLimit = await schedulingService.getMonthlyRescheduleCount(
  session.user.id
);
const canReschedule = await schedulingService.canRescheduleClass(
  classId,
  newDateTime
);
```

#### `/api/classes/[classId]/reschedule` (POST)

**Regras Atuais:** ❌ Apenas autenticação básica
**Regras Necessárias:**

- ✅ Usuário deve estar autenticado
- ❌ **FALTANDO**: Validação de role
- ❌ **FALTANDO**: Validação de ownership/contexto
- ❌ **FALTANDO**: Regras específicas por role

```typescript
// Validação necessária
switch (session.user.role) {
  case "student":
    await validateStudentOwnership(session.user.id, classId);
    await validateRescheduleLimit(session.user.id);
    break;
  case "teacher":
    await validateTeacherContext(session.user.id, classId);
    break;
  case "admin":
  case "manager":
    // Acesso total
    break;
}
```

### **3. Visualização de Aulas**

#### `/api/student/my-classes` (GET)

**Regras Atuais:** ✅ Autenticação básica
**Regras Necessárias:**

- ✅ Usuário deve estar autenticado
- ❌ **FALTANDO**: Validação de role STUDENT
- ❌ **FALTANDO**: Filtrar apenas aulas do estudante

```typescript
// Validação necessária
if (session.user.role !== "student") {
  throw new Error("Apenas estudantes podem acessar este endpoint");
}
```

#### `/api/my-classes` (GET)

**Regras Atuais:** ✅ Valida roles TEACHER, ADMIN
**Regras Necessárias:**

- ✅ Usuário deve estar autenticado
- ✅ Usuário deve ter role TEACHER ou ADMIN
- ❌ **FALTANDO**: TEACHER deve ver apenas suas aulas
- ❌ **FALTANDO**: Incluir role MANAGER

```typescript
// Validação necessária
const allowedRoles = ["teacher", "admin", "manager"];
if (!allowedRoles.includes(session.user.role)) {
  throw new Error("Acesso negado");
}

if (session.user.role === "teacher") {
  // Filtrar apenas aulas do professor
  classes = await schedulingService.getClassesForTeacher(session.user.id);
}
```

### **4. Modificação de Status/Feedback**

#### `/api/classes/[classId]` (PATCH)

**Regras Atuais:** ❌ Apenas autenticação básica
**Regras Necessárias:**

- ✅ Usuário deve estar autenticado
- ❌ **FALTANDO**: Validação de role (TEACHER, ADMIN, MANAGER)
- ❌ **FALTANDO**: TEACHER só pode modificar aulas que leciona
- ❌ **FALTANDO**: Validação de campos permitidos por role

```typescript
// Validação necessária
const allowedRoles = ["teacher", "admin", "manager"];
if (!allowedRoles.includes(session.user.role)) {
  throw new Error("Apenas professores e administradores podem modificar aulas");
}

if (session.user.role === "teacher") {
  const isTeacherOfClass = await schedulingService.isTeacherOfClass(
    session.user.id,
    classId
  );
  if (!isTeacherOfClass) {
    throw new Error("Professor não leciona esta aula");
  }
}
```

### **5. Administração de Usuários**

#### `/api/admin/users` (GET/POST)

**Regras Atuais:** ✅ Valida role ADMIN
**Regras Necessárias:**

- ✅ Usuário deve estar autenticado
- ✅ Usuário deve ter role ADMIN
- ❌ **FALTANDO**: Incluir role MANAGER para algumas operações
- ❌ **FALTANDO**: Rate limiting para criação de usuários

### **6. Configurações de Usuário**

#### `/api/settings` (PUT)

**Regras Atuais:** ✅ Autenticação via requireAuth
**Regras Necessárias:**

- ✅ Usuário deve estar autenticado
- ❌ **FALTANDO**: Validar quais configurações cada role pode modificar
- ❌ **FALTANDO**: Ownership de configurações específicas

```typescript
// Validação necessária
const allowedSettings = getAllowedSettingsForRole(session.user.role);
const requestedSettings = Object.keys(updateData);
const unauthorizedSettings = requestedSettings.filter(
  (s) => !allowedSettings.includes(s)
);

if (unauthorizedSettings.length > 0) {
  throw new Error(
    `Configurações não permitidas: ${unauthorizedSettings.join(", ")}`
  );
}
```

#### `/api/profile` (PUT)

**Regras Atuais:** ✅ Autenticação via requireAuth
**Regras Necessárias:**

- ✅ Usuário deve estar autenticado
- ❌ **FALTANDO**: Validar campos que cada role pode modificar
- ❌ **FALTANDO**: Impedir modificação de role próprio

---

## 🔒 Matriz de Permissões por Endpoint

| Endpoint                           | STUDENT       | TEACHER          | ADMIN      | MANAGER       |
| ---------------------------------- | ------------- | ---------------- | ---------- | ------------- |
| `POST /student/classes/cancel`     | ✅ (próprias) | ❌               | ❌         | ❌            |
| `POST /teacher/cancel-class`       | ❌            | ✅ (que leciona) | ✅ (todas) | ✅ (todas)    |
| `POST /student/classes/reschedule` | ✅ (próprias) | ❌               | ❌         | ❌            |
| `POST /classes/[id]/reschedule`    | ✅ (próprias) | ✅ (que leciona) | ✅ (todas) | ✅ (todas)    |
| `GET /student/my-classes`          | ✅ (próprias) | ❌               | ❌         | ❌            |
| `GET /my-classes`                  | ❌            | ✅ (próprias)    | ✅ (todas) | ✅ (todas)    |
| `PATCH /classes/[id]`              | ❌            | ✅ (que leciona) | ✅ (todas) | ✅ (todas)    |
| `GET/POST /admin/users`            | ❌            | ❌               | ✅         | ✅ (limitado) |
| `PUT /settings`                    | ✅ (limitado) | ✅ (limitado)    | ✅ (todas) | ✅ (limitado) |
| `PUT /profile`                     | ✅ (próprio)  | ✅ (próprio)     | ✅ (todos) | ✅ (limitado) |

---

## 🚨 Rate Limiting por Endpoint

### **Operações Críticas**

- **Cancelamento**: 5 tentativas/hora por usuário
- **Reagendamento**: 10 tentativas/hora por usuário
- **Login**: 10 tentativas/15min por IP

### **Operações Administrativas**

- **Criação de usuários**: 20/hora por admin
- **Modificação de configurações**: 50/hora por usuário

### **APIs Gerais**

- **Consultas**: 100 requests/min por usuário
- **Modificações**: 30 requests/min por usuário

---

## 📝 Próximas Implementações

1. **Criar funções de validação de ownership**
2. **Implementar verificações de contexto para professores**
3. **Adicionar rate limiting específico por operação**
4. **Criar middleware centralizado de autorização**
5. **Implementar testes de segurança para cada regra**

---

**Última Atualização:** $(date)
**Status:** Em Implementação
**Prioridade:** CRÍTICA
