import { adminDb } from "@/lib/firebase/admin";
import { 
  userAdminRepository,
  classRepository
} from "@/repositories";
import { PopulatedStudentClass, StudentClass } from "@/types/classes/class";
import { AvailabilityType } from "@/types/time/availability";

// Usando instâncias singleton centralizadas
const userAdminRepo = userAdminRepository;


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
    const classes = await classRepository.findFutureClassesByTeacherId(teacherId);
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

  async getMyStudentsWithNextClass(teacherId: string) {
    try {
      console.log(`Fetching future classes for teacher: ${teacherId}`);
      // 1. Busca todas as aulas futuras do professor
      const classes = await classRepository.findFutureClassesByTeacherId(teacherId);
      console.log(`Found ${classes.length} future classes for teacher: ${teacherId}`);
      
      if (classes.length === 0) {
        return [];
      }

      // 2. Extrai os IDs únicos dos alunos dessas aulas
      const studentIds = [...new Set(classes.map(c => c.studentId))];

      // 3. Busca os perfis de todos esses alunos de uma só vez
      const students = await userAdminRepo.findUsersByIds(studentIds);
      console.log(`Found ${students.length} students for teacher: ${teacherId}`);
      
      // 4. Cria um "mapa" para facilitar a busca do aluno pelo ID
      const studentMap = new Map(students.map(s => [s.id, s]));

      // 5. Para cada aluno, encontra a próxima aula
      const studentsWithNextClass = students.map(student => {
        // Filtra as aulas deste aluno e ordena por data
        const studentClasses = classes
          .filter(cls => cls.studentId === student.id)
          .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
        
        // Pega a próxima aula (a primeira da lista ordenada)
        const nextClass = studentClasses.length > 0 ? studentClasses[0] : null;
        
        return {
          id: student.id,
          name: student.name,
          email: student.email || '',
          avatarUrl: student.avatarUrl,
          nextClass: nextClass ? {
            scheduledAt: nextClass.scheduledAt.toISOString(), // Convert to ISO string for proper serialization
            language: nextClass.language
          } : null
        };
      });

      // Ordena os alunos pela data da próxima aula (os que têm aula mais próxima primeiro)
      const sortedStudents = studentsWithNextClass.sort((a, b) => {
        // Se ambos têm próxima aula, ordena por data
        if (a.nextClass && b.nextClass) {
          const dateA = new Date(a.nextClass.scheduledAt);
          const dateB = new Date(b.nextClass.scheduledAt);
          return dateA.getTime() - dateB.getTime();
        }
        // Se apenas um tem próxima aula, ele vem primeiro
        if (a.nextClass) return -1;
        if (b.nextClass) return 1;
        // Se nenhum tem próxima aula, mantém a ordem
        return 0;
      });
      
      console.log(`Returning ${sortedStudents.length} students with next class info for teacher: ${teacherId}`);
      return sortedStudents;
    } catch (error) {
      console.error('Error in getMyStudentsWithNextClass:', error);
      throw error;
    }
  }
}

export default TeacherService;