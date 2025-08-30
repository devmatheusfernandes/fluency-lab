// repositories/classRepository.ts

import { adminDb } from "@/lib/firebase/admin";
import { ClassStatus, ClassTemplateDay, PopulatedStudentClass, StudentClass } from "@/types/classes/class";
import { daysOfWeek } from "@/types/time/times";
import { Timestamp, Transaction } from "firebase-admin/firestore";

export class ClassRepository {
  private collectionRef = adminDb.collection('classes');

  /**
   * Converts Firebase Timestamp fields to JavaScript Date objects in a StudentClass
   */
  private convertTimestampsToDate(data: any, docId: string): StudentClass {
    const convertedData: any = {
      id: docId,
      ...data,
      scheduledAt: (data.scheduledAt as Timestamp).toDate(),
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };

    // Handle optional timestamp fields
    if (data.canceledAt) {
      convertedData.canceledAt = (data.canceledAt as Timestamp).toDate();
    }
    if (data.completedAt) {
      convertedData.completedAt = (data.completedAt as Timestamp).toDate();
    }
    
    // Handle nested rescheduledFrom object with originalScheduledAt timestamp
    if (data.rescheduledFrom && data.rescheduledFrom.originalScheduledAt) {
      convertedData.rescheduledFrom = {
        ...data.rescheduledFrom,
        originalScheduledAt: (data.rescheduledFrom.originalScheduledAt as Timestamp).toDate(),
      };
    }

    return convertedData as StudentClass;
  }

  /**
   * Cria um novo documento de aula dentro de uma transação do Firestore.
   */
  createWithTransaction(
    transaction: FirebaseFirestore.Transaction,
    classData: Omit<StudentClass, 'id'>
  ) {
    const newClassRef = this.collectionRef.doc();
    // Garante que as datas sejam salvas no formato Timestamp
    const dataToSave = {
      ...classData,
      scheduledAt: Timestamp.fromDate(new Date(classData.scheduledAt)),
      createdAt: Timestamp.fromDate(new Date(classData.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(classData.updatedAt)),
    };
    transaction.set(newClassRef, dataToSave);
  }

  /**
   * Busca todas as aulas (futuras) de um professor específico.
   * @param teacherId O ID do professor.
   * @returns Uma lista de aulas agendadas.
   */
  async findClassesByTeacherId(teacherId: string): Promise<StudentClass[]> {
    const now = Timestamp.now();
    const snapshot = await this.collectionRef
      .where('teacherId', '==', teacherId)
      //.where('scheduledAt', '>=', now) //PRECISO CRIAR O INDICE
      .get();

    // 👇 ADICIONE ESTE LOG
    console.log(`[REPOSITÓRIOsss] Busca por aulas do professor ${teacherId}. Encontrado(s): ${snapshot.docs.length}`);

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return this.convertTimestampsToDate(data, doc.id);
    });
  }

