import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitTestDto } from './dto/submit-test.dto';
import { QueryTestsDto } from './dto/query-tests.dto';
import {
  CreateTestDto,
  UpdateTestDto,
  CreateQuestionDto,
  UpdateQuestionDto,
} from './dto/admin-test.dto';

@Injectable()
export class TestsService {
  private readonly logger = new Logger(TestsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 1. Get all tests with user's latest status
  async findAll(userId?: string, query?: QueryTestsDto) {
    const where: any = { isPublished: true };
    if (query?.level) where.level = query.level;
    if (query?.category) where.category = query.category;

    const tests = await this.prisma.jlptTest.findMany({
      where,
      orderBy: [{ level: 'desc' }, { order: 'asc' }],
      include: {
        _count: {
          select: { questions: true },
        },
        ...(userId
          ? {
              userResults: {
                where: { userId },
                orderBy: { completedAt: 'desc' },
                take: 1,
              },
            }
          : {}),
      },
    });

    return tests.map((t: any) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      description: t.description,
      level: t.level,
      category: t.category,
      durationMinutes: t.durationMinutes,
      passingScore: t.passingScore,
      totalScore: t.totalScore,
      audioUrl: t.audioUrl,
      order: t.order,
      isPremium: t.isPremium ?? false,
      questionCount: t._count.questions,
      latestResult: t.userResults?.[0] || null,
    }));
  }

  // 2. Get user's JLPT testing statistics
  async getStats(userId: string) {
    const results = await this.prisma.userTestResult.findMany({
      where: { userId },
      select: {
        score: true,
        percentage: true,
        isPassed: true,
        timeSpentSeconds: true,
        answers: true,
      },
    });

    const totalTestsTaken = results.length;
    const passedCount = results.filter((r) => r.isPassed).length;
    const avgPercentage =
      totalTestsTaken > 0
        ? Math.round(
            results.reduce((acc, r) => acc + r.percentage, 0) / totalTestsTaken,
          )
        : 0;

    let totalQuestionsAnswered = 0;
    for (const r of results) {
      if (Array.isArray(r.answers)) {
        totalQuestionsAnswered += r.answers.length;
      }
    }

    return {
      totalTestsTaken,
      passedCount,
      avgPercentage,
      totalQuestionsAnswered,
    };
  }

  // 2.5 Get user's JLPT test attempts history
  async getUserHistory(userId: string, limit: number = 10) {
    const history = await this.prisma.userTestResult.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: Math.min(Math.max(1, Number(limit) || 10), 50),
      include: {
        test: {
          select: {
            id: true,
            title: true,
            slug: true,
            level: true,
            category: true,
            totalScore: true,
            passingScore: true,
          },
        },
      },
    });

    return history.map((h) => ({
      id: h.id,
      testId: h.testId,
      testTitle: h.test?.title || 'JLPT Mock Test',
      testSlug: h.test?.slug || '',
      level: h.test?.level || 'N5',
      category: h.test?.category || 'MOCK_EXAM',
      score: h.score,
      totalScore: h.test?.totalScore || 180,
      passingScore: h.test?.passingScore || 60,
      percentage: h.percentage,
      isPassed: h.isPassed,
      timeSpentSeconds: h.timeSpentSeconds,
      completedAt: h.completedAt,
    }));
  }

  // 3. Get single test by slug or ID (Questions without exposing answers during exam)
  async findBySlugOrId(idOrSlug: string, userId?: string) {
    const test = await this.prisma.jlptTest.findFirst({
      where: {
        OR: [{ slug: idOrSlug }, { id: idOrSlug }],
        isPublished: true,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            section: true,
            mondaiTitle: true,
            questionNumber: true,
            questionText: true,
            contextText: true,
            imageUrl: true,
            options: true,
            points: true,
            order: true,
          },
        },
        ...(userId
          ? {
              userResults: {
                where: { userId },
                orderBy: { completedAt: 'desc' },
                take: 1,
              },
            }
          : {}),
      },
    });

    if (!test) {
      throw new NotFoundException('Test topilmadi');
    }

    if (test.isPremium) {
      let isPro = false;
      if (userId) {
        const sub = await this.prisma.userSubscription.findFirst({
          where: {
            userId,
            status: 'ACTIVE',
            endDate: { gt: new Date() },
          },
        });
        isPro = !!sub;
      }
      if (!isPro) {
        throw new BadRequestException(
          'Ushbu test faqat Pro obunachilar uchun ochiq. Iltimos, Pro tarifiga obuna boʻling.',
        );
      }
    }

    return {
      ...test,
      latestResult: (test as any).userResults?.[0] || null,
    };
  }

  // 4. Submit test, evaluate score & answers, log activity, return review
  async submitTest(testId: string, userId: string, dto: SubmitTestDto) {
    const test = await this.prisma.jlptTest.findUnique({
      where: { id: testId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!test) {
      throw new NotFoundException('Test topilmadi');
    }

    let earnedPoints = 0;
    let maxPoints = 0;

    const evaluatedAnswers = test.questions.map((q) => {
      maxPoints += q.points;
      const userSubmission = dto.answers?.find((a) => a.questionId === q.id);
      const selectedAnswer = userSubmission?.selectedAnswer?.trim() || null;
      const isCorrect =
        selectedAnswer !== null && selectedAnswer === q.correctAnswer.trim();

      if (isCorrect) {
        earnedPoints += q.points;
      }

      return {
        questionId: q.id,
        section: q.section,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        options: q.options,
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        isCorrect,
        points: q.points,
      };
    });

    const percentage =
      maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
    const scaledScore = Math.round((percentage / 100) * test.totalScore);

    // Official JLPT pass marks:
    // N5: 80/180 ball
    // N4: 90/180 ball
    // N3: 95/180 ball
    // N2: 90/180 ball
    // N1: 100/180 ball
    const officialThresholds: Record<string, number> = {
      N5: 80,
      N4: 90,
      N3: 95,
      N2: 90,
      N1: 100,
    };

    const targetPassScore =
      test.passingScore >= 70
        ? test.passingScore
        : (officialThresholds[test.level] ?? 80);

    const isPassed = scaledScore >= targetPassScore;

    // Save test result
    const result = await this.prisma.userTestResult.create({
      data: {
        userId,
        testId: test.id,
        score: scaledScore,
        percentage,
        isPassed,
        timeSpentSeconds: dto.timeSpentSeconds || 0,
        answers: evaluatedAnswers,
      },
    });

    // Award coins for completing / passing test
    const coinReward = percentage >= 90 ? 80 : isPassed ? 50 : 15;
    try {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: { coins: { increment: coinReward } },
        }),
        this.prisma.coinTransaction.create({
          data: {
            userId,
            amount: coinReward,
            type: 'MOCK_PASSED',
            description: `${test.title} (${percentage}%) uchun mukofot tangalari`,
          },
        }),
      ]);
    } catch (err) {
      this.logger.warn(`Failed to award test coins: ${err}`);
    }

    // Automatically log study time in user_study_activities
    if (dto.timeSpentSeconds && dto.timeSpentSeconds > 60) {
      const minutes = Math.round(dto.timeSpentSeconds / 60);
      const today = new Date().toISOString().split('T')[0];
      try {
        await this.prisma.userStudyActivity.upsert({
          where: {
            userId_date: { userId, date: today },
          },
          update: {
            minutesSpent: { increment: minutes },
          },
          create: {
            userId,
            date: today,
            minutesSpent: minutes,
          },
        });
      } catch (err) {
        this.logger.warn(
          `Failed to log study activity for test submit: ${err}`,
        );
      }
    }

    return {
      resultId: result.id,
      testTitle: test.title,
      score: scaledScore,
      totalScore: test.totalScore,
      passingScore: targetPassScore,
      percentage,
      isPassed,
      timeSpentSeconds: result.timeSpentSeconds,
      completedAt: result.completedAt,
      answers: evaluatedAnswers,
    };
  }

  // 5. Get previous result by ID
  async getResultById(resultId: string, userId: string) {
    const result = await this.prisma.userTestResult.findFirst({
      where: {
        id: resultId,
        userId,
      },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            slug: true,
            level: true,
            totalScore: true,
            passingScore: true,
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException('Test natijasi topilmadi');
    }

    return {
      resultId: result.id,
      testTitle: result.test.title,
      testSlug: result.test.slug,
      level: result.test.level,
      score: result.score,
      totalScore: result.test.totalScore,
      passingScore: result.test.passingScore,
      percentage: result.percentage,
      isPassed: result.isPassed,
      timeSpentSeconds: result.timeSpentSeconds,
      completedAt: result.completedAt,
      answers: result.answers,
    };
  }

  // =====================================
  // ADMIN PANEL METHODS
  // =====================================

  // Admin: Get all tests (including unpublished)
  async adminFindAll() {
    const tests = await this.prisma.jlptTest.findMany({
      orderBy: [{ level: 'desc' }, { order: 'asc' }],
      include: {
        _count: {
          select: {
            questions: true,
            userResults: true,
          },
        },
      },
    });

    return tests.map((t) => ({
      ...t,
      questionCount: t._count.questions,
      attemptsCount: t._count.userResults,
    }));
  }

  // Admin: Get single test with all questions (including correct answers & explanations)
  async adminFindOne(id: string) {
    const test = await this.prisma.jlptTest.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: [
            { section: 'asc' },
            { order: 'asc' },
            { questionNumber: 'asc' },
          ],
        },
        _count: {
          select: {
            questions: true,
            userResults: true,
          },
        },
      },
    });

    if (!test) {
      throw new NotFoundException('Test topilmadi');
    }

    return {
      ...test,
      questionCount: test._count.questions,
      attemptsCount: test._count.userResults,
    };
  }

  // Admin: Create new test
  async adminCreateTest(dto: CreateTestDto) {
    const existing = await this.prisma.jlptTest.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException('Bu slug bilan test allaqachon mavjud');
    }

    return this.prisma.jlptTest.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        level: dto.level,
        category: dto.category || 'MOCK_EXAM',
        durationMinutes: dto.durationMinutes,
        passingScore: dto.passingScore ?? 60,
        totalScore: dto.totalScore ?? 180,
        audioUrl: dto.audioUrl,
        order: dto.order ?? 1,
        isPublished: dto.isPublished ?? true,
        isPremium: dto.isPremium ?? false,
      },
    });
  }

  // Admin: Update test
  async adminUpdateTest(id: string, dto: UpdateTestDto) {
    const test = await this.prisma.jlptTest.findUnique({ where: { id } });
    if (!test) throw new NotFoundException('Test topilmadi');

    if (dto.slug && dto.slug !== test.slug) {
      const slugExists = await this.prisma.jlptTest.findUnique({
        where: { slug: dto.slug },
      });
      if (slugExists) {
        throw new BadRequestException('Bu slug bilan test allaqachon mavjud');
      }
    }

    return this.prisma.jlptTest.update({
      where: { id },
      data: {
        title: dto.title ?? test.title,
        slug: dto.slug ?? test.slug,
        description:
          dto.description !== undefined ? dto.description : test.description,
        level: dto.level ?? test.level,
        category: dto.category ?? test.category,
        durationMinutes: dto.durationMinutes ?? test.durationMinutes,
        passingScore: dto.passingScore ?? test.passingScore,
        totalScore: dto.totalScore ?? test.totalScore,
        audioUrl: dto.audioUrl !== undefined ? dto.audioUrl : test.audioUrl,
        order: dto.order ?? test.order,
        isPublished:
          dto.isPublished !== undefined ? dto.isPublished : test.isPublished,
        isPremium: dto.isPremium !== undefined ? dto.isPremium : test.isPremium,
      },
    });
  }

  // Admin: Delete test
  async adminDeleteTest(id: string) {
    const test = await this.prisma.jlptTest.findUnique({ where: { id } });
    if (!test) throw new NotFoundException('Test topilmadi');

    await this.prisma.jlptTest.delete({ where: { id } });
    return { success: true, message: "Test muvaffaqiyatli o'chirildi" };
  }

  // Admin: Add question to test
  async adminCreateQuestion(testId: string, dto: CreateQuestionDto) {
    const test = await this.prisma.jlptTest.findUnique({
      where: { id: testId },
    });
    if (!test) throw new NotFoundException('Test topilmadi');

    return this.prisma.jlptQuestion.create({
      data: {
        testId,
        section: dto.section,
        mondaiTitle: dto.mondaiTitle,
        questionNumber: dto.questionNumber,
        questionText: dto.questionText,
        contextText: dto.contextText,
        options: dto.options,
        correctAnswer: dto.correctAnswer,
        explanation: dto.explanation,
        points: dto.points ?? 3,
        order: dto.order ?? dto.questionNumber,
      },
    });
  }

  // Admin: Update question
  async adminUpdateQuestion(questionId: string, dto: UpdateQuestionDto) {
    const q = await this.prisma.jlptQuestion.findUnique({
      where: { id: questionId },
    });
    if (!q) throw new NotFoundException('Savol topilmadi');

    return this.prisma.jlptQuestion.update({
      where: { id: questionId },
      data: {
        section: dto.section ?? q.section,
        mondaiTitle:
          dto.mondaiTitle !== undefined ? dto.mondaiTitle : q.mondaiTitle,
        questionNumber: dto.questionNumber ?? q.questionNumber,
        questionText: dto.questionText ?? q.questionText,
        contextText:
          dto.contextText !== undefined ? dto.contextText : q.contextText,
        options:
          dto.options !== undefined ? (dto.options as any) : (q.options as any),
        correctAnswer: dto.correctAnswer ?? q.correctAnswer,
        explanation:
          dto.explanation !== undefined ? dto.explanation : q.explanation,
        points: dto.points ?? q.points,
        order: dto.order ?? q.order,
      },
    });
  }

  // Admin: Delete question
  async adminDeleteQuestion(questionId: string) {
    const q = await this.prisma.jlptQuestion.findUnique({
      where: { id: questionId },
    });
    if (!q) throw new NotFoundException('Savol topilmadi');

    await this.prisma.jlptQuestion.delete({ where: { id: questionId } });
    return { success: true, message: "Savol muvaffaqiyatli o'chirildi" };
  }
}
