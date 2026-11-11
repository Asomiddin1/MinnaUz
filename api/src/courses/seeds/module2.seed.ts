import { PrismaClient } from '@prisma/client';

export async function seedModule2(prisma: PrismaClient, courseId: string) {
  // 1. Get or create Module 2
  let module2 = await prisma.courseModule.findFirst({
    where: { courseId, order: 2 },
  });

  if (!module2) {
    module2 = await prisma.courseModule.create({
      data: {
        courseId,
        title: '2-Modul: Kundalik Harakatlar, Sifatlar va Bor/Yoʻqlik (6–10 darslar)',
        description: 'Kundalik harakatlar, qurol-vositalar, sifatlar, yoqtirish va mavjudlik (arimasu/imasu).',
        order: 2,
      },
    });
  } else {
    await prisma.courseModule.update({
      where: { id: module2.id },
      data: {
        title: '2-Modul: Kundalik Harakatlar, Sifatlar va Bor/Yoʻqlik (6–10 darslar)',
        description: 'Kundalik harakatlar, qurol-vositalar, sifatlar, yoqtirish va mavjudlik (arimasu/imasu).',
      },
    });
  }

  // ==========================================
  // LESSON 6: Harakat fe'llari va を partikli
  // ==========================================
  let lesson6 = await prisma.lesson.findFirst({
    where: { moduleId: module2.id, order: 6 },
  });
  if (!lesson6) {
    lesson6 = await prisma.lesson.create({
      data: {
        moduleId: module2.id,
        title: '6-dars: Kundalik harakatlar va takliflar (O partikli)',
        japaneseTitle: '第6課 (Dai 6 Ka)',
        slug: 'lesson-6',
        order: 6,
        summary: 'Ushbu darsda harakat feʼllari, obyekt partikli (o), harakat sodir boʻladigan joy (de) hamda birgalikda biror ish qilishga taklif shakllari (~masenka / ~mashou) oʻrganiladi.',
        kaiwaScenario: {
          topic: 'Doʻst bilan tushlikka yoki dam olish kunida kinoga borishni rejalashtirish',
          partnerName: 'Sato-san',
          goal: 'Birga qahvaxonaga borishni taklif qiling va qayerda uchrashishni kelishib oling.',
          sampleDialog: [
            {
              speaker: 'Sato',
              text: 'いっしょに ひるごはんを たべませんか。',
              uz: 'Birga tushlik qilmaymizmi?',
            },
            {
              speaker: 'User',
              text: 'ええ、たべましょう。どこで たべますか。',
              uz: 'Ha, mayli yeymiz. Qayerda yeymiz?',
            },
            {
              speaker: 'Sato',
              text: 'あの レストランで たべましょう。',
              uz: 'Anavi restoranda yeylik.',
            },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  const l6KotobaCount = await prisma.kotobaItem.count({ where: { lessonId: lesson6.id } });
  if (l6KotobaCount === 0) {
    const kotoba6 = [
      { word: 'たべます', furigana: 'たべます', romaji: 'tabemasu', meaningUz: 'yemoq', partOfSpeech: "Fe'l", sampleSentence: 'ごはんを たべます。', sampleSentenceUz: 'Ovqat yeyman.', order: 1 },
      { word: 'のみます', furigana: 'のみます', romaji: 'nomimasu', meaningUz: 'ichmoq', partOfSpeech: "Fe'l", sampleSentence: 'みずを のみます。', sampleSentenceUz: 'Suv ichaman.', order: 2 },
      { word: 'すいます [たばこを~]', furigana: 'すいます', romaji: 'suimasu', meaningUz: 'chekmoq (tamaki)', partOfSpeech: "Fe'l", sampleSentence: 'たばこを すいません。', sampleSentenceUz: 'Tamaki chekmayman.', order: 3 },
      { word: 'みます', furigana: 'みます', romaji: 'mimasu', meaningUz: 'koʻrmoq, tomosha qilmoq', partOfSpeech: "Fe'l", sampleSentence: 'テレビを みます。', sampleSentenceUz: 'Televizor koʻraman.', order: 4 },
      { word: 'ききます', furigana: 'ききます', romaji: 'kikimasu', meaningUz: 'eshitmoq, tinglamoq', partOfSpeech: "Fe'l", sampleSentence: 'おんがくを ききます。', sampleSentenceUz: 'Musiqa tinglayman.', order: 5 },
      { word: 'よみます', furigana: 'よみます', romaji: 'yomimasu', meaningUz: 'oʻqimoq', partOfSpeech: "Fe'l", sampleSentence: 'ほんを よみます。', sampleSentenceUz: 'Kitob oʻqiyman.', order: 6 },
      { word: 'かきます', furigana: 'かきます', romaji: 'kakimasu', meaningUz: 'yozmoq, chizmoq', partOfSpeech: "Fe'l", sampleSentence: 'てがみを かきます。', sampleSentenceUz: 'Xat yozaman.', order: 7 },
      { word: 'かいます', furigana: 'かいます', romaji: 'kaimasu', meaningUz: 'sotib olmoq', partOfSpeech: "Fe'l", sampleSentence: 'パンを かいます。', sampleSentenceUz: 'Non sotib olaman.', order: 8 },
      { word: 'とります [しゃしんを~]', furigana: 'とります', romaji: 'torimasu', meaningUz: 'suratga olmoq', partOfSpeech: "Fe'l", sampleSentence: 'しゃしんを とります。', sampleSentenceUz: 'Suratga olaman.', order: 9 },
      { word: 'します', furigana: 'します', romaji: 'shimasu', meaningUz: 'qilmoq, bajarmoq', partOfSpeech: "Fe'l", sampleSentence: 'サッカーを します。', sampleSentenceUz: 'Futbol oʻynayman.', order: 10 },
      { word: 'あいます [ともだちに~]', furigana: 'あいます', romaji: 'aimasu', meaningUz: 'uchrashmoq (doʻst bilan)', partOfSpeech: "Fe'l", sampleSentence: 'えきで ともだちに あいます。', sampleSentenceUz: 'Vokzalda doʻstim bilan uchrashaman.', order: 11 },
      { word: 'ごはん', furigana: 'ごはん', romaji: 'gohan', meaningUz: 'taom, pishgan guruch', partOfSpeech: 'Ot', sampleSentence: 'あさごはんを たべました。', sampleSentenceUz: 'Ertalabki nonushtani yedim.', order: 12 },
      { word: 'あさごはん', furigana: 'あさごはん', romaji: 'asagohan', meaningUz: 'nonushta', partOfSpeech: 'Ot', sampleSentence: 'あさごはんを たべます。', sampleSentenceUz: 'Nonushta qilaman.', order: 13 },
      { word: 'ひるごはん', furigana: 'ひるごはん', romaji: 'hirugohan', meaningUz: 'tushlik', partOfSpeech: 'Ot', sampleSentence: 'ひるごはんを たべましょう。', sampleSentenceUz: 'Tushlik qilaylik.', order: 14 },
      { word: 'ばんごはん', furigana: 'ばんごはん', romaji: 'bangohan', meaningUz: 'kechki ovqat', partOfSpeech: 'Ot', sampleSentence: 'ばんごはんを つくります。', sampleSentenceUz: 'Kechki ovqat tayyorlayman.', order: 15 },
      { word: 'パン', furigana: 'パン', romaji: 'pan', meaningUz: 'non', partOfSpeech: 'Ot', sampleSentence: '毎朝パンを食べます。', sampleSentenceUz: 'Har tong non yeyman.', order: 16 },
      { word: 'たまご', furigana: 'たまご', romaji: 'tamago', meaningUz: 'tuxum', partOfSpeech: 'Ot', sampleSentence: 'たまごを かいました。', sampleSentenceUz: 'Tuxum sotib oldim.', order: 17 },
      { word: 'にく', furigana: 'にく', romaji: 'niku', meaningUz: 'goʻsht', partOfSpeech: 'Ot', sampleSentence: 'ぎゅうにくが すきです。', sampleSentenceUz: 'Mol goʻshtini yoqtiraman.', order: 18 },
      { word: 'さかな', furigana: 'さかな', romaji: 'sakana', meaningUz: 'baliq', partOfSpeech: 'Ot', sampleSentence: 'さかなを たべます。', sampleSentenceUz: 'Baliq yeyman.', order: 19 },
      { word: 'やさい', furigana: 'やさい', romaji: 'yasai', meaningUz: 'sabzavot', partOfSpeech: 'Ot', sampleSentence: 'やさいを たくさん たべます。', sampleSentenceUz: 'Koʻp sabzavot yeyman.', order: 20 },
      { word: 'くだもの', furigana: 'くだもの', romaji: 'kudamono', meaningUz: 'meva', partOfSpeech: 'Ot', sampleSentence: 'くだものを かいました。', sampleSentenceUz: 'Meva sotib oldim.', order: 21 },
      { word: 'みず', furigana: 'みず', romaji: 'mizu', meaningUz: 'suv', partOfSpeech: 'Ot', sampleSentence: 'つめたい みずを ください。', sampleSentenceUz: 'Muzdek suv bering.', order: 22 },
      { word: 'おちゃ', furigana: 'おちゃ', romaji: 'ocha', meaningUz: 'yashil choy', partOfSpeech: 'Ot', sampleSentence: 'おちゃを のみます。', sampleSentenceUz: 'Choy ichaman.', order: 23 },
      { word: 'ジュース', furigana: 'ジュース', romaji: 'juusu', meaningUz: 'sharbat (sok)', partOfSpeech: 'Ot', sampleSentence: 'りんごジュースを のみます。', sampleSentenceUz: 'Olma sharbati ichaman.', order: 24 },
      { word: 'えいが', furigana: 'えいが', romaji: 'eiga', meaningUz: 'kino, film', partOfSpeech: 'Ot', sampleSentence: 'きのう えいがを みました。', sampleSentenceUz: 'Kecha kino koʻrdim.', order: 25 },
      { word: 'てがみ', furigana: 'てがみ', romaji: 'tegami', meaningUz: 'xat', partOfSpeech: 'Ot', sampleSentence: 'ともだちに てがみを かきます。', sampleSentenceUz: 'Doʻstimga xat yozaman.', order: 26 },
      { word: 'みせ', furigana: 'みせ', romaji: 'mise', meaningUz: 'doʻkon', partOfSpeech: 'Ot', sampleSentence: 'あの みせで かいました。', sampleSentenceUz: 'Anavi doʻkondan sotib oldim.', order: 27 },
      { word: 'レストラン', furigana: 'レストラン', romaji: 'resutoran', meaningUz: 'restoran', partOfSpeech: 'Ot', sampleSentence: 'レストランで たべます。', sampleSentenceUz: 'Restoranda yeyman.', order: 28 },
      { word: 'ときどき', furigana: 'ときどき', romaji: 'tokidoki', meaningUz: 'baʼzan, onda-sonda', partOfSpeech: 'Ravish', sampleSentence: 'ときどき テニスを します。', sampleSentenceUz: 'Baʼzan tennis oʻynayman.', order: 29 },
      { word: 'いつも', furigana: 'いつも', romaji: 'itsumo', meaningUz: 'har doim, doimo', partOfSpeech: 'Ravish', sampleSentence: 'いつも ７じに おきます。', sampleSentenceUz: 'Doimo soat 7 da uygʻonaman.', order: 30 },
      { word: 'いっしょに', furigana: 'いっしょに', romaji: 'isshoni', meaningUz: 'birgalikda, birga', partOfSpeech: 'Ravish', sampleSentence: 'いっしょに いきましょう。', sampleSentenceUz: 'Birga ketaylik.', order: 31 },
    ];
    for (const item of kotoba6) {
      await prisma.kotobaItem.create({ data: { lessonId: lesson6.id, ...item } });
    }
  }

  const l6BunpouCount = await prisma.bunpouItem.count({ where: { lessonId: lesson6.id } });
  if (l6BunpouCount === 0) {
    const bunpou6 = [
      {
        title: 'N を V (Obyekt partikli)',
        structure: 'Ot (Narsa) を Feʼl',
        explanationUz: 'Obyekt partikli (を - o) bevosita harakat qaratilgan buyumni bildirish uchun ishlatiladi. Yozilishda を ishlatiladi, lekin [o] deb oʻqiladi.',
        examples: [
          { japanese: 'ジュースを のみます。', romaji: 'Juusu o nomimasu.', uzbek: 'Sharbat ichaman.' },
          { japanese: 'ほんを よみました。', romaji: 'Hon o yomimashita.', uzbek: 'Kitob oʻqidim.' },
          { japanese: 'なにを たべますか。', romaji: 'Nani o tabemasu ka.', uzbek: 'Nima yeysiz?' },
        ],
        order: 1,
      },
      {
        title: 'N (joy) で V (Harakat sodir boʻladigan joy)',
        structure: 'Joy で Feʼl',
        explanationUz: 'で (de) partikli harakat qaysi joyda sodir boʻlayotganini bildiradi. (5-darsdagi transport vositasi partiklidan farqli oʻlaroq, bu yerda ish-harakat joyini koʻrsatadi).',
        examples: [
          { japanese: 'しょくどうで ひるごはんを たべます。', romaji: 'Shokudou de hirugohan o tabemasu.', uzbek: 'Oshxonada tushlik qilaman.' },
          { japanese: 'としょかんで べんきょうしました。', romaji: 'Toshokan de benkyou shimashita.', uzbek: 'Kutubxonada dars qildim.' },
          { japanese: 'どこで その えいがを みましたか。', romaji: 'Doko de sono eiga o mimashita ka.', uzbek: 'U kinoni qayerda koʻrdingiz?' },
        ],
        order: 2,
      },
      {
        title: 'V-ませんか (Taklif qilish)',
        structure: 'Feʼl negizi + ませんか',
        explanationUz: 'Suhbatdoshni birgalikda biror harakatni amalga oshirishga xushmuomalalik bilan taklif qilish uchun ishlatiladi ("...maysizmi?").',
        examples: [
          { japanese: 'いっしょに きょうとへ いきませんか。', romaji: 'Issho ni Kyouto e ikimasen ka.', uzbek: 'Birga Kiotoga bormaymizmi?' },
          { japanese: 'おちゃを のみませんか。', romaji: 'Ocha o nomimasen ka.', uzbek: 'Choy ichmaysizmi?' },
        ],
        order: 3,
      },
      {
        title: 'V-ましょう (Taklifga rozilik yoki tashabbus)',
        structure: 'Feʼl negizi + ましょう',
        explanationUz: 'Taklifga ijobiy javob berish yoki suhbatdoshni harakatga undash uchun ishlatiladi ("...aylik, ketdik!").',
        examples: [
          { japanese: 'ええ、いきましょう。', romaji: 'Ee, ikimashou.', uzbek: 'Ha, mayli, ketdik.' },
          { japanese: 'ちょっと やすみましょう。', romaji: 'Chotto yasumimashou.', uzbek: 'Biroz dam olaylik.' },
        ],
        order: 4,
      },
    ];
    for (const b of bunpou6) {
      await prisma.bunpouItem.create({ data: { lessonId: lesson6.id, ...b } });
    }
  }

  const l6KanjiCount = await prisma.kanjiItem.count({ where: { lessonId: lesson6.id } });
  if (l6KanjiCount === 0) {
    const kanji6 = [
      {
        character: '食',
        onyomi: 'ショク (SHOKU)',
        kunyomi: 'た・べる (ta-beru)',
        meaningUz: 'Yemoq, ozuqa',
        strokeCount: 9,
        radical: '食',
        examples: [
          { word: '食べます', reading: 'たべます', meaning: 'Yemoq' },
          { word: '食堂', reading: 'しょくどう', meaning: 'Oshxona' },
          { word: '食事', reading: 'しょくじ', meaning: 'Taomlanish' },
        ],
        order: 1,
      },
      {
        character: '飲',
        onyomi: 'イン (IN)',
        kunyomi: 'の・む (no-mu)',
        meaningUz: 'Ichmoq',
        strokeCount: 12,
        radical: '食',
        examples: [
          { word: '飲みます', reading: 'のみます', meaning: 'Ichmoq' },
          { word: '飲み物', reading: 'のみもの', meaning: 'Ichimlik' },
          { word: '飲料水', reading: 'いんりょうすい', meaning: 'Ichimlik suvi' },
        ],
        order: 2,
      },
      {
        character: '見',
        onyomi: 'ケン (KEN)',
        kunyomi: 'み・る (mi-ru)',
        meaningUz: 'Koʻrmoq, qaramoq',
        strokeCount: 7,
        radical: '見',
        examples: [
          { word: '見ます', reading: 'みます', meaning: 'Koʻrmoq' },
          { word: '見学', reading: 'けんがく', meaning: 'Oʻrganish sayohati' },
          { word: '花見', reading: 'はなみ', meaning: 'Gullarni tomosha qilish' },
        ],
        order: 3,
      },
      {
        character: '聞',
        onyomi: 'ブン (BUN)',
        kunyomi: 'き・く (ki-ku)',
        meaningUz: 'Eshitmoq, tinglamoq, soʻramoq',
        strokeCount: 14,
        radical: '耳',
        examples: [
          { word: '聞きます', reading: 'ききます', meaning: 'Eshitmoq' },
          { word: '新聞', reading: 'しんぶん', meaning: 'Gazeta' },
        ],
        order: 4,
      },
    ];
    for (const k of kanji6) {
      await prisma.kanjiItem.create({ data: { lessonId: lesson6.id, ...k } });
    }
  }

  const l6RenshuuCount = await prisma.renshuuItem.count({ where: { lessonId: lesson6.id } });
  if (l6RenshuuCount === 0) {
    const renshuu6 = [
      {
        type: 'QUIZ' as const,
        question: '“Restoranda baliq yedim” gapining toʻgʻri tarjimasini tanlang:',
        options: [
          'レストランで さかなを たべました。',
          'レストランへ さかなで たべました。',
          'レストランを さかなに たべました。',
          'レストランに さかなを たべます。',
        ],
        correctAnswer: 'レストランで さかなを たべました。',
        explanation: 'Harakat sodir boʻladigan joy uchun で, obyekt uchun を partikli ishlatiladi.',
        order: 1,
      },
      {
        type: 'QUIZ' as const,
        question: '“Birga qahva ichmaysizmi?” taklif jumlasini toping:',
        options: [
          'いっしょに コーヒーを のみませんか。',
          'いっしょに コーヒーを のみましょう。',
          'いっしょに コーヒーを のみますか。',
          'いっしょに コーヒーを のみません。',
        ],
        correctAnswer: 'いっしょに コーヒーを のみませんか。',
        explanation: 'Taklif shakli feʼl negiziga 〜ませんか qoʻshish orqali yasaladi.',
        order: 2,
      },
      {
        type: 'FILL_BLANK' as const,
        question: 'Mos partiklni qoʻying: まいあさ パン [ ? ] たべます。',
        options: ['を', 'で', 'に', 'へ'],
        correctAnswer: 'を',
        explanation: 'Non yeyish harakatining bevosita obyekti boʻlgani uchun を partikli qoʻyiladi.',
        order: 3,
      },
      {
        type: 'AUDIO_LISTENING' as const,
        question: 'Tinglang: “ロビーで ともだちに あいました。” U qayerda doʻsti bilan uchrashdi?',
        options: ['Lobbida (mehmonxona kirish zalida)', 'Kutubxonada', 'Xonada', 'Vokzalda'],
        correctAnswer: 'Lobbida (mehmonxona kirish zalida)',
        explanation: 'ロビー (robii) = kutish zali, lobbi.',
        order: 4,
      },
    ];
    for (const r of renshuu6) {
      await prisma.renshuuItem.create({ data: { lessonId: lesson6.id, ...r } });
    }
  }

  // ==========================================
  // LESSON 7: Qurol-vosita (de), hadyalar (agemasu/moraimasu)
  // ==========================================
  let lesson7 = await prisma.lesson.findFirst({
    where: { moduleId: module2.id, order: 7 },
  });
  if (!lesson7) {
    lesson7 = await prisma.lesson.create({
      data: {
        moduleId: module2.id,
        title: '7-dars: Qurol, vosita va hadyalar (De / Agemasu / Moraimasu)',
        japaneseTitle: '第7課 (Dai 7 Ka)',
        slug: 'lesson-7',
        order: 7,
        summary: 'Ushbu darsda harakat vositasi (qoshiq, choʻp, til bilan), kimdirga biror narsa berish (agemasu) va olish (moraimasu) hamda "allaqachon bajarildi" (mou ~mashita) ifodalari oʻrganiladi.',
        kaiwaScenario: {
          topic: 'Tugʻilgan kunga yoki yangi yilga sovgʻa berish va tabriklash',
          partnerName: 'Yamada-san',
          goal: 'Yamada-sanga sovgʻa bering va uning nima ekanligini yapon tilida tushuntiring.',
          sampleDialog: [
            {
              speaker: 'User',
              text: '山田さん、これ、どうぞ。誕生日のプレゼントです。',
              uz: 'Yamada-san, marhamat, oling. Tugʻilgan kuningiz uchun sovgʻa.',
            },
            {
              speaker: 'Yamada',
              text: 'ありがとうございます。何ですか。',
              uz: 'Katta rahmat! Bu nima?',
            },
            {
              speaker: 'User',
              text: 'ウズベキスタンの お茶です。どうぞ。',
              uz: 'Oʻzbekiston choyi. Marhamat.',
            },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  const l7KotobaCount = await prisma.kotobaItem.count({ where: { lessonId: lesson7.id } });
  if (l7KotobaCount === 0) {
    const kotoba7 = [
      { word: 'きります', furigana: 'きります', romaji: 'kirimasu', meaningUz: 'kesmoq', partOfSpeech: "Fe'l", sampleSentence: 'ナイフで パンを きります。', sampleSentenceUz: 'Pichoq bilan nonni kesaman.', order: 1 },
      { word: 'おくります', furigana: 'おくります', romaji: 'okurimasu', meaningUz: 'joʻnatmoq', partOfSpeech: "Fe'l", sampleSentence: 'にもつを おくります。', sampleSentenceUz: 'Yukni joʻnataman.', order: 2 },
      { word: 'あげます', furigana: 'あげます', romaji: 'agemasu', meaningUz: 'bermoq, hadya qilmoq', partOfSpeech: "Fe'l", sampleSentence: 'ははに はなを あげます。', sampleSentenceUz: 'Onamga gul beraman.', order: 3 },
      { word: 'もらいます', furigana: 'もらいます', romaji: 'moraimasu', meaningUz: 'olmoq, qabul qilmoq', partOfSpeech: "Fe'l", sampleSentence: 'ちちに プレゼントを もらいました。', sampleSentenceUz: 'Otamdan sovgʻa oldim.', order: 4 },
      { word: 'かします', furigana: 'かします', romaji: 'kashimasu', meaningUz: 'qarzga bermoq (vaqtinchalik)', partOfSpeech: "Fe'l", sampleSentence: 'ともだちに ほんを かします。', sampleSentenceUz: 'Doʻstimga kitob berib turaman.', order: 5 },
      { word: 'かります', furigana: 'かります', romaji: 'karimasu', meaningUz: 'qarzga olmoq (vaqtinchalik)', partOfSpeech: "Fe'l", sampleSentence: 'せんせいに じしょを かりました。', sampleSentenceUz: 'Oʻqituvchidan lugʻat olib turdim.', order: 6 },
      { word: 'おしえます', furigana: 'おしえます', romaji: 'oshiemasu', meaningUz: 'oʻrgatmoq, maʼlum qilmoq', partOfSpeech: "Fe'l", sampleSentence: 'にほんごを おしえます。', sampleSentenceUz: 'Yapon tilini oʻrgataman.', order: 7 },
      { word: 'ならいます', furigana: 'ならいます', romaji: 'naraimasu', meaningUz: 'oʻrganmoq (ustozdan)', partOfSpeech: "Fe'l", sampleSentence: 'ピアノを ならいます。', sampleSentenceUz: 'Pianino chalishni oʻrganaman.', order: 8 },
      { word: 'かけます [でんわを~]', furigana: 'かけます', romaji: 'kakemasu', meaningUz: 'telefon qilmoq', partOfSpeech: "Fe'l", sampleSentence: 'ともだちに でんわを かけます。', sampleSentenceUz: 'Doʻstimga telefon qilaman.', order: 9 },
      { word: 'て', furigana: 'て', romaji: 'te', meaningUz: 'qoʻl', partOfSpeech: 'Ot', sampleSentence: 'てを あらいます。', sampleSentenceUz: 'Qoʻlimni yuvaman.', order: 10 },
      { word: 'はし', furigana: 'はし', romaji: 'hashi', meaningUz: 'ovqat choʻpi (xashi)', partOfSpeech: 'Ot', sampleSentence: 'はしで たべます。', sampleSentenceUz: 'Choʻp bilan yeyman.', order: 11 },
      { word: 'スプーン', furigana: 'スプーン', romaji: 'supuun', meaningUz: 'qoshiq', partOfSpeech: 'Ot', sampleSentence: 'スプーンで たべます。', sampleSentenceUz: 'Qoshiq bilan yeyman.', order: 12 },
      { word: 'ナイフ', furigana: 'ナイフ', romaji: 'naifu', meaningUz: 'pichoq', partOfSpeech: 'Ot', sampleSentence: 'ナイフで きります。', sampleSentenceUz: 'Pichoq bilan kesaman.', order: 13 },
      { word: 'フォーク', furigana: 'フォーク', romaji: 'fooku', meaningUz: 'vilka', partOfSpeech: 'Ot', sampleSentence: 'フォークを つかいます。', sampleSentenceUz: 'Vilka ishlataman.', order: 14 },
      { word: 'はさみ', furigana: 'はさみ', romaji: 'hasami', meaningUz: 'qaychi', partOfSpeech: 'Ot', sampleSentence: 'はさみで かみを きります。', sampleSentenceUz: 'Qaychi bilan qogʻozni kesaman.', order: 15 },
      { word: 'パソコン', furigana: 'パソコン', romaji: 'pasokon', meaningUz: 'kompyuter', partOfSpeech: 'Ot', sampleSentence: 'パソコンで レポートを かきます。', sampleSentenceUz: 'Kompyuterda hisobot yozaman.', order: 16 },
      { word: 'ケータイ', furigana: 'ケータイ', romaji: 'keetai', meaningUz: 'mobil telefon', partOfSpeech: 'Ot', sampleSentence: 'ケータイで しゃしんを とります。', sampleSentenceUz: 'Mobil telefonda suratga olaman.', order: 17 },
      { word: 'メール', furigana: 'メール', romaji: 'meeru', meaningUz: 'elektron xat', partOfSpeech: 'Ot', sampleSentence: 'メールを おくりました。', sampleSentenceUz: 'Xat joʻnatdim.', order: 18 },
      { word: 'かみ', furigana: 'かみ', romaji: 'kami', meaningUz: 'qogʻoz', partOfSpeech: 'Ot', sampleSentence: 'かみに なまえを かいてください。', sampleSentenceUz: 'Qogʻozga ismingizni yozing.', order: 19 },
      { word: 'はな', furigana: 'はな', romaji: 'hana', meaningUz: 'gul', partOfSpeech: 'Ot', sampleSentence: 'きれいな はなですね。', sampleSentenceUz: 'Chiroyli gul-a.', order: 20 },
      { word: 'シャツ', furigana: 'シャツ', romaji: 'shatsu', meaningUz: 'koʻylak', partOfSpeech: 'Ot', sampleSentence: 'しろい シャツを かいました。', sampleSentenceUz: 'Oq koʻylak sotib oldim.', order: 21 },
      { word: 'プレゼント', furigana: 'プレゼント', romaji: 'purezento', meaningUz: 'sovgʻa', partOfSpeech: 'Ot', sampleSentence: 'プレゼントを あげました。', sampleSentenceUz: 'Sovgʻa berdim.', order: 22 },
      { word: 'にもつ', furigana: 'にもつ', romaji: 'nimotsu', meaningUz: 'yuk, posilka', partOfSpeech: 'Ot', sampleSentence: 'にもつを おくります。', sampleSentenceUz: 'Posilkani joʻnataman.', order: 23 },
      { word: 'おかね', furigana: 'おかね', romaji: 'okane', meaningUz: 'pul', partOfSpeech: 'Ot', sampleSentence: 'おかねが ありません。', sampleSentenceUz: 'Pulim yoʻq.', order: 24 },
      { word: 'きっぷ', furigana: 'きっぷ', romaji: 'kippu', meaningUz: 'chipta', partOfSpeech: 'Ot', sampleSentence: 'でんしゃの きっぷを かいました。', sampleSentenceUz: 'Poyezd chiptasini sotib oldim.', order: 25 },
      { word: 'もう', furigana: 'もう', romaji: 'mou', meaningUz: 'allaqachon', partOfSpeech: 'Ravish', sampleSentence: 'もう ひるごはんを たべましたか。', sampleSentenceUz: 'Allaqachon tushlik qildingizmi?', order: 26 },
      { word: 'まだ', furigana: 'まだ', romaji: 'mada', meaningUz: 'hali, hali emas', partOfSpeech: 'Ravish', sampleSentence: 'いいえ、まだです。', sampleSentenceUz: 'Yoʻq, hali emas.', order: 27 },
      { word: 'これから', furigana: 'これから', romaji: 'korekara', meaningUz: 'hozir, bundan buyon', partOfSpeech: 'Ravish', sampleSentence: 'これから たべます。', sampleSentenceUz: 'Hozir yeyman.', order: 28 },
    ];
    for (const item of kotoba7) {
      await prisma.kotobaItem.create({ data: { lessonId: lesson7.id, ...item } });
    }
  }

  const l7BunpouCount = await prisma.bunpouItem.count({ where: { lessonId: lesson7.id } });
  if (l7BunpouCount === 0) {
    const bunpou7 = [
      {
        title: 'N (qurol/vosita) で V',
        structure: 'Qurol/Vosita/Til で Feʼl',
        explanationUz: 'で (de) partikli biror harakat qanday qurol, vosita yoki qaysi tilda bajarilayotganini ifodalaydi ("...orqali, ...bilan, ...da").',
        examples: [
          { japanese: 'はしで たべます。', romaji: 'Hashi de tabemasu.', uzbek: 'Choʻp bilan yeyman.' },
          { japanese: 'にほんごで レポートを かきます。', romaji: 'Nihongo de repooto o kakimasu.', uzbek: 'Yapon tilida hisobot yozaman.' },
        ],
        order: 1,
      },
      {
        title: '“Soʻz / Gap” は 〜ごで なん ですか',
        structure: 'Soʻz は Til-nomi で なん ですか',
        explanationUz: 'Biror soʻz yoki ibora boshqa tilda qanday aytilishini soʻrash usuli.',
        examples: [
          { japanese: '「ありがとう」は えいごで なん ですか。', romaji: '"Arigatou" wa eigo de nan desu ka.', uzbek: '"Arigatou" ingliz tilida nima boʻladi?' },
          { japanese: '「Thank you」です。', romaji: '"Thank you" desu.', uzbek: '"Thank you" boʻladi.' },
        ],
        order: 2,
      },
      {
        title: 'N1 (shaxs) に N2 を あげます',
        structure: 'Qabul qiluvchi に Narsa を あげます',
        explanationUz: 'Kimdirga biror narsani hadya qilish, berish, qarzga berish yoki oʻrgatishni ifodalaydi. Qabul qiluvchi shaxs orqasidan に partikli keladi.',
        examples: [
          { japanese: 'わたしは ははに はなを あげました。', romaji: 'Watashi wa haha ni hana o agemashita.', uzbek: 'Men onamga gul berdim.' },
          { japanese: 'きむらさんに えいごを おしえます。', romaji: 'Kimura-san ni eigo o oshiemasu.', uzbek: 'Kimura xonimga ingliz tilini oʻrgataman.' },
        ],
        order: 3,
      },
      {
        title: 'N1 (shaxs) に / から N2 を もらいます',
        structure: 'Beruvchi に/から Narsa を もらいます',
        explanationUz: 'Kimdandir biror narsa olish, qarzga olish yoki oʻrganishni ifodalaydi. Beruvchi shaxs ortidan に yoki から keladi.',
        examples: [
          { japanese: 'わたしは たなかさんに ほんを もらいました。', romaji: 'Watashi wa Tanaka-san ni hon o moraimashita.', uzbek: 'Men Tanaka-sandan kitob oldim.' },
          { japanese: 'ぎんこうから おかねを かりました。', romaji: 'Ginkou kara okane o karimashita.', uzbek: 'Bankdan qarz (kredit) oldim.' },
        ],
        order: 4,
      },
      {
        title: 'もう V-ました (Allaqachon qilib boʻlindi)',
        structure: 'もう Feʼl-ました',
        explanationUz: 'Harakat allaqachon yakunlanganini bildiradi. Savol berilganda, agar hali qilinmagan boʻlsa "いいえ、まだです" deb javob beriladi.',
        examples: [
          { japanese: 'もう にもつを おくりましたか。', romaji: 'Mou nimotsu o okurimashita ka.', uzbek: 'Posilkani allaqachon joʻnatdingizmi?' },
          { japanese: 'はい、もう おくりました。', romaji: 'Hai, mou okurimashita.', uzbek: 'Ha, allaqachon joʻnatdim.' },
          { japanese: 'いいえ、まだです。', romaji: 'Iie, mada desu.', uzbek: 'Yoʻq, hali emas.' },
        ],
        order: 5,
      },
    ];
    for (const b of bunpou7) {
      await prisma.bunpouItem.create({ data: { lessonId: lesson7.id, ...b } });
    }
  }

  const l7KanjiCount = await prisma.kanjiItem.count({ where: { lessonId: lesson7.id } });
  if (l7KanjiCount === 0) {
    const kanji7 = [
      {
        character: '手',
        onyomi: 'シュ (SHU)',
        kunyomi: 'て (te)',
        meaningUz: 'Qoʻl, mahorat',
        strokeCount: 4,
        radical: '手',
        examples: [
          { word: '手', reading: 'て', meaning: 'Qoʻl' },
          { word: '手紙', reading: 'てがみ', meaning: 'Xat' },
          { word: '上手', reading: 'じょうず', meaning: 'Usta, mohir' },
        ],
        order: 1,
      },
      {
        character: '紙',
        onyomi: 'シ (SHI)',
        kunyomi: 'かみ (kami)',
        meaningUz: 'Qogʻoz',
        strokeCount: 10,
        radical: '糸',
        examples: [
          { word: '手紙', reading: 'てがみ', meaning: 'Xat' },
          { word: '紙', reading: 'かみ', meaning: 'Qogʻoz' },
        ],
        order: 2,
      },
      {
        character: '書',
        onyomi: 'ショ (SHO)',
        kunyomi: 'か・く (ka-ku)',
        meaningUz: 'Yozmoq, kitob',
        strokeCount: 10,
        radical: '曰',
        examples: [
          { word: '書きます', reading: 'かきます', meaning: 'Yozmoq' },
          { word: '辞書', reading: 'じしょ', meaning: 'Lugʻat' },
          { word: '読書', reading: 'どくしょ', meaning: 'Kitob mutolaasi' },
        ],
        order: 3,
      },
      {
        character: '友',
        onyomi: 'ユウ (YUU)',
        kunyomi: 'とも (tomo)',
        meaningUz: 'Doʻst, oʻrtoq',
        strokeCount: 4,
        radical: '又',
        examples: [
          { word: '友達', reading: 'ともだち', meaning: 'Doʻstlar' },
          { word: '親友', reading: 'しんゆう', meaning: 'Yaqin doʻst' },
        ],
        order: 4,
      },
    ];
    for (const k of kanji7) {
      await prisma.kanjiItem.create({ data: { lessonId: lesson7.id, ...k } });
    }
  }

  const l7RenshuuCount = await prisma.renshuuItem.count({ where: { lessonId: lesson7.id } });
  if (l7RenshuuCount === 0) {
    const renshuu7 = [
      {
        type: 'QUIZ' as const,
        question: '“Choʻp (hashi) bilan ovqat yeyman” gapidagi mos partikl qaysi?',
        options: ['はしで', 'はしを', 'はしに', 'はしへ'],
        correctAnswer: 'はしで',
        explanation: 'Qurol yoki vosita vositachiligini bildirish uchun で partikli qoʻllaniladi.',
        order: 1,
      },
      {
        type: 'QUIZ' as const,
        question: '“Doʻstimdan kitob oldim” gapi qanday boʻladi?',
        options: [
          'ともだちに ほんを もらいました。',
          'ともだちに ほんを あげました。',
          'ともだちが ほんを かしました。',
          'ともだちで ほんを もらいました。',
        ],
        correctAnswer: 'ともだちに ほんを もらいました。',
        explanation: 'Boshqa shaxsdan olish feʼli もらいました boʻlib, bergan shaxsga に qoʻshiladi.',
        order: 2,
      },
      {
        type: 'QUIZ' as const,
        question: '“もう ひるごはんを たべましたか” savoliga salbiy javob qanday boʻladi?',
        options: [
          'いいえ、まだです。',
          'いいえ、たべませんでした。',
          'いいえ、もうです。',
          'はい、まだです。',
        ],
        correctAnswer: 'いいえ、まだです。',
        explanation: 'Hali qilinmagan boʻlsa "いいえ、まだです" (Yoʻq, hali emas) deb javob beriladi.',
        order: 3,
      },
    ];
    for (const r of renshuu7) {
      await prisma.renshuuItem.create({ data: { lessonId: lesson7.id, ...r } });
    }
  }

  // ==========================================
  // LESSON 8: Sifatlar (I va Na sifatlar)
  // ==========================================
  let lesson8 = await prisma.lesson.findFirst({
    where: { moduleId: module2.id, order: 8 },
  });
  if (!lesson8) {
    lesson8 = await prisma.lesson.create({
      data: {
        moduleId: module2.id,
        title: '8-dars: Sifatlar (い va な sifatlar dunyosi)',
        japaneseTitle: '第8課 (Dai 8 Ka)',
        slug: 'lesson-8',
        order: 8,
        summary: 'Ushbu darsda yapon tilidagi ikki turdagi sifatlar (i-sifatlar va na-sifatlar), ularning ijobiy va inkor tuslanishlari hamda daraja ravishlari (totemo / amari) oʻrganiladi.',
        kaiwaScenario: {
          topic: 'Yaponiyadagi hayot, ob-havo yoki shahar haqida taassurotlarni soʻrash',
          partnerName: 'Tanaka-san',
          goal: 'Tokio va yapon taomlari haqida oʻz fikringizni bildiring.',
          sampleDialog: [
            {
              speaker: 'Tanaka',
              text: '日本の 生活は どうですか。',
              uz: 'Yaponiyadagi hayot qanday ekan?',
            },
            {
              speaker: 'User',
              text: 'とても 楽しいです。でも、少し 忙しいです。',
              uz: 'Juda maroqli. Lekin, biroz bandman.',
            },
            {
              speaker: 'Tanaka',
              text: '日本の 食べ物は おいしいですか。',
              uz: 'Yapon taomlari mazalimi?',
            },
            {
              speaker: 'User',
              text: 'はい、とても おいしいです。',
              uz: 'Ha, juda ham mazali!',
            },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  const l8KotobaCount = await prisma.kotobaItem.count({ where: { lessonId: lesson8.id } });
  if (l8KotobaCount === 0) {
    const kotoba8 = [
      { word: 'ハンサム[な]', furigana: 'ハンサム[な]', romaji: 'hansamu[na]', meaningUz: 'kelishgan, xushbichim', partOfSpeech: 'Na-sifat', sampleSentence: 'ハンサムな ひとですね。', sampleSentenceUz: 'Kelishgan inson-a.', order: 1 },
      { word: 'きれい[な]', furigana: 'きれい[な]', romaji: 'kirei[na]', meaningUz: 'chiroyli, ozoda, toza', partOfSpeech: 'Na-sifat', sampleSentence: 'へやが きれいです。', sampleSentenceUz: 'Xona ozoda.', order: 2 },
      { word: 'しずか[な]', furigana: 'しずか[な]', romaji: 'shizuka[na]', meaningUz: 'tinch, osoyishta', partOfSpeech: 'Na-sifat', sampleSentence: 'しずかな まちです。', sampleSentenceUz: 'Tinch shahar.', order: 3 },
      { word: 'にぎやか[な]', furigana: 'にぎやか[な]', romaji: 'nigiyaka[na]', meaningUz: 'gavjum, shovqinli', partOfSpeech: 'Na-sifat', sampleSentence: 'とうきょうは にぎやかです。', sampleSentenceUz: 'Tokio gavjum.', order: 4 },
      { word: 'ゆうめい[な]', furigana: 'ゆうめい[な]', romaji: 'yuumei[na]', meaningUz: 'mashhur', partOfSpeech: 'Na-sifat', sampleSentence: 'ゆうめいな レストランです。', sampleSentenceUz: 'Mashhur restoran.', order: 5 },
      { word: 'しんせつ[な]', furigana: 'しんせつ[な]', romaji: 'shinsetsu[na]', meaningUz: 'mehribon, oqkoʻngil', partOfSpeech: 'Na-sifat', sampleSentence: 'たなかさんは しんせつです。', sampleSentenceUz: 'Tanaka-san mehribon.', order: 6 },
      { word: 'げんき[な]', furigana: 'げんき[な]', romaji: 'genki[na]', meaningUz: 'tetik, baquvvat, sogʻlom', partOfSpeech: 'Na-sifat', sampleSentence: 'おげんきですか。', sampleSentenceUz: 'Yaxshimisiz / Tetikmisiz?', order: 7 },
      { word: 'ひま[な]', furigana: 'ひま[な]', romaji: 'hima[na]', meaningUz: 'boʻsh vaqti bor', partOfSpeech: 'Na-sifat', sampleSentence: 'あした ひまですか。', sampleSentenceUz: 'Ertaga boʻshmisiz?', order: 8 },
      { word: 'べんり[な]', furigana: 'べんり[な]', romaji: 'benri[na]', meaningUz: 'qulay', partOfSpeech: 'Na-sifat', sampleSentence: 'ちかてつは べんりです。', sampleSentenceUz: 'Metro qulay.', order: 9 },
      { word: 'おおきい', furigana: 'おおきい', romaji: 'ookii', meaningUz: 'katta', partOfSpeech: 'I-sifat', sampleSentence: 'おおきい いえですね。', sampleSentenceUz: 'Katta uy ekan.', order: 10 },
      { word: 'ちいさい', furigana: 'ちいさい', romaji: 'chiisai', meaningUz: 'kichik', partOfSpeech: 'I-sifat', sampleSentence: 'ちいさい くるまです。', sampleSentenceUz: 'Kichik mashina.', order: 11 },
      { word: 'あたらしい', furigana: 'あたらしい', romaji: 'atarashii', meaningUz: 'yangi', partOfSpeech: 'I-sifat', sampleSentence: 'あたらしい ケータイです。', sampleSentenceUz: 'Yangi mobil telefon.', order: 12 },
      { word: 'ふるい', furigana: 'ふるい', romaji: 'furui', meaningUz: 'eski', partOfSpeech: 'I-sifat', sampleSentence: 'ふるい ほんです。', sampleSentenceUz: 'Eski kitob.', order: 13 },
      { word: 'いい (よい)', furigana: 'いい', romaji: 'ii (yoi)', meaningUz: 'yaxshi', partOfSpeech: 'I-sifat', sampleSentence: 'てんきが いいです。', sampleSentenceUz: 'Ob-havo yaxshi.', order: 14 },
      { word: 'わるい', furigana: 'わるい', romaji: 'warui', meaningUz: 'yomon', partOfSpeech: 'I-sifat', sampleSentence: 'きぶんが わるいです。', sampleSentenceUz: 'Kayfiyatim yomon.', order: 15 },
      { word: 'あつい', furigana: 'あつい', romaji: 'atsui', meaningUz: 'issiq', partOfSpeech: 'I-sifat', sampleSentence: 'きょうは あついです。', sampleSentenceUz: 'Bugun havo issiq.', order: 16 },
      { word: 'さむい', furigana: 'さむい', romaji: 'samui', meaningUz: 'sovuq (havo)', partOfSpeech: 'I-sifat', sampleSentence: 'ふゆは さむいです。', sampleSentenceUz: 'Qishda havo sovuq.', order: 17 },
      { word: 'つめたい', furigana: 'つめたい', romaji: 'tsumetai', meaningUz: 'sovuq, muzdek (buyum/ichimlik)', partOfSpeech: 'I-sifat', sampleSentence: 'つめたい ジュースです。', sampleSentenceUz: 'Muzdek sharbat.', order: 18 },
      { word: 'むずかしい', furigana: 'むずかしい', romaji: 'muzukashii', meaningUz: 'qiyin, murakkab', partOfSpeech: 'I-sifat', sampleSentence: 'にほんごは むずかしいです。', sampleSentenceUz: 'Yapon tili qiyin.', order: 19 },
      { word: 'やさしい', furigana: 'やさしい', romaji: 'yasashii', meaningUz: 'oson, muloyim', partOfSpeech: 'I-sifat', sampleSentence: 'テストは やさしかったです。', sampleSentenceUz: 'Test oson edi.', order: 20 },
      { word: 'たかい', furigana: 'たかい', romaji: 'takai', meaningUz: 'qimmat, baland', partOfSpeech: 'I-sifat', sampleSentence: 'この カメラは たかいです。', sampleSentenceUz: 'Bu kamera qimmat.', order: 21 },
      { word: 'やすい', furigana: 'やすい', romaji: 'yasui', meaningUz: 'arzon', partOfSpeech: 'I-sifat', sampleSentence: 'あの みせは 安いです。', sampleSentenceUz: 'Anavi doʻkon arzon.', order: 22 },
      { word: 'おもしろい', furigana: 'おもしろい', romaji: 'omoshiroi', meaningUz: 'qiziqarli', partOfSpeech: 'I-sifat', sampleSentence: 'おもしろい えいがでした。', sampleSentenceUz: 'Qiziqarli kino edi.', order: 23 },
      { word: 'おいしい', furigana: 'おいしい', romaji: 'oishii', meaningUz: 'mazali', partOfSpeech: 'I-sifat', sampleSentence: 'ラーメンは おいしいです。', sampleSentenceUz: 'Ramen mazali.', order: 24 },
      { word: 'いそがしい', furigana: 'いそがしい', romaji: 'isogashii', meaningUz: 'band', partOfSpeech: 'I-sifat', sampleSentence: 'きょうは いそがしいです。', sampleSentenceUz: 'Bugun bandman.', order: 25 },
      { word: 'たのしい', furigana: 'たのしい', romaji: 'tanoshii', meaningUz: 'maroqli, quvonchli', partOfSpeech: 'I-sifat', sampleSentence: 'りょこうは たのしかったです。', sampleSentenceUz: 'Sayohat maroqli boʻldi.', order: 26 },
      { word: 'とても', furigana: 'とても', romaji: 'totemo', meaningUz: 'juda, nihoyatda', partOfSpeech: 'Ravish', sampleSentence: 'とても おいしいです。', sampleSentenceUz: 'Juda mazali.', order: 27 },
      { word: 'あまり', furigana: 'あまり', romaji: 'amari', meaningUz: 'unchalik emas (inkor bilan)', partOfSpeech: 'Ravish', sampleSentence: 'あまり さむくないです。', sampleSentenceUz: 'Unchalik sovuq emas.', order: 28 },
    ];
    for (const item of kotoba8) {
      await prisma.kotobaItem.create({ data: { lessonId: lesson8.id, ...item } });
    }
  }

  const l8BunpouCount = await prisma.bunpouItem.count({ where: { lessonId: lesson8.id } });
  if (l8BunpouCount === 0) {
    const bunpou8 = [
      {
        title: 'I-sifatlar va ularning tuslanishi',
        structure: 'Ijobiy: ~い です / Inkor: ~くない です',
        explanationUz: 'い-sifatlar oxiri い bilan tugaydi. Inkorda oxirgi い tushib qolib, oʻrniga くない qoʻshiladi. (Diqqat: いい sifatining inkori よくない boʻladi).',
        examples: [
          { japanese: 'この りんごは おいしいです。', romaji: 'Kono ringo wa oishii desu.', uzbek: 'Bu olma mazali.' },
          { japanese: 'あの みせは たかくないです。', romaji: 'Ano mise wa takakunai desu.', uzbek: 'Anavi doʻkon qimmat emas.' },
        ],
        order: 1,
      },
      {
        title: 'Na-sifatlar va ularning tuslanishi',
        structure: 'Ijobiy: ~です / Inkor: ~じゃ ありません',
        explanationUz: 'な-sifatlar xuddi otlar kabi tuslanadi. Gap oxirida kelganda な tushib qoladi va です yoki じゃありません qoʻshiladi.',
        examples: [
          { japanese: 'この まちは しずかです。', romaji: 'Kono machi wa shizuka desu.', uzbek: 'Bu shahar tinch.' },
          { japanese: 'きょうは ひまじゃ ありません。', romaji: 'Kyou wa hima ja arimasen.', uzbek: 'Bugun boʻsh emasman.' },
        ],
        order: 2,
      },
      {
        title: 'Sifat bilan otni bogʻlash',
        structure: 'I-sifat + Ot / Na-sifat + な + Ot',
        explanationUz: 'Sifat ot oldidan kelib uni aniqlaganda: i-sifat oʻzgarishsiz oʻzining い bilan keladi, na-sifat esa ot bilan orasiga な oladi.',
        examples: [
          { japanese: 'おおきい いえ', romaji: 'ookii ie', uzbek: 'katta uy' },
          { japanese: 'しずかな まち', romaji: 'shizukana machi', uzbek: 'tinch shahar' },
          { japanese: 'きむらさんは しんせつな ひとです。', romaji: 'Kimura-san wa shinsetsu na hito desu.', uzbek: 'Kimura-san mehribon inson.' },
        ],
        order: 3,
      },
      {
        title: 'とても (juda) va あまり (unchalik emas)',
        structure: 'とても + Ijobiy / あまり + Inkor',
        explanationUz: 'Daraja ravishlari: とても sifatning kuchli ekanini taʼkidlaydi. あまり esa doimo inkor shakl bilan ishlatilib "unchalik ... emas" maʼnosini bildiradi.',
        examples: [
          { japanese: 'にほんの たべものは とても おいしいです。', romaji: 'Nihon no tabemono wa totemo oishii desu.', uzbek: 'Yapon taomlari juda mazali.' },
          { japanese: 'この えいがは あまり おもしろくないです。', romaji: 'Kono eiga wa amari omoshirokunai desu.', uzbek: 'Bu kino unchalik qiziqarli emas.' },
        ],
        order: 4,
      },
    ];
    for (const b of bunpou8) {
      await prisma.bunpouItem.create({ data: { lessonId: lesson8.id, ...b } });
    }
  }

  const l8KanjiCount = await prisma.kanjiItem.count({ where: { lessonId: lesson8.id } });
  if (l8KanjiCount === 0) {
    const kanji8 = [
      {
        character: '大',
        onyomi: 'ダイ, タイ (DAI, TAI)',
        kunyomi: 'おお・きい (oo-kii)',
        meaningUz: 'Katta, ulkan',
        strokeCount: 3,
        radical: '大',
        examples: [
          { word: '大きい', reading: 'おおきい', meaning: 'Katta' },
          { word: '大学', reading: 'だいがく', meaning: 'Universitet' },
          { word: '大人', reading: 'おとな', meaning: 'Kattalar' },
        ],
        order: 1,
      },
      {
        character: '小',
        onyomi: 'ショウ (SHOU)',
        kunyomi: 'ちい・さい (chii-sai)',
        meaningUz: 'Kichik, mayda',
        strokeCount: 3,
        radical: '小',
        examples: [
          { word: '小さい', reading: 'ちいさい', meaning: 'Kichik' },
          { word: '小学校', reading: 'しょうがっこう', meaning: 'Boshlangʻich maktab' },
        ],
        order: 2,
      },
      {
        character: '新',
        onyomi: 'シン (SHIN)',
        kunyomi: 'あたら・しい (atara-shii)',
        meaningUz: 'Yangi',
        strokeCount: 13,
        radical: '斤',
        examples: [
          { word: '新しい', reading: 'あたらしい', meaning: 'Yangi' },
          { word: '新聞', reading: 'しんぶん', meaning: 'Gazeta' },
          { word: '新年', reading: 'しんねん', meaning: 'Yangi yil' },
        ],
        order: 3,
      },
      {
        character: '古',
        onyomi: 'コ (KO)',
        kunyomi: 'ふる・い (furu-i)',
        meaningUz: 'Eski, qadimiy',
        strokeCount: 5,
        radical: '口',
        examples: [
          { word: '古い', reading: 'ふるい', meaning: 'Eski' },
          { word: '中古', reading: 'ちゅうこ', meaning: 'Ishlatilgan (b/u)' },
        ],
        order: 4,
      },
    ];
    for (const k of kanji8) {
      await prisma.kanjiItem.create({ data: { lessonId: lesson8.id, ...k } });
    }
  }

  const l8RenshuuCount = await prisma.renshuuItem.count({ where: { lessonId: lesson8.id } });
  if (l8RenshuuCount === 0) {
    const renshuu8 = [
      {
        type: 'QUIZ' as const,
        question: '“Kirei” (chiroyli) sifatining inkor shakli qaysi?',
        options: ['きれいじゃ ありません', 'きれいくないです', 'きれいないです', 'きれいではないでした'],
        correctAnswer: 'きれいじゃ ありません',
        explanation: 'Kirei soʻzi oxiri -i bilan tugasa ham na-sifat turiga kiradi, shuning uchun inkori 〜じゃありません boʻladi.',
        order: 1,
      },
      {
        type: 'QUIZ' as const,
        question: '“Bu shahar unchalik tinch emas” jumlasining toʻgʻri varianti:',
        options: [
          'この まちは あまり しずかじゃ ありません。',
          'この まちは とても しずかです。',
          'この まちは あまり しずかです。',
          'この まちは とても しずかくないです。',
        ],
        correctAnswer: 'この まちは あまり しずかじゃ ありません。',
        explanation: 'Amari (unchalik emas) inkor bilan ishlatiladi: あまり + しずかじゃありません.',
        order: 2,
      },
      {
        type: 'FILL_BLANK' as const,
        question: 'Mos qoʻshimchani tanlang: たなかさんは しんせつ [ ? ] ひとです。',
        options: ['な', 'い', 'の', 'で'],
        correctAnswer: 'な',
        explanation: 'Na-sifat ot oldidan kelganda な oladi: しんせつな ひと.',
        order: 3,
      },
    ];
    for (const r of renshuu8) {
      await prisma.renshuuItem.create({ data: { lessonId: lesson8.id, ...r } });
    }
  }

  // ==========================================
  // LESSON 9: Yoqtirish, qobiliyat va sabab
  // ==========================================
  let lesson9 = await prisma.lesson.findFirst({
    where: { moduleId: module2.id, order: 9 },
  });
  if (!lesson9) {
    lesson9 = await prisma.lesson.create({
      data: {
        moduleId: module2.id,
        title: '9-dars: Qobiliyat, yoqtirish va sabab (Suki / Jouzu / Kara)',
        japaneseTitle: '第9課 (Dai 9 Ka)',
        slug: 'lesson-9',
        order: 9,
        summary: 'Ushbu darsda yoqtirish va yoqtirmaslik (suki/kirai), mahorat va noʻnoqlik (jouzu/heta), tushunish (wakarimasu), egalik (arimasu) hamda sabab bildirish (~kara) oʻrganiladi.',
        kaiwaScenario: {
          topic: 'Sevimli mashgʻulotlar, sport va qobiliyatlar haqida suhbat',
          partnerName: 'Yamada-san',
          goal: 'Qaysi sportni yoki musiqa turini yoqtirishingizni va nega yoqtirishingizni tushuntiring.',
          sampleDialog: [
            {
              speaker: 'Yamada',
              text: 'スポーツが すきですか。',
              uz: 'Sportni yoqtirasizmi?',
            },
            {
              speaker: 'User',
              text: 'はい、サッカーが すきです。よく 友だちと します。',
              uz: 'Ha, futbolni yoqtiraman. Tez-tez doʻstlarim bilan oʻynab turaman.',
            },
            {
              speaker: 'Yamada',
              text: 'カラオケは どうですか。',
              uz: 'Karaoke-chi?',
            },
            {
              speaker: 'User',
              text: '歌が 下手ですから、あまり 行きません。',
              uz: 'Qoʻshiq aytishga noʻnoq boʻlganim uchun unchalik bormayman.',
            },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  const l9KotobaCount = await prisma.kotobaItem.count({ where: { lessonId: lesson9.id } });
  if (l9KotobaCount === 0) {
    const kotoba9 = [
      { word: 'わかります', furigana: 'わかります', romaji: 'wakarimasu', meaningUz: 'tushunmoq, bilmoq', partOfSpeech: "Fe'l", sampleSentence: 'にほんごが わかります。', sampleSentenceUz: 'Yapon tilini tushunaman.', order: 1 },
      { word: 'あります', furigana: 'あります', romaji: 'arimasu', meaningUz: 'bormoq, mavjud boʻlmoq', partOfSpeech: "Fe'l", sampleSentence: 'じかんが あります。', sampleSentenceUz: 'Vaqtim bor.', order: 2 },
      { word: 'すき[な]', furigana: 'すき[な]', romaji: 'suki[na]', meaningUz: 'yoqadigan, sevimli', partOfSpeech: 'Na-sifat', sampleSentence: 'さかなが すきです。', sampleSentenceUz: 'Baliqni yoqtiraman.', order: 3 },
      { word: 'きらい[な]', furigana: 'きらい[な]', romaji: 'kirai[na]', meaningUz: 'yoqmaydigan, yomon koʻradigan', partOfSpeech: 'Na-sifat', sampleSentence: 'やさいが きらいです。', sampleSentenceUz: 'Sabzavotni yoqtirmayman.', order: 4 },
      { word: 'じょうず[な]', furigana: 'じょうず[な]', romaji: 'jouzu[na]', meaningUz: 'usta, mohir, epchil', partOfSpeech: 'Na-sifat', sampleSentence: 'うたが じょうずですね。', sampleSentenceUz: 'Qoʻshiqqa ustasiz-a.', order: 5 },
      { word: 'へた[な]', furigana: 'へた[な]', romaji: 'heta[na]', meaningUz: 'noʻnoq, noepchil', partOfSpeech: 'Na-sifat', sampleSentence: 'テニスが へたです。', sampleSentenceUz: 'Tennisga noʻnoqman.', order: 6 },
      { word: 'りょうり', furigana: 'りょうり', romaji: 'ryouri', meaningUz: 'taom, pishiriq, oshxona sanʼati', partOfSpeech: 'Ot', sampleSentence: 'にほんりょうりが すきです。', sampleSentenceUz: 'Yapon taomlarini yoqtiraman.', order: 7 },
      { word: 'スポーツ', furigana: 'スポーツ', romaji: 'supootsu', meaningUz: 'sport', partOfSpeech: 'Ot', sampleSentence: 'スポーツを します。', sampleSentenceUz: 'Sport bilan shugʻullanaman.', order: 8 },
      { word: 'おんがく', furigana: 'おんがく', romaji: 'ongaku', meaningUz: 'musiqa', partOfSpeech: 'Ot', sampleSentence: 'おんがくを ききます。', sampleSentenceUz: 'Musiqa tinglayman.', order: 9 },
      { word: 'うた', furigana: 'うた', romaji: 'uta', meaningUz: 'qoʻshiq', partOfSpeech: 'Ot', sampleSentence: 'うたを うたいます。', sampleSentenceUz: 'Qoʻshiq aytaman.', order: 10 },
      { word: 'え', furigana: 'え', romaji: 'e', meaningUz: 'surat, rasm', partOfSpeech: 'Ot', sampleSentence: 'えを かきます。', sampleSentenceUz: 'Rasm chizaman.', order: 11 },
      { word: 'じ', furigana: 'じ', romaji: 'ji', meaningUz: 'harf, belgi', partOfSpeech: 'Ot', sampleSentence: 'かんじを べんきょうします。', sampleSentenceUz: 'Kanjini oʻrganaman.', order: 12 },
      { word: 'こまかい おかね', furigana: 'こまかい おかね', romaji: 'komakai okane', meaningUz: 'mayda pul', partOfSpeech: 'Ot', sampleSentence: 'こまかい おかねが ありますか。', sampleSentenceUz: 'Mayda pulingiz bormi?', order: 13 },
      { word: 'じかん', furigana: 'じかん', romaji: 'jikan', meaningUz: 'vaqt', partOfSpeech: 'Ot', sampleSentence: 'じかんが ありません。', sampleSentenceUz: 'Vaqtim yoʻq.', order: 14 },
      { word: 'ようじ', furigana: 'ようじ', romaji: 'youji', meaningUz: 'zarur yumush, reja', partOfSpeech: 'Ot', sampleSentence: 'きょうは ようじが あります。', sampleSentenceUz: 'Bugun yumushim bor.', order: 15 },
      { word: 'やくそく', furigana: 'やくそく', romaji: 'yakusoku', meaningUz: 'vaʼda, uchrashuv kelishuvi', partOfSpeech: 'Ot', sampleSentence: 'ともだちと やくそくが あります。', sampleSentenceUz: 'Doʻstim bilan kelishuvim bor.', order: 16 },
      { word: 'よく', furigana: 'よく', romaji: 'yoku', meaningUz: 'yaxshi, puxta, tez-tez', partOfSpeech: 'Ravish', sampleSentence: 'よく わかります。', sampleSentenceUz: 'Yaxshi tushunaman.', order: 17 },
      { word: 'だいたい', furigana: 'だいたい', romaji: 'daitai', meaningUz: 'deyarli, asosan', partOfSpeech: 'Ravish', sampleSentence: 'だいたい わかりました。', sampleSentenceUz: 'Deyarli tushundim.', order: 18 },
      { word: 'たくさん', furigana: 'たくさん', romaji: 'takusan', meaningUz: 'koʻp', partOfSpeech: 'Ravish', sampleSentence: 'ほんが たくさん あります。', sampleSentenceUz: 'Kitob koʻp.', order: 19 },
      { word: 'すこし', furigana: 'すこし', romaji: 'sukoshi', meaningUz: 'ozgina, biroz', partOfSpeech: 'Ravish', sampleSentence: 'すこし にほんごが わかります。', sampleSentenceUz: 'Biroz yapon tilini bilaman.', order: 20 },
      { word: 'ぜんぜん', furigana: 'ぜんぜん', romaji: 'zenzen', meaningUz: 'umuman (inkor bilan)', partOfSpeech: 'Ravish', sampleSentence: 'ぜんぜん わかりません。', sampleSentenceUz: 'Umuman tushunmayapman.', order: 21 },
      { word: 'どうして', furigana: 'どうして', romaji: 'doushite', meaningUz: 'nima uchun, nega', partOfSpeech: 'Soʻroq', sampleSentence: 'どうして きのう やすみましたか。', sampleSentenceUz: 'Nega kecha darsga kelmadingiz?', order: 22 },
      { word: '〜から', furigana: '〜から', romaji: '~kara', meaningUz: '...sababli, chunki...', partOfSpeech: 'Bogʻlovchi', sampleSentence: 'じかんが ありませんから。', sampleSentenceUz: 'Chunki vaqtim yoʻq edi.', order: 23 },
    ];
    for (const item of kotoba9) {
      await prisma.kotobaItem.create({ data: { lessonId: lesson9.id, ...item } });
    }
  }

  const l9BunpouCount = await prisma.bunpouItem.count({ where: { lessonId: lesson9.id } });
  if (l9BunpouCount === 0) {
    const bunpou9 = [
      {
        title: 'N が すきです / きらいです / じょうずです / へたです',
        structure: 'Ot が Sifat です',
        explanationUz: 'Yapon tilida yoqtirish (suki), yoqtirmaslik (kirai), ustalik (jouzu) va noʻnoqlik (heta) kabi hissiy va qobiliyat obyektlari oldidan を emas, balki が (ga) partikli qoʻllaniladi.',
        examples: [
          { japanese: 'わたしは イタリアりょうりが すきです。', romaji: 'Watashi wa Itaria-ryouri ga suki desu.', uzbek: 'Men italyan taomlarini yoqtiraman.' },
          { japanese: 'やまださんは テニスが じょうずです。', romaji: 'Yamada-san wa tenisu ga jouzu desu.', uzbek: 'Yamada janoblari tennisga usta.' },
        ],
        order: 1,
      },
      {
        title: 'N が わかります / あります',
        structure: 'Ot が わかります / あります',
        explanationUz: 'Tushunish (wakarimasu) va mavjudlik/egalik (arimasu) feʼllarida ham obyekt が bilan belgilanadi.',
        examples: [
          { japanese: 'わたしは えいごが わかります。', romaji: 'Watashi wa eigo ga wakarimasu.', uzbek: 'Men ingliz tilini tushunaman.' },
          { japanese: 'きょうは ようじが あります。', romaji: 'Kyou wa youji ga arimasu.', uzbek: 'Bugun zarur yumushim bor.' },
        ],
        order: 2,
      },
      {
        title: 'S1 から、S2 (Sabab bildirish)',
        structure: 'Gap 1 から、Gap 2',
        explanationUz: 'から (kara) gap oʻrtasida kelganda "chunki, sababli" maʼnosini berib, birinchi jumla ikkinchi jumlaga sabab ekanligini koʻrsatadi.',
        examples: [
          { japanese: 'じかんが ありませんから、タクシーで いきます。', romaji: 'Jikan ga arimasen kara, takushii de ikimasu.', uzbek: 'Vaqtim boʻlmagani sababli taksida boraman.' },
          { japanese: 'にほんごが すきですから、まいにち べんきょうします。', romaji: 'Nihongo ga suki desu kara, mainichi benkyou shimasu.', uzbek: 'Yapon tilini yoqtirganim uchun har kuni dars qilaman.' },
        ],
        order: 3,
      },
    ];
    for (const b of bunpou9) {
      await prisma.bunpouItem.create({ data: { lessonId: lesson9.id, ...b } });
    }
  }

  const l9KanjiCount = await prisma.kanjiItem.count({ where: { lessonId: lesson9.id } });
  if (l9KanjiCount === 0) {
    const kanji9 = [
      {
        character: '好',
        onyomi: 'コウ (KOU)',
        kunyomi: 'す・き, この・む (su-ki)',
        meaningUz: 'Yoqtirmoq, yaxshi koʻrmoq',
        strokeCount: 6,
        radical: '女',
        examples: [
          { word: '好き', reading: 'すき', meaning: 'Yoqadigan' },
          { word: '大好物', reading: 'だいこうぶつ', meaning: 'Eng sevimli taom' },
        ],
        order: 1,
      },
      {
        character: '上',
        onyomi: 'ジョウ (JOU)',
        kunyomi: 'うえ, あ・がる (ue)',
        meaningUz: 'Yuqori, usti, usta',
        strokeCount: 3,
        radical: '一',
        examples: [
          { word: '上', reading: 'うえ', meaning: 'Usti' },
          { word: '上手', reading: 'じょうず', meaning: 'Usta, epchil' },
        ],
        order: 2,
      },
      {
        character: '下',
        onyomi: 'カ, ゲ (KA, GE)',
        kunyomi: 'した, さ・がる (shita)',
        meaningUz: 'Quyi, osti, noʻnoq',
        strokeCount: 3,
        radical: '一',
        examples: [
          { word: '下', reading: 'した', meaning: 'Osti' },
          { word: '下手', reading: 'へた', meaning: 'Noʻnoq, tajribasiz' },
          { word: '地下鉄', reading: 'ちかてつ', meaning: 'Metro' },
        ],
        order: 3,
      },
      {
        character: '中',
        onyomi: 'チュウ (CHUU)',
        kunyomi: 'なか (naka)',
        meaningUz: 'Ichida, oʻrtasi',
        strokeCount: 4,
        radical: '丨',
        examples: [
          { word: '中', reading: 'なか', meaning: 'Ichi, ichida' },
          { word: '中国', reading: 'ちゅうごく', meaning: 'Xitoy' },
          { word: '一日中', reading: 'いちにちじゅう', meaning: 'Kun boʻyi' },
        ],
        order: 4,
      },
    ];
    for (const k of kanji9) {
      await prisma.kanjiItem.create({ data: { lessonId: lesson9.id, ...k } });
    }
  }

  const l9RenshuuCount = await prisma.renshuuItem.count({ where: { lessonId: lesson9.id } });
  if (l9RenshuuCount === 0) {
    const renshuu9 = [
      {
        type: 'QUIZ' as const,
        question: '“Men sportni yoqtiraman” jumlasida qaysi partikl ishlatiladi: わたしは スポーツ [ ? ] すきです。',
        options: ['が', 'を', 'に', 'で'],
        correctAnswer: 'が',
        explanation: 'Suki (yoqtirish) sifati oldidan doimo が partikli qoʻllaniladi.',
        order: 1,
      },
      {
        type: 'QUIZ' as const,
        question: '“Ertaga yumushim boʻlgani uchun kela olmayman” gapi yapon tilida qanday bogʻlanadi?',
        options: [
          'あした ようじが ありますから、きません。',
          'あした ようじが ありますでも、きません。',
          'あした ようじが ありますそして、きません。',
          'あした ようじが あります、から きません。',
        ],
        correctAnswer: 'あした ようじが ありますから、きません。',
        explanation: 'Sabab bildirish uchun gap oxiriga 〜から (kara) qoʻshiladi.',
        order: 2,
      },
    ];
    for (const r of renshuu9) {
      await prisma.renshuuItem.create({ data: { lessonId: lesson9.id, ...r } });
    }
  }

  // ==========================================
  // LESSON 10: Mavjudlik (Arimasu / Imasu)
  // ==========================================
  let lesson10 = await prisma.lesson.findFirst({
    where: { moduleId: module2.id, order: 10 },
  });
  if (!lesson10) {
    lesson10 = await prisma.lesson.create({
      data: {
        moduleId: module2.id,
        title: '10-dars: Mavjudlik va joylashuv (Arimasu / Imasu / Joy partikllari)',
        japaneseTitle: '第10課 (Dai 10 Ka)',
        slug: 'lesson-10',
        order: 10,
        summary: 'Ushbu darsda jonsiz narsalar uchun "arimasu", jonli inson va hayvonlar uchun "imasu", joylashuv olmoshlari (usti, osti, yonida, ichida) hamda "ya ~ nado" roʻyxat partikli oʻrganiladi.',
        kaiwaScenario: {
          topic: 'Xona yoki ofisdagi narsa va shaxslarning joylashuvini soʻrash',
          partnerName: 'Sato-san',
          goal: 'Hamkasbingizdan qaychi yoki kalit qayerdaligini soʻrab toping.',
          sampleDialog: [
            {
              speaker: 'User',
              text: 'すみません、はさみは どこに ありますか。',
              uz: 'Kechirasiz, qaychi qayerda bor?',
            },
            {
              speaker: 'Sato',
              text: 'つくえの うえの はこの なかに ありますよ。',
              uz: 'Stol ustidagi qutining ichida bor.',
            },
            {
              speaker: 'User',
              text: 'あ、ありました。ありがとうございます。',
              uz: 'Ha, topdim. Katta rahmat!',
            },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  const l10KotobaCount = await prisma.kotobaItem.count({ where: { lessonId: lesson10.id } });
  if (l10KotobaCount === 0) {
    const kotoba10 = [
      { word: 'います', furigana: 'います', romaji: 'imasu', meaningUz: 'bor boʻlmoq (inson va hayvonlar uchun)', partOfSpeech: "Fe'l", sampleSentence: 'いぬが います。', sampleSentenceUz: 'It bor.', order: 1 },
      { word: 'あります', furigana: 'あります', romaji: 'arimasu', meaningUz: 'bor boʻlmoq (jonsiz buyum va oʻsimliklar uchun)', partOfSpeech: "Fe'l", sampleSentence: 'ほんが あります。', sampleSentenceUz: 'Kitob bor.', order: 2 },
      { word: 'いろいろ[な]', furigana: 'いろいろ[な]', romaji: 'iroiro[na]', meaningUz: 'turli xil, xilma-xil', partOfSpeech: 'Na-sifat', sampleSentence: 'いろいろな みせが あります。', sampleSentenceUz: 'Turli xil doʻkonlar bor.', order: 3 },
      { word: 'おとこの ひと', furigana: 'おとこの ひと', romaji: 'otoko no hito', meaningUz: 'erkak kishi', partOfSpeech: 'Ot', sampleSentence: 'あそこに おとこの ひとが います。', sampleSentenceUz: 'Anavi yerda erkak kishi turibdi.', order: 4 },
      { word: 'おんなの ひと', furigana: 'おんなの ひと', romaji: 'onna no hito', meaningUz: 'ayol kishi', partOfSpeech: 'Ot', sampleSentence: 'おんなの ひとが ２にん います。', sampleSentenceUz: 'Ikki nafar ayol bor.', order: 5 },
      { word: 'おとこの こ', furigana: 'おとこの こ', romaji: 'otoko no ko', meaningUz: 'oʻgʻil bola', partOfSpeech: 'Ot', sampleSentence: 'げんきな おとこの こですね。', sampleSentenceUz: 'Tetik oʻgʻil bola-a.', order: 6 },
      { word: 'おんなの こ', furigana: 'おんなの こ', romaji: 'onna no ko', meaningUz: 'qiz bola', partOfSpeech: 'Ot', sampleSentence: 'かわいい おんなの こです。', sampleSentenceUz: 'Yoqimtoy qizcha.', order: 7 },
      { word: 'いぬ', furigana: 'いぬ', romaji: 'inu', meaningUz: 'it', partOfSpeech: 'Ot', sampleSentence: 'しろい いぬが います。', sampleSentenceUz: 'Oq it bor.', order: 8 },
      { word: 'ねこ', furigana: 'ねこ', romaji: 'neko', meaningUz: 'mushuk', partOfSpeech: 'Ot', sampleSentence: 'へやに ねこが います。', sampleSentenceUz: 'Xonada mushuk bor.', order: 9 },
      { word: 'パンダ', furigana: 'パンダ', romaji: 'panda', meaningUz: 'panda', partOfSpeech: 'Ot', sampleSentence: 'どうぶつえんに パンダが います。', sampleSentenceUz: 'Hayvonot bogʻida panda bor.', order: 10 },
      { word: 'き', furigana: 'き', romaji: 'ki', meaningUz: 'daraxt', partOfSpeech: 'Ot', sampleSentence: 'こうえんに おおきい きが あります。', sampleSentenceUz: 'Xiyobonda katta daraxt bor.', order: 11 },
      { word: 'もの', furigana: 'もの', romaji: 'mono', meaningUz: 'narsa, buyum', partOfSpeech: 'Ot', sampleSentence: 'いろいろな ものを かいました。', sampleSentenceUz: 'Xilma-xil narsalar sotib oldim.', order: 12 },
      { word: 'れいぞうこ', furigana: 'れいぞうこ', romaji: 'reizouko', meaningUz: 'muzlatgich', partOfSpeech: 'Ot', sampleSentence: 'れいぞうこに みずが あります。', sampleSentenceUz: 'Muzlatgichda suv bor.', order: 13 },
      { word: 'テーブル', furigana: 'テーブル', romaji: 'teeburu', meaningUz: 'stol', partOfSpeech: 'Ot', sampleSentence: 'テーブルの うえに あります。', sampleSentenceUz: 'Stolning ustida turibdi.', order: 14 },
      { word: 'ベッド', furigana: 'ベッド', romaji: 'beddo', meaningUz: 'krovat, toʻshak', partOfSpeech: 'Ot', sampleSentence: 'ベッドの したに ねこが います。', sampleSentenceUz: 'Krovat ostida mushuk bor.', order: 15 },
      { word: 'たな', furigana: 'たな', romaji: 'tana', meaningUz: 'javon, tokcha', partOfSpeech: 'Ot', sampleSentence: 'ほんだなに ほんが あります。', sampleSentenceUz: 'Kitob javonida kitoblar bor.', order: 16 },
      { word: 'ドア', furigana: 'ドア', romaji: 'doa', meaningUz: 'eshik', partOfSpeech: 'Ot', sampleSentence: 'ドアを あけてください。', sampleSentenceUz: 'Eshikni oching.', order: 17 },
      { word: 'まど', furigana: 'まど', romaji: 'mado', meaningUz: 'deraza', partOfSpeech: 'Ot', sampleSentence: 'まどの ちかくに すわります。', sampleSentenceUz: 'Deraza yaqiniga oʻtiraman.', order: 18 },
      { word: 'うえ', furigana: 'うえ', romaji: 'ue', meaningUz: 'usti, yuqori', partOfSpeech: 'Joylashuv', sampleSentence: 'つくえの うえ', sampleSentenceUz: 'stol usti', order: 19 },
      { word: 'した', furigana: 'した', romaji: 'shita', meaningUz: 'osti, quyisi', partOfSpeech: 'Joylashuv', sampleSentence: 'つくえの した', sampleSentenceUz: 'stol osti', order: 20 },
      { word: 'まえ', furigana: 'まえ', romaji: 'mae', meaningUz: 'oldi, old tomoni', partOfSpeech: 'Joylashuv', sampleSentence: 'えきの まえ', sampleSentenceUz: 'vokzal oldi', order: 21 },
      { word: 'うしろ', furigana: 'うしろ', romaji: 'ushiro', meaningUz: 'orqasi', partOfSpeech: 'Joylashuv', sampleSentence: 'くるまの うしろ', sampleSentenceUz: 'mashina orqasi', order: 22 },
      { word: 'みぎ', furigana: 'みぎ', romaji: 'migi', meaningUz: 'oʻng tomon', partOfSpeech: 'Joylashuv', sampleSentence: 'みぎへ まがります。', sampleSentenceUz: 'Oʻngga buriling.', order: 23 },
      { word: 'ひだり', furigana: 'ひだり', romaji: 'hidari', meaningUz: 'chap tomon', partOfSpeech: 'Joylashuv', sampleSentence: 'ひだりに ぎんこうが あります。', sampleSentenceUz: 'Chapda bank bor.', order: 24 },
      { word: 'なか', furigana: 'なか', romaji: 'naka', meaningUz: 'ichi, ichkarisi', partOfSpeech: 'Joylashuv', sampleSentence: 'はこの なか', sampleSentenceUz: 'quti ichi', order: 25 },
      { word: 'そと', furigana: 'そと', romaji: 'soto', meaningUz: 'tashqarisi', partOfSpeech: 'Joylashuv', sampleSentence: 'へやの そと', sampleSentenceUz: 'xona tashqarisi', order: 26 },
      { word: 'となり', furigana: 'となり', romaji: 'tonari', meaningUz: 'yonma-yon qoʻshnisi', partOfSpeech: 'Joylashuv', sampleSentence: 'ぎんこうの となり', sampleSentenceUz: 'bank yonidagi bino', order: 27 },
      { word: 'ちかく', furigana: 'ちかく', romaji: 'chikaku', meaningUz: 'yaqini, atrofi', partOfSpeech: 'Joylashuv', sampleSentence: 'いえの ちかく', sampleSentenceUz: 'uy yaqini', order: 28 },
      { word: 'あいだ', furigana: 'あいだ', romaji: 'aida', meaningUz: 'orasi, oraligʻi', partOfSpeech: 'Joylashuv', sampleSentence: 'ほんやと はなやの あいだ', sampleSentenceUz: 'kitob doʻkoni va gul doʻkoni orasi', order: 29 },
    ];
    for (const item of kotoba10) {
      await prisma.kotobaItem.create({ data: { lessonId: lesson10.id, ...item } });
    }
  }

  const l10BunpouCount = await prisma.bunpouItem.count({ where: { lessonId: lesson10.id } });
  if (l10BunpouCount === 0) {
    const bunpou10 = [
      {
        title: 'N (joy) に N (narsa/odam) が あります / います',
        structure: 'Joy に Narsa が あります / Shaxs/Hayvon が います',
        explanationUz: 'Biror joyda buyum borligini aytishda あります (arimasu), odam yoki hayvon borligini aytishda esa います (imasu) ishlatiladi. Joy orqasidan に partikli keladi.',
        examples: [
          { japanese: 'へやに テレビが あります。', romaji: 'Heya ni terebi ga arimasu.', uzbek: 'Xonada televizor bor.' },
          { japanese: 'にわに いぬが います。', romaji: 'Niwa ni inu ga imasu.', uzbek: 'Hovlida it bor.' },
        ],
        order: 1,
      },
      {
        title: 'N は N (joy) に あります / います',
        structure: 'Buyum/Shaxs は Joy に あります/います',
        explanationUz: 'Narsa yoki shaxsning qayerda ekanligini taʼkidlab soʻrash yoki javob berish usuli.',
        examples: [
          { japanese: 'とうきょうディズニーランドは ちばけんに あります。', romaji: 'Toukyou Dizuniirando wa Chiba-ken ni arimasu.', uzbek: 'Tokio Disneylendi Chiba prefekturasida joylashgan.' },
          { japanese: 'ミラさんは じむしょに います。', romaji: 'Miraa-san wa jimusho ni imasu.', uzbek: 'Miller janoblari ofisda.' },
        ],
        order: 2,
      },
      {
        title: 'N1 (joy) の N2 (joylashuv) に N3 が あります/います',
        structure: 'Joy の Joylashuv に Narsa/Shaxs が あります/います',
        explanationUz: 'Biror narsa yoki shaxsning boshqa bir buyumga nisbatan aniq joylashuvini (usti, osti, orqasida) koʻrsatish usuli.',
        examples: [
          { japanese: 'つくえの うえに ほんが あります。', romaji: 'Tsukue no ue ni hon ga arimasu.', uzbek: 'Stol ustida kitob bor.' },
          { japanese: 'ドアの みぎに スイッチが あります。', romaji: 'Doa no migi ni suicchi ga arimasu.', uzbek: 'Eshikning oʻng tomonida oʻchirgʻich bor.' },
        ],
        order: 3,
      },
      {
        title: 'N1 や N2 [など] (Va boshqalar)',
        structure: 'Ot 1 や Ot 2 [など]',
        explanationUz: 'Bir nechta buyumlardan faqat bir ikkitasini namuna sifatida sanab oʻtishda や (ya) va gap oxirida など (nado) qoʻllaniladi.',
        examples: [
          { japanese: 'はこの なかに てがみや しゃしんなどが あります。', romaji: 'Hako no naka ni tegami ya shashin nado ga arimasu.', uzbek: 'Qutining ichida xatlar va suratlar kabilar bor.' },
        ],
        order: 4,
      },
    ];
    for (const b of bunpou10) {
      await prisma.bunpouItem.create({ data: { lessonId: lesson10.id, ...b } });
    }
  }

  const l10KanjiCount = await prisma.kanjiItem.count({ where: { lessonId: lesson10.id } });
  if (l10KanjiCount === 0) {
    const kanji10 = [
      {
        character: '右',
        onyomi: 'ウ, ユウ (U, YUU)',
        kunyomi: 'みぎ (migi)',
        meaningUz: 'Oʻng tomon',
        strokeCount: 5,
        radical: '口',
        examples: [
          { word: '右', reading: 'みぎ', meaning: 'Oʻng' },
          { word: '右手', reading: 'みぎて', meaning: 'Oʻng qoʻl' },
          { word: '左右', reading: 'さゆう', meaning: 'Oʻng va chap, taʼsir' },
        ],
        order: 1,
      },
      {
        character: '左',
        onyomi: 'サ (SA)',
        kunyomi: 'ひだり (hidari)',
        meaningUz: 'Chap tomon',
        strokeCount: 5,
        radical: '工',
        examples: [
          { word: '左', reading: 'ひだり', meaning: 'Chap' },
          { word: '左手', reading: 'ひだりて', meaning: 'Chap qoʻl' },
        ],
        order: 2,
      },
      {
        character: '名',
        onyomi: 'メイ, ミョウ (MEI, MYOU)',
        kunyomi: 'な (na)',
        meaningUz: 'Ism, nom, obroʻ',
        strokeCount: 6,
        radical: '口',
        examples: [
          { word: '名前', reading: 'なまえ', meaning: 'Ism' },
          { word: '有名', reading: 'ゆうめい', meaning: 'Mashhur' },
          { word: '名刺', reading: 'めいし', meaning: 'Tashrif qogʻozi (vizitka)' },
        ],
        order: 3,
      },
      {
        character: '外',
        onyomi: 'ガイ, ゲ (GAI, GE)',
        kunyomi: 'そと, はず・す (soto)',
        meaningUz: 'Tashqari, tashqi, begona',
        strokeCount: 5,
        radical: '夕',
        examples: [
          { word: '外', reading: 'そと', meaning: 'Tashqari' },
          { word: '外国', reading: 'がいこく', meaning: 'Xorijiy davlat' },
          { word: '外国人', reading: 'がいこくじん', meaning: 'Chet ellik' },
        ],
        order: 4,
      },
    ];
    for (const k of kanji10) {
      await prisma.kanjiItem.create({ data: { lessonId: lesson10.id, ...k } });
    }
  }

  const l10RenshuuCount = await prisma.renshuuItem.count({ where: { lessonId: lesson10.id } });
  if (l10RenshuuCount === 0) {
    const renshuu10 = [
      {
        type: 'QUIZ' as const,
        question: '“Xonada mushuk bor” gapida qaysi feʼl toʻgʻri: へやに ねこが [ ? ]。',
        options: ['います', 'あります', 'します', 'いきます'],
        correctAnswer: 'います',
        explanation: 'Mushuk tirik jonzot boʻlganligi uchun います (imasu) ishlatiladi.',
        order: 1,
      },
      {
        type: 'QUIZ' as const,
        question: '“Stol ustida kitob bor” jumlasi qaysi?',
        options: [
          'つくえの うえに ほんが あります。',
          'つくえの したに ほんが あります。',
          'つくえの なかに ほんが います。',
          'つくえの となりに ほんが います。',
        ],
        correctAnswer: 'つくえの うえに ほんが あります。',
        explanation: 'Ue = ustida, hon (kitob) jonsiz buyum boʻlgani uchun あります ishlatiladi.',
        order: 2,
      },
    ];
    for (const r of renshuu10) {
      await prisma.renshuuItem.create({ data: { lessonId: lesson10.id, ...r } });
    }
  }

  console.log('✅ Module 2 (Lessons 6-10) muvaffaqiyatli seed qilindi!');
}
