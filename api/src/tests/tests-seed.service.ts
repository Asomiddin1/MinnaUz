import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourseLevel, TestCategory } from '@prisma/client';

@Injectable()
export class TestsSeedService implements OnModuleInit {
  private readonly logger = new Logger(TestsSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedJlptTests();
  }

  async seedJlptTests() {
    const emptyPublishedTests = await this.prisma.jlptTest.findMany({
      where: {
        isPublished: true,
        questions: { none: {} },
      },
      select: { id: true, title: true },
    });

    if (emptyPublishedTests.length > 0) {
      await this.prisma.jlptTest.updateMany({
        where: { id: { in: emptyPublishedTests.map((test) => test.id) } },
        data: { isPublished: false },
      });
      this.logger.warn(
        `Savolsiz testlar qoralamaga o'tkazildi: ${emptyPublishedTests
          .map((test) => test.title)
          .join(', ')}`,
      );
    }

    // Delete non-full tests if any exist, to ensure only full 3-module tests are shown
    const existing = await this.prisma.jlptTest.findMany({
      select: { id: true, category: true },
    });

    const hasMiniTests = existing.some(
      (t) => t.category !== TestCategory.MOCK_EXAM,
    );
    if (hasMiniTests) {
      this.logger.log(
        "Eski kichik testlar tozalanmoqda, faqat 3 modulli to'liq mock imtihonlar qoldiriladi...",
      );
      await this.prisma.jlptTest.deleteMany({});
    } else if (existing.length >= 2) {
      this.logger.log(
        `Toʻliq JLPT mock testlari mavjud (${existing.length} ta).`,
      );
      return;
    }

    this.logger.log(
      'Toʻliq 3 modulli JLPT imtihonlarini bazaga kiritish boshlandi...',
    );

    // ==========================================
    // 1. JLPT N5 TO'LIQ MOCK IMTIHON #1
    // ==========================================
    await this.prisma.jlptTest.create({
      data: {
        title: 'JLPT N5 Toʻliq Mock Imtihon #1',
        slug: 'jlpt-n5-mock-1',
        description:
          'Haqiqiy Yaponiya JLPT N5 imtihoni andozasidagi toʻliq sinov. 3 ta rasmiy moduldan iborat: 1. Lugʻat & Kanji (文字・語彙), 2. Grammatika & Oʻqish (文法・読解), 3. Tinglab tushunish (聴解 - yagona audio bilan).',
        level: CourseLevel.N5,
        category: TestCategory.MOCK_EXAM,
        durationMinutes: 105,
        passingScore: 80, // Rasmiy JLPT N5 o'tish chegarasi (80/180 ball)
        totalScore: 180,
        audioUrl:
          'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3', // Choukai continuous audio
        order: 1,
        isPublished: true,
        questions: {
          create: [
            // ====================================================
            // MODUL 1: 言語知識（文字・語彙）- Lugʻat & Kanji (Moji / Goi)
            // ====================================================
            {
              section: 'MODULE_1_VOCAB',
              mondaiTitle:
                '【1-Modul: 文字・語彙】問題1: ___の ことばは どう よみますか。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。',
              questionNumber: 1,
              questionText: '毎朝、しんぶんを 読みます。',
              options: ['まいあさ', 'まいばん', 'まいあざ', 'まいしゅう'],
              correctAnswer: 'まいあさ',
              explanation:
                '「毎朝」soʻzi「毎 (mai - har bir)」va「朝 (asa - tong)」kanjilaridan tashkil topgan boʻlib, "har kuni ertalab" (まいあさ) deb oʻqiladi.',
              points: 3,
              order: 1,
            },
            {
              section: 'MODULE_1_VOCAB',
              mondaiTitle:
                '【1-Modul: 文字・語彙】問題1: ___の ことばは どう よみますか。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。',
              questionNumber: 2,
              questionText: 'この 部屋には だれも いません。',
              options: ['へや', 'いえ', 'まち', 'みせ'],
              correctAnswer: 'へや',
              explanation:
                '「部屋」kanjisi "heya" deb oʻqiladi va "xona" maʼnosini bildiradi. (いえ = uy, まち = shahar, みせ = doʻkon).',
              points: 3,
              order: 2,
            },
            {
              section: 'MODULE_1_VOCAB',
              mondaiTitle:
                '【1-Modul: 文字・語彙】問題1: ___の ことばは どう よみますか。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。',
              questionNumber: 3,
              questionText: '父は 会社員です。',
              options: ['かいしゃいん', 'ぎんこういん', 'いしゃ', 'せんせい'],
              correctAnswer: 'かいしゃいん',
              explanation:
                '「会社員」soʻzi "kaishain" deb oʻqiladi va "firma / kompaniya xodimi" degan maʼnoni bildiradi.',
              points: 3,
              order: 3,
            },
            {
              section: 'MODULE_1_VOCAB',
              mondaiTitle:
                '【1-Modul: 文字・語彙】問題1: ___の ことばは どう よみますか。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。',
              questionNumber: 4,
              questionText: '大学の 図書館で 勉強します。',
              options: [
                'としょかん',
                'たいしかん',
                'えいがかん',
                'びじゅつかん',
              ],
              correctAnswer: 'としょかん',
              explanation:
                '「図書館」kanjilari "toshokan" (kutubxona) degan maʼnoni bildiradi. (たいしかん = elchixona, えいがかん = kinoteatr).',
              points: 3,
              order: 4,
            },
            {
              section: 'MODULE_1_VOCAB',
              mondaiTitle:
                '【1-Modul: 文字・語彙】問題2: ___の ことばは どう かきますか。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。',
              questionNumber: 5,
              questionText: 'きのう ともだちと えいがを みました。',
              options: ['友達', '友人', '同僚', '家族'],
              correctAnswer: '友達',
              explanation:
                '「ともだち」soʻzining toʻgʻri N5 kanji yozilishi「友達」boʻladi.',
              points: 3,
              order: 5,
            },
            {
              section: 'MODULE_1_VOCAB',
              mondaiTitle:
                '【1-Modul: 文字・語彙】問題2: ___の ことばは どう かきますか。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。',
              questionNumber: 6,
              questionText: 'あした あめが ふるでしょう。',
              options: ['雨', '雪', '雲', '風'],
              correctAnswer: '雨',
              explanation:
                '「あめ (ame - yomgʻir)」kanjisi「雨」. (雪 = qor, 雲 = bulut, 風 = shamol).',
              points: 3,
              order: 6,
            },
            {
              section: 'MODULE_1_VOCAB',
              mondaiTitle:
                '【1-Modul: 文字・語彙】問題3: 文脈規定 - ( )に なにを いれますか。',
              questionNumber: 7,
              questionText:
                'さとうさんは のどが かわいたので、つめたい 水を ( )。',
              options: ['のみました', 'たべました', 'すいました', 'ききました'],
              correctAnswer: 'のみました',
              explanation:
                'Chanqaganda suvni ichish uchun "飲む" (nomu -> nomimashita) feʼli ishlatiladi.',
              points: 3,
              order: 7,
            },
            {
              section: 'MODULE_1_VOCAB',
              mondaiTitle:
                '【1-Modul: 文字・語彙】問題3: 文脈規定 - ( )に なにを いれますか。',
              questionNumber: 8,
              questionText: '今朝は バスが こなかったので、タクシーに ( )。',
              options: [
                'のりました',
                'おりました',
                'はいりました',
                'でかけました',
              ],
              correctAnswer: 'のりました',
              explanation:
                'Transport vositasiga oʻtirish / minish uchun "〜に乗る" (ni noru -> norimashita) birikmasi qoʻllaniladi.',
              points: 3,
              order: 8,
            },

            // ====================================================
            // MODUL 2: 言語知識（文法）・読解 - Grammatika & Oʻqish
            // ====================================================
            {
              section: 'MODULE_2_GRAMMAR_READING',
              mondaiTitle:
                '【2-Modul: 文法・読解】問題1: 文法形式の判断 - ( )に なにを いれますか。',
              questionNumber: 9,
              questionText: 'わたしは 日曜日( ) どこへも 行きませんでした。',
              options: ['は', 'に', 'を', 'で'],
              correctAnswer: 'は',
              explanation:
                'Inkor harakat kuchaytirilganda yoki vaqt chegaralanganda mavzu yuklamasi sifatida「は (wa)」ishlatiladi: Nichiyoubi wa doko e mo ikimasen deshita.',
              points: 3,
              order: 9,
            },
            {
              section: 'MODULE_2_GRAMMAR_READING',
              mondaiTitle:
                '【2-Modul: 文法・読解】問題1: 文法形式の判断 - ( )に なにを いれますか。',
              questionNumber: 10,
              questionText: 'スプーン( ) スープを 飲みます。',
              options: ['で', 'に', 'を', 'から'],
              correctAnswer: 'で',
              explanation:
                'Harakat bajarilayotgan qurol yoki vositani (qoshiq bilan) ifodalash uchun「で (de)」yuklamasi ishlatiladi: supun de.',
              points: 3,
              order: 10,
            },
            {
              section: 'MODULE_2_GRAMMAR_READING',
              mondaiTitle:
                '【2-Modul: 文法・読解】問題1: 文法形式の判断 - ( )に なにを いれますか。',
              questionNumber: 11,
              questionText: '駅まで 歩いて 15分( ) かかります。',
              options: ['ぐらい', 'ごろ', 'から', 'まで'],
              correctAnswer: 'ぐらい',
              explanation:
                'Davomiylik vaqtiga taxmin qoʻshishda (taxminan 15 daqiqa)「ぐらい (gurai)」qoʻllaniladi.「ごろ (goro)」esa faqat aniq soat nuqtasiga ishlatiladi.',
              points: 3,
              order: 11,
            },
            {
              section: 'MODULE_2_GRAMMAR_READING',
              mondaiTitle:
                '【2-Modul: 文法・読解】問題1: 文法形式の判断 - ( )に なにを いれますか。',
              questionNumber: 12,
              questionText: 'すみません、この 漢字の 読み方を ( ) ください。',
              options: ['おしえて', 'おしえる', 'おしえ', 'おしえた'],
              correctAnswer: 'おしえて',
              explanation:
                'Iltimos bildirish qolipi: Feʼlning Te-shakli + ください (~te kudasai). Oshieru -> Oshiete kudasai (oʻrgatib yuboring).',
              points: 3,
              order: 12,
            },
            {
              section: 'MODULE_2_GRAMMAR_READING',
              mondaiTitle:
                '【2-Modul: 文法・読解】問題2: 文の組み立て (Gap tuzish) - ★に 入る ものは どれですか。',
              questionNumber: 13,
              questionText:
                'わたしは [ 1. で / 2. を / 3. はし / ★4. ごはん ] たべます。★に入る番号を選んでください。',
              options: ['ごはん', 'はし', 'で', 'を'],
              correctAnswer: 'ごはん',
              explanation:
                'Toʻgʻri gap tartibi: わたしは はし(3) で(1) ごはん(4:★) を(2) たべます (Men choʻp bilan ovqat yeyman). ★ oʻrnida 4-raqam: "ごはん" turadi.',
              points: 4,
              order: 13,
            },
            {
              section: 'MODULE_2_GRAMMAR_READING',
              mondaiTitle:
                '【2-Modul: 文法・読解】問題3: 読解 (短文) - つぎの ぶんを よんで こたえて ください。',
              contextText:
                '【たなかさんの メモ】\nらいしゅうの どようびに みんなで サッカーを します。じかんは ごご 2じから 4じまでです。ばしょは みなみこうえんです。あめが ふったら、たいいくかんで します。ボールは たなかさんが もって いきます。',
              questionNumber: 14,
              questionText:
                'あめが ふった ときは、どこで サッカーを しますか。',
              options: [
                'たいいくかん',
                'みなみこうえん',
                'たなかさんの いえ',
                'がっこう',
              ],
              correctAnswer: 'たいいくかん',
              explanation:
                'Matnda aniq aytilgan:「あめが ふったら、たいいくかんで します」(Yomgʻir yogʻsa, sport zalida qilamiz).',
              points: 4,
              order: 14,
            },
            {
              section: 'MODULE_2_GRAMMAR_READING',
              mondaiTitle:
                '【2-Modul: 文法・読解】問題3: 読解 (短文) - つぎの ぶんを よんで こたえて ください。',
              contextText:
                '【たなかさんの メモ】\nらいしゅうの どようびに みんなで サッカーを します。じかんは ごご 2じから 4じまでです。ばしょは みなみこうえんです。あめが ふったら、たいいくかんで します。ボールは たなかさんが もって いきます。',
              questionNumber: 15,
              questionText: 'サッカーは なんじから はじまりますか。',
              options: ['ごご 2じ', 'ごぜん 2じ', 'ごご 4じ', 'ごぜん 10じ'],
              correctAnswer: 'ごご 2じ',
              explanation:
                'Matnga koʻra:「じかんは ごご 2じから 4じまでです」, demak oʻyin tushdan keyin soat 2:00 da (Gogo 2-ji) boshlanadi.',
              points: 4,
              order: 15,
            },

            // ====================================================
            // MODUL 3: 聴解 (Choukai) - Tinglab tushunish (Continuous Audio)
            // ====================================================
            {
              section: 'MODULE_3_LISTENING',
              mondaiTitle:
                '【3-Modul: 聴解 (Choukai)】問題1: 課題理解 - 音声を 聞いて、正しい 答えを 選んで ください。',
              contextText:
                '【第1問】男の人と 女の人が 話しています。男の人は 何と 何を 買いますか。\n(音声ダイアログ: 男「パンを 買いに 行くけど、何か ほしいもの ある？」女「じゃあ、りんごを 2つ お願い。」男「分かった。パンと りんごね。」)',
              questionNumber: 16,
              questionText: '男の人は 何と 何を 買いますか。',
              options: [
                'パンと りんご',
                'パンだけ',
                'りんごだけ',
                'パンと みかん',
              ],
              correctAnswer: 'パンと りんご',
              explanation:
                'Erkak kishi non (pan) olishini, ayol esa olma (ringo) iltimos qilganini eshitamiz. Erkak "Pan to ringo ne" deb tasdiqlaydi.',
              points: 4,
              order: 16,
            },
            {
              section: 'MODULE_3_LISTENING',
              mondaiTitle:
                '【3-Modul: 聴解 (Choukai)】問題1: 課題理解 - 音声を 聞いて、正しい 答えを 選んで ください。',
              contextText:
                '【第2問】先生が 学生に 話しています。学生は 明日 何を 持って きますか。\n(音声ダイアログ: 先生「明日は 遠足です。お弁当と 水筒を 忘れないで ください。教科書は いりませんよ。」)',
              questionNumber: 17,
              questionText: '学生は 明日 何を 持って きますか。',
              options: [
                'お弁当と 水筒',
                '教科書と ノート',
                'お弁当と 教科書',
                '水筒と えんぴつ',
              ],
              correctAnswer: 'お弁当と 水筒',
              explanation:
                'Oʻqituvchi ertaga ensoku (sayr) uchun「お弁当 (obento)」va「水筒 (suitou - suv idishi)」olib kelishni, darslik esa kerak emasligini aytadi.',
              points: 4,
              order: 17,
            },
            {
              section: 'MODULE_3_LISTENING',
              mondaiTitle:
                '【3-Modul: 聴解 (Choukai)】問題2: ポイント理解 - 音声を 聞いて、正しい 答えを 選んで ください。',
              contextText:
                '【第3問】駅で 女の人が 駅員に 聞いています。次の 新宿行きの 電車は 何番線から 出ますか。\n(音声ダイアログ: 女「すみません、新宿行きの 電車は 何番線ですか。」駅員「新宿行きは 3番線ですよ。もうすぐ 来ます。」)',
              questionNumber: 18,
              questionText: '新宿行きの 電車は 何番線ですか。',
              options: ['3番線', '1番線', '2番線', '4番線'],
              correctAnswer: '3番線',
              explanation:
                'Vokzal xodimi Shinjuku tomon poyezd 3-raqamli yoʻldan (San-bansen) joʻnashini aniq aytadi.',
              points: 4,
              order: 18,
            },
          ],
        },
      },
    });

    // ==========================================
    // 2. JLPT N5 TO'LIQ MOCK IMTIHON #2
    // ==========================================
    await this.prisma.jlptTest.create({
      data: {
        title: 'JLPT N5 Toʻliq Mock Imtihon #2',
        slug: 'jlpt-n5-mock-2',
        description:
          'Haqiqiy Yaponiya JLPT N5 imtihonining 2-namunaviy toʻliq varianti. 3 ta rasmiy modul: 1. Lugʻat & Kanji, 2. Grammatika & Oʻqish, 3. Tinglab tushunish (Choukai).',
        level: CourseLevel.N5,
        category: TestCategory.MOCK_EXAM,
        durationMinutes: 105,
        passingScore: 80, // Rasmiy JLPT N5 o'tish chegarasi (80/180 ball)
        totalScore: 180,
        audioUrl:
          'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3',
        order: 2,
        isPublished: true,
        questions: {
          create: [
            // Modul 1
            {
              section: 'MODULE_1_VOCAB',
              mondaiTitle: '【1-Modul: 文字・語彙】問題1: 漢字の 読み方',
              questionNumber: 1,
              questionText: 'きのう 新しい 自転車を 買いました。',
              options: ['あたらしい', 'ふるい', 'おおきい', 'ちいさい'],
              correctAnswer: 'あたらしい',
              explanation:
                '「新しい」kanjisi "atarashii" (yangi) deb oʻqiladi.',
              points: 3,
              order: 1,
            },
            {
              section: 'MODULE_1_VOCAB',
              mondaiTitle: '【1-Modul: 文字・語彙】問題1: 漢字の 読み方',
              questionNumber: 2,
              questionText: '川の 近くに 白い 鳥が います。',
              options: ['しろい', 'くろい', 'あかい', 'あおい'],
              correctAnswer: 'しろい',
              explanation:
                '「白い」kanjisi "shiroi" (oq) degan maʼnoni bildiradi.',
              points: 3,
              order: 2,
            },
            // Modul 2
            {
              section: 'MODULE_2_GRAMMAR_READING',
              mondaiTitle: '【2-Modul: 文法・読解】問題1: 文法形式の判断',
              questionNumber: 3,
              questionText: 'きのうは どこ( ) 行きませんでした。',
              options: ['へも', 'に', 'で', 'を'],
              correctAnswer: 'へも',
              explanation: 'Hech qayerga bormadim: Doko e mo ikimasen deshita.',
              points: 3,
              order: 3,
            },
            {
              section: 'MODULE_2_GRAMMAR_READING',
              mondaiTitle: '【2-Modul: 文法・読解】問題1: 文法形式の判断',
              questionNumber: 4,
              questionText: '田中さんは 日本語を 話す こと( ) じょうずです。',
              options: ['が', 'を', 'に', 'で'],
              correctAnswer: 'が',
              explanation:
                'Mahorat sifatlari (jouzu, heta) bilan「が (ga)」yuklamasi keladi.',
              points: 3,
              order: 4,
            },
            // Modul 3
            {
              section: 'MODULE_3_LISTENING',
              mondaiTitle: '【3-Modul: 聴解 (Choukai)】問題1: 課題理解',
              contextText:
                '【対話】男の人と 女の人が 電話で 話しています。男の人は 何時に 駅に 着きますか。\n(男「もしもし、今 電車に 乗ったよ。あと 10分で 着く。」女「今 2時50分だから、3時ね。待ってるね。」)',
              questionNumber: 5,
              questionText: '男の人は 何時に 駅に 着きますか。',
              options: ['3時', '2時50分', '3時10分', '2時40分'],
              correctAnswer: '3時',
              explanation:
                '2:50 da yana 10 daqiqada yetib borishini aytadi, demak soat 3:00 da (San-ji) yetib boradi.',
              points: 4,
              order: 5,
            },
          ],
        },
      },
    });

    // ==========================================
    // 3. JLPT N4 TO'LIQ MOCK IMTIHON #1
    // ==========================================
    await this.prisma.jlptTest.create({
      data: {
        title: 'JLPT N4 Toʻliq Mock Imtihon #1',
        slug: 'jlpt-n4-mock-1',
        description:
          'Haqiqiy Yaponiya JLPT N4 imtihoni andozasidagi toʻliq sinov. 3 ta rasmiy modul: 1. Lugʻat & Kanji, 2. Grammatika & Oʻqish, 3. Tinglab tushunish (Choukai).',
        level: CourseLevel.N4,
        category: TestCategory.MOCK_EXAM,
        durationMinutes: 115,
        passingScore: 90, // Rasmiy JLPT N4 o'tish chegarasi (90/180 ball)
        totalScore: 180,
        audioUrl:
          'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3',
        order: 3,
        isPublished: true,
        questions: {
          create: [
            {
              section: 'MODULE_1_VOCAB',
              mondaiTitle: '【1-Modul: 文字・語彙】問題1: 漢字の 読み方',
              questionNumber: 1,
              questionText: 'あしたの 会議の 予定を 教えて ください。',
              options: ['よてい', 'よてき', 'よでい', 'よて'],
              correctAnswer: 'よてい',
              explanation:
                '「予定 (yotei)」reja / jadval degan maʼnoni anglatadi.',
              points: 3,
              order: 1,
            },
            {
              section: 'MODULE_2_GRAMMAR_READING',
              mondaiTitle: '【2-Modul: 文法・読解】問題1: 文法',
              questionNumber: 2,
              questionText: 'バスが こないときは、歩いて 行く ( )が あります。',
              options: ['こと', 'もの', 'とき', 'わけ'],
              correctAnswer: 'こと',
              explanation:
                'Baʼzan shunday qilib turaman: Feʼlning oddiy shakli + ことがある (koto ga aru).',
              points: 3,
              order: 2,
            },
            {
              section: 'MODULE_3_LISTENING',
              mondaiTitle: '【3-Modul: 聴解】問題1: 課題理解',
              contextText:
                '【対話】留学生と 先生が 話しています。留学生は 次の 授業までに 何を しますか。\n(先生「来週までに レポートを 出してください。パソコンで 書いてね。」学生「分かりました。」)',
              questionNumber: 3,
              questionText: '留学生は 何を しますか。',
              options: [
                'パソコンで レポートを 書く',
                '本を 読む',
                'テストを 受ける',
                '先生に 電話する',
              ],
              correctAnswer: 'パソコンで レポートを 書く',
              explanation:
                'Oʻqituvchi kompyuterda hisobot yozib kelishni tayinlaydi.',
              points: 4,
              order: 3,
            },
          ],
        },
      },
    });

    this.logger.log(
      'Toʻliq 3 modulli JLPT testlari muvaffaqiyatli bazaga kiritildi!',
    );
  }
}
