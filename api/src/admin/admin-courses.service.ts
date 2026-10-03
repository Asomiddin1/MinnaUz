import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCourseDto,
  CreateModuleDto,
  CreateLessonDto,
} from '../courses/dto/course.dto';
import { Role } from '../auth/roles.enum';

@Injectable()
export class AdminCoursesService {
  constructor(private prisma: PrismaService) {}

  // === TEACHERS LIST FOR COURSE ASSIGNMENT ===
  async getTeachers() {
    return this.prisma.user.findMany({
      where: {
        role: { in: ['TEACHER', 'ADMIN', 'SUPER_ADMIN'] as any },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  // === COURSES ===
  async getAllCourses(user?: { id: string; role: Role }) {
    const isTeacherOnly = user?.role === Role.TEACHER;
    const whereClause: any = {};
    if (isTeacherOnly && user?.id) {
      whereClause.authorId = user.id;
    }

    return this.prisma.course.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
        modules: {
          include: {
            lessons: {
              select: { id: true, title: true, order: true, isPublished: true },
            },
          },
        },
      },
    });
  }

  async getCourseById(id: string, user?: { id: string; role: Role }) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                _count: {
                  select: {
                    kotobaItems: true,
                    bunpouItems: true,
                    kanjiItems: true,
                    renshuuItems: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) throw new NotFoundException('Kurs topilmadi');

    // If teacher, ensure they own this course
    if (user?.role === Role.TEACHER && course.authorId !== user.id) {
      throw new ForbiddenException(
        'Ushbu kursni boshqarish uchun sizda yetarli ruxsat yoʻq',
      );
    }

    return course;
  }

  async createCourse(
    dto: CreateCourseDto,
    currentUserId: string,
    currentUserRole: Role,
  ) {
    let authorId = currentUserId;
    if (
      (currentUserRole === Role.ADMIN ||
        currentUserRole === Role.SUPER_ADMIN) &&
      dto.authorId
    ) {
      authorId = dto.authorId;
    }

    return this.prisma.course.create({
      data: {
        title: dto.title,
        slug: dto.slug || dto.title.toLowerCase().replace(/\s+/g, '-'),
        description: dto.description,
        level: (dto.level as any) || 'N5',
        coverImage: dto.coverImage,
        order: dto.order || 1,
        isPublished: dto.isPublished ?? true,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async updateCourse(
    id: string,
    dto: Partial<CreateCourseDto>,
    currentUserId: string,
    currentUserRole: Role,
  ) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Kurs topilmadi');

    if (currentUserRole === Role.TEACHER && course.authorId !== currentUserId) {
      throw new ForbiddenException(
        'Siz faqat oʻzingiz yaratgan kurslarni tahrirlashingiz mumkin',
      );
    }

    let authorId = course.authorId;
    if (
      (currentUserRole === Role.ADMIN ||
        currentUserRole === Role.SUPER_ADMIN) &&
      dto.authorId
    ) {
      authorId = dto.authorId;
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        ...dto,
        authorId,
        level: dto.level ? (dto.level as any) : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async deleteCourse(id: string, currentUserId: string, currentUserRole: Role) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Kurs topilmadi');

    if (currentUserRole === Role.TEACHER && course.authorId !== currentUserId) {
      throw new ForbiddenException(
        'Siz faqat oʻzingiz yaratgan kurslarni oʻchirishingiz mumkin',
      );
    }

    await this.prisma.course.delete({ where: { id } });
    return { success: true, message: 'Kurs oʻchirildi' };
  }

  // === MODULES ===
  async createModule(courseId: string, dto: CreateModuleDto) {
    return this.prisma.courseModule.create({
      data: {
        courseId,
        title: dto.title,
        description: dto.description,
        order: dto.order || 1,
      },
    });
  }

  async updateModule(moduleId: string, dto: Partial<CreateModuleDto>) {
    return this.prisma.courseModule.update({
      where: { id: moduleId },
      data: dto,
    });
  }

  async deleteModule(moduleId: string) {
    await this.prisma.courseModule.delete({ where: { id: moduleId } });
    return { success: true, message: 'Modul oʻchirildi' };
  }

  // === LESSONS ===
  async createLesson(moduleId: string, dto: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: {
        moduleId,
        title: dto.title,
        japaneseTitle: dto.japaneseTitle,
        slug: dto.slug,
        videoUrl: dto.videoUrl,
        summary: dto.summary,
        kaiwaScenario: dto.kaiwaScenario,
        order: dto.order || 1,
        isPublished: dto.isPublished ?? true,
        isFree: dto.isFree ?? false,
      },
    });
  }

  async updateLesson(
    lessonId: string,
    dto: Partial<CreateLessonDto> & { isPublished?: boolean; isFree?: boolean },
  ) {
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: dto,
    });
  }

  async deleteLesson(lessonId: string) {
    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { success: true, message: 'Dars oʻchirildi' };
  }

  // === LESSON CONTENT SECTIONS ===
  async getLessonContent(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: { include: { course: true } },
        kotobaItems: { orderBy: { order: 'asc' } },
        bunpouItems: { orderBy: { order: 'asc' } },
        kanjiItems: { orderBy: { order: 'asc' } },
        renshuuItems: { orderBy: { order: 'asc' } },
      },
    });
    if (!lesson) throw new NotFoundException('Dars topilmadi');
    return lesson;
  }

  // KOTOBA CRUD
  async saveKotobaItem(lessonId: string, data: any) {
    if (data.id) {
      return this.prisma.kotobaItem.update({
        where: { id: data.id },
        data: { ...data, lessonId },
      });
    }
    return this.prisma.kotobaItem.create({
      data: { ...data, lessonId },
    });
  }

  async deleteKotobaItem(id: string) {
    await this.prisma.kotobaItem.delete({ where: { id } });
    return { success: true };
  }

  // BUNPOU CRUD
  async saveBunpouItem(lessonId: string, data: any) {
    if (data.id) {
      return this.prisma.bunpouItem.update({
        where: { id: data.id },
        data: { ...data, lessonId },
      });
    }
    return this.prisma.bunpouItem.create({
      data: { ...data, lessonId },
    });
  }

  async deleteBunpouItem(id: string) {
    await this.prisma.bunpouItem.delete({ where: { id } });
    return { success: true };
  }

  // KANJI CRUD
  async saveKanjiItem(lessonId: string, data: any) {
    if (data.id) {
      return this.prisma.kanjiItem.update({
        where: { id: data.id },
        data: { ...data, lessonId },
      });
    }
    return this.prisma.kanjiItem.create({
      data: { ...data, lessonId },
    });
  }

  async deleteKanjiItem(id: string) {
    await this.prisma.kanjiItem.delete({ where: { id } });
    return { success: true };
  }

  // RENSHUU CRUD
  async saveRenshuuItem(lessonId: string, data: any) {
    if (data.id) {
      return this.prisma.renshuuItem.update({
        where: { id: data.id },
        data: { ...data, lessonId },
      });
    }
    return this.prisma.renshuuItem.create({
      data: { ...data, lessonId },
    });
  }

  async deleteRenshuuItem(id: string) {
    await this.prisma.renshuuItem.delete({ where: { id } });
    return { success: true };
  }
}
