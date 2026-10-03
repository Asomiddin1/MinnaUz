import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTeacherFeedbackDto,
  CreateTeacherAnnouncementDto,
  RequestDeleteLessonDto,
} from './dto/teacher.dto';
import { CreateModuleDto, CreateLessonDto } from '../courses/dto/course.dto';
import {
  CreateTestDto,
  UpdateTestDto,
  CreateQuestionDto,
  UpdateQuestionDto,
} from '../tests/dto/admin-test.dto';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // HELPER: VERIFY COURSE BELONGS TO TEACHER
  // ==========================================
  private async verifyCourseOwnership(courseId: string, teacherId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, authorId: true, title: true },
    });
    if (!course) throw new NotFoundException('Kurs topilmadi');
    if (course.authorId !== teacherId) {
      throw new ForbiddenException(
        'Siz faqat oʻzingizga biriktirilgan kurslarni boshqara olasiz',
      );
    }
    return course;
  }

  private async verifyLessonOwnership(lessonId: string, teacherId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: { select: { id: true, authorId: true, title: true } },
          },
        },
      },
    });
    if (!lesson) throw new NotFoundException('Dars topilmadi');
    if (lesson.module.course.authorId !== teacherId) {
      throw new ForbiddenException(
        'Ushbu dars sizning kursingizga tegishli emas',
      );
    }
    return lesson;
  }

  // ==========================================
  // 1. STATS & OVERVIEW
  // ==========================================
  async getTeacherStats(teacherId: string) {
    // Teacher's courses
    const courses = await this.prisma.course.findMany({
      where: { authorId: teacherId },
      select: { id: true },
    });
    const courseIds = courses.map((c) => c.id);

    // Lessons count
    const lessonsCount = await this.prisma.lesson.count({
      where: {
        module: { courseId: { in: courseIds } },
      },
    });

    // Enrolled/Active students count in teacher's courses
    const progressRecords = await this.prisma.userLessonProgress.findMany({
      where: {
        lesson: { module: { courseId: { in: courseIds } } },
      },
      select: { userId: true },
      distinct: ['userId'],
    });
    const studentsCount = progressRecords.length;

    // Tests count created by teacher
    const testsCount = await this.prisma.jlptTest.count({
      where: {
        OR: [{ authorId: teacherId }, { courseId: { in: courseIds } }],
      },
    });

    // Deletion requests pending
    const pendingDeletionCount = await this.prisma.lesson.count({
      where: {
        module: { courseId: { in: courseIds } },
        deleteRequested: true,
      },
    });

    // Recent 5 student activities
    const recentActivities = await this.prisma.userLessonProgress.findMany({
      where: {
        lesson: { module: { courseId: { in: courseIds } } },
      },
      orderBy: { lastStudiedAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        lesson: { select: { id: true, title: true, order: true } },
      },
    });

    return {
      coursesCount: courseIds.length,
      lessonsCount,
      studentsCount,
      testsCount,
      pendingDeletionCount,
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        studentName: a.user.fullName || a.user.email,
        studentEmail: a.user.email,
        studentAvatar: a.user.avatarUrl,
        lessonTitle: a.lesson.title,
        lessonOrder: a.lesson.order,
        isCompleted: a.isCompleted,
        quizScore: a.quizScore,
        studiedAt: a.lastStudiedAt,
      })),
    };
  }

  // ==========================================
  // 2. COURSES MANAGEMENT
  // ==========================================
  async getCourses(teacherId: string) {
    return this.prisma.course.findMany({
      where: { authorId: teacherId },
      orderBy: { order: 'asc' },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                order: true,
                isPublished: true,
                videoUrl: true,
                deleteRequested: true,
                deleteReason: true,
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
  }

  async getCourseById(courseId: string, teacherId: string) {
    await this.verifyCourseOwnership(courseId, teacherId);

    return this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
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
  }

  async updateCourse(courseId: string, teacherId: string, dto: any) {
    await this.verifyCourseOwnership(courseId, teacherId);

    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        title: dto.title,
        description: dto.description,
        coverImage: dto.coverImage,
        isPublished: dto.isPublished,
      },
    });
  }

  // Modules
  async createModule(
    courseId: string,
    teacherId: string,
    dto: CreateModuleDto,
  ) {
    await this.verifyCourseOwnership(courseId, teacherId);

    return this.prisma.courseModule.create({
      data: {
        courseId,
        title: dto.title,
        description: dto.description,
        order: dto.order || 1,
      },
    });
  }

  async updateModule(
    moduleId: string,
    teacherId: string,
    dto: Partial<CreateModuleDto>,
  ) {
    const mod = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!mod) throw new NotFoundException('Modul topilmadi');
    if (mod.course.authorId !== teacherId) {
      throw new ForbiddenException(
        'Ushbu modul sizning kursingizga tegishli emas',
      );
    }

    return this.prisma.courseModule.update({
      where: { id: moduleId },
      data: dto,
    });
  }

  async deleteModule(moduleId: string, teacherId: string) {
    const mod = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true, lessons: true },
    });
    if (!mod) throw new NotFoundException('Modul topilmadi');
    if (mod.course.authorId !== teacherId) {
      throw new ForbiddenException(
        'Ushbu modul sizning kursingizga tegishli emas',
      );
    }
    if (mod.lessons.length > 0) {
      throw new BadRequestException(
        'Modul ichida darslar mavjud. Avval darslarni oʻchirish soʻrovini yuboring',
      );
    }

    await this.prisma.courseModule.delete({ where: { id: moduleId } });
    return { success: true, message: 'Boʻsh modul oʻchirildi' };
  }

  // Lessons
  async createLesson(
    moduleId: string,
    teacherId: string,
    dto: CreateLessonDto,
  ) {
    const mod = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!mod) throw new NotFoundException('Modul topilmadi');
    if (mod.course.authorId !== teacherId) {
      throw new ForbiddenException(
        'Ushbu kursga dars qoʻshish huquqingiz yoʻq',
      );
    }

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

  async updateLesson(lessonId: string, teacherId: string, dto: any) {
    await this.verifyLessonOwnership(lessonId, teacherId);

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: dto.title,
        japaneseTitle: dto.japaneseTitle,
        videoUrl: dto.videoUrl,
        summary: dto.summary,
        attachments: dto.attachments,
        isPublished: dto.isPublished,
        isFree: dto.isFree,
      },
    });
  }

  // =========================================================================
  // DELETION RESTRICTION: TEACHER CANNOT DELETE LESSON WITHOUT ADMIN APPROVAL
  // =========================================================================
  async requestDeleteLesson(
    lessonId: string,
    teacherId: string,
    dto: RequestDeleteLessonDto,
  ) {
    const lesson = await this.verifyLessonOwnership(lessonId, teacherId);

    const updated = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        deleteRequested: true,
        deleteReason: dto.reason,
        isPublished: false, // Automatically unpublish while pending deletion
      },
    });

    return {
      success: true,
      message:
        'Darsni oʻchirish soʻrovi Adminga yuborildi. Dars vaqtincha yopildi.',
      lesson: updated,
    };
  }

  async cancelDeleteLessonRequest(lessonId: string, teacherId: string) {
    await this.verifyLessonOwnership(lessonId, teacherId);

    const updated = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        deleteRequested: false,
        deleteReason: null,
      },
    });

    return {
      success: true,
      message: 'Darsni oʻchirish soʻrovi bekor qilindi.',
      lesson: updated,
    };
  }

  // Dars kontenti (Kotoba, Bunpou, Kanji, Renshuu)
  async getLessonContent(lessonId: string, teacherId: string) {
    await this.verifyLessonOwnership(lessonId, teacherId);

    return this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        kotobaItems: { orderBy: { order: 'asc' } },
        bunpouItems: { orderBy: { order: 'asc' } },
        kanjiItems: { orderBy: { order: 'asc' } },
        renshuuItems: { orderBy: { order: 'asc' } },
      },
    });
  }

  async addKotoba(lessonId: string, teacherId: string, dto: any) {
    await this.verifyLessonOwnership(lessonId, teacherId);
    return this.prisma.kotobaItem.create({
      data: { ...dto, lessonId },
    });
  }

  async updateKotoba(id: string, teacherId: string, dto: any) {
    const item = await this.prisma.kotobaItem.findUnique({
      where: { id },
      include: {
        lesson: { include: { module: { include: { course: true } } } },
      },
    });
    if (!item || item.lesson.module.course.authorId !== teacherId) {
      throw new ForbiddenException('Ruxsat berilmagan');
    }
    return this.prisma.kotobaItem.update({ where: { id }, data: dto });
  }

  async deleteKotoba(id: string, teacherId: string) {
    const item = await this.prisma.kotobaItem.findUnique({
      where: { id },
      include: {
        lesson: { include: { module: { include: { course: true } } } },
      },
    });
    if (!item || item.lesson.module.course.authorId !== teacherId) {
      throw new ForbiddenException('Ruxsat berilmagan');
    }
    await this.prisma.kotobaItem.delete({ where: { id } });
    return { success: true };
  }

  async addBunpou(lessonId: string, teacherId: string, dto: any) {
    await this.verifyLessonOwnership(lessonId, teacherId);
    return this.prisma.bunpouItem.create({ data: { ...dto, lessonId } });
  }

  async updateBunpou(id: string, teacherId: string, dto: any) {
    const item = await this.prisma.bunpouItem.findUnique({
      where: { id },
      include: {
        lesson: { include: { module: { include: { course: true } } } },
      },
    });
    if (!item || item.lesson.module.course.authorId !== teacherId) {
      throw new ForbiddenException('Ruxsat berilmagan');
    }
    return this.prisma.bunpouItem.update({ where: { id }, data: dto });
  }

  async deleteBunpou(id: string, teacherId: string) {
    const item = await this.prisma.bunpouItem.findUnique({
      where: { id },
      include: {
        lesson: { include: { module: { include: { course: true } } } },
      },
    });
    if (!item || item.lesson.module.course.authorId !== teacherId) {
      throw new ForbiddenException('Ruxsat berilmagan');
    }
    await this.prisma.bunpouItem.delete({ where: { id } });
    return { success: true };
  }

  async addKanji(lessonId: string, teacherId: string, dto: any) {
    await this.verifyLessonOwnership(lessonId, teacherId);
    return this.prisma.kanjiItem.create({ data: { ...dto, lessonId } });
  }

  async updateKanji(id: string, teacherId: string, dto: any) {
    const item = await this.prisma.kanjiItem.findUnique({
      where: { id },
      include: {
        lesson: { include: { module: { include: { course: true } } } },
      },
    });
    if (!item || item.lesson.module.course.authorId !== teacherId) {
      throw new ForbiddenException('Ruxsat berilmagan');
    }
    return this.prisma.kanjiItem.update({ where: { id }, data: dto });
  }

  async deleteKanji(id: string, teacherId: string) {
    const item = await this.prisma.kanjiItem.findUnique({
      where: { id },
      include: {
        lesson: { include: { module: { include: { course: true } } } },
      },
    });
    if (!item || item.lesson.module.course.authorId !== teacherId) {
      throw new ForbiddenException('Ruxsat berilmagan');
    }
    await this.prisma.kanjiItem.delete({ where: { id } });
    return { success: true };
  }

  async addRenshuu(lessonId: string, teacherId: string, dto: any) {
    await this.verifyLessonOwnership(lessonId, teacherId);
    return this.prisma.renshuuItem.create({ data: { ...dto, lessonId } });
  }

  async updateRenshuu(id: string, teacherId: string, dto: any) {
    const item = await this.prisma.renshuuItem.findUnique({
      where: { id },
      include: {
        lesson: { include: { module: { include: { course: true } } } },
      },
    });
    if (!item || item.lesson.module.course.authorId !== teacherId) {
      throw new ForbiddenException('Ruxsat berilmagan');
    }
    return this.prisma.renshuuItem.update({ where: { id }, data: dto });
  }

  async deleteRenshuu(id: string, teacherId: string) {
    const item = await this.prisma.renshuuItem.findUnique({
      where: { id },
      include: {
        lesson: { include: { module: { include: { course: true } } } },
      },
    });
    if (!item || item.lesson.module.course.authorId !== teacherId) {
      throw new ForbiddenException('Ruxsat berilmagan');
    }
    await this.prisma.renshuuItem.delete({ where: { id } });
    return { success: true };
  }

  // ==========================================
  // 3. STUDENTS MONITORING & FEEDBACK
  // ==========================================
  async getTeacherStudents(
    teacherId: string,
    courseId?: string,
    search?: string,
  ) {
    const courses = await this.prisma.course.findMany({
      where: {
        authorId: teacherId,
        ...(courseId ? { id: courseId } : {}),
      },
      include: {
        modules: {
          include: {
            lessons: { select: { id: true } },
          },
        },
      },
    });

    const allTeacherCourseIds = courses.map((c) => c.id);
    const allTeacherLessonIds = courses.flatMap((c) =>
      c.modules.flatMap((m) => m.lessons.map((l) => l.id)),
    );

    if (allTeacherLessonIds.length === 0) {
      return [];
    }

    // Find all users who have progress in these lessons
    const progressList = await this.prisma.userLessonProgress.findMany({
      where: {
        lessonId: { in: allTeacherLessonIds },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        lesson: {
          include: { module: { select: { courseId: true } } },
        },
      },
      orderBy: { lastStudiedAt: 'desc' },
    });

    // Group by student + course
    const studentMap = new Map<string, any>();

    for (const p of progressList) {
      const studentId = p.userId;
      const cId = p.lesson.module.courseId;
      const key = `${studentId}_${cId}`;

      const matchedCourse = courses.find((c) => c.id === cId);
      const totalLessonsInCourse = matchedCourse
        ? matchedCourse.modules.reduce((sum, m) => sum + m.lessons.length, 0)
        : 1;

      if (!studentMap.has(key)) {
        studentMap.set(key, {
          studentId: p.user.id,
          fullName: p.user.fullName || p.user.email.split('@')[0],
          email: p.user.email,
          avatarUrl: p.user.avatarUrl,
          courseId: cId,
          courseTitle: matchedCourse?.title || 'Kurs',
          courseLevel: matchedCourse?.level || 'N5',
          completedLessonsCount: 0,
          totalLessonsCount: totalLessonsInCourse,
          progressPercent: 0,
          lastActivityAt: p.lastStudiedAt,
          averageQuizScore: 0,
          quizScoresSum: 0,
          quizScoresCount: 0,
        });
      }

      const entry = studentMap.get(key);
      if (p.isCompleted) {
        entry.completedLessonsCount += 1;
      }
      if (p.quizScore !== null && p.quizScore !== undefined) {
        entry.quizScoresSum += p.quizScore;
        entry.quizScoresCount += 1;
      }
      if (new Date(p.lastStudiedAt) > new Date(entry.lastActivityAt)) {
        entry.lastActivityAt = p.lastStudiedAt;
      }
    }

    const students = Array.from(studentMap.values()).map((s) => {
      s.progressPercent = Math.min(
        100,
        Math.round(
          (s.completedLessonsCount / Math.max(1, s.totalLessonsCount)) * 100,
        ),
      );
      s.averageQuizScore =
        s.quizScoresCount > 0
          ? Math.round(s.quizScoresSum / s.quizScoresCount)
          : null;
      delete s.quizScoresSum;
      delete s.quizScoresCount;
      return s;
    });

    // Apply optional search filter
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      return students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.courseTitle.toLowerCase().includes(q),
      );
    }

    return students;
  }

  async getStudentDetail(studentId: string, teacherId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    if (!student) throw new NotFoundException('Oʻquvchi topilmadi');

    // Courses by this teacher
    const courses = await this.prisma.course.findMany({
      where: { authorId: teacherId },
      include: {
        modules: {
          include: {
            lessons: {
              select: { id: true, title: true, order: true },
            },
          },
        },
      },
    });

    const teacherLessonIds = courses.flatMap((c) =>
      c.modules.flatMap((m) => m.lessons.map((l) => l.id)),
    );

    const progress = await this.prisma.userLessonProgress.findMany({
      where: {
        userId: studentId,
        lessonId: { in: teacherLessonIds },
      },
      include: {
        lesson: { select: { id: true, title: true, order: true } },
      },
      orderBy: { lastStudiedAt: 'desc' },
    });

    const feedbacks = await this.prisma.teacherFeedback.findMany({
      where: { studentId, teacherId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      student,
      progress,
      feedbacks,
    };
  }

  async sendStudentFeedback(teacherId: string, dto: CreateTeacherFeedbackDto) {
    const feedback = await this.prisma.teacherFeedback.create({
      data: {
        teacherId,
        studentId: dto.studentId,
        courseId: dto.courseId,
        lessonId: dto.lessonId,
        title: dto.title || 'Ustozingizdan tavsiya va fikr-mulohaza',
        comment: dto.comment,
        rating: dto.rating,
      },
    });

    // Automatically send an in-app Notification to the student!
    try {
      const notif = await this.prisma.notification.create({
        data: {
          title: dto.title || 'Ustozingizdan yangi baho va fikr-mulohaza! 🎓',
          message: dto.comment,
          type: 'INFO',
          targetUserId: dto.studentId,
        },
      });

      await this.prisma.userNotification.create({
        data: {
          userId: dto.studentId,
          notificationId: notif.id,
        },
      });
    } catch (e) {
      // Notification creation is best-effort
    }

    return {
      success: true,
      message: 'Fikr-mulohaza muvaffaqiyatli yuborildi!',
      feedback,
    };
  }

  async getFeedbacks(teacherId: string, studentId?: string) {
    return this.prisma.teacherFeedback.findMany({
      where: {
        teacherId,
        ...(studentId ? { studentId } : {}),
      },
      include: {
        student: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
        course: { select: { id: true, title: true } },
        lesson: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // 4. ANNOUNCEMENTS FOR STUDENTS
  // ==========================================
  async sendAnnouncement(teacherId: string, dto: CreateTeacherAnnouncementDto) {
    await this.verifyCourseOwnership(dto.courseId, teacherId);

    // Get all students enrolled in this course
    const lessons = await this.prisma.lesson.findMany({
      where: { module: { courseId: dto.courseId } },
      select: { id: true },
    });
    const lessonIds = lessons.map((l) => l.id);

    const enrollments = await this.prisma.userLessonProgress.findMany({
      where: { lessonId: { in: lessonIds } },
      select: { userId: true },
      distinct: ['userId'],
    });

    const studentIds = enrollments.map((e) => e.userId);

    // Create Notification
    const notif = await this.prisma.notification.create({
      data: {
        title: dto.title,
        message: dto.message,
        type: 'ANNOUNCEMENT',
        targetUserId: null,
      },
    });

    // Bulk create user receipts for students
    if (studentIds.length > 0) {
      await this.prisma.userNotification.createMany({
        data: studentIds.map((userId) => ({
          userId,
          notificationId: notif.id,
        })),
        skipDuplicates: true,
      });
    }

    return {
      success: true,
      message: `Eʼlon ${studentIds.length} nafar oʻquvchiga muvaffaqiyatli yuborildi!`,
      sentCount: studentIds.length,
    };
  }

  // ==========================================
  // 5. TESTS & QUIZZES MANAGEMENT
  // ==========================================
  async getTeacherTests(teacherId: string) {
    const courses = await this.prisma.course.findMany({
      where: { authorId: teacherId },
      select: { id: true },
    });
    const courseIds = courses.map((c) => c.id);

    return this.prisma.jlptTest.findMany({
      where: {
        OR: [{ authorId: teacherId }, { courseId: { in: courseIds } }],
      },
      include: {
        course: { select: { id: true, title: true, level: true } },
        _count: { select: { questions: true, userResults: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTestById(testId: string, teacherId: string) {
    const test = await this.prisma.jlptTest.findUnique({
      where: { id: testId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        course: { select: { id: true, title: true, authorId: true } },
      },
    });
    if (!test) throw new NotFoundException('Test topilmadi');
    if (test.authorId !== teacherId && test.course?.authorId !== teacherId) {
      throw new ForbiddenException(
        'Ushbu test sizning kursingizga tegishli emas',
      );
    }
    return test;
  }

  async createTest(teacherId: string, dto: CreateTestDto) {
    if (dto.courseId) {
      await this.verifyCourseOwnership(dto.courseId, teacherId);
    }

    return this.prisma.jlptTest.create({
      data: {
        title: dto.title,
        slug:
          dto.slug ||
          dto.title.toLowerCase().replace(/\s+/g, '-') +
            '-' +
            Date.now().toString().slice(-4),
        description: dto.description,
        level: dto.level as any,
        category: (dto.category as any) || 'MOCK_EXAM',
        durationMinutes: dto.durationMinutes || 45,
        passingScore: dto.passingScore || 60,
        totalScore: dto.totalScore || 180,
        audioUrl: dto.audioUrl || undefined,
        isPublished: dto.isPublished ?? true,
        authorId: teacherId,
        courseId: dto.courseId,
      },
    });
  }

  async updateTest(testId: string, teacherId: string, dto: UpdateTestDto) {
    await this.getTestById(testId, teacherId);

    return this.prisma.jlptTest.update({
      where: { id: testId },
      data: dto as any,
    });
  }

  async deleteTest(testId: string, teacherId: string) {
    await this.getTestById(testId, teacherId);

    await this.prisma.jlptTest.delete({ where: { id: testId } });
    return { success: true, message: 'Test oʻchirildi' };
  }

  async createQuestion(
    testId: string,
    teacherId: string,
    dto: CreateQuestionDto,
  ) {
    await this.getTestById(testId, teacherId);

    return this.prisma.jlptQuestion.create({
      data: {
        testId,
        section: dto.section || 'KOTOBA',
        mondaiTitle: dto.mondaiTitle,
        questionText: dto.questionText,
        options: dto.options,
        correctAnswer: dto.correctAnswer,
        explanation: dto.explanation,
        points: dto.points || 2,
        order: dto.order || 1,
      },
    });
  }

  async updateQuestion(
    questionId: string,
    teacherId: string,
    dto: UpdateQuestionDto,
  ) {
    const q = await this.prisma.jlptQuestion.findUnique({
      where: { id: questionId },
      include: { test: { include: { course: true } } },
    });
    if (!q) throw new NotFoundException('Savol topilmadi');
    if (
      q.test.authorId !== teacherId &&
      q.test.course?.authorId !== teacherId
    ) {
      throw new ForbiddenException('Ushbu savolni tahrirlash huquqingiz yoʻq');
    }

    return this.prisma.jlptQuestion.update({
      where: { id: questionId },
      data: dto as any,
    });
  }

  async deleteQuestion(questionId: string, teacherId: string) {
    const q = await this.prisma.jlptQuestion.findUnique({
      where: { id: questionId },
      include: { test: { include: { course: true } } },
    });
    if (!q) throw new NotFoundException('Savol topilmadi');
    if (
      q.test.authorId !== teacherId &&
      q.test.course?.authorId !== teacherId
    ) {
      throw new ForbiddenException('Ushbu savolni oʻchirish huquqingiz yoʻq');
    }

    await this.prisma.jlptQuestion.delete({ where: { id: questionId } });
    return { success: true, message: 'Savol oʻchirildi' };
  }
}
