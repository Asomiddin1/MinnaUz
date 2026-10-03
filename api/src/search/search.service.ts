import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GlobalSearchResult {
  query: string;
  totalCount: number;
  results: {
    courses: {
      id: string;
      title: string;
      slug: string;
      level: string;
      description?: string | null;
      coverImage?: string | null;
    }[];
    lessons: {
      id: string;
      title: string;
      japaneseTitle?: string | null;
      order: number;
      courseId: string;
      courseSlug: string;
      courseTitle: string;
      courseLevel: string;
      isFree: boolean;
    }[];
    vocab: {
      id: string;
      word: string;
      furigana?: string | null;
      romaji?: string | null;
      meaningUz: string;
      partOfSpeech?: string | null;
      courseLevel: string;
      lessonOrder: number;
    }[];
    kanji: {
      id: string;
      character: string;
      onyomi?: string | null;
      kunyomi?: string | null;
      meaningUz: string;
      strokeCount?: number | null;
      courseLevel: string;
    }[];
    tests: {
      id: string;
      title: string;
      slug: string;
      level: string;
      category: string;
      isPremium: boolean;
      durationMinutes: number;
    }[];
    pages: {
      id: string;
      title: string;
      subtitle: string;
      icon: string;
      url: string;
    }[];
  };
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(rawQuery: string): Promise<GlobalSearchResult> {
    const q = (rawQuery || '').trim();

    if (!q) {
      return {
        query: '',
        totalCount: 0,
        results: {
          courses: [],
          lessons: [],
          vocab: [],
          kanji: [],
          tests: [],
          pages: this.getDefaultPages(),
        },
      };
    }

    const lowerQ = q.toLowerCase();
    const isLevelQuery = ['N5', 'N4', 'N3', 'N2', 'N1'].includes(
      q.toUpperCase(),
    );

    try {
      // Run parallel searches
      const [courses, lessons, vocab, kanji, tests] = await Promise.all([
        // 1. Published Courses
        this.prisma.course.findMany({
          where: {
            isPublished: true,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              ...(isLevelQuery ? [{ level: q.toUpperCase() as any }] : []),
            ],
          },
          select: {
            id: true,
            title: true,
            slug: true,
            level: true,
            description: true,
            coverImage: true,
          },
          take: 4,
        }),

        // 2. Published Lessons
        this.prisma.lesson.findMany({
          where: {
            isPublished: true,
            module: { course: { isPublished: true } },
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { japaneseTitle: { contains: q, mode: 'insensitive' } },
            ],
          },
          include: {
            module: {
              include: {
                course: {
                  select: { id: true, title: true, slug: true, level: true },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
          take: 6,
        }),

        // 3. Vocab Words (Kotoba)
        this.prisma.kotobaItem.findMany({
          where: {
            lesson: {
              isPublished: true,
              module: { course: { isPublished: true } },
            },
            OR: [
              { word: { contains: q, mode: 'insensitive' } },
              { furigana: { contains: q, mode: 'insensitive' } },
              { romaji: { contains: q, mode: 'insensitive' } },
              { meaningUz: { contains: q, mode: 'insensitive' } },
            ],
          },
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: {
                      select: { level: true },
                    },
                  },
                },
              },
            },
          },
          take: 8,
        }),

        // 4. Kanji Characters
        this.prisma.kanjiItem.findMany({
          where: {
            lesson: {
              isPublished: true,
              module: { course: { isPublished: true } },
            },
            OR: [
              { character: { contains: q } },
              { onyomi: { contains: q, mode: 'insensitive' } },
              { kunyomi: { contains: q, mode: 'insensitive' } },
              { meaningUz: { contains: q, mode: 'insensitive' } },
            ],
          },
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: {
                      select: { level: true },
                    },
                  },
                },
              },
            },
          },
          take: 8,
        }),

        // 5. JLPT Tests
        this.prisma.jlptTest.findMany({
          where: {
            isPublished: true,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              ...(isLevelQuery ? [{ level: q.toUpperCase() as any }] : []),
            ],
          },
          select: {
            id: true,
            title: true,
            slug: true,
            level: true,
            category: true,
            isPremium: true,
            durationMinutes: true,
          },
          take: 5,
        }),
      ]);

      // Format Lessons
      const formattedLessons = lessons.map((l) => ({
        id: l.id,
        title: l.title,
        japaneseTitle: l.japaneseTitle,
        order: l.order,
        courseId: l.module.course.id,
        courseSlug: l.module.course.slug,
        courseTitle: l.module.course.title,
        courseLevel: l.module.course.level,
        isFree: l.isFree,
      }));

      // Format Vocab
      const formattedVocab = vocab.map((k) => ({
        id: k.id,
        word: k.word,
        furigana: k.furigana,
        romaji: k.romaji,
        meaningUz: k.meaningUz,
        partOfSpeech: k.partOfSpeech,
        courseLevel: k.lesson.module.course.level,
        lessonOrder: k.lesson.order,
      }));

      // Format Kanji
      const formattedKanji = kanji.map((k) => ({
        id: k.id,
        character: k.character,
        onyomi: k.onyomi,
        kunyomi: k.kunyomi,
        meaningUz: k.meaningUz,
        strokeCount: k.strokeCount,
        courseLevel: k.lesson.module.course.level,
      }));

      // Check matching quick pages
      const matchedPages = this.filterPages(lowerQ);

      const totalCount =
        courses.length +
        formattedLessons.length +
        formattedVocab.length +
        formattedKanji.length +
        tests.length +
        matchedPages.length;

      return {
        query: q,
        totalCount,
        results: {
          courses,
          lessons: formattedLessons,
          vocab: formattedVocab,
          kanji: formattedKanji,
          tests: tests,
          pages: matchedPages,
        },
      };
    } catch (err) {
      console.error('Global search error:', err);
      return {
        query: q,
        totalCount: 0,
        results: {
          courses: [],
          lessons: [],
          vocab: [],
          kanji: [],
          tests: [],
          pages: this.filterPages(lowerQ),
        },
      };
    }
  }

  private getDefaultPages() {
    return [
      {
        id: 'page-vocab',
        title: 'Yapon Tili Lugʻati',
        subtitle: 'Barcha soʻzlar qomusi va Flashcardlar',
        icon: 'BookA',
        url: '/dashboard?tab=vocab',
      },
      {
        id: 'page-kanji',
        title: 'Kanji Laboratoriyasi',
        subtitle: 'Chizilish animatsiyasi va kalligrafiya doskasi',
        icon: 'Type',
        url: '/dashboard?tab=kanji',
      },
      {
        id: 'page-tests',
        title: 'JLPT Testlari',
        subtitle: 'N5 dan N1 gacha boʻlgan rasmiy formatdagi testlar',
        icon: 'GraduationCap',
        url: '/dashboard/tests',
      },
      {
        id: 'page-ai',
        title: 'AI Sensei',
        subtitle: 'Sunʼiy intellekt bilan cheksiz yaponcha suhbat',
        icon: 'Bot',
        url: '/dashboard?tab=ai',
      },
      {
        id: 'page-premium',
        title: 'Pro Obuna',
        subtitle: 'Barcha kurslar va imkoniyatlarni ochish',
        icon: 'Crown',
        url: '/dashboard/premium',
      },
      {
        id: 'page-store',
        title: 'Minna Doʻkoni',
        subtitle: 'Avatar ramkalari va tangalar',
        icon: 'Store',
        url: '/dashboard?tab=store',
      },
    ];
  }

  private filterPages(q: string) {
    const allPages = this.getDefaultPages();
    return allPages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q),
    );
  }
}
