import { adminDb } from "@/lib/firebase/admin";
import { ClassRepository } from "@/repositories/classRepository";
import { UserAdminRepository } from "@/repositories/user.admin.repository";
import { PopulatedStudentClass } from "@/types/classes/class";
import { AvailabilityType } from "@/types/time/availability";

const userAdminRepo = new UserAdminRepository();
const classRepository = new ClassRepository();


export class TeacherService {
  /**
   * Busca apenas os professores que têm pelo menos um horário de disponibilidade
   * do tipo "occasional" cadastrado.
   */
 async findAvailableTeachersForOccasional(filters: { language?: string; leadTime?: number }) {
    // 1. Busca os IDs dos professores com disponibilidade (como antes)
    const availabilitySnapshot = await adminDb.collection('availabilities')
      .where('type', '==', AvailabilityType.OCCASIONAL)
      .get();
    
    if (availabilitySnapshot.empty) return [];
    const teacherIds = [...new Set(availabilitySnapshot.docs.map(doc => doc.data().teacherId))];
    if (teacherIds.length === 0) return [];

    // 2. Busca os perfis completos desses professores
    const allAvailableTeachers = await userAdminRepo.findUsersByIds(teacherIds);

    // 3. Aplica os filtros adicionais no servidor
    let filteredTeachers = allAvailableTeachers;

    // Filtro por Idioma
    if (filters.language) {
      filteredTeachers = filteredTeachers.filter(teacher => 
        teacher.profile?.languages?.includes(filters.language!)
      );
    }

    // Filtro por Antecedência Mínima
    if (filters.leadTime) {
      filteredTeachers = filteredTeachers.filter(teacher => {
        const teacherLeadTime = teacher.schedulingSettings?.bookingLeadTimeHours || 24; // Padrão 24h
        return teacherLeadTime <= filters.leadTime!;
      });
    }
    
    return filteredTeachers;
  }

  async getPopulatedScheduledClasses(teacherId: string): Promise<PopulatedStudentClass[]> {
    // 1. Busca todas as aulas futuras do professor
    const classes = await classRepository.findAllClassesByTeacherId(teacherId);
    if (classes.length === 0) {
      return [];
    }

    // 2. Extrai os IDs únicos dos alunos dessas aulas
    const studentIds = [...new Set(classes.map(c => c.studentId))];

    // 3. Busca os perfis de todos esses alunos de uma só vez
    const students = await userAdminRepo.findUsersByIds(studentIds);
    
    // 4. Cria um "mapa" para facilitar a busca do aluno pelo ID
    const studentMap = new Map(students.map(s => [s.id, s]));

    // 5. Combina os dados da aula com os dados do aluno
    const populatedClasses = classes.map(cls => {
      const student = studentMap.get(cls.studentId);
      return {
        ...cls,
        studentName: student?.name || 'Aluno Desconhecido',
        studentAvatarUrl: student?.avatarUrl,
      };
    });

    return populatedClasses;
  }

  async getMyStudents(teacherId: string) {
    // 1. Busca todas as aulas do professor
    const classes = await classRepository.findAllClassesByTeacherId(teacherId);
    if (classes.length === 0) {
      return [];
    }

    // 2. Extrai os IDs únicos dos alunos dessas aulas
    const studentIds = [...new Set(classes.map(c => c.studentId))];

    // 3. Busca os perfis de todos esses alunos de uma só vez
    const students = await userAdminRepo.findUsersByIds(studentIds);
    
    // 4. Mapeia os dados dos alunos para o formato necessário
    const studentList = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email || '',
      avatarUrl: student.avatarUrl
    }));

    return studentList;
  }
}