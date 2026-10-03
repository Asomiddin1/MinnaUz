import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(private prisma: PrismaService) {}

  async getUserStats(userId?: string) {
    const allCourses = await this.prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                japaneseTitle: true,
                slug: true,
                order: true,
                summary: true,
                kotobaItems: { select: { id: true } },
              },
            },
          },
        },
      },
    });

    const totalLessons = allCourses.reduce(
      (sum, c) =>
        sum + c.modules.reduce((mSum, m) => mSum + m.lessons.length, 0),
      0,
    );

    if (!userId) {
      const defaultCourse = allCourses[0];
      const defaultLesson = defaultCourse?.modules[0]?.lessons[0];
      const defaultTotal = defaultCourse
        ? defaultCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)
        : 25;

      return {
        streakDays: 1,
        wordsLearned: 0,
        completedLessons: 0,
        totalLessons: totalLessons || 50,
        n5ProgressPercent: 0,
        recentLessons: [],
        studyPlan: {
          targetLevel: 'N5',
          weeklyGoalHours: 4,
          dailyMinutes: 35,
          targetMonths: 6,
          isConfigured: false,
        },
        activeCourse: defaultCourse
          ? {
              id: defaultCourse.id,
              slug: defaultCourse.slug,
              title: defaultCourse.title,
              level: defaultCourse.level,
              totalLessons: defaultTotal,
              completedLessons: 0,
              progressPercent: 0,
              nextLesson: defaultLesson
                ? {
                    id: defaultLesson.id,
                    title: defaultLesson.title,
                    japaneseTitle: defaultLesson.japaneseTitle,
                    order: defaultLesson.order,
                    summary: defaultLesson.summary,
                    category: 'Tanishtiruv va asoslar',
                    progressPercent: 0,
                  }
                : null,
            }
          : null,
        studyTime: {
          totalMinutes: 0,
          totalHours: 0,
          totalMinutesRemainder: 0,
          todayMinutes: 0,
          todayHours: 0,
          todayMinutesRemainder: 0,
          weeklyMinutes: 0,
          weeklyGoalMinutes: 240,
          weeklyProgressPercent: 0,
          weeklyActivity: [
            { day: 'Du', date: '', minutes: 0, height: 'h-4', active: false },
            { day: 'Se', date: '', minutes: 0, height: 'h-4', active: false },
            { day: 'Ch', date: '', minutes: 0, height: 'h-4', active: false },
            { day: 'Pa', date: '', minutes: 0, height: 'h-4', active: false },
            { day: 'Ju', date: '', minutes: 0, height: 'h-4', active: false },
            { day: 'Sh', date: '', minutes: 0, height: 'h-4', active: false },
            { day: 'Ya', date: '', minutes: 0, height: 'h-4', active: false },
          ],
        },
        activeDates: [new Date().getDate()],
      };
    }

    const [allUserProgress, studyActivities, studyPlan] = await Promise.all([
      this.prisma.userLessonProgress.findMany({
        where: { userId },
        include: {
          lesson: {
            include: {
              kotobaItems: { select: { id: true } },
              module: { include: { course: true } },
            },
          },
        },
        orderBy: { lastStudiedAt: 'desc' },
      }),
      (this.prisma as any).userStudyActivity.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
      (this.prisma as any).userStudyPlan.findUnique({
        where: { userId },
      }),
    ]);

    const completedProgress = allUserProgress.filter((p) => p.isCompleted);
    const progressMap = new Map(allUserProgress.map((p) => [p.lessonId, p]));

    // 1. Calculate words learned
    const wordsLearned = completedProgress.reduce(
      (sum, p) => sum + (p.lesson?.kotobaItems?.length || 0),
      0,
    );

    // 2. Calculate streak & active days
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const studyDates = new Set<string>();
    allUserProgress.forEach((p) => {
      if (p.lastStudiedAt) {
        studyDates.add(new Date(p.lastStudiedAt).toISOString().split('T')[0]);
      }
    });
    studyActivities.forEach((a: any) => {
      if (a.date) {
        studyDates.add(a.date);
      }
    });

    const uniqueDays = Array.from(studyDates);
    const streakDays = Math.max(1, uniqueDays.length);

    // Extract day numbers in the current month for Calendar
    const activeDates: number[] = [];
    uniqueDays.forEach((dateStr) => {
      const d = new Date(dateStr);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        activeDates.push(d.getDate());
      }
    });
    if (!activeDates.includes(today.getDate())) {
      activeDates.push(today.getDate());
    }

    // 3. User Target JLPT Level Progress percent
    const targetLevel = studyPlan?.targetLevel || 'N5';
    const totalTargetLessons = allCourses
      .filter((c) => c.level === targetLevel)
      .reduce(
        (sum, c) =>
          sum + c.modules.reduce((mSum, m) => mSum + m.lessons.length, 0),
        0,
      );
    const completedTargetLessons = completedProgress.filter(
      (p) => p.lesson?.module?.course?.level === targetLevel,
    ).length;
    const n5ProgressPercent =
      totalTargetLessons > 0
        ? Math.round((completedTargetLessons / totalTargetLessons) * 100)
        : 0;

    // 4. Find Active Course & Next Lesson (prioritize targetLevel course if available)
    let activeCourseData =
      allCourses.find((c) => c.level === targetLevel) || allCourses[0];
    if (
      allUserProgress.length > 0 &&
      allUserProgress[0].lesson?.module?.course
    ) {
      const matched = allCourses.find(
        (c) => c.id === allUserProgress[0].lesson.module.course.id,
      );
      if (matched) activeCourseData = matched;
    }

    let activeCourse: any = null;
    if (activeCourseData) {
      const courseLessons = activeCourseData.modules.flatMap((m) => m.lessons);
      const courseTotal = courseLessons.length;
      const courseCompleted = courseLessons.filter(
        (l) => progressMap.get(l.id)?.isCompleted,
      ).length;
      const courseProgressPercent =
        courseTotal > 0 ? Math.round((courseCompleted / courseTotal) * 100) : 0;

      // Find next uncompleted lesson
      let nextLessonObj = courseLessons.find(
        (l) => !progressMap.get(l.id)?.isCompleted,
      );
      if (!nextLessonObj && courseLessons.length > 0) {
        nextLessonObj = courseLessons[courseLessons.length - 1];
      }

      let nextLessonData: any = null;
      if (nextLessonObj) {
        const nextProg = progressMap.get(nextLessonObj.id);
        const completedSecs = ((nextProg?.completedSections as string[]) || [])
          .length;
        const lessonProgressPercent = Math.min(
          100,
          Math.round((completedSecs / 4) * 100),
        );

        let category = 'Grammatika';
        if (completedSecs === 0) category = 'Kirish va Lugʻat';
        else if (completedSecs === 1) category = 'Grammatika';
        else if (completedSecs === 2) category = 'Kanji';
        else if (completedSecs >= 3) category = 'Mashqlar';

        nextLessonData = {
          id: nextLessonObj.id,
          title: nextLessonObj.title,
          japaneseTitle: nextLessonObj.japaneseTitle,
          order: nextLessonObj.order,
          summary: nextLessonObj.summary,
          category,
          progressPercent: lessonProgressPercent,
        };
      }

      activeCourse = {
        id: activeCourseData.id,
        slug: activeCourseData.slug,
        title: activeCourseData.title,
        level: activeCourseData.level,
        totalLessons: courseTotal,
        completedLessons: courseCompleted,
        progressPercent: courseProgressPercent,
        nextLesson: nextLessonData,
      };
    }

    // 5. Study Time & Weekly Activity calculation
    const activityMap = new Map<string, number>();
    studyActivities.forEach((a: any) => {
      activityMap.set(a.date, a.minutesSpent);
    });

    // Estimate base minutes from progress if not in activity map
    allUserProgress.forEach((p) => {
      if (p.lastStudiedAt) {
        const dStr = new Date(p.lastStudiedAt).toISOString().split('T')[0];
        const secsCount = ((p.completedSections as string[]) || []).length;
        const estMinutes = p.isCompleted ? 25 : Math.max(10, secsCount * 6);
        const current = activityMap.get(dStr) || 0;
        if (current < estMinutes) {
          activityMap.set(dStr, Math.max(current, estMinutes));
        }
      }
    });

    // If today is active, guarantee at least realistic initial active time (e.g. 15 min base)
    if (!activityMap.has(todayStr) || activityMap.get(todayStr)! < 15) {
      const curr = activityMap.get(todayStr) || 0;
      activityMap.set(todayStr, Math.max(curr, 15));
    }

    let totalMinutes = 0;
    activityMap.forEach((mins) => {
      totalMinutes += mins;
    });
    totalMinutes = Math.max(totalMinutes, 15);

    const totalHours = Math.floor(totalMinutes / 60);
    const totalMinutesRemainder = totalMinutes % 60;

    const todayMinutes = activityMap.get(todayStr) || 15;
    const todayHours = Math.floor(todayMinutes / 60);
    const todayMinutesRemainder = todayMinutes % 60;

    // Calculate 7-day Monday to Sunday weekly activity
    const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);

    const dayLabels = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
    let weeklyMinutes = 0;
    const weeklyActivity = dayLabels.map((dayLabel, idx) => {
      const currentDayDate = new Date(monday);
      currentDayDate.setDate(monday.getDate() + idx);
      const dStr = currentDayDate.toISOString().split('T')[0];
      const mins =
        activityMap.get(dStr) || (idx === dayOfWeek ? todayMinutes : 0);
      weeklyMinutes += mins;

      // Determine height bar
      let height = 'h-4';
      if (mins >= 60) height = 'h-20';
      else if (mins >= 45) height = 'h-16';
      else if (mins >= 30) height = 'h-12';
      else if (mins >= 15) height = 'h-8';
      else if (mins > 0) height = 'h-6';

      return {
        day: dayLabel,
        date: dStr,
        minutes: mins,
        height,
        active: idx === dayOfWeek,
      };
    });

    const weeklyGoalHours = studyPlan?.weeklyGoalHours || 4;
    const weeklyGoalMinutes = weeklyGoalHours * 60;
    const weeklyProgressPercent = Math.min(
      100,
      Math.round((weeklyMinutes / weeklyGoalMinutes) * 100),
    );

    const recentLessons = completedProgress.slice(0, 3).map((p) => ({
      id: p.lesson.id,
      title: p.lesson.title,
      japaneseTitle: p.lesson.japaneseTitle,
      courseTitle: p.lesson.module.course.title,
      courseSlug: p.lesson.module.course.slug,
      isCompleted: p.isCompleted,
      quizScore: p.quizScore,
    }));

    return {
      streakDays,
      wordsLearned,
      completedLessons: completedProgress.length,
      totalLessons: totalLessons || 50,
      n5ProgressPercent,
      recentLessons,
      activeCourse,
      studyPlan: studyPlan
        ? {
            targetLevel: studyPlan.targetLevel,
            weeklyGoalHours: studyPlan.weeklyGoalHours,
            dailyMinutes: studyPlan.dailyMinutes,
            targetMonths: studyPlan.targetMonths,
            isConfigured: studyPlan.isConfigured,
          }
        : {
            targetLevel: 'N5',
            weeklyGoalHours: 4,
            dailyMinutes: 35,
            targetMonths: 6,
            isConfigured: false,
          },
      studyTime: {
        totalMinutes,
        totalHours,
        totalMinutesRemainder,
        todayMinutes,
        todayHours,
        todayMinutesRemainder,
        weeklyMinutes,
        weeklyGoalMinutes,
        weeklyProgressPercent,
        weeklyActivity,
      },
      activeDates,
    };
  }

  async getUserStudyPlan(userId: string) {
    const plan = await (this.prisma as any).userStudyPlan.findUnique({
      where: { userId },
    });
    if (plan) return plan;
    return {
      userId,
      targetLevel: 'N5',
      weeklyGoalHours: 4,
      dailyMinutes: 35,
      targetMonths: 6,
      isConfigured: false,
    };
  }

  async saveUserStudyPlan(
    userId: string,
    dto: {
      targetLevel?: string;
      weeklyGoalHours?: number;
      dailyMinutes?: number;
      targetMonths?: number;
    },
  ) {
    const validLevels = ['N5', 'N4', 'N3', 'N2', 'N1', 'OTHER'];
    const targetLevel = validLevels.includes(dto.targetLevel || '')
      ? dto.targetLevel
      : 'N5';
    const weeklyGoalHours = Math.max(
      1,
      Math.min(40, Number(dto.weeklyGoalHours) || 4),
    );
    const dailyMinutes = Math.max(
      10,
      Math.min(
        240,
        Number(dto.dailyMinutes) || Math.round((weeklyGoalHours * 60) / 6),
      ),
    );
    const targetMonths = Math.max(
      1,
      Math.min(36, Number(dto.targetMonths) || 6),
    );

    return (this.prisma as any).userStudyPlan.upsert({
      where: { userId },
      update: {
        targetLevel,
        weeklyGoalHours,
        dailyMinutes,
        targetMonths,
        isConfigured: true,
      },
      create: {
        userId,
        targetLevel,
        weeklyGoalHours,
        dailyMinutes,
        targetMonths,
        isConfigured: true,
      },
    });
  }

  async logStudyTime(userId: string, minutes: number) {
    const todayStr = new Date().toISOString().split('T')[0];
    const minsToAdd = Math.max(1, Math.min(120, Number(minutes) || 1));

    const existing = await (this.prisma as any).userStudyActivity.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayStr,
        },
      },
    });

    if (existing) {
      return (this.prisma as any).userStudyActivity.update({
        where: { id: existing.id },
        data: {
          minutesSpent: existing.minutesSpent + minsToAdd,
        },
      });
    }

    return (this.prisma as any).userStudyActivity.create({
      data: {
        userId,
        date: todayStr,
        minutesSpent: minsToAdd,
      },
    });
  }

  async getCourses(userId?: string) {
    const courses = await this.prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
        modules: {
          include: {
            lessons: {
              where: { isPublished: true },
              select: { id: true },
            },
          },
        },
      },
    });

    // If user is authenticated, compute progress for each course
    const userProgressMap: Record<string, number> = {};
    if (userId) {
      const completedProgress = await this.prisma.userLessonProgress.findMany({
        where: {
          userId,
          isCompleted: true,
        },
        select: { lessonId: true },
      });
      const completedLessonIds = new Set(
        completedProgress.map((p) => p.lessonId),
      );

      for (const course of courses) {
        const allLessonIds = course.modules.flatMap((m) =>
          m.lessons.map((l) => l.id),
        );
        const total = allLessonIds.length;
        if (total === 0) {
          userProgressMap[course.id] = 0;
        } else {
          const completedCount = allLessonIds.filter((id) =>
            completedLessonIds.has(id),
          ).length;
          userProgressMap[course.id] = Math.round(
            (completedCount / total) * 100,
          );
        }
      }
    }

    return courses.map((course) => {
      const totalLessons = course.modules.reduce(
        (acc, m) => acc + m.lessons.length,
        0,
      );
      const totalModules = course.modules.length;
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        level: course.level,
        coverImage: course.coverImage,
        author: course.author,
        totalLessons,
        totalModules,
        progress: userProgressMap[course.id] || 0,
      };
    });
  }
  private async checkUserIsPro(userId?: string): Promise<boolean> {
    if (!userId) return false;
    const activeSub = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
      },
    });
    return !!activeSub;
  }

  async getCourseDetails(idOrSlug: string, userId?: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              where: { isPublished: true },
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

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    const isPro = await this.checkUserIsPro(userId);

    // Get user progress for all lessons in this course
    const progressMap: Record<
      string,
      { isCompleted: boolean; quizScore?: number; completedSections?: string[] }
    > = {};
    if (userId) {
      const allLessonIds = course.modules.flatMap((m) =>
        m.lessons.map((l) => l.id),
      );
      const userProgress = await this.prisma.userLessonProgress.findMany({
        where: {
          userId,
          lessonId: { in: allLessonIds },
        },
      });
      userProgress.forEach((p) => {
        progressMap[p.lessonId] = {
          isCompleted: p.isCompleted,
          quizScore: p.quizScore ?? undefined,
          completedSections: (p.completedSections as string[]) || [],
        };
      });
    }

    // Determine lock state: N5 lessons 1-5 are free; subsequent lessons or N4+ require Pro
    let previousLessonCompleted = true;
    const modulesWithState = course.modules.map((mod) => {
      const lessonsWithState = mod.lessons.map((lesson) => {
        const prog = progressMap[lesson.id];
        const isCompleted = prog?.isCompleted || false;
        const isCurrent = !isCompleted && previousLessonCompleted;
        const isProRequired = !lesson.isFree;
        const isLockedBySub = isProRequired && !isPro;
        const isLocked =
          (!previousLessonCompleted && !isCompleted) || isLockedBySub;

        // update flag for next lesson
        previousLessonCompleted = isCompleted;

        return {
          ...lesson,
          status: isCompleted
            ? 'COMPLETED'
            : isCurrent
              ? 'CURRENT'
              : isLocked
                ? 'LOCKED'
                : 'AVAILABLE',
          isCompleted,
          isLocked,
          isFree: lesson.isFree,
          isProRequired,
          lockReason: isLockedBySub
            ? 'PRO_REQUIRED'
            : !previousLessonCompleted && !isCompleted
              ? 'PREVIOUS_INCOMPLETE'
              : null,
          quizScore: prog?.quizScore || null,
          completedSections: prog?.completedSections || [],
          counts: lesson._count,
        };
      });

      return {
        ...mod,
        lessons: lessonsWithState,
      };
    });

    const totalLessons = course.modules.reduce(
      (acc, m) => acc + m.lessons.length,
      0,
    );
    const completedLessons = Object.values(progressMap).filter(
      (p) => p.isCompleted,
    ).length;
    const overallProgress =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      level: course.level,
      coverImage: course.coverImage,
      author: course.author,
      totalLessons,
      completedLessons,
      progressPercent: overallProgress,
      modules: modulesWithState,
    };
  }

  async getLesson(lessonId: string, userId?: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  orderBy: { order: 'asc' },
                  include: {
                    lessons: {
                      where: { isPublished: true },
                      orderBy: { order: 'asc' },
                      select: { id: true, title: true, order: true },
                    },
                  },
                },
              },
            },
            lessons: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
              select: { id: true, title: true, order: true },
            },
          },
        },
        kotobaItems: { orderBy: { order: 'asc' } },
        bunpouItems: { orderBy: { order: 'asc' } },
        kanjiItems: { orderBy: { order: 'asc' } },
        renshuuItems: { orderBy: { order: 'asc' } },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    const isPro = await this.checkUserIsPro(userId);
    const isProRequired = !lesson.isFree;

    // Flatten all course lessons in chronological order
    const allCourseLessons = lesson.module.course.modules.flatMap(
      (m) => m.lessons,
    );
    const currentIndex = allCourseLessons.findIndex((l) => l.id === lesson.id);
    const prevLesson =
      currentIndex > 0 ? allCourseLessons[currentIndex - 1] : null;
    const nextLesson =
      currentIndex < allCourseLessons.length - 1
        ? allCourseLessons[currentIndex + 1]
        : null;

    let userProgress: any = null;
    let isLocked = false;
    let lockReason: string | null = null;

    if (userId) {
      userProgress = await this.prisma.userLessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
      });

      if (isProRequired && !isPro) {
        isLocked = true;
        lockReason = 'PRO_REQUIRED';
      } else if (prevLesson && !userProgress?.isCompleted) {
        const prevProgress = await this.prisma.userLessonProgress.findUnique({
          where: {
            userId_lessonId: {
              userId,
              lessonId: prevLesson.id,
            },
          },
        });
        if (!prevProgress || !prevProgress.isCompleted) {
          isLocked = true;
          lockReason = 'PREVIOUS_INCOMPLETE';
        }
      }
    } else {
      if (isProRequired) {
        isLocked = true;
        lockReason = 'PRO_REQUIRED';
      } else if (currentIndex > 0) {
        isLocked = false;
      }
    }

    return {
      id: lesson.id,
      title: lesson.title,
      japaneseTitle: lesson.japaneseTitle,
      slug: lesson.slug,
      order: lesson.order,
      videoUrl: lesson.videoUrl,
      summary: lesson.summary,
      kaiwaScenario: lesson.kaiwaScenario,
      isLocked,
      lockReason,
      isFree: lesson.isFree,
      isProRequired,
      module: {
        id: lesson.module.id,
        title: lesson.module.title,
        courseId: lesson.module.course.id,
        courseTitle: lesson.module.course.title,
        courseSlug: lesson.module.course.slug,
      },
      navigation: {
        prevLesson,
        nextLesson,
      },
      content: {
        kotoba: lesson.kotobaItems,
        bunpou: lesson.bunpouItems,
        kanji: lesson.kanjiItems,
        renshuu: lesson.renshuuItems,
      },
      userProgress: userProgress
        ? {
            completedSections:
              (userProgress.completedSections as string[]) || [],
            quizScore: userProgress.quizScore,
            isCompleted: userProgress.isCompleted,
            lastStudiedAt: userProgress.lastStudiedAt,
          }
        : {
            completedSections: [],
            quizScore: null,
            isCompleted: false,
          },
    };
  }

  async updateProgress(
    userId: string,
    lessonId: string,
    dto: UpdateProgressDto,
  ) {
    const existing = await this.prisma.userLessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    let currentSections: string[] =
      (existing?.completedSections as string[]) || [];
    if (dto.completedSections && Array.isArray(dto.completedSections)) {
      const merged = new Set([...currentSections, ...dto.completedSections]);
      currentSections = Array.from(merged);
    }

    const isCompleted =
      dto.isCompleted !== undefined
        ? dto.isCompleted
        : (dto.quizScore !== undefined && dto.quizScore >= 70) ||
          existing?.isCompleted ||
          false;

    const progress = await this.prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        completedSections: currentSections,
        quizScore:
          dto.quizScore !== undefined ? dto.quizScore : existing?.quizScore,
        isCompleted,
        lastStudiedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        completedSections: currentSections,
        quizScore: dto.quizScore ?? null,
        isCompleted,
        lastStudiedAt: new Date(),
      },
    });

    // Automatically record study activity time (5 mins per section progress / 10 mins if completed)
    try {
      const minsToAdd = isCompleted ? 10 : 5;
      await this.logStudyTime(userId, minsToAdd);
    } catch {
      // ignore
    }

    // Award real coins on completing a lesson (10 coins + 5 extra if 100% quiz)
    let earnedCoins = 0;
    if (isCompleted && !existing?.isCompleted) {
      earnedCoins = 10;
      if (dto.quizScore === 100) {
        earnedCoins += 5;
      }

      try {
        await this.prisma.$transaction([
          this.prisma.user.update({
            where: { id: userId },
            data: { coins: { increment: earnedCoins } },
          }),
          this.prisma.coinTransaction.create({
            data: {
              userId,
              amount: earnedCoins,
              type: 'LESSON_COMPLETED',
              description: `Darsni yakunlaganingiz uchun (${
                dto.quizScore === 100 ? '100% aʼlo natija bilan! ' : ''
              })mukofot tangalari`,
            },
          }),
        ]);
      } catch (err) {
        this.logger.warn(`Failed to award lesson coins: ${err}`);
      }
    }

    return {
      success: true,
      earnedCoins,
      progress: {
        completedSections: progress.completedSections,
        quizScore: progress.quizScore,
        isCompleted: progress.isCompleted,
      },
    };
  }

  // === VOCABULARY & FLASHCARDS ===
  async getAllUserVocab(userId?: string) {
    const isPro = await this.checkUserIsPro(userId);

    const lessons = await this.prisma.lesson.findMany({
      where: {
        isPublished: true,
        module: { course: { isPublished: true } },
        ...(isPro ? {} : { isFree: true }),
      },
      include: {
        module: {
          include: {
            course: {
              select: { id: true, title: true, slug: true, level: true },
            },
          },
        },
        kotobaItems: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
    });

    let lockedWordCount = 0;
    if (!isPro) {
      lockedWordCount = await this.prisma.kotobaItem.count({
        where: {
          lesson: {
            isPublished: true,
            isFree: false,
            module: { course: { isPublished: true } },
          },
        },
      });
    }

    const userProgress = userId
      ? await (this.prisma as any).userKotobaProgress.findMany({
          where: { userId },
        })
      : [];
    const progressMap = new Map(userProgress.map((p: any) => [p.kotobaId, p]));

    const words = lessons.flatMap((l) =>
      l.kotobaItems.map((k) => {
        const prog: any = progressMap.get(k.id);
        return {
          id: k.id,
          word: k.word,
          furigana: k.furigana || k.word,
          romaji: k.romaji || '',
          meaningUz: k.meaningUz,
          meaningRu: k.meaningRu || '',
          meaningEn: k.meaningEn || '',
          partOfSpeech: k.partOfSpeech || 'Ot',
          audioUrl: k.audioUrl,
          sampleSentence: k.sampleSentence,
          sampleSentenceUz: k.sampleSentenceUz,
          order: k.order,
          lessonId: l.id,
          lessonTitle: l.title,
          lessonJapaneseTitle: l.japaneseTitle,
          lessonOrder: l.order,
          courseId: l.module.course.id,
          courseTitle: l.module.course.title,
          courseLevel: l.module.course.level,
          flashcardStatus: prog ? prog.status : null,
          reviewCount: prog ? prog.reviewCount : 0,
        };
      }),
    );

    return {
      words,
      totalCount: words.length,
      lockedWordCount,
      isPro,
    };
  }

  async setFlashcardStatus(
    userId: string,
    kotobaId: string,
    status?: 'LEARNING' | 'MASTERED',
  ) {
    const targetStatus = status || 'LEARNING';
    return (this.prisma as any).userKotobaProgress.upsert({
      where: { userId_kotobaId: { userId, kotobaId } },
      update: {
        status: targetStatus,
        reviewCount: { increment: 1 },
        lastReviewedAt: new Date(),
      },
      create: {
        userId,
        kotobaId,
        status: targetStatus,
        reviewCount: 1,
        lastReviewedAt: new Date(),
      },
    });
  }

  async batchAddFlashcards(
    userId: string,
    kotobaIds: string[],
    status?: 'LEARNING' | 'MASTERED',
  ) {
    const targetStatus = status || 'LEARNING';
    const operations = kotobaIds.map((kotobaId) =>
      (this.prisma as any).userKotobaProgress.upsert({
        where: { userId_kotobaId: { userId, kotobaId } },
        update: {
          status: targetStatus,
          lastReviewedAt: new Date(),
        },
        create: {
          userId,
          kotobaId,
          status: targetStatus,
          reviewCount: 1,
          lastReviewedAt: new Date(),
        },
      }),
    );
    await this.prisma.$transaction(operations);
    return { success: true, count: kotobaIds.length };
  }

  async removeFlashcard(userId: string, kotobaId: string) {
    await (this.prisma as any).userKotobaProgress.deleteMany({
      where: { userId, kotobaId },
    });
    return { success: true };
  }

  async batchRemoveFlashcards(userId: string, kotobaIds: string[]) {
    await (this.prisma as any).userKotobaProgress.deleteMany({
      where: {
        userId,
        kotobaId: { in: kotobaIds },
      },
    });
    return { success: true, count: kotobaIds.length };
  }

  async getVocabStats(userId: string) {
    const items = await (this.prisma as any).userKotobaProgress.findMany({
      where: { userId },
      select: { status: true },
    });

    const totalLearning = items.filter(
      (i: any) => i.status === 'LEARNING',
    ).length;
    const totalMastered = items.filter(
      (i: any) => i.status === 'MASTERED',
    ).length;

    return {
      totalLearning,
      totalMastered,
      totalSaved: items.length,
    };
  }

  // === KANJI & FLASHCARDS ===
  async getAllUserKanji(userId?: string) {
    const isPro = await this.checkUserIsPro(userId);

    const lessons = await this.prisma.lesson.findMany({
      where: {
        isPublished: true,
        module: { course: { isPublished: true } },
        ...(isPro ? {} : { isFree: true }),
      },
      include: {
        module: {
          include: {
            course: {
              select: { id: true, title: true, slug: true, level: true },
            },
          },
        },
        kanjiItems: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
    });

    let lockedKanjiCount = 0;
    if (!isPro) {
      lockedKanjiCount = await this.prisma.kanjiItem.count({
        where: {
          lesson: {
            isPublished: true,
            isFree: false,
            module: { course: { isPublished: true } },
          },
        },
      });
    }

    const userProgress = userId
      ? await (this.prisma as any).userKanjiProgress.findMany({
          where: { userId },
        })
      : [];
    const progressMap = new Map(userProgress.map((p: any) => [p.kanjiId, p]));

    const kanji = lessons.flatMap((l) =>
      l.kanjiItems.map((k) => {
        const prog: any = progressMap.get(k.id);
        return {
          id: k.id,
          character: k.character,
          onyomi: k.onyomi || '',
          kunyomi: k.kunyomi || '',
          meaningUz: k.meaningUz,
          meaningRu: k.meaningRu || '',
          strokeCount: k.strokeCount || 1,
          strokeOrderData: k.strokeOrderData,
          radical: k.radical || '',
          examples: (k.examples as any) || [],
          order: k.order,
          lessonId: l.id,
          lessonTitle: l.title,
          lessonJapaneseTitle: l.japaneseTitle,
          lessonOrder: l.order,
          courseId: l.module.course.id,
          courseTitle: l.module.course.title,
          courseLevel: l.module.course.level,
          flashcardStatus: prog ? prog.status : null,
          reviewCount: prog ? prog.reviewCount : 0,
        };
      }),
    );

    return {
      kanji,
      totalCount: kanji.length,
      lockedKanjiCount,
      isPro,
    };
  }

  async setKanjiFlashcardStatus(
    userId: string,
    kanjiId: string,
    status?: 'LEARNING' | 'MASTERED',
  ) {
    const targetStatus = status || 'LEARNING';
    return (this.prisma as any).userKanjiProgress.upsert({
      where: { userId_kanjiId: { userId, kanjiId } },
      update: {
        status: targetStatus,
        reviewCount: { increment: 1 },
        lastReviewedAt: new Date(),
      },
      create: {
        userId,
        kanjiId,
        status: targetStatus,
        reviewCount: 1,
        lastReviewedAt: new Date(),
      },
    });
  }

  async batchAddKanjiFlashcards(
    userId: string,
    kanjiIds: string[],
    status?: 'LEARNING' | 'MASTERED',
  ) {
    const targetStatus = status || 'LEARNING';
    const operations = kanjiIds.map((kanjiId) =>
      (this.prisma as any).userKanjiProgress.upsert({
        where: { userId_kanjiId: { userId, kanjiId } },
        update: {
          status: targetStatus,
          lastReviewedAt: new Date(),
        },
        create: {
          userId,
          kanjiId,
          status: targetStatus,
          reviewCount: 1,
          lastReviewedAt: new Date(),
        },
      }),
    );
    await this.prisma.$transaction(operations);
    return { success: true, count: kanjiIds.length };
  }

  async removeKanjiFlashcard(userId: string, kanjiId: string) {
    await (this.prisma as any).userKanjiProgress.deleteMany({
      where: { userId, kanjiId },
    });
    return { success: true };
  }

  async batchRemoveKanjiFlashcards(userId: string, kanjiIds: string[]) {
    await (this.prisma as any).userKanjiProgress.deleteMany({
      where: {
        userId,
        kanjiId: { in: kanjiIds },
      },
    });
    return { success: true, count: kanjiIds.length };
  }

  async getKanjiStats(userId: string) {
    const items = await (this.prisma as any).userKanjiProgress.findMany({
      where: { userId },
      select: { status: true },
    });

    const totalLearning = items.filter(
      (i: any) => i.status === 'LEARNING',
    ).length;
    const totalMastered = items.filter(
      (i: any) => i.status === 'MASTERED',
    ).length;

    return {
      totalLearning,
      totalMastered,
      totalSaved: items.length,
    };
  }
}