/**
   * Busca TODAS as aulas de um professor (passadas e futuras), ordenadas por data.
   * ESTA VERSÃO NÃO TEM FILTRO DE DATA e irá buscar todos os registos.
   * @param teacherId O ID do professor.
   * @returns Uma lista de todas as aulas.
   */
  async findAllClassesByTeacherId(teacherId: string): Promise<StudentClass[]> {
    const snapshot = await this.collectionRef
      .where('teacherId', '==', teacherId) // Apenas filtra pelo professor
      .orderBy('scheduledAt', 'desc')     // Ordena da mais recente para a mais antiga
      .get();

    console.log(`[REPOSITÓRIO all] Busca por aulas do professor ${teacherId}. Encontrado(s): ${snapshot.docs.length}`);

    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        scheduledAt: (data.scheduledAt as Timestamp).toDate(),
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
      } as StudentClass;
    });
  }

  /**
   * Busca todas as aulas (futuras) de um aluno específico, ordenadas por data.
   * @param studentId O ID do aluno.
   * @returns Uma lista de aulas agendadas.
   */
  async findClassesByStudentId(studentId: string): Promise<StudentClass[]> {
    const now = Timestamp.now();
    const snapshot = await this.collectionRef
      .where('studentId', '==', studentId)
      .where('scheduledAt', '>=', now)
      .orderBy('scheduledAt', 'asc') // Ordena as aulas da mais próxima para a mais distante
      .get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Converte os Timestamps de volta para Datas do JS
        scheduledAt: (data.scheduledAt as Timestamp).toDate(),
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
      } as StudentClass;
    });
  }

  /**
 * Busca por uma aula de um professor em uma data específica DENTRO de uma transação.
 * @param transaction - O objeto da transação do Firestore.
 * @param teacherId - O ID do professor.
 * @param scheduledAt - A data e hora exatas da aula.
 * @returns O resultado da query.
 */
  async findClassByTeacherAndDateWithTransaction(
    transaction: Transaction,
    teacherId: string,
    scheduledAt: Date
  ): Promise<FirebaseFirestore.QuerySnapshot> {
    const query = this.collectionRef
      .where('teacherId', '==', teacherId)
      .where('scheduledAt', '==', Timestamp.fromDate(scheduledAt));

    return transaction.get(query);
  }

  /**
 * Conta quantas aulas um professor já tem agendadas em um dia específico.
 * Executado dentro de uma transação para garantir consistência.
 * @param transaction - O objeto da transação do Firestore.
 * @param teacherId - O ID do professor.
 * @param date - A data a ser verificada.
 * @returns O número de aulas encontradas.
 */
  async countClassesOnDateForTeacher(
    transaction: Transaction,
    teacherId: string,
    date: Date
  ): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = this.collectionRef
      .where('teacherId', '==', teacherId)
      .where('scheduledAt', '>=', Timestamp.fromDate(startOfDay))
      .where('scheduledAt', '<=', Timestamp.fromDate(endOfDay));

    const snapshot = await transaction.get(query);
    return snapshot.size;
  }

  /**
   * Busca uma única aula pelo seu ID.
   * @param classId O ID do documento da aula.
   * @returns O objeto da aula ou null se não for encontrado.
   */
  async findClassById(classId: string): Promise<StudentClass | null> {
    const docRef = this.collectionRef.doc(classId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }

    const data = docSnap.data()!;
    
    return this.convertTimestampsToDate(data, docSnap.id);
  }

  async countClassesForToday(): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const snapshot = await this.collectionRef
      .where('scheduledAt', '>=', Timestamp.fromDate(startOfDay))
      .where('scheduledAt', '<=', Timestamp.fromDate(endOfDay))
      .count()
      .get();
    return snapshot.data().count;
  }

  async findRecentClassesWithUserDetails(limit: number): Promise<PopulatedStudentClass[]> {
    const snapshot = await this.collectionRef
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    if (snapshot.empty) return [];

    const classes = snapshot.docs.map(doc => {
      const data = doc.data();
      return this.convertTimestampsToDate(data, doc.id);
    });

    // Lógica para popular com nomes de alunos e professores (similar ao que fizemos antes)
    // ... (esta lógica pode ser movida para um serviço para reutilização)
    return classes as PopulatedStudentClass[]; // Retorno simplificado por enquanto
  }

  /**
 * Cria múltiplas aulas no Firestore de forma eficiente usando um WriteBatch.
 * Essencial para gerar o cronograma de um contrato inteiro.
 * @param classes - Um array de objetos StudentClass a serem criados.
 */
  async batchCreate(classes: Omit<StudentClass, 'id'>[]): Promise<void> {
    const batch = adminDb.batch();

    classes.forEach((classData) => {
      const docRef = this.collectionRef.doc(); // Gera um ID automático
      batch.set(docRef, {
        ...classData,
        // Garante que as datas sejam salvas no formato Timestamp do Firebase
        scheduledAt: Timestamp.fromDate(new Date(classData.scheduledAt)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log(`${classes.length} aulas foram criadas com sucesso em lote.`);
  }

  /**
   * Encontra e atualiza o status de todas as aulas agendadas de um professor
   * dentro de um intervalo de datas. Executado dentro de uma transação.
   * @param transaction A transação do Firestore.
   * @param teacherId O ID do professor.
   * @param startDate A data de início do período.
   * @param endDate A data de fim do período.
   * @param newStatus O novo status a ser aplicado nas aulas.
   */
  async updateClassesStatusInRange(
    transaction: Transaction,
    teacherId: string,
    startDate: Date,
    endDate: Date,
    newStatus: ClassStatus
  ): Promise<void> {
    const classesQuery = this.collectionRef
      .where('teacherId', '==', teacherId)
      .where('status', '==', ClassStatus.SCHEDULED)
      .where('scheduledAt', '>=', Timestamp.fromDate(startDate))
      .where('scheduledAt', '<=', Timestamp.fromDate(endDate));

    const snapshot = await transaction.get(classesQuery);

    if (!snapshot.empty) {
      snapshot.docs.forEach(doc => {
        transaction.update(doc.ref, { status: newStatus, updatedAt: Timestamp.now() });
      });
      console.log(`${snapshot.size} aulas foram atualizadas para o status ${newStatus}.`);
    }
  }

  /**
   * Busca todas as aulas agendadas de um professor dentro de um intervalo de datas.
   * Útil para encontrar aulas afetadas por férias ou outros eventos.
   * @param teacherId O ID do professor.
   * @param startDate A data de início do período.
   * @param endDate A data de fim do período.
   * @returns Uma lista de aulas encontradas no período.
   */
  async findClassesByTeacherInRange(
    teacherId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StudentClass[]> {
    const snapshot = await this.collectionRef
      .where('teacherId', '==', teacherId)
      .where('status', '==', ClassStatus.SCHEDULED)
      .where('scheduledAt', '>=', Timestamp.fromDate(startDate))
      .where('scheduledAt', '<=', Timestamp.fromDate(endDate))
      .orderBy('scheduledAt', 'asc')
      .get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        scheduledAt: (data.scheduledAt as Timestamp).toDate(),
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
      } as StudentClass;
    });
  }

  /**
   * Busca TODAS as aulas de um aluno específico (passadas e futuras), ordenadas por data.
   * Ideal para visualizações de histórico administrativo.
   * @param studentId O ID do aluno.
   * @returns Uma lista de todas as aulas.
   */
  async findAllClassesByStudentId(studentId: string): Promise<StudentClass[]> {
    const snapshot = await this.collectionRef
      .where('studentId', '==', studentId)
      .orderBy('scheduledAt', 'asc') // Ordena da mais antiga para a mais nova
      .get();

    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        scheduledAt: (data.scheduledAt as Timestamp).toDate(),
        // ... outras conversões de data
      } as StudentClass;
    });
  }

  /**
   * Encontra e exclui em lote todas as aulas futuras de um aluno que
   * correspondem a um conjunto específico de regras de template (dia, hora, professor).
   * @param studentId O ID do aluno.
   * @param templatesToRemove Um array de entradas de template que foram removidas.
   */
  async deleteFutureClassesByTemplate(studentId: string, templatesToRemove: ClassTemplateDay[]): Promise<void> {
    if (templatesToRemove.length === 0) return;

    const batch = adminDb.batch();
    const now = Timestamp.now();

    for (const template of templatesToRemove) {
      const classesQuery = this.collectionRef
        .where('studentId', '==', studentId)
        .where('status', '==', ClassStatus.SCHEDULED)
        .where('teacherId', '==', template.teacherId)
        // Infelizmente, o Firestore não permite filtrar por dia da semana ou hora diretamente.
        // Teremos que fazer essa lógica no serviço. Aqui, apenas filtramos o básico.
        .where('scheduledAt', '>=', now);
      
      const snapshot = await classesQuery.get();
      
      snapshot.docs.forEach(doc => {
        const classData = doc.data() as StudentClass;
        const classDate = (classData.scheduledAt as unknown as Timestamp).toDate();
        const classDay = daysOfWeek[classDate.getDay()];
        const classHour = `${String(classDate.getHours()).padStart(2, '0')}:${String(classDate.getMinutes()).padStart(2, '0')}`;

        // Se a aula corresponde exatamente ao dia e hora do template removido, marque para exclusão.
        if (classDay === template.day && classHour === template.hour) {
          batch.delete(doc.ref);
        }
      });
    }

    await batch.commit();
    console.log(`Exclusão em cascata concluída para o aluno ${studentId}.`);
  }

    /**
   * Verifica de forma eficiente se um aluno já possui aulas agendadas no futuro.
   * @param studentId O ID do aluno.
   * @returns `true` se existirem aulas futuras, `false` caso contrário.
   */
  async hasFutureScheduledClasses(studentId: string): Promise<boolean> {
    const now = Timestamp.now();
    const snapshot = await this.collectionRef
      .where('studentId', '==', studentId)
      .where('status', '==', ClassStatus.SCHEDULED)
      .where('scheduledAt', '>=', now)
      .limit(1) // Otimização máxima: para a busca assim que encontrar 1 resultado
      .get();

    return !snapshot.empty;
  }


  /**
   * Atualiza dados específicos de uma aula.
   * @param classId O ID da aula a ser atualizada.
   * @param data Um objeto com os campos a serem atualizados.
   */
  async update(classId: string, data: Partial<StudentClass>): Promise<void> {
    const classRef = this.collectionRef.doc(classId);
    await classRef.update({
      ...data,
      updatedAt: Timestamp.now(),
    });
  }
}