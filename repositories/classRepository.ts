// repositories/classRepository.ts

import { adminDb } from "@/lib/firebase/admin";
import { StudentClass } from "@/types/classes/class";
import { Timestamp, Transaction } from "firebase-admin/firestore";

export class ClassRepository {
  private collectionRef = adminDb.collection('classes');

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
      .where('scheduledAt', '>=', now)
      .get();

    // 👇 ADICIONE ESTE LOG
    console.log(`[REPOSITÓRIO] Busca por aulas do professor ${teacherId}. Encontrado(s): ${snapshot.docs.length}`);

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
    return {
      id: docSnap.id,
      ...data,
      // Converte os Timestamps de volta para Datas do JS
      scheduledAt: (data.scheduledAt as Timestamp).toDate(),
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as StudentClass;
  }
}