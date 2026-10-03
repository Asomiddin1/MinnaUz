import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesSeedService implements OnModuleInit {
  private readonly logger = new Logger(CoursesSeedService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedCourses();
  }

  async seedCourses() {
    try {
      // Find or create default Super Admin
      let superAdmin = await this.prisma.user.findFirst({
        where: {
          OR: [
            { role: 'SUPER_ADMIN' },
            { role: 'ADMIN' },
            { email: 'admin@minna.uz' },
          ],
        },
      });

      if (!superAdmin) {
        superAdmin = await this.prisma.user.create({
          data: {
            email: 'admin@minna.uz',
            fullName: 'MinnaUz Sensei (Rasmiy)',
            role: 'SUPER_ADMIN',
            isVerified: true,
            avatarUrl:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          },
        });
      }

      // Check if courses exist without author and update them
      await this.prisma.course.updateMany({
        where: { authorId: null },
        data: { authorId: superAdmin.id },
      });

      // Default N5 lessons 1-5 to free initially
      await this.prisma.lesson.updateMany({
        where: {
          module: { course: { level: 'N5' } },
          order: { lte: 5 },
        },
        data: { isFree: true },
      });

      // 1. Get or create N5 Course: Minna no Nihongo I
      let n5Course = await this.prisma.course.findFirst({
        where: { slug: 'minna-no-nihongo-1' },
      });

      if (!n5Course) {
        n5Course = await this.prisma.course.create({
          data: {
            title: 'Minna no Nihongo I (N5)',
            slug: 'minna-no-nihongo-1',
            description:
              'Boshlangʻich yapon tili: Hiragana, Katakana, 100+ Kanji, 25 ta dars va toʻliq audio talaffuzlar.',
            level: 'N5',
            order: 1,
            isPublished: true,
            authorId: superAdmin.id,
            coverImage:
              'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
          },
        });
      }

      // 2. Get or create Module 1 for N5 Course
      let module1 = await this.prisma.courseModule.findFirst({
        where: { courseId: n5Course.id, order: 1 },
      });

      if (!module1) {
        module1 = await this.prisma.courseModule.create({
          data: {
            courseId: n5Course.id,
            title: '1-Modul: Tanishtiruv va Asoslar (1–5 darslar)',
            description:
              'Oʻzini tanishtirish, buyumlar, joylar, vaqt va harakat feʼllari asoslari.',
            order: 1,
          },
        });
      }

      // Ensure Module 2 & 3 exist
      const mod2 = await this.prisma.courseModule.findFirst({
        where: { courseId: n5Course.id, order: 2 },
      });
      if (!mod2) {
        await this.prisma.courseModule.create({
          data: {
            courseId: n5Course.id,
            title: '2-Modul: Kundalik Harakatlar va Sifatlar (6–10 darslar)',
            description:
              'Harakat obyektlari, birgalikda harakat qilish, sifatlar va mavjudlik.',
            order: 2,
          },
        });
      }

      // ==========================================
      // SEED LESSON 1: O'zini tanishtirish
      // ==========================================
      let lesson1 = await this.prisma.lesson.findFirst({
        where: { moduleId: module1.id, order: 1 },
      });
      if (!lesson1) {
        lesson1 = await this.prisma.lesson.create({
          data: {
            moduleId: module1.id,
            title: '1-dars: Oʻzini tanishtirish va salomlashish',
            japaneseTitle: '第1課 (Dai 1 Ka)',
            slug: 'lesson-1',
            order: 1,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            summary:
              'Ushbu darsda oʻzingizni tanishtirish, ism, kasb va millatni aytishni, shuningdek yapon tilidagi asosiy ~wa ~desu strukturasini oʻrganasiz.',
            kaiwaScenario: {
              topic: 'Kompaniyada yoki sinfda yangi tanishuv',
              partnerName: 'Tanaka-san',
              goal: 'Oʻzingizning ismingiz, kasbingiz va qayerdan ekanligingizni aytib tanishing.',
              sampleDialog: [
                {
                  speaker: 'Tanaka',
                  text: '初めまして。田中です。どうぞよろしくお願いします。',
                  uz: 'Tanishganimdan xursandman. Men Tanakaman. Marhamat, yaxshi munosabatda boʻlaylik.',
                },
                {
                  speaker: 'User',
                  text: '初めまして。アザマトです。ウズベキスタンから来ました。どうぞよろしくお願いします。',
                  uz: 'Tanishganimdan xursandman. Men Azamatman. Oʻzbekistondan keldim. Yaxshi munosabatda boʻlaylik.',
                },
              ],
            },
          },
        });
      }

      const l1KotobaCount = await this.prisma.kotobaItem.count({
        where: { lessonId: lesson1.id },
      });
      if (l1KotobaCount === 0) {
        const kotoba1 = [
          {
            word: 'わたし',
            furigana: 'わたし',
            romaji: 'watashi',
            meaningUz: 'men',
            partOfSpeech: 'Olmosh',
            sampleSentence: 'わたしは がくせいです。',
            sampleSentenceUz: 'Men talabaman.',
            order: 1,
          },
          {
            word: 'あなた',
            furigana: 'あなた',
            romaji: 'anata',
            meaningUz: 'siz',
            partOfSpeech: 'Olmosh',
            sampleSentence: 'あなたは せんせいですか。',
            sampleSentenceUz: 'Siz oʻqituvchimisiz?',
            order: 2,
          },
          {
            word: 'あのひと (あの方)',
            furigana: 'あのひと (あのかた)',
            romaji: 'ano hito (ano kata)',
            meaningUz: 'u kishi / u odam',
            partOfSpeech: 'Olmosh',
            sampleSentence: 'あのかたは どなたですか。',
            sampleSentenceUz: 'U kishi kimlar?',
            order: 3,
          },
          {
            word: 'さん',
            furigana: 'さん',
            romaji: 'san',
            meaningUz: 'janob / xonim (hurmat qoʻshimchasi)',
            partOfSpeech: 'Qoʻshimcha',
            sampleSentence: 'ミラーさん',
            sampleSentenceUz: 'Janob Miller',
            order: 4,
          },
          {
            word: 'せんせい',
            furigana: 'せんせい',
            romaji: 'sensei',
            meaningUz: 'oʻqituvchi / ustoz',
            partOfSpeech: 'Ot',
            sampleSentence: 'たなかさんは せんせいです。',
            sampleSentenceUz: 'Tanaka xonim oʻqituvchi.',
            order: 5,
          },
          {
            word: 'がくせい',
            furigana: 'がくせい',
            romaji: 'gakusei',
            meaningUz: 'talaba / oʻquvchi',
            partOfSpeech: 'Ot',
            sampleSentence: 'アリさんは がくせいです。',
            sampleSentenceUz: 'Ali talaba.',
            order: 6,
          },
          {
            word: 'かいしゃいん',
            furigana: 'かいしゃいん',
            romaji: 'kaishain',
            meaningUz: 'kompaniya xodimi',
            partOfSpeech: 'Ot',
            sampleSentence: 'サントスさんは かいしゃいんです。',
            sampleSentenceUz: 'Santos janoblari firma xodimi.',
            order: 7,
          },
          {
            word: 'いしゃ',
            furigana: 'いしゃ',
            romaji: 'isha',
            meaningUz: 'shifokor / doʻxtir',
            partOfSpeech: 'Ot',
            sampleSentence: 'ちちは いしゃです。',
            sampleSentenceUz: 'Otam shifokor.',
            order: 8,
          },
          {
            word: 'エンジニア',
            furigana: 'エンジニア',
            romaji: 'enjinia',
            meaningUz: 'muhandis / injener',
            partOfSpeech: 'Ot',
            sampleSentence: 'わたしは エンジニアです。',
            sampleSentenceUz: 'Men muhandisman.',
            order: 9,
          },
          {
            word: 'だいがく',
            furigana: 'だいがく',
            romaji: 'daigaku',
            meaningUz: 'universitet',
            partOfSpeech: 'Ot',
            sampleSentence: 'とうきょうだいがく',
            sampleSentenceUz: 'Tokio universiteti',
            order: 10,
          },
          {
            word: 'はじめまして',
            furigana: 'はじめまして',
            romaji: 'hajimemashite',
            meaningUz: 'Tanishganimdan xursandman',
            partOfSpeech: 'Ibora',
            sampleSentence: 'はじめまして、どうぞよろしく。',
            sampleSentenceUz: 'Tanishganimdan xursandman, marhamat.',
            order: 11,
          },
          {
            word: 'どうぞ よろしく おねがいします',
            furigana: 'どうぞ よろしく おねがいします',
            romaji: 'douzo yoroshiku onegaishimasu',
            meaningUz: 'Iltimos, menga yaxshi munosabatda boʻling',
            partOfSpeech: 'Ibora',
            sampleSentence: 'どうぞ よろしく おねがいします。',
            sampleSentenceUz: 'Tanishganimdan mamnunman.',
            order: 12,
          },
        ];
        for (const item of kotoba1) {
          await this.prisma.kotobaItem.create({
            data: { lessonId: lesson1.id, ...item },
          });
        }

        const bunpou1 = [
          {
            title: '1. N1 は N2 です (N1 N2 dir)',
            structure: 'N1 [Ot] は N2 [Ot] です',
            explanationUz:
              'は (wa deb oʻqiladi) — mavzu koʻmakchisi (partikl) boʻlib, gap nima haqida ekanligini bildiradi. です (desu) — kesimlik qoʻshimchasi boʻlib, "dir / hisoblanadi" maʼnosini beradi.',
            examples: [
              {
                japanese: 'わたしは マイク・ミラーです。',
                romaji: 'Watashi wa Maiku Miraa desu.',
                uzbek: 'Men Mayk Millerdirman.',
              },
              {
                japanese: 'サントスさんは ブラジルじんです。',
                romaji: 'Santosu-san wa Burajiru-jin desu.',
                uzbek: 'Janob Santos braziliyalikdir.',
              },
            ],
            order: 1,
          },
          {
            title: '2. N1 は N2 じゃ ありません (N1 N2 emas)',
            structure: 'N1 は N2 じゃ ありません (yoki ではありません)',
            explanationUz:
              'です ning inkor shakli じゃ ありません (ogʻzaki) yoki ではありません (rasmiy) shaklida boʻladi.',
            examples: [
              {
                japanese: 'サントスさんは がくせいじゃ ありません。',
                romaji: 'Santosu-san wa gakusei ja arimasen.',
                uzbek: 'Janob Santos talaba emas.',
              },
            ],
            order: 2,
          },
        ];
        for (const b of bunpou1) {
          await this.prisma.bunpouItem.create({
            data: { lessonId: lesson1.id, ...b },
          });
        }

        const kanji1 = [
          {
            character: '一',
            onyomi: 'イチ (ICHI)',
            kunyomi: 'ひと・つ (hito-tsu)',
            meaningUz: 'Bir (1)',
            strokeCount: 1,
            radical: '一',
            examples: [
              { word: '一つ', reading: 'ひとつ', meaning: 'Bitta' },
              { word: '一人', reading: 'ひとり', meaning: 'Bir kishi' },
            ],
            order: 1,
          },
          {
            character: '二',
            onyomi: 'ニ (NI)',
            kunyomi: 'ふた・つ (futa-tsu)',
            meaningUz: 'Ikki (2)',
            strokeCount: 2,
            radical: '二',
            examples: [
              { word: '二つ', reading: 'ふたつ', meaning: 'Ikkita' },
              { word: '二人', reading: 'ふたり', meaning: 'Ikki kishi' },
            ],
            order: 2,
          },
          {
            character: '三',
            onyomi: 'サン (SAN)',
            kunyomi: 'みっ・つ (mit-tsu)',
            meaningUz: 'Uch (3)',
            strokeCount: 3,
            radical: '一',
            examples: [
              { word: '三つ', reading: 'みっつ', meaning: 'Uchta' },
              { word: '三人', reading: 'さんにん', meaning: 'Uch kishi' },
            ],
            order: 3,
          },
          {
            character: '日',
            onyomi: 'ニチ (NICHI)',
            kunyomi: 'ひ, -び (hi, -bi)',
            meaningUz: 'Quyosh, kun, Yaponiya',
            strokeCount: 4,
            radical: '日',
            examples: [
              { word: '日本', reading: 'にほん', meaning: 'Yaponiya' },
              { word: '日曜日', reading: 'にちようび', meaning: 'Yakshanba' },
            ],
            order: 4,
          },
        ];
        for (const k of kanji1) {
          await this.prisma.kanjiItem.create({
            data: { lessonId: lesson1.id, ...k },
          });
        }

        const renshuu1 = [
          {
            type: 'QUIZ' as const,
            question:
              'わたし ___ がくせいです。 (Boʻsh joyga mos partiklni tanlang)',
            options: ['は (wa)', 'が (ga)', 'を (o)', 'に (ni)'],
            correctAnswer: 'は (wa)',
            explanation: 'Mavzu koʻrsatkichi sifatida "は" ishlatiladi.',
            order: 1,
          },
          {
            type: 'QUIZ' as const,
            question: '"Tanaka shifokor emas" yapon tilida qanday boʻladi?',
            options: [
              'たなかさんは いしゃじゃ ありません。',
              'たなかさんは いしゃです。',
              'たなかさんは いしゃですか。',
              'たなかさんも いしゃです。',
            ],
            correctAnswer: 'たなかさんは いしゃじゃ ありません。',
            explanation:
              'Emas inkor shakli uchun "じゃ ありません" ishlatiladi.',
            order: 2,
          },
          {
            type: 'QUIZ' as const,
            question:
              'Ilk bor koʻrishganda aytiladigan salomlashish iborasi qaysi?',
            options: [
              'はじめまして',
              'さようなら',
              'ありがとう ございます',
              'おやすみなさい',
            ],
            correctAnswer: 'はじめまして',
            explanation: 'Ilk tanishuvda "はじめまして" deyiladi.',
            order: 3,
          },
          {
            type: 'AUDIO_LISTENING' as const,
            question: 'Tinglang: "わたしは エンジニアです。" Kasbni tanlang:',
            options: ['Muhandis', 'Shifokor', 'Oʻqituvchi', 'Talaba'],
            correctAnswer: 'Muhandis',
            explanation: 'エンジニア (enjinia) = muhandis.',
            order: 4,
          },
        ];
        for (const r of renshuu1) {
          await this.prisma.renshuuItem.create({
            data: { lessonId: lesson1.id, ...r },
          });
        }
      }

      // ==========================================
      // SEED LESSON 2: Buyumlar va ko'rsatish olmoshlari
      // ==========================================
      let lesson2 = await this.prisma.lesson.findFirst({
        where: { moduleId: module1.id, order: 2 },
      });
      if (!lesson2) {
        lesson2 = await this.prisma.lesson.create({
          data: {
            moduleId: module1.id,
            title:
              '2-dars: Buyumlar va koʻrsatish olmoshlari (Kore, Sore, Are)',
            japaneseTitle: '第2課 (Dai 2 Ka)',
            slug: 'lesson-2',
            order: 2,
            summary:
              'Buyumlarni koʻrsatish (kore/sore/are), kishi egaligi (no partikli) va buyumlar nomlarini oʻrganasiz.',
            kaiwaScenario: {
              topic: 'Yangi buyum yoki sovgʻa haqida soʻrash',
              partnerName: 'Yamada-san',
              goal: 'Bu nima ekanligini va kimga tegishli ekanligini soʻrang.',
            },
          },
        });
      }

      const l2KotobaCount = await this.prisma.kotobaItem.count({
        where: { lessonId: lesson2.id },
      });
      if (l2KotobaCount === 0) {
        const kotoba2 = [
          {
            word: 'これ',
            furigana: 'これ',
            romaji: 'kore',
            meaningUz: 'bu (gapiruvchiga yaqin)',
            partOfSpeech: 'Olmosh',
            sampleSentence: 'これは ほんです。',
            sampleSentenceUz: 'Bu kitob.',
            order: 1,
          },
          {
            word: 'それ',
            furigana: 'それ',
            romaji: 'sore',
            meaningUz: 'shu (tinglovchiga yaqin)',
            partOfSpeech: 'Olmosh',
            sampleSentence: 'それは なんですか。',
            sampleSentenceUz: 'Shu nima?',
            order: 2,
          },
          {
            word: 'あれ',
            furigana: 'あれ',
            romaji: 'are',
            meaningUz: 'ana u (har ikkalasidan uzoq)',
            partOfSpeech: 'Olmosh',
            sampleSentence: 'あれは くるまです。',
            sampleSentenceUz: 'Ana u mashina.',
            order: 3,
          },
          {
            word: 'この',
            furigana: 'この',
            romaji: 'kono',
            meaningUz: 'bu (+ ot)',
            partOfSpeech: 'Koʻrsatish',
            sampleSentence: 'このほんは わたしのです。',
            sampleSentenceUz: 'Bu kitob meniki.',
            order: 4,
          },
          {
            word: 'その',
            furigana: 'その',
            romaji: 'sono',
            meaningUz: 'shu (+ ot)',
            partOfSpeech: 'Koʻrsatish',
            sampleSentence: 'そのかさは だれのですか。',
            sampleSentenceUz: 'Shu soyabon kimniki?',
            order: 5,
          },
          {
            word: 'あの',
            furigana: 'あの',
            romaji: 'ano',
            meaningUz: 'ana u (+ ot)',
            partOfSpeech: 'Koʻrsatish',
            sampleSentence: 'あのかたは せんせいです。',
            sampleSentenceUz: 'Ana u kishi ustoz.',
            order: 6,
          },
          {
            word: 'ほん',
            furigana: 'ほん',
            romaji: 'hon',
            meaningUz: 'kitob',
            partOfSpeech: 'Ot',
            sampleSentence: 'にほんごの ほん',
            sampleSentenceUz: 'Yapon tili kitobi',
            order: 7,
          },
          {
            word: 'じしょ',
            furigana: 'じしょ',
            romaji: 'jisho',
            meaningUz: 'lugʻat kitob',
            partOfSpeech: 'Ot',
            sampleSentence: 'でんしじしょ',
            sampleSentenceUz: 'Elektron lugʻat',
            order: 8,
          },
          {
            word: 'ざっし',
            furigana: 'ざっし',
            romaji: 'zasshi',
            meaningUz: 'jurnal',
            partOfSpeech: 'Ot',
            sampleSentence: 'くるまの ざっし',
            sampleSentenceUz: 'Avtomobil jurnali',
            order: 9,
          },
          {
            word: 'しんぶん',
            furigana: 'しんぶん',
            romaji: 'shinbun',
            meaningUz: 'gazeta',
            partOfSpeech: 'Ot',
            sampleSentence: 'にほんの しんぶん',
            sampleSentenceUz: 'Yaponiya gazetasi',
            order: 10,
          },
          {
            word: 'ノート',
            furigana: 'ノート',
            romaji: 'nooto',
            meaningUz: 'daftar',
            partOfSpeech: 'Ot',
            sampleSentence: 'わたしの ノート',
            sampleSentenceUz: 'Mening daftarim',
            order: 11,
          },
          {
            word: 'かさ',
            furigana: 'かさ',
            romaji: 'kasa',
            meaningUz: 'soyabon',
            partOfSpeech: 'Ot',
            sampleSentence: 'あめと かさ',
            sampleSentenceUz: 'Yomgʻir va soyabon',
            order: 12,
          },
        ];
        for (const item of kotoba2) {
          await this.prisma.kotobaItem.create({
            data: { lessonId: lesson2.id, ...item },
          });
        }

        const bunpou2 = [
          {
            title: '1. これ / それ / あれ は N です (Ko-So-A tizimi)',
            structure: 'これ / それ / あれ は N です',
            explanationUz:
              'これ — gapiruvchiga yaqin; それ — tinglovchiga yaqin; あれ — har ikki suhbatdoshdan uzoqdagi buyumni bildiradi.',
            examples: [
              {
                japanese: 'これは じしょです。',
                romaji: 'Kore wa jisho desu.',
                uzbek: 'Bu lugʻatdir.',
              },
              {
                japanese: 'それは わたしのかばんです。',
                romaji: 'Sore wa watashi no kaban desu.',
                uzbek: 'Shu mening sumkamdir.',
              },
            ],
            order: 1,
          },
          {
            title: '2. この / その / あの N (Aniqlovchi koʻrsatish)',
            structure: 'この / その / あの + Ot',
            explanationUz:
              'Ushbu soʻzlar faqat otdan oldin kelib, oʻsha buyumni aniq koʻrsatadi.',
            examples: [
              {
                japanese: 'このほんは わたしのです。',
                romaji: 'Kono hon wa watashi no desu.',
                uzbek: 'Bu kitob meniki.',
              },
            ],
            order: 2,
          },
        ];
        for (const b of bunpou2) {
          await this.prisma.bunpouItem.create({
            data: { lessonId: lesson2.id, ...b },
          });
        }

        const kanji2 = [
          {
            character: '本',
            onyomi: 'ホン (HON)',
            kunyomi: 'もと (moto)',
            meaningUz: 'Kitob, ildiz, asos',
            strokeCount: 5,
            radical: '木',
            examples: [
              { word: '本', reading: 'ほん', meaning: 'Kitob' },
              { word: '日本', reading: 'にほん', meaning: 'Yaponiya' },
            ],
            order: 1,
          },
          {
            character: '人',
            onyomi: 'ジン, ニン (JIN, NIN)',
            kunyomi: 'ひと (hito)',
            meaningUz: 'Odam, kishi',
            strokeCount: 2,
            radical: '人',
            examples: [
              { word: '日本人', reading: 'にほんじん', meaning: 'Yaponiyalik' },
              { word: 'あの人', reading: 'あのひと', meaning: 'U odam' },
            ],
            order: 2,
          },
          {
            character: '大',
            onyomi: 'ダイ, タイ (DAI, TAI)',
            kunyomi: 'おお・きい (oo-kii)',
            meaningUz: 'Katta',
            strokeCount: 3,
            radical: '大',
            examples: [
              { word: '大学', reading: 'だいがく', meaning: 'Universitet' },
              { word: '大人', reading: 'おとな', meaning: 'Katta yoshli odam' },
            ],
            order: 3,
          },
        ];
        for (const k of kanji2) {
          await this.prisma.kanjiItem.create({
            data: { lessonId: lesson2.id, ...k },
          });
        }

        const renshuu2 = [
          {
            type: 'QUIZ' as const,
            question:
              'Qoʻlingizda turgan buyumni koʻrsatib "Bu kitob" deyish uchun qaysi soʻz ishlatiladi?',
            options: [
              'これ (kore)',
              'それ (sore)',
              'あれ (are)',
              'どれ (dore)',
            ],
            correctAnswer: 'これ (kore)',
            explanation: 'Gapiruvchiga yaqin buyum uchun "これ" ishlatiladi.',
            order: 1,
          },
          {
            type: 'QUIZ' as const,
            question:
              '"Kono kaban wa watashi no desu" gapining tarjimasi qaysi?',
            options: [
              'Bu sumka meniki.',
              'Bu mening ruchkam.',
              'Shu sumka uniki.',
              'Ana u sumka yangi.',
            ],
            correctAnswer: 'Bu sumka meniki.',
            explanation: 'Kono kaban = bu sumka, watashi no = meniki.',
            order: 2,
          },
          {
            type: 'QUIZ' as const,
            question:
              'Savol beruvchi: "それは なんですか。" Javob beruvchi oʻziga yaqin buyum haqida nima deydi?',
            options: [
              'これは てちょうです。',
              'それは てちょうです。',
              'あれは てちょうです。',
              'どれも てちょうです。',
            ],
            correctAnswer: 'これは てちょうです。',
            explanation:
              'Tinglovchi oʻziga yaqin narsa haqida gapirganda "これ" ga oʻzgaradi.',
            order: 3,
          },
          {
            type: 'AUDIO_LISTENING' as const,
            question: 'Tinglang: "これは だれのかさですか。" Nimani soʻradi?',
            options: [
              'Soyabon kimniki ekanligini',
              'Kitob narxini',
              'Avtomobil rusumini',
              'Daftar qayerdaligini',
            ],
            correctAnswer: 'Soyabon kimniki ekanligini',
            explanation: 'かさ (kasa) = soyabon.',
            order: 4,
          },
        ];
        for (const r of renshuu2) {
          await this.prisma.renshuuItem.create({
            data: { lessonId: lesson2.id, ...r },
          });
        }
      }

      // ==========================================
      // SEED LESSON 3: Joylar, binolar va xarid
      // ==========================================
      let lesson3 = await this.prisma.lesson.findFirst({
        where: { moduleId: module1.id, order: 3 },
      });
      if (!lesson3) {
        lesson3 = await this.prisma.lesson.create({
          data: {
            moduleId: module1.id,
            title: '3-dars: Joylar, binolar va xarid (Koko, Soko, Asoko)',
            japaneseTitle: '第3課 (Dai 3 Ka)',
            slug: 'lesson-3',
            order: 3,
            summary:
              'Joylar (bu yer, u yer), binolar, qavatlar, xarid qilish va narxlar (ikura desu ka)ni oʻrganasiz.',
            kaiwaScenario: {
              topic: 'Doʻkonda narx soʻrash va xarid qilish',
              partnerName: 'Tenin-san (Sotuvchi)',
              goal: 'Sotuvchidan buyum qayerdaligini va narxini soʻrab xarid qiling.',
            },
          },
        });
      }

      const l3KotobaCount = await this.prisma.kotobaItem.count({
        where: { lessonId: lesson3.id },
      });
      if (l3KotobaCount === 0) {
        const kotoba3 = [
          {
            word: 'ここ (こちら)',
            furigana: 'ここ (こちら)',
            romaji: 'koko (kochira)',
            meaningUz: 'bu yer / bu tomon',
            partOfSpeech: 'Olmosh',
            sampleSentence: 'ここは きょうしつです。',
            sampleSentenceUz: 'Bu yer sinfxonadir.',
            order: 1,
          },
          {
            word: 'そこ (そちら)',
            furigana: 'そこ (そちら)',
            romaji: 'soko (sochira)',
            meaningUz: 'u yer / u tomon',
            partOfSpeech: 'Olmosh',
            sampleSentence: 'そこは うけつけです。',
            sampleSentenceUz: 'U yer qabulxona (reception).',
            order: 2,
          },
          {
            word: 'あそこ (あちら)',
            furigana: 'あそこ (あちら)',
            romaji: 'asoko (achira)',
            meaningUz: 'ana u yer / ana u tomon',
            partOfSpeech: 'Olmosh',
            sampleSentence: 'あそこは しょくどうです。',
            sampleSentenceUz: 'Ana u yer oshxona.',
            order: 3,
          },
          {
            word: 'どこ (どちら)',
            furigana: 'どこ (どちら)',
            romaji: 'doko (dochira)',
            meaningUz: 'qayer / qaysi tomon',
            partOfSpeech: 'Soʻroq',
            sampleSentence: 'おてあらいは どこですか。',
            sampleSentenceUz: 'Hojatxona qayerda?',
            order: 4,
          },
          {
            word: 'きょうしつ',
            furigana: 'きょうしつ',
            romaji: 'kyoushitsu',
            meaningUz: 'sinfxona / darsxona',
            partOfSpeech: 'Ot',
            sampleSentence: 'ひろい きょうしつ',
            sampleSentenceUz: 'Keng darsxona',
            order: 5,
          },
          {
            word: 'しょくどう',
            furigana: 'しょくどう',
            romaji: 'shokudou',
            meaningUz: 'oshxona / oshxona zali',
            partOfSpeech: 'Ot',
            sampleSentence: 'だいがくの しょくどう',
            sampleSentenceUz: 'Universitet oshxonasi',
            order: 6,
          },
          {
            word: 'じむしょ',
            furigana: 'じむしょ',
            romaji: 'jimusho',
            meaningUz: 'ofis / idora',
            partOfSpeech: 'Ot',
            sampleSentence: 'かいしゃの じむしょ',
            sampleSentenceUz: 'Kompaniya idorasi',
            order: 7,
          },
          {
            word: 'うけつけ',
            furigana: 'うけつけ',
            romaji: 'uketsuke',
            meaningUz: 'qabulxona / reception',
            partOfSpeech: 'Ot',
            sampleSentence: 'うけつけは 1かいです。',
            sampleSentenceUz: 'Qabulxona 1-qavatda.',
            order: 8,
          },
          {
            word: 'へや',
            furigana: 'へや',
            romaji: 'heya',
            meaningUz: 'xona',
            partOfSpeech: 'Ot',
            sampleSentence: 'わたしの へや',
            sampleSentenceUz: 'Mening xonam',
            order: 9,
          },
          {
            word: 'トイレ (おてあらい)',
            furigana: 'トイレ (おてあらい)',
            romaji: 'toire (otearai)',
            meaningUz: 'hojatxona',
            partOfSpeech: 'Ot',
            sampleSentence: 'トイレは あそこです。',
            sampleSentenceUz: 'Hojatxona ana u yerda.',
            order: 10,
          },
          {
            word: 'かいだん',
            furigana: 'かいだん',
            romaji: 'kaidan',
            meaningUz: 'zina / zinapoya',
            partOfSpeech: 'Ot',
            sampleSentence: 'かいだんを のぼる',
            sampleSentenceUz: 'Zinadan koʻtarilmoq',
            order: 11,
          },
          {
            word: 'いくら',
            furigana: 'いくら',
            romaji: 'ikura',
            meaningUz: 'qancha (narx)',
            partOfSpeech: 'Soʻroq',
            sampleSentence: 'これは いくらですか。',
            sampleSentenceUz: 'Bu qancha turadi?',
            order: 12,
          },
        ];
        for (const item of kotoba3) {
          await this.prisma.kotobaItem.create({
            data: { lessonId: lesson3.id, ...item },
          });
        }

        const bunpou3 = [
          {
            title: '1. ここ / そこ / あそこ は N です (Joyni bildirish)',
            structure: 'ここ / そこ / あそこ は [Joy/Bino] です',
            explanationUz:
              'Joyni koʻrsatishda qoʻllaniladi. ここ — bu yer; そこ — u yer; あそこ — ana u yer.',
            examples: [
              {
                japanese: 'ここは きょうしつです。',
                romaji: 'Koko wa kyoushitsu desu.',
                uzbek: 'Bu yer sinfxonadir.',
              },
              {
                japanese: 'あそこは じむしょです。',
                romaji: 'Asoko wa jimusho desu.',
                uzbek: 'Ana u yer ofisdir.',
              },
            ],
            order: 1,
          },
          {
            title: '2. N は [Joy] です (N qayerda joylashganligi)',
            structure: '[Mavzu/Shaxs/Bino] は [Joy] です',
            explanationUz:
              'Biror bino, xona yoki kishi qayerda joylashganini bildiradi.',
            examples: [
              {
                japanese: 'おてあらいは あそこです。',
                romaji: 'Otearai wa asoko desu.',
                uzbek: 'Hojatxona ana u yerda.',
              },
              {
                japanese: 'せんせいは じむしょです。',
                romaji: 'Sensei wa jimusho desu.',
                uzbek: 'Ustoz ofisdalar.',
              },
            ],
            order: 2,
          },
          {
            title: '3. いくらですか (Narx soʻrash)',
            structure: 'N は いくらですか',
            explanationUz:
              'Buyum yoki xizmat narxini soʻrash uchun ishlatiladi.',
            examples: [
              {
                japanese: 'このくつは いくらですか。',
                romaji: 'Kono kutsu wa ikura desu ka.',
                uzbek: 'Bu poyabzal qancha turadi?',
              },
              {
                japanese: '5000えんです。',
                romaji: 'Gosen-en desu.',
                uzbek: '5000 iyen.',
              },
            ],
            order: 3,
          },
        ];
        for (const b of bunpou3) {
          await this.prisma.bunpouItem.create({
            data: { lessonId: lesson3.id, ...b },
          });
        }

        const kanji3 = [
          {
            character: '学',
            onyomi: 'ガク (GAKU)',
            kunyomi: 'まな・ぶ (mana-bu)',
            meaningUz: 'Oʻrganish, fan',
            strokeCount: 8,
            radical: '子',
            examples: [
              { word: '学生', reading: 'がくせい', meaning: 'Talaba' },
              { word: '大学', reading: 'だいがく', meaning: 'Universitet' },
            ],
            order: 1,
          },
          {
            character: '校',
            onyomi: 'コウ (KOU)',
            kunyomi: '—',
            meaningUz: 'Maktab, bino',
            strokeCount: 10,
            radical: '木',
            examples: [
              { word: '学校', reading: 'がっこう', meaning: 'Maktab' },
              {
                word: '高校',
                reading: 'こうこう',
                meaning: 'Yuqori maktab (litsey)',
              },
            ],
            order: 2,
          },
          {
            character: '先',
            onyomi: 'セン (SEN)',
            kunyomi: 'さき (saki)',
            meaningUz: 'Oldingi, avval',
            strokeCount: 6,
            radical: '儿',
            examples: [
              { word: '先生', reading: 'せんせい', meaning: 'Oʻqituvchi' },
              { word: '先月', reading: 'せんげつ', meaning: 'Oʻtgan oy' },
            ],
            order: 3,
          },
          {
            character: '生',
            onyomi: 'セイ, ショウ (SEI)',
            kunyomi: 'い・きる, う・まれる (i-kiru)',
            meaningUz: 'Hayot, tugʻilish',
            strokeCount: 5,
            radical: '生',
            examples: [
              { word: '先生', reading: 'せんせい', meaning: 'Ustoz' },
              { word: '学生', reading: 'がくせい', meaning: 'Talaba' },
            ],
            order: 4,
          },
        ];
        for (const k of kanji3) {
          await this.prisma.kanjiItem.create({
            data: { lessonId: lesson3.id, ...k },
          });
        }

        const renshuu3 = [
          {
            type: 'QUIZ' as const,
            question:
              'Hojatxona qayerdaligini xushmuomalalik bilan soʻrash qanday boʻladi?',
            options: [
              'おてあらいは どこですか。',
              'おてあらいは なんですか。',
              'おてあらいは だれですか。',
              'おてあらいは いくらですか。',
            ],
            correctAnswer: 'おてあらいは どこですか。',
            explanation:
              'Qayerdaligini soʻrash uchun "どこですか" ishlatiladi.',
            order: 1,
          },
          {
            type: 'QUIZ' as const,
            question: '"Kono kamera wa 30,000-en desu" gapining maʼnosi:',
            options: [
              'Bu kamera 30 000 iyen turadi.',
              'Bu kamera Yaponiyaniki.',
              'Bu kamera ofisda turibdi.',
              'Bu kamera juda qimmat.',
            ],
            correctAnswer: 'Bu kamera 30 000 iyen turadi.',
            explanation: '30,000-en = sanman-en (30 ming iyen).',
            order: 2,
          },
          {
            type: 'AUDIO_LISTENING' as const,
            question:
              'Tinglang: "うけつけは 1かいです。" Qabulxona nechanchi qavatda?',
            options: [
              '1-qavatda',
              '2-qavatda',
              '3-qavatda',
              'Zinapoyaning yonida',
            ],
            correctAnswer: '1-qavatda',
            explanation: '1かい (ikkai) = 1-qavat.',
            order: 3,
          },
        ];
        for (const r of renshuu3) {
          await this.prisma.renshuuItem.create({
            data: { lessonId: lesson3.id, ...r },
          });
        }
      }

      // ==========================================
      // SEED LESSON 4: Vaqt, soatlar va kun tartibi
      // ==========================================
      let lesson4 = await this.prisma.lesson.findFirst({
        where: { moduleId: module1.id, order: 4 },
      });
      if (!lesson4) {
        lesson4 = await this.prisma.lesson.create({
          data: {
            moduleId: module1.id,
            title: '4-dars: Vaqt, soatlar va kun tartibi (Ima nan-ji desu ka)',
            japaneseTitle: '第4課 (Dai 4 Ka)',
            slug: 'lesson-4',
            order: 4,
            summary:
              'Soat va daqiqalarni aytish (ji, fun), haftaning kunlari, feʼllarning hozirgi va oʻtgan zamon tuslanishi (~masu, ~mashita).',
            kaiwaScenario: {
              topic: 'Ish va dars soatlari haqida suhbat',
              partnerName: 'Sato-san',
              goal: 'Kutubxona yoki bank soat nechadan nechagacha ishlashini soʻrang.',
            },
          },
        });
      }

      const l4KotobaCount = await this.prisma.kotobaItem.count({
        where: { lessonId: lesson4.id },
      });
      if (l4KotobaCount === 0) {
        const kotoba4 = [
          {
            word: 'いま',
            furigana: 'いま',
            romaji: 'ima',
            meaningUz: 'hozir',
            partOfSpeech: 'Vaqt',
            sampleSentence: 'いま なんじですか。',
            sampleSentenceUz: 'Hozir soat necha?',
            order: 1,
          },
          {
            word: '～じ (～時)',
            furigana: '～じ',
            romaji: '~ji',
            meaningUz: 'soat ... (masalan: 1-soat)',
            partOfSpeech: 'Hisoblagich',
            sampleSentence: 'いま 9じです。',
            sampleSentenceUz: 'Hozir soat 9.',
            order: 2,
          },
          {
            word: '～ふん / ぷん (～分)',
            furigana: '～ふん',
            romaji: '~fun / ~pun',
            meaningUz: '... daqiqa',
            partOfSpeech: 'Hisoblagich',
            sampleSentence: '9じ 30ぷん (はん)',
            sampleSentenceUz: '9:30 (toʻqqiz yarim)',
            order: 3,
          },
          {
            word: 'はん (半)',
            furigana: 'はん',
            romaji: 'han',
            meaningUz: 'yarim (30 daqiqa)',
            partOfSpeech: 'Vaqt',
            sampleSentence: '5じ はん',
            sampleSentenceUz: 'Besh yarim',
            order: 4,
          },
          {
            word: 'あさ',
            furigana: 'あさ',
            romaji: 'asa',
            meaningUz: 'ertalab / tong',
            partOfSpeech: 'Vaqt',
            sampleSentence: 'まいあさ 6じに おきます。',
            sampleSentenceUz: 'Har kuni ertalab soat 6 da uygʻonaman.',
            order: 5,
          },
          {
            word: 'ひる',
            furigana: 'ひる',
            romaji: 'hiru',
            meaningUz: 'tushlik vaqti / kunduz',
            partOfSpeech: 'Vaqt',
            sampleSentence: 'ひるやすみ',
            sampleSentenceUz: 'Tushlik tanaffusi',
            order: 6,
          },
          {
            word: 'ばん (よる)',
            furigana: 'ばん (よる)',
            romaji: 'ban (yoru)',
            meaningUz: 'oqshom / kechasi',
            partOfSpeech: 'Vaqt',
            sampleSentence: 'まいばん べんきょうします。',
            sampleSentenceUz: 'Har kuni kechqurun dars qilaman.',
            order: 7,
          },
          {
            word: 'おきます',
            furigana: 'おきます',
            romaji: 'okimasu',
            meaningUz: 'uygʻonmoq / turmoq',
            partOfSpeech: 'Feʼl',
            sampleSentence: 'あさ 6じに おきます。',
            sampleSentenceUz: 'Ertalab 6 da uygʻonaman.',
            order: 8,
          },
          {
            word: 'ねます',
            furigana: 'ねます',
            romaji: 'nemasu',
            meaningUz: 'uxlamoq / yotmoq',
            partOfSpeech: 'Feʼl',
            sampleSentence: 'よる 11じに ねます。',
            sampleSentenceUz: 'Kechasi soat 11 da uxlayman.',
            order: 9,
          },
          {
            word: 'はたらきます',
            furigana: 'はたらきます',
            romaji: 'hatarakimasu',
            meaningUz: 'ishlamoq',
            partOfSpeech: 'Feʼl',
            sampleSentence: '9じから 5じまで はたらきます。',
            sampleSentenceUz: '9 dan 5 gacha ishlayman.',
            order: 10,
          },
          {
            word: 'やすみます',
            furigana: 'やすみます',
            romaji: 'yasumimasu',
            meaningUz: 'dam olmoq',
            partOfSpeech: 'Feʼl',
            sampleSentence: 'にちようび やすみます。',
            sampleSentenceUz: 'Yakshanba kuni dam olaman.',
            order: 11,
          },
          {
            word: 'べんきょうします',
            furigana: 'べんきょうします',
            romaji: 'benkyoushimasu',
            meaningUz: 'oʻqimoq / dars qilmoq',
            partOfSpeech: 'Feʼl',
            sampleSentence: 'にほんごを べんきょうします。',
            sampleSentenceUz: 'Yapon tilini oʻrganaman.',
            order: 12,
          },
        ];
        for (const item of kotoba4) {
          await this.prisma.kotobaItem.create({
            data: { lessonId: lesson4.id, ...item },
          });
        }

        const bunpou4 = [
          {
            title: '1. いま [Vaqt] じ [Daqiqa] ふん です (Vaqtni aytish)',
            structure: 'いま ～じ ～ふん です',
            explanationUz:
              'Hozirgi vaqtni aytishda soat uchun ~ji, daqiqa uchun ~fun/pun qoʻshiladi.',
            examples: [
              {
                japanese: 'いま 4じ 15ふんです。',
                romaji: 'Ima yo-ji juugo-fun desu.',
                uzbek: 'Hozir soat 4 dan 15 daqiqa oʻtdi.',
              },
            ],
            order: 1,
          },
          {
            title: '2. [Vaqt] に V-masu (Vaqt partikli に)',
            structure: '[Aniq vaqt] に [Feʼl]-masu',
            explanationUz:
              'Aniq soat yoki kunda sodir boʻladigan harakat uchun に (ni) partikli qoʻyiladi.',
            examples: [
              {
                japanese: 'わたしは 6じはん に おきます。',
                romaji: 'Watashi wa roku-ji han ni okimasu.',
                uzbek: 'Men soat 6 yarimda uygʻonaman.',
              },
            ],
            order: 2,
          },
          {
            title: '3. ～から ～まで (~dan ~gacha)',
            structure: '[Boshlanish] から [Tugash] まで',
            explanationUz:
              'Vaqt yoki joy oraligʻini "dan gacha" deb ifodalashda から (kara) va まで (made) ishlatiladi.',
            examples: [
              {
                japanese: 'ぎんこうは 9じから 3じまでです。',
                romaji: 'Ginkou wa ku-ji kara san-ji made desu.',
                uzbek: 'Bank soat 9 dan 3 gacha ishlaydi.',
              },
            ],
            order: 3,
          },
        ];
        for (const b of bunpou4) {
          await this.prisma.bunpouItem.create({
            data: { lessonId: lesson4.id, ...b },
          });
        }

        const kanji4 = [
          {
            character: '時',
            onyomi: 'ジ (JI)',
            kunyomi: 'とき (toki)',
            meaningUz: 'Vaqt, soat',
            strokeCount: 10,
            radical: '日',
            examples: [
              { word: '何時', reading: 'なんじ', meaning: 'Soat necha?' },
              { word: '時間', reading: 'じかん', meaning: 'Vaqt' },
            ],
            order: 1,
          },
          {
            character: '分',
            onyomi: 'フン, ブン (FUN, BUN)',
            kunyomi: 'わ・かる (wa-karu)',
            meaningUz: 'Daqiqa, tushunmoq, boʻlinmoq',
            strokeCount: 4,
            radical: '刀',
            examples: [
              { word: '五分', reading: 'ごふん', meaning: '5 daqiqa' },
              { word: '半分', reading: 'はんぶん', meaning: 'Yarmi' },
            ],
            order: 2,
          },
          {
            character: '半',
            onyomi: 'ハン (HAN)',
            kunyomi: 'なか・ば (naka-ba)',
            meaningUz: 'Yarim',
            strokeCount: 5,
            radical: '十',
            examples: [
              { word: '半日', reading: 'はんにち', meaning: 'Yarim kun' },
              { word: '九時半', reading: 'くじはん', meaning: 'Toʻqqiz yarim' },
            ],
            order: 3,
          },
          {
            character: '月',
            onyomi: 'ゲツ, ガツ (GETSU, GATSU)',
            kunyomi: 'つき (tsuki)',
            meaningUz: 'Oy, dushanba',
            strokeCount: 4,
            radical: '月',
            examples: [
              { word: '月曜日', reading: 'げつようび', meaning: 'Dushanba' },
              { word: '一月', reading: 'いちがつ', meaning: 'Yanvar' },
            ],
            order: 4,
          },
        ];
        for (const k of kanji4) {
          await this.prisma.kanjiItem.create({
            data: { lessonId: lesson4.id, ...k },
          });
        }

        const renshuu4 = [
          {
            type: 'QUIZ' as const,
            question:
              'Hozir soat 7:30 ekanligini yapon tilida qanday aytiladi?',
            options: [
              'いま 7じ はんです。',
              'いま 7じ 30じです。',
              'いま 7じから 30までです。',
              'いま 7じに おきます。',
            ],
            correctAnswer: 'いま 7じ はんです。',
            explanation: '7:30 = shichi-ji han (yoki shichi-ji sanjuppun).',
            order: 1,
          },
          {
            type: 'QUIZ' as const,
            question:
              '"Kechasi soat 11 da uxlayman" gapidagi boʻsh joyga mos partikl: よる 11じ ___ ねます。',
            options: ['に', 'は', 'を', 'で'],
            correctAnswer: 'に',
            explanation: 'Aniq vaqt koʻrsatilganda "に" partikli ishlatiladi.',
            order: 2,
          },
          {
            type: 'AUDIO_LISTENING' as const,
            question:
              'Tinglang: "まいあさ 6じに おきます。" Soat nechada uygʻonadi?',
            options: ['Soat 6 da', 'Soat 7 da', 'Soat 8 da', 'Soat 5 da'],
            correctAnswer: 'Soat 6 da',
            explanation: '6じ (roku-ji) = soat 6.',
            order: 3,
          },
        ];
        for (const r of renshuu4) {
          await this.prisma.renshuuItem.create({
            data: { lessonId: lesson4.id, ...r },
          });
        }
      }

      // ==========================================
      // SEED LESSON 5: Harakat fe'llari va transport
      // ==========================================
      let lesson5 = await this.prisma.lesson.findFirst({
        where: { moduleId: module1.id, order: 5 },
      });
      if (!lesson5) {
        lesson5 = await this.prisma.lesson.create({
          data: {
            moduleId: module1.id,
            title:
              '5-dars: Harakat feʼllari va transport vositalari (Ikimasu, Kimasu)',
            japaneseTitle: '第5課 (Dai 5 Ka)',
            slug: 'lesson-5',
            order: 5,
            summary:
              'Borish (ikimasu), kelish (kimasu), qaytish (kaerimasu), yoʻnalish partikli (e) hamda transport vositalari (de partikli)ni oʻrganasiz.',
            kaiwaScenario: {
              topic: 'Dam olish kunlaridagi sayohat rejasi',
              partnerName: 'Kimura-san',
              goal: 'Shanba kuni poyezdda qayerga borishingizni ayting.',
            },
          },
        });
      }

      const l5KotobaCount = await this.prisma.kotobaItem.count({
        where: { lessonId: lesson5.id },
      });
      if (l5KotobaCount === 0) {
        const kotoba5 = [
          {
            word: 'いきます (行きます)',
            furigana: 'いきます',
            romaji: 'ikimasu',
            meaningUz: 'bormoq',
            partOfSpeech: 'Feʼl',
            sampleSentence: 'とうきょうへ いきます。',
            sampleSentenceUz: 'Tokioga boraman.',
            order: 1,
          },
          {
            word: 'きます (来ます)',
            furigana: 'きます',
            romaji: 'kimasu',
            meaningUz: 'kelmoq',
            partOfSpeech: 'Feʼl',
            sampleSentence: 'ウズベキスタンから きました。',
            sampleSentenceUz: 'Oʻzbekistondan keldim.',
            order: 2,
          },
          {
            word: 'かえります (帰ります)',
            furigana: 'かえります',
            romaji: 'kaerimasu',
            meaningUz: 'qaytmoq / uyga bormoq',
            partOfSpeech: 'Feʼl',
            sampleSentence: 'うちへ かえります。',
            sampleSentenceUz: 'Uyga qaytaman.',
            order: 3,
          },
          {
            word: 'がっこう (学校)',
            furigana: 'がっこう',
            romaji: 'gakkou',
            meaningUz: 'maktab',
            partOfSpeech: 'Ot',
            sampleSentence: 'がっこうへ いきます。',
            sampleSentenceUz: 'Maktabga boraman.',
            order: 4,
          },
          {
            word: 'スーパー',
            furigana: 'スーパー',
            romaji: 'suupaa',
            meaningUz: 'supermarket',
            partOfSpeech: 'Ot',
            sampleSentence: 'ちかくの スーパー',
            sampleSentenceUz: 'Yaqin atrofdagi supermarket',
            order: 5,
          },
          {
            word: 'えき (駅)',
            furigana: 'えき',
            romaji: 'eki',
            meaningUz: 'vokzal / temir yoʻl bekati',
            partOfSpeech: 'Ot',
            sampleSentence: 'とうきょうえき',
            sampleSentenceUz: 'Tokio vokzali',
            order: 6,
          },
          {
            word: 'ひこうき (飛行機)',
            furigana: 'ひこうき',
            romaji: 'hikouki',
            meaningUz: 'samolyot',
            partOfSpeech: 'Ot',
            sampleSentence: 'ひこうきで いきます。',
            sampleSentenceUz: 'Samolyotda boraman.',
            order: 7,
          },
          {
            word: 'でんしゃ (電車)',
            furigana: 'でんしゃ',
            romaji: 'densha',
            meaningUz: 'poyezd / elektr poyezdi',
            partOfSpeech: 'Ot',
            sampleSentence: 'でんしゃで いきます。',
            sampleSentenceUz: 'Poyezdda boraman.',
            order: 8,
          },
          {
            word: 'ちかてつ (地下鉄)',
            furigana: 'ちかてつ',
            romaji: 'chikatetsu',
            meaningUz: 'metro',
            partOfSpeech: 'Ot',
            sampleSentence: 'ちかてつに のる',
            sampleSentenceUz: 'Metroga chiqmoq',
            order: 9,
          },
          {
            word: 'バス',
            furigana: 'バス',
            romaji: 'basu',
            meaningUz: 'avtobus',
            partOfSpeech: 'Ot',
            sampleSentence: 'バスで がっこうへ いきます。',
            sampleSentenceUz: 'Avtobusda maktabga boraman.',
            order: 10,
          },
          {
            word: 'タクシー',
            furigana: 'タクシー',
            romaji: 'takushii',
            meaningUz: 'taksi',
            partOfSpeech: 'Ot',
            sampleSentence: 'タクシーで かえります。',
            sampleSentenceUz: 'Taksida qaytaman.',
            order: 11,
          },
          {
            word: 'じてんしゃ (自転車)',
            furigana: 'じてんしゃ',
            romaji: 'jitensha',
            meaningUz: 'velosiped',
            partOfSpeech: 'Ot',
            sampleSentence: 'じてんしゃで えきへ いきます。',
            sampleSentenceUz: 'Velosipedda bekatga boraman.',
            order: 12,
          },
        ];
        for (const item of kotoba5) {
          await this.prisma.kotobaItem.create({
            data: { lessonId: lesson5.id, ...item },
          });
        }

        const bunpou5 = [
          {
            title:
              '1. [Joy] へ 行きます / 来ます / 帰ります (Yoʻnalish partikli へ)',
            structure: '[Manzil / Joy] へ (e) いきます / きます / かえります',
            explanationUz:
              'へ (e deb oʻqiladi) — harakat qaysi manzilga yoʻnalganini (ga qoʻshimchasi) bildiradi.',
            examples: [
              {
                japanese: 'わたしは きょうとへ いきます。',
                romaji: 'Watashi wa Kyouto e ikimasu.',
                uzbek: 'Men Kiotoga boraman.',
              },
              {
                japanese: 'うちへ かえります。',
                romaji: 'Uchi e kaerimasu.',
                uzbek: 'Uyga qaytaman.',
              },
            ],
            order: 1,
          },
          {
            title:
              '2. [Transport] で 行きます (Transport vositasi partikli で)',
            structure: '[Transport vositasi] で [Harakat feʼli]',
            explanationUz:
              'Qaysi transport vositasida harakatlanishni bildirish uchun で (de = da) partikli qoʻyiladi. Piyoda yurish uchun あるいて (aruite) ishlatilib, で qoʻyilmaydi.',
            examples: [
              {
                japanese: 'でんしゃで がっこうへ いきます。',
                romaji: 'Densha de gakkou e ikimasu.',
                uzbek: 'Poyezdda maktabga boraman.',
              },
              {
                japanese: 'あるいて かえります。',
                romaji: 'Aruite kaerimasu.',
                uzbek: 'Piyoda qaytaman.',
              },
            ],
            order: 2,
          },
          {
            title: '3. [Shaxs] と 行きます (Birgalik partikli と)',
            structure: '[Kishi] と [Harakat feʼli]',
            explanationUz:
              'Kim bilan birgalikda borishni bildirishda と (to = bilan) ishlatiladi. Yolgʻiz boʻlsa ひとりで (hitori de) deyiladi.',
            examples: [
              {
                japanese: 'ともだちと にほんへ きました。',
                romaji: 'Tomodachi to Nihon e kimashita.',
                uzbek: 'Doʻstim bilan Yaponiyaga keldim.',
              },
            ],
            order: 3,
          },
        ];
        for (const b of bunpou5) {
          await this.prisma.bunpouItem.create({
            data: { lessonId: lesson5.id, ...b },
          });
        }

        const kanji5 = [
          {
            character: '行',
            onyomi: 'コウ, ギョウ (KOU, GYOU)',
            kunyomi: 'い・く, おこな・う (i-ku)',
            meaningUz: 'Bormoq, harakat qilmoq',
            strokeCount: 6,
            radical: '行',
            examples: [
              { word: '行きます', reading: 'いきます', meaning: 'Bormoq' },
              { word: '旅行', reading: 'りょこう', meaning: 'Sayohat' },
            ],
            order: 1,
          },
          {
            character: '来',
            onyomi: 'ライ (RAI)',
            kunyomi: 'く・る, き・ます (ku-ru)',
            meaningUz: 'Kelmoq',
            strokeCount: 7,
            radical: '木',
            examples: [
              { word: '来ます', reading: 'きます', meaning: 'Kelmoq' },
              { word: '来週', reading: 'らいしゅう', meaning: 'Keyingi hafta' },
            ],
            order: 2,
          },
          {
            character: '帰',
            onyomi: 'キ (KI)',
            kunyomi: 'かえ・る (kae-ru)',
            meaningUz: 'Qaytmoq',
            strokeCount: 10,
            radical: '巾',
            examples: [
              { word: '帰ります', reading: 'かえります', meaning: 'Qaytmoq' },
              { word: '帰国', reading: 'きこく', meaning: 'Vatanga qaytish' },
            ],
            order: 3,
          },
          {
            character: '車',
            onyomi: 'シャ (SHA)',
            kunyomi: 'くるま (kuruma)',
            meaningUz: 'Mashina, gʻildirak',
            strokeCount: 7,
            radical: '車',
            examples: [
              { word: '電車', reading: 'でんしゃ', meaning: 'Elektr poyezdi' },
              { word: '自動車', reading: 'じどうしゃ', meaning: 'Avtomobil' },
            ],
            order: 4,
          },
        ];
        for (const k of kanji5) {
          await this.prisma.kanjiItem.create({
            data: { lessonId: lesson5.id, ...k },
          });
        }

        const renshuu5 = [
          {
            type: 'QUIZ' as const,
            question:
              'Tokioga poyezdda borish yapon tilida qanday ifodalanadi?',
            options: [
              'でんしゃで とうきょうへ いきます。',
              'でんしゃへ とうきょうで いきます。',
              'でんしゃを とうきょうに いきます。',
              'でんしゃに とうきょうへ いきます。',
            ],
            correctAnswer: 'でんしゃで とうきょうへ いきます。',
            explanation:
              'Transport uchun で, manzil uchun へ partikli ishlatiladi.',
            order: 1,
          },
          {
            type: 'QUIZ' as const,
            question: '"Tomodachi to Nihon e kimashita" jumlasining maʼnosi:',
            options: [
              'Doʻstim bilan Yaponiyaga keldim.',
              'Doʻstim Yaponiyaga ketdi.',
              'Yolgʻiz oʻzim Kiotoga bordim.',
              'Doʻstim bilan uyga qaytdim.',
            ],
            correctAnswer: 'Doʻstim bilan Yaponiyaga keldim.',
            explanation: 'Tomodachi to = doʻstim bilan, kimashita = keldim.',
            order: 2,
          },
          {
            type: 'AUDIO_LISTENING' as const,
            question:
              'Tinglang: "ひこうきで くにへ かえります。" Qaysi transportda qaytmoqda?',
            options: ['Samolyotda', 'Poyezdda', 'Avtobusda', 'Kemada'],
            correctAnswer: 'Samolyotda',
            explanation: 'ひこうき (hikouki) = samolyot.',
            order: 3,
          },
        ];
        for (const r of renshuu5) {
          await this.prisma.renshuuItem.create({
            data: { lessonId: lesson5.id, ...r },
          });
        }
      }

      this.logger.log('1-Modulning barcha 5 ta darsi toʻliq seed qilindi! 🎉');
    } catch (err) {
      this.logger.error('Kurslarni seed qilishda xatolik:', err);
    }
  }
}
