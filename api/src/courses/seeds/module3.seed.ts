import { PrismaClient } from '@prisma/client';

export async function seedModule3(prisma: PrismaClient, courseId: string) {
  // 1. Get or create Module 3
  let module3 = await prisma.courseModule.findFirst({
    where: { courseId, order: 3 },
  });

  if (!module3) {
    module3 = await prisma.courseModule.create({
      data: {
        courseId,
        title: '3-Modul: Miqdorlar, Istaklar va Te-forma (11–15 darslar)',
        description: 'Sanoq hisoblagichlari, solishtirish, istaklar (~tai), Te-forma va ruxsat/taqiq qoidalari.',
        order: 3,
      },
    });
  } else {
    await prisma.courseModule.update({
      where: { id: module3.id },
      data: {
        title: '3-Modul: Miqdorlar, Istaklar va Te-forma (11–15 darslar)',
        description: 'Sanoq hisoblagichlari, solishtirish, istaklar (~tai), Te-forma va ruxsat/taqiq qoidalari.',
      },
    });
  }

  // ==========================================
  // LESSON 11: Sanoq so'zlari va davrlar
  // ==========================================
  let lesson11 = await prisma.lesson.findFirst({
    where: { moduleId: module3.id, order: 11 },
  });
  if (!lesson11) {
    lesson11 = await prisma.lesson.create({
      data: {
        moduleId: module3.id,
        title: '11-dars: Sanoq soʻzlari, hisoblagichlar va davomiylik',
        japaneseTitle: '第11課 (Dai 11 Ka)',
        slug: 'lesson-11',
        order: 11,
        summary: 'Ushbu darsda yapon tilining oʻziga xos sanoq hisoblagichlari (hitotsu/futatsu, odamlar uchun -nin, texnika uchun -dai, qogʻoz/varaq uchun -mai) hamda vaqt oraligʻi va chastotani aytish oʻrganiladi.',
        kaiwaScenario: {
          topic: 'Doʻkonda yoki bozorda meva va buyumlarni donalab xarid qilish',
          partnerName: 'Tenin-san (Sotuvchi)',
          goal: 'Olma va apelsin donasini aytib xarid qiling va umumiy narxni soʻrang.',
          sampleDialog: [
            { speaker: 'Tenin', text: 'いらっしゃいませ。何にしますか。', uz: 'Xush kelibsiz! Nima olasiz?' },
            { speaker: 'User', text: 'りんごを ３つと みかんを ５つ ください。', uz: '3 ta olma va 5 ta mandarin bering, iltimos.' },
            { speaker: 'Tenin', text: 'はい。全部で ８００円です。', uz: 'Xoʻp. Jami 800 yen boʻladi.' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  const l11KotobaCount = await prisma.kotobaItem.count({ where: { lessonId: lesson11.id } });
  if (l11KotobaCount === 0) {
    const kotoba11 = [
      { word: 'ひとつ', furigana: 'ひとつ', romaji: 'hitotsu', meaningUz: 'bitta (1 ta)', partOfSpeech: 'Sanoq', sampleSentence: 'りんごを ひとつ ください。', sampleSentenceUz: 'Bitta olma bering.', order: 1 },
      { word: 'ふたつ', furigana: 'ふたつ', romaji: 'futatsu', meaningUz: 'ikkita (2 ta)', partOfSpeech: 'Sanoq', sampleSentence: 'みかんを ふたつ たべました。', sampleSentenceUz: 'Ikkita mandarin yedim.', order: 2 },
      { word: 'みっつ', furigana: 'みっつ', romaji: 'mittsu', meaningUz: 'uchta (3 ta)', partOfSpeech: 'Sanoq', sampleSentence: 'パンを みっつ かいました。', sampleSentenceUz: 'Uchta non sotib oldim.', order: 3 },
      { word: 'よっつ', furigana: 'よっつ', romaji: 'yottsu', meaningUz: 'toʻrtta (4 ta)', partOfSpeech: 'Sanoq', sampleSentence: 'たまごを よっつ つかいます。', sampleSentenceUz: 'Toʻrtta tuxum ishlataman.', order: 4 },
      { word: 'いつつ', furigana: 'いつつ', romaji: 'itsutsu', meaningUz: 'beshta (5 ta)', partOfSpeech: 'Sanoq', sampleSentence: 'いすが いつつ あります。', sampleSentenceUz: 'Beshta stul bor.', order: 5 },
      { word: 'むっつ', furigana: 'むっつ', romaji: 'muttsu', meaningUz: 'oltita (6 ta)', partOfSpeech: 'Sanoq', sampleSentence: 'ビールを むっつ ください。', sampleSentenceUz: 'Oltita pivo bering.', order: 6 },
      { word: 'ななつ', furigana: 'ななつ', romaji: 'nanatsu', meaningUz: 'yettita (7 ta)', partOfSpeech: 'Sanoq', sampleSentence: 'ななつ かぞえます。', sampleSentenceUz: 'Yettigacha sanayman.', order: 7 },
      { word: 'やっつ', furigana: 'やっつ', romaji: 'yattsu', meaningUz: 'sakkizta (8 ta)', partOfSpeech: 'Sanoq', sampleSentence: 'ケーキを やっつ かいました。', sampleSentenceUz: 'Sakkizta keks sotib oldim.', order: 8 },
      { word: 'ここのつ', furigana: 'ここのつ', romaji: 'kokonotsu', meaningUz: 'toʻqqizta (9 ta)', partOfSpeech: 'Sanoq', sampleSentence: 'ここのつ あります。', sampleSentenceUz: 'Toʻqqizta bor.', order: 9 },
      { word: 'とお', furigana: 'とお', romaji: 'too', meaningUz: 'oʻnta (10 ta)', partOfSpeech: 'Sanoq', sampleSentence: 'とお かぞえました。', sampleSentenceUz: 'Oʻntagacha sanadim.', order: 10 },
      { word: 'いくつ', furigana: 'いくつ', romaji: 'ikutsu', meaningUz: 'nechta?', partOfSpeech: 'Soʻroq', sampleSentence: 'みかんが いくつ ありますか。', sampleSentenceUz: 'Mandarin nechta bor?', order: 11 },
      { word: 'ひとり', furigana: 'ひとり', romaji: 'hitori', meaningUz: 'bir kishi, yolgʻiz', partOfSpeech: 'Sanoq', sampleSentence: 'ひとりで いきます。', sampleSentenceUz: 'Yolgʻiz oʻzim boraman.', order: 12 },
      { word: 'ふたり', furigana: 'ふたり', romaji: 'futari', meaningUz: 'ikki kishi', partOfSpeech: 'Sanoq', sampleSentence: 'ふたりで たべます。', sampleSentenceUz: 'Ikki kishi boʻlib yeymiz.', order: 13 },
      { word: '〜にん', furigana: '〜にん', romaji: '~nin', meaningUz: '...nafar (kishilar soni)', partOfSpeech: 'Qoʻshimcha', sampleSentence: 'がくせいが ３にん います。', sampleSentenceUz: '3 nafar talaba bor.', order: 14 },
      { word: '〜だい', furigana: '〜だい', romaji: '~dai', meaningUz: '...dona (mashina, texnikalar)', partOfSpeech: 'Qoʻshimcha', sampleSentence: 'くるまが ２だい あります。', sampleSentenceUz: '2 ta mashina bor.', order: 15 },
      { word: '〜まい', furigana: '〜まい', romaji: '~mai', meaningUz: '...varaq, dona (yupqa narsalar)', partOfSpeech: 'Qoʻshimcha', sampleSentence: 'シャツを １まい かいました。', sampleSentenceUz: '1 dona koʻylak sotib oldim.', order: 16 },
      { word: '〜かい', furigana: '〜かい', romaji: '~kai', meaningUz: '...marta, marotaba', partOfSpeech: 'Qoʻshimcha', sampleSentence: 'いっしゅうかんに ２かい いきます。', sampleSentenceUz: 'Haftada 2 marta boraman.', order: 17 },
      { word: 'りんご', furigana: 'りんご', romaji: 'ringo', meaningUz: 'olma', partOfSpeech: 'Ot', sampleSentence: 'あかい りんごです。', sampleSentenceUz: 'Qizil olma.', order: 18 },
      { word: 'みかん', furigana: 'みかん', romaji: 'mikan', meaningUz: 'mandarin', partOfSpeech: 'Ot', sampleSentence: 'あまい みかんです。', sampleSentenceUz: 'Shirin mandarin.', order: 19 },
      { word: 'きって', furigana: 'きって', romaji: 'kitte', meaningUz: 'pochta markasi', partOfSpeech: 'Ot', sampleSentence: 'きってを はります。', sampleSentenceUz: 'Marka yopishtiraman.', order: 20 },
      { word: 'はがき', furigana: 'はがき', romaji: 'hagaki', meaningUz: 'otkritka, tabriknoma', partOfSpeech: 'Ot', sampleSentence: 'はがきを おくります。', sampleSentenceUz: 'Otkritka joʻnataman.', order: 21 },
      { word: 'ふうとう', furigana: 'ふうとう', romaji: 'fuutou', meaningUz: 'konvert', partOfSpeech: 'Ot', sampleSentence: 'ふうとうに いれます。', sampleSentenceUz: 'Konvertga solaman.', order: 22 },
      { word: 'きょうだい', furigana: 'きょうだい', romaji: 'kyoudai', meaningUz: 'aka-uka, opa-singillar', partOfSpeech: 'Ot', sampleSentence: 'きょうだいが ３にん います。', sampleSentenceUz: '3 ta aka-ukam bor.', order: 23 },
      { word: 'どのくらい', furigana: 'どのくらい', romaji: 'dono kurai', meaningUz: 'qancha vaqt / qancha miqdor?', partOfSpeech: 'Soʻroq', sampleSentence: 'どのくらい かかりますか。', sampleSentenceUz: 'Qancha vaqt ketadi?', order: 24 },
    ];
    for (const item of kotoba11) {
      await prisma.kotobaItem.create({ data: { lessonId: lesson11.id, ...item } });
    }
  }

  const l11BunpouCount = await prisma.bunpouItem.count({ where: { lessonId: lesson11.id } });
  if (l11BunpouCount === 0) {
    const bunpou11 = [
      {
        title: 'Sanoq soʻzlarining gapdagi oʻrni',
        structure: 'Ot を Sanoq-soʻzi Feʼl',
        explanationUz: 'Yapon tilida miqdor yoki sanoq soʻzi odatda partikldan keyin, feʼlning bevosita oldida keladi.',
        examples: [
          { japanese: 'りんごを ４つ かいました。', romaji: 'Ringo o yottsu kaimashita.', uzbek: 'Toʻrtta olma sotib oldim.' },
          { japanese: 'がいこくじんの がくせいが ２にん います。', romaji: 'Gaikokujin no gakusei ga futari imasu.', uzbek: 'Chet ellik talabalardan 2 kishi bor.' },
        ],
        order: 1,
      },
      {
        title: 'Davr に 〜かい V (Chastota)',
        structure: 'Davr に Soni/Marta Feʼl',
        explanationUz: 'Muayyan vaqt oraligʻida harakat necha marta takrorlanishini ifodalash uchun ishlatiladi.',
        examples: [
          { japanese: '１かげつに ２かい えいがを みます。', romaji: 'Ikkagetsu ni nikai eiga o mimasu.', uzbek: 'Bir oyda 2 marta kino koʻraman.' },
          { japanese: '１にちに ３かい くすりを のみます。', romaji: 'Ichinichi ni sankai kusuri o nomimasu.', uzbek: 'Bir kunda 3 mahal dori ichaman.' },
        ],
        order: 2,
      },
    ];
    for (const b of bunpou11) {
      await prisma.bunpouItem.create({ data: { lessonId: lesson11.id, ...b } });
    }
  }

  // ==========================================
  // LESSON 12: Sifatlar o'tgan zamoni va solishtirish
  // ==========================================
  let lesson12 = await prisma.lesson.findFirst({
    where: { moduleId: module3.id, order: 12 },
  });
  if (!lesson12) {
    lesson12 = await prisma.lesson.create({
      data: {
        moduleId: module3.id,
        title: '12-dars: Sifatlarning oʻtgan zamoni va solishtirish',
        japaneseTitle: '第12課 (Dai 12 Ka)',
        slug: 'lesson-12',
        order: 12,
        summary: 'Ushbu darsda sifatlarning oʻtgan zamoni (~katta desu / ~deshita), ikki buyumni oʻzaro taqqoslash (A wa B yori...) hamda guruh ichida eng yuqorisini tanlash (ichiban) oʻrganiladi.',
        kaiwaScenario: {
          topic: 'Yil fasllari, sayohat joylari va ob-havoni solishtirish',
          partnerName: 'Kimura-san',
          goal: 'Yaponiyaning qaysi fasli sizga koʻproq yoqishini va nega ekanini ayting.',
          sampleDialog: [
            { speaker: 'Kimura', text: '日本の 季節で いつが 一番 好きですか。', uz: 'Yapon fasllaridan qaysi biri eng koʻp yoqadi?' },
            { speaker: 'User', text: '秋が 一番 好きです。紅葉が とても きれいですから。', uz: 'Kuz eng koʻp yoqadi. Chunki xazon barglari juda chiroyli.' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  // ==========================================
  // LESSON 13: Istaklar (~tai, ~ga hoshii)
  // ==========================================
  let lesson13 = await prisma.lesson.findFirst({
    where: { moduleId: module3.id, order: 13 },
  });
  if (!lesson13) {
    lesson13 = await prisma.lesson.create({
      data: {
        moduleId: module3.id,
        title: '13-dars: Istaklar va Maqsad (~tai desu / ~ga hoshii)',
        japaneseTitle: '第13課 (Dai 13 Ka)',
        slug: 'lesson-13',
        order: 13,
        summary: 'Ushbu darsda buyumga nisbatan istak (~ga hoshii), harakatni bajarish istagi (Feʼl-tai desu) hamda harakat maqsadini bildirish (Joy e Feʼl-oʻzagi ni ikimasu) oʻrganiladi.',
        kaiwaScenario: {
          topic: 'Yozgi taʼtilda nima qilishni va qayerga borishni rejalashtirish',
          partnerName: 'Tanaka-san',
          goal: 'Taʼtilda Yaponiyaning qayeriga sayohat qilishni xohlayotganingizni ayting.',
          sampleDialog: [
            { speaker: 'Tanaka', text: '夏休みに どこへ 行きたいですか。', uz: 'Yozgi taʼtilda qayerga borishni xohlaysiz?' },
            { speaker: 'User', text: '北海道へ 行きたいです。涼しいですから。', uz: 'Xokkaydoga borishni xohlayman. Chunki u yer salqin.' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  // ==========================================
  // LESSON 14: Fe'llarning Te-formasi va Iltimos (~te kudasai)
  // ==========================================
  let lesson14 = await prisma.lesson.findFirst({
    where: { moduleId: module3.id, order: 14 },
  });
  if (!lesson14) {
    lesson14 = await prisma.lesson.create({
      data: {
        moduleId: module3.id,
        title: '14-dars: Feʼllarning Te-formasi va Iltimos shakli (~te kudasai)',
        japaneseTitle: '第14課 (Dai 14 Ka)',
        slug: 'lesson-14',
        order: 14,
        summary: 'Yapon tili grammatikasining eng muhim poydevori: Feʼllarning 3 guruhga boʻlinishi, Te-formaga tuslanish qoidalari, iltimos shakli (~te kudasai) va davomli zamon (~te imasu) asoslari.',
        kaiwaScenario: {
          topic: 'Taksida manzilni aytish yoki doʻkonda yordam soʻrash',
          partnerName: 'Untenshu-san (Haydovchi)',
          goal: 'Haydovchiga vokzalga haydashni va chorrahada toʻxtashni iltimos qiling.',
          sampleDialog: [
            { speaker: 'User', text: '東京駅まで お願いします。', uz: 'Tokio vokzaligacha, iltimos.' },
            { speaker: 'Untenshu', text: 'かしこまりました。', uz: 'Bosh ustiga.' },
            { speaker: 'User', text: 'あの 信号を 右へ 曲がってください。', uz: 'Anavi svetofordan oʻngga buriling, iltimos.' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  // ==========================================
  // LESSON 15: Ruxsat va Taqiq (~te mo ii desu ka)
  // ==========================================
  let lesson15 = await prisma.lesson.findFirst({
    where: { moduleId: module3.id, order: 15 },
  });
  if (!lesson15) {
    lesson15 = await prisma.lesson.create({
      data: {
        moduleId: module3.id,
        title: '15-dars: Ruxsat va Taqiq (~te mo ii desu ka / ~te wa ikemasen)',
        japaneseTitle: '第15課 (Dai 15 Ka)',
        slug: 'lesson-15',
        order: 15,
        summary: 'Ushbu darsda biror ishni qilishga ruxsat soʻrash (~te mo ii desu ka), taqiqlash (~te wa ikemasen) hamda hozirgi holatni ifodalovchi feʼllar (shitte imasu, sunde imasu, motte imasu) oʻrganiladi.',
        kaiwaScenario: {
          topic: 'Muzeyda yoki kutubxonada qoidalarni soʻrash',
          partnerName: 'Kakarichou (Xodim)',
          goal: 'Muzeyda rasmga olish mumkin yoki mumkin emasligini soʻrang.',
          sampleDialog: [
            { speaker: 'User', text: 'すみません、ここで 写真を 撮っても いいですか。', uz: 'Kechirasiz, bu yerda rasmga olsam maylimi?' },
            { speaker: 'Kakarichou', text: 'いいえ、撮っては いけません。撮影禁止です。', uz: 'Yoʻq, olish mumkin emas. Suratga olish taqiqlangan.' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  console.log('✅ Module 3 (Lessons 11-15) muvaffaqiyatli seed qilindi!');
}

