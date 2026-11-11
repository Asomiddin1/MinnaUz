import { PrismaClient } from '@prisma/client';

export async function seedModule4(prisma: PrismaClient, courseId: string) {
  // 1. Get or create Module 4
  let module4 = await prisma.courseModule.findFirst({
    where: { courseId, order: 4 },
  });

  if (!module4) {
    module4 = await prisma.courseModule.create({
      data: {
        courseId,
        title: '4-Modul: Ketma-ketlik, Nay-forma va Lugʻat shakli (16–20 darslar)',
        description: 'Harakatlar ketma-ketligi, inkor buyruq (nay-forma), qobiliyat (jisho-forma), tajriba (ta-forma) va oddiy uslub (futsuukei).',
        order: 4,
      },
    });
  } else {
    await prisma.courseModule.update({
      where: { id: module4.id },
      data: {
        title: '4-Modul: Ketma-ketlik, Nay-forma va Lugʻat shakli (16–20 darslar)',
        description: 'Harakatlar ketma-ketligi, inkor buyruq (nay-forma), qobiliyat (jisho-forma), tajriba (ta-forma) va oddiy uslub (futsuukei).',
      },
    });
  }

  // ==========================================
  // LESSON 16: Ketma-ketlik (~te, ~te kara)
  // ==========================================
  let lesson16 = await prisma.lesson.findFirst({
    where: { moduleId: module4.id, order: 16 },
  });
  if (!lesson16) {
    lesson16 = await prisma.lesson.create({
      data: {
        moduleId: module4.id,
        title: '16-dars: Ketma-ket harakatlar va sifatlar bogʻlanishi (~te kara)',
        japaneseTitle: '第16課 (Dai 16 Ka)',
        slug: 'lesson-16',
        order: 16,
        summary: 'Ushbu darsda harakatlarni xronologik tartibda sanash (~te, ~te), "biror ishni qilgandan soʻng" (~te kara) hamda sifatlarning bir-biriga bogʻlanishi (kute / de) oʻrganiladi.',
        kaiwaScenario: {
          topic: 'Kun tartibi yoki shaharga borib nimalar qilganini soʻzlab berish',
          partnerName: 'Tanaka-san',
          goal: 'Kutubxonaga borib, kitob oʻqib, soʻng doʻstingiz bilan uchrashganingizni ayting.',
          sampleDialog: [
            { speaker: 'Tanaka', text: '休みの 日は 何を しましたか。', uz: 'Dam olish kunida nimalar qildingiz?' },
            { speaker: 'User', text: '図書館へ 行って、本を 読んで、それから 友だちに 会いました。', uz: 'Kutubxonaga borib, kitob oʻqib, soʻngra doʻstim bilan uchrashdim.' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  // ==========================================
  // LESSON 17: Nay-forma va Majburiyat (~nakereba narimasen)
  // ==========================================
  let lesson17 = await prisma.lesson.findFirst({
    where: { moduleId: module4.id, order: 17 },
  });
  if (!lesson17) {
    lesson17 = await prisma.lesson.create({
      data: {
        moduleId: module4.id,
        title: '17-dars: Feʼllarning Nay-formasi va Majburiyat (~nakereba narimasen)',
        japaneseTitle: '第17課 (Dai 17 Ka)',
        slug: 'lesson-17',
        order: 17,
        summary: 'Feʼllarning inkor negizi (nay-forma), "iltimos bunday qilmang" (~naide kudasai), qatʼiy majburiyat ("qilishim shart" - ~nakereba narimasen) hamda ixtiyoriylik (~nakutemo ii desu) oʻrganiladi.',
        kaiwaScenario: {
          topic: 'Shifokor qabulida va dori ichish qoidalari',
          partnerName: 'Isha-san (Shifokor)',
          goal: 'Shifokorga shamollab qolganingizni va dorini qanday ichish kerakligini soʻrang.',
          sampleDialog: [
            { speaker: 'Isha', text: '風邪ですね。薬を 飲んで、無理を しないで ください。', uz: 'Shamollabsiz. Dori iching va zoʻriqmang, iltimos.' },
            { speaker: 'User', text: 'お風呂に 入っても いいですか。', uz: 'Vannaga tushsam boʻladimi?' },
            { speaker: 'Isha', text: 'いいえ、今日は 入らないで ください。', uz: 'Yoʻq, bugun vannaga kirmang.' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  // ==========================================
  // LESSON 18: Jisho-forma va Qobiliyat (~koto ga dekimasu)
  // ==========================================
  let lesson18 = await prisma.lesson.findFirst({
    where: { moduleId: module4.id, order: 18 },
  });
  if (!lesson18) {
    lesson18 = await prisma.lesson.create({
      data: {
        moduleId: module4.id,
        title: '18-dars: Lugʻat (Jisho) shakli va Qobiliyat (koto ga dekimasu)',
        japaneseTitle: '第18課 (Dai 18 Ka)',
        slug: 'lesson-18',
        order: 18,
        summary: 'Feʼllarning asosiy lugʻat shakli (jisho-kei), biror harakatni bajara olish qobiliyati (~koto ga dekimasu), sevimli mashgʻulotlar (shumi wa ... koto desu) hamda "oldin" (~mae ni) qoidasi.',
        kaiwaScenario: {
          topic: 'Xobbi va qobiliyatlar haqida suhbat',
          partnerName: 'Sato-san',
          goal: 'Yapon tilida suhbatlasha olishingizni va pianino chala olishingizni bildiring.',
          sampleDialog: [
            { speaker: 'Sato', text: 'ピアノを 弾く ことが できますか。', uz: 'Pianino chala olasizmi?' },
            { speaker: 'User', text: 'はい、少し 弾く ことが できます。', uz: 'Ha, ozgina chala olaman.' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  // ==========================================
  // LESSON 19: Ta-forma va Tajriba (~koto ga arimasu)
  // ==========================================
  let lesson19 = await prisma.lesson.findFirst({
    where: { moduleId: module4.id, order: 19 },
  });
  if (!lesson19) {
    lesson19 = await prisma.lesson.create({
      data: {
        moduleId: module4.id,
        title: '19-dars: Ta-forma va Oʻtmishdagi Tajriba (~koto ga arimasu)',
        japaneseTitle: '第19課 (Dai 19 Ka)',
        slug: 'lesson-19',
        order: 19,
        summary: 'Feʼllarning oʻtgan zamon oddiy shakli (ta-kei), hayotiy tajriba ("qilib koʻrganman" - ta-kei + koto ga arimasu), harakatlarni aralash sanash (~tari, ~tari shimasu) va oʻzgarish (~ni narimasu).',
        kaiwaScenario: {
          topic: 'Yaponiya madaniyati, taomlari yoki Fuji togʻiga chiqish tajribasi',
          partnerName: 'Tanaka-san',
          goal: 'Fuji togʻiga chiqib koʻrganingizni va sushi yeb koʻrganingizni soʻzlab bering.',
          sampleDialog: [
            { speaker: 'Tanaka', text: '富士山に 登った ことが ありますか。', uz: 'Fuji togʻiga chiqib koʻrganmisiz?' },
            { speaker: 'User', text: 'はい、去年 一度 登った ことが あります。素晴らしかったです。', uz: 'Ha, oʻtgan yili bir marta chiqqanman. Ajoyib boʻlgan.' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  // ==========================================
  // LESSON 20: Oddiy uslub (Futsuukei / Plain style)
  // ==========================================
  let lesson20 = await prisma.lesson.findFirst({
    where: { moduleId: module4.id, order: 20 },
  });
  if (!lesson20) {
    lesson20 = await prisma.lesson.create({
      data: {
        moduleId: module4.id,
        title: '20-dars: Oddiy uslub (Futsuukei / Doʻstona muloqot)',
        japaneseTitle: '第20課 (Dai 20 Ka)',
        slug: 'lesson-20',
        order: 20,
        summary: 'Xushmuomala uslub (desu/masu)dan kundalik doʻstona uslub (futsuukei)ga oʻtish qoidalari: yaqin doʻstlar, tengdoshlar va oila davrasida erkin gaplashish sirlari.',
        kaiwaScenario: {
          topic: 'Yaqin doʻst bilan hafta oxirida uchrashish haqida doʻstona suhbat',
          partnerName: 'Ken-kun (Doʻst)',
          goal: 'Ertaga boʻsh ekaningizni va birga ovqatlangani borishni oddiy uslubda ayting.',
          sampleDialog: [
            { speaker: 'Ken', text: '明日 暇？', uz: 'Ertaga boʻshmisan?' },
            { speaker: 'User', text: 'うん、暇だよ。どこか 行く？', uz: 'Ha, boʻshman. Biror joyga boramizmi?' },
            { speaker: 'Ken', text: 'ラーメン 食べに 行かない？', uz: 'Ramen yegani bormaymizmi?' },
            { speaker: 'User', text: 'いいね、行こう！', uz: 'Yaxshi fikr, ketdik!' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  console.log('✅ Module 4 (Lessons 16-20) muvaffaqiyatli seed qilindi!');
}

