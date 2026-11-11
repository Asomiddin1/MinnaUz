import { PrismaClient } from '@prisma/client';

export async function seedModule5(prisma: PrismaClient, courseId: string) {
  // 1. Get or create Module 5
  let module5 = await prisma.courseModule.findFirst({
    where: { courseId, order: 5 },
  });

  if (!module5) {
    module5 = await prisma.courseModule.create({
      data: {
        courseId,
        title: '5-Modul: Fikrlar, Shart mayli va Murakkab jumlalar (21–25 darslar)',
        description: 'Fikr bildirish (~to omoimasu), sifatdosh jumlalar, payt (~toki), yordam (~te agemasu) va shart mayli (~tara/~temo).',
        order: 5,
      },
    });
  } else {
    await prisma.courseModule.update({
      where: { id: module5.id },
      data: {
        title: '5-Modul: Fikrlar, Shart mayli va Murakkab jumlalar (21–25 darslar)',
        description: 'Fikr bildirish (~to omoimasu), sifatdosh jumlalar, payt (~toki), yordam (~te agemasu) va shart mayli (~tara/~temo).',
      },
    });
  }

  // ==========================================
  // LESSON 21: Fikr bildirish (~to omoimasu)
  // ==========================================
  let lesson21 = await prisma.lesson.findFirst({
    where: { moduleId: module5.id, order: 21 },
  });
  if (!lesson21) {
    lesson21 = await prisma.lesson.create({
      data: {
        moduleId: module5.id,
        title: '21-dars: Shaxsiy fikr va iqtibos (~to omoimasu / ~to iimashita)',
        japaneseTitle: '第21課 (Dai 21 Ka)',
        slug: 'lesson-21',
        order: 21,
        summary: 'Oʻz fikrini bildirish ("menimcha..." - futsuukei + to omoimasu), boshqalarning soʻzidan iqtibos keltirish (~to iimashita) hamda fikrni tasdiqlatish (~deshou).',
        kaiwaScenario: {
          topic: 'Yaponiyadagi narx-navo va kelajakdagi texnologiyalar haqida fikr almashish',
          partnerName: 'Tanaka-san',
          goal: 'Kelajakda robotlar insonlarga yanada koʻproq yordam berishini oʻylashingizni ayting.',
          sampleDialog: [
            { speaker: 'Tanaka', text: '日本の 物価について どう 思いますか。', uz: 'Yaponiyadagi narx-navo haqida nima deb oʻylaysiz?' },
            { speaker: 'User', text: '少し 高いと 思います。特に 果物が 高いです。', uz: 'Biroz qimmat deb oʻylayman. Ayniqsa mevalar qimmat.' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  // ==========================================
  // LESSON 22: Sifatdosh kiritmasi (Noun modification)
  // ==========================================
  let lesson22 = await prisma.lesson.findFirst({
    where: { moduleId: module5.id, order: 22 },
  });
  if (!lesson22) {
    lesson22 = await prisma.lesson.create({
      data: {
        moduleId: module5.id,
        title: '22-dars: Murakkab jumlalar va Aniqlash kiritmasi (Sifatdosh)',
        japaneseTitle: '第22課 (Dai 22 Ka)',
        slug: 'lesson-22',
        order: 22,
        summary: 'Otni butun bir jumla orqali ifodalash ("kecha men sotib olgan kitob", "u kishi ishlaydigan shifoxona") va yapon tilida gap tuzish qobiliyatini yangi darajaga olib chiqish.',
        kaiwaScenario: {
          topic: 'Yangi sotib olingan buyum yoki tanish insonni tavsiflab berish',
          partnerName: 'Sato-san',
          goal: 'Doʻstingiz bergan soatni taqib yurganingizni tushuntiring.',
          sampleDialog: [
            { speaker: 'Sato', text: '素敵な 時計ですね。どこで 買いましたか。', uz: 'Ajoyib soat ekan-a! Qayerdan sotib oldingiz?' },
            { speaker: 'User', text: 'これは 誕生日に 友だちが くれた 時計です。', uz: 'Bu tugʻilgan kunimga doʻstim sovgʻa qilgan soat.' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  // ==========================================
  // LESSON 23: Payt va Muqarrar natija (~toki / ~to)
  // ==========================================
  let lesson23 = await prisma.lesson.findFirst({
    where: { moduleId: module5.id, order: 23 },
  });
  if (!lesson23) {
    lesson23 = await prisma.lesson.create({
      data: {
        moduleId: module5.id,
        title: '23-dars: Vaqt va Shartli natija (~toki / Feʼl + to)',
        japaneseTitle: '第23課 (Dai 23 Ka)',
        slug: 'lesson-23',
        order: 23,
        summary: 'Biror harakat yuz bergan paytda (~toki) hamda tabiat yoki texnika qonuniyatlari boʻyicha muqarrar yuz beruvchi natija ("tugmani bossangiz, chipta chiqadi" - ~to) qoidalari.',
        kaiwaScenario: {
          topic: 'Koʻchada yoʻl soʻrash yoki avtomatdan foydalanish',
          partnerName: 'Tsuukounin (Yoʻlovchi)',
          goal: 'Bankka qanday borishni soʻrang.',
          sampleDialog: [
            { speaker: 'User', text: 'すみません、銀行は どこですか。', uz: 'Kechirasiz, bank qayerda?' },
            { speaker: 'Tsuukounin', text: 'あの 交差点を 右へ 曲がると、左側に ありますよ。', uz: 'Anavi chorrahadan oʻngga burilsangiz, chap tomonda joylashgan.' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  // ==========================================
  // LESSON 24: Iltifot va Yordam (~te agemasu / ~te kuremasu)
  // ==========================================
  let lesson24 = await prisma.lesson.findFirst({
    where: { moduleId: module5.id, order: 24 },
  });
  if (!lesson24) {
    lesson24 = await prisma.lesson.create({
      data: {
        moduleId: module5.id,
        title: '24-dars: Iltifot, yordam va minnatdorchilik (~te agemasu / kuremasu)',
        japaneseTitle: '第24課 (Dai 24 Ka)',
        slug: 'lesson-24',
        order: 24,
        summary: 'Birovga yaxshilik qilish (~te agemasu), birov sizga yoki oilangizga yaxshilik qilishi (~te kuremasu) hamda minnatdorchilik bildirish mantiqi.',
        kaiwaScenario: {
          topic: 'Doʻstga koʻchishda yoki vazifada yordam berish',
          partnerName: 'Yamada-san',
          goal: 'Ogʻir yukni koʻtarishga yordam berganingiz uchun minnatdorchilik qabul qiling.',
          sampleDialog: [
            { speaker: 'Yamada', text: '荷物が 重いですね。手伝いましょうか。', uz: 'Yukingiz ogʻir ekan. Yordamlashaymi?' },
            { speaker: 'User', text: 'ありがとうございます。手伝って くれて 助かりました。', uz: 'Katta rahmat! Yordam berganingiz juda qoʻl keldi.' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  // ==========================================
  // LESSON 25: Shart mayllari (~tara / ~temo) - N5 YAKUNI!
  // ==========================================
  let lesson25 = await prisma.lesson.findFirst({
    where: { moduleId: module5.id, order: 25 },
  });
  if (!lesson25) {
    lesson25 = await prisma.lesson.create({
      data: {
        moduleId: module5.id,
        title: '25-dars: Shart mayllari va Yakun (~tara / ~temo) [N5 Yakuni]',
        japaneseTitle: '第25課 (Dai 25 Ka)',
        slug: 'lesson-25',
        order: 25,
        summary: 'Minna no Nihongo 1-kitobining eng soʻnggi bosqichi: "Agar ... boʻlsa" (~tara), "Hatto ... boʻlsa ham" (~temo) shart mayllari va JLPT N5 grammatikasini toʻliq yakunlash!',
        kaiwaScenario: {
          topic: 'Kelajakdagi orzular va shartli rejalar haqida suhbat',
          partnerName: 'Sensei (Ustoz)',
          goal: 'JLPT N5 ni topshirgach N4 ga tayyorgarlikni boshlashingizni ustozga ayting.',
          sampleDialog: [
            { speaker: 'Sensei', text: 'N5の 試験に 合格したら、どう しますか。', uz: 'N5 imtihonidan oʻtsangiz, nima qilasiz?' },
            { speaker: 'User', text: '合格したら、すぐに N4の 勉強を 始めます！', uz: 'Muvaffaqiyatli oʻtsam, darhol N4 oʻrganishni boshlayman!' },
          ],
        },
        isPublished: true,
        isFree: false,
      },
    });
  }

  console.log('✅ Module 5 (Lessons 21-25) muvaffaqiyatli seed qilindi!');
}

