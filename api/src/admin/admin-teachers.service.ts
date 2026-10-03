import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../auth/roles.enum';

@Injectable()
export class AdminTeachersService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. GET ALL TEACHERS WITH STATS
  // ==========================================
  async getTeachers() {
    const teachers = await this.prisma.user.findMany({
      where: {
        role: { in: [Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN] },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        authoredCourses: {
          select: {
            id: true,
            title: true,
            level: true,
            isPublished: true,
            modules: {
              select: {
                lessons: {
                  select: { id: true, deleteRequested: true },
                },
              },
            },
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return teachers.map((t) => {
      const courses = t.authoredCourses;
      const allLessons = courses.flatMap((c) =>
        c.modules.flatMap((m) => m.lessons),
      );
      const pendingDeletionCount = allLessons.filter(
        (l) => l.deleteRequested,
      ).length;

      return {
        id: t.id,
        fullName: t.fullName || t.email.split('@')[0],
        email: t.email,
        avatarUrl: t.avatarUrl,
        role: t.role,
        createdAt: t.createdAt,
        coursesCount: courses.length,
        lessonsCount: allLessons.length,
        pendingDeletionCount,
        courses: courses.map((c) => ({
          id: c.id,
          title: c.title,
          level: c.level,
          isPublished: c.isPublished,
        })),
      };
    });
  }

  // ==========================================
  // 2. ASSIGN / REMOVE TEACHER ROLE
  // ==========================================
  async assignTeacherRole(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.TEACHER },
      select: { id: true, fullName: true, email: true, role: true },
    });
  }

  async removeTeacherRole(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.USER },
      select: { id: true, fullName: true, email: true, role: true },
    });
  }

  // ==========================================
  // 3. ASSIGN COURSE TO TEACHER
  // ==========================================
  async assignCourseToTeacher(courseId: string, teacherId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Kurs topilmadi');

    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });
    if (!teacher) throw new NotFoundException('Oʻqituvchi topilmadi');

    return this.prisma.course.update({
      where: { id: courseId },
      data: { authorId: teacherId },
      include: {
        author: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });
  }

  // ==========================================
  // 4. LESSON DELETION REQUESTS (APPROVAL/REJECTION)
  // ==========================================
  async getDeletionRequests() {
    return this.prisma.lesson.findMany({
      where: { deleteRequested: true },
      include: {
        module: {
          include: {
            course: {
              include: {
                author: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async approveLessonDeletion(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Dars topilmadi');

    await this.prisma.lesson.delete({ where: { id: lessonId } });

    return {
      success: true,
      message: 'Dars muvaffaqiyatli oʻchirildi (Admin tomonidan tasdiqlandi).',
    };
  }

  async rejectLessonDeletion(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Dars topilmadi');

    const updated = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        deleteRequested: false,
        deleteReason: null,
        isPublished: true, // Restore visibility
      },
    });

    return {
      success: true,
      message:
        'Darsni oʻchirish soʻrovi rad etildi va dars qayta faollashtirildi.',
      lesson: updated,
    };
  }
}
