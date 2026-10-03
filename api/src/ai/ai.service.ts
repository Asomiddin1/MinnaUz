import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { KaiwaMessageDto } from './dto/kaiwa.dto';
import { ExplainMistakeDto } from './dto/explain.dto';
import { GenerateDokkaiDto } from './dto/dokkai.dto';

export interface TranslateResult {
  translation: string;
  romaji?: string;
  furigana?: string;
  notes?: string;
}

export interface KaiwaResponse {
  japanese: string;
  romaji: string;
  uzbek: string;
  correction?: string;
  encouragement?: string;
  isCompleted: boolean;
  summary?: {
    accuracyPercent: number;
    wordsUsedCount: number;
    feedback: string;
    rewardCoins: number;
  };
  coinsAwarded?: number;
  newBalance?: number;
}

export interface ExplainMistakeResponse {
  whyWrong: string;
  whyCorrect: string;
  tip: string;
}

export interface GeneratedDokkaiResponse {
  title: string;
  titleUz: string;
  readingTime: string;
  japaneseText: string;
  furiganaText: string;
  uzbekTranslation: string;
  vocabulary: { word: string; meaning: string }[];
  question: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private cachedModel: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private async resolveModel(apiKey: string, baseUrl: string): Promise<string> {
    const configured = this.configService.get<string>('GROQ_MODEL');
    if (
      configured &&
      configured !== 'llama-3.3-70b-versatile' &&
      configured.trim() !== ''
    ) {
      return configured.trim();
    }

    if (this.cachedModel) {
      return this.cachedModel;
    }

    try {
      const modelsEndpoint = `${baseUrl.replace(/\/+$/, '')}/models`;
      const res = await fetch(modelsEndpoint, {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const modelIds: string[] = (data.data || []).map((m: any) => m.id);

        const preferred = [
          'openai/gpt-oss-120b',
          'openai/gpt-oss-20b',
          'qwen/qwen3.8-27b',
          'qwen/qwen3.6-27b',
          'llama-3.3-70b-versatile',
          'llama-3.1-8b-instant',
        ];

        for (const pref of preferred) {
          if (modelIds.includes(pref)) {
            this.cachedModel = pref;
            this.logger.log(`Selected Groq active model: ${pref}`);
            return pref;
          }
        }

        const fallback = modelIds.find(
          (id) =>
            !id.includes('whisper') &&
            !id.includes('safeguard') &&
            !id.includes('tts') &&
            !id.includes('guard'),
        );
        if (fallback) {
          this.cachedModel = fallback;
          this.logger.log(`Selected Groq fallback model: ${fallback}`);
          return fallback;
        }
      }
    } catch (err) {
      this.logger.warn('Failed to dynamically query /models from Groq', err);
    }

    return 'openai/gpt-oss-120b';
  }

  private async callGroq(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.3,
  ): Promise<string> {
    const apiKey =
      this.configService.get<string>('GROQ_API_KEY') ||
      this.configService.get<string>('BAI_API_KEY');
    const baseUrl =
      this.configService.get<string>('GROQ_API_BASE_URL') ||
      'https://api.groq.com/openai/v1';

    if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY' || apiKey.trim() === '') {
      throw new HttpException(
        'GROQ_API_KEY backendda sozlanmagan. Iltimos api/.env faylida GROQ_API_KEY ni kiriting.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const model = await this.resolveModel(apiKey, baseUrl);
    const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

    try {
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature,
        }),
      });

      if (response.status === 400) {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature,
          }),
        });
      }

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Groq API error (${response.status}): ${errorBody}`);
        throw new HttpException(
          `Groq API javobida xatolik: ${response.status} ${response.statusText}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Groq request failed', error);
      throw new HttpException(
        'AI xizmati bilan bogʻlanishda xatolik yuz berdi.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private cleanJson(raw: string): any {
    let cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    return JSON.parse(cleaned);
  }

  // === 1. TRANSLATE ===
  async translate(
    text: string,
    direction: 'ja-uz' | 'uz-ja',
  ): Promise<TranslateResult> {
    const systemPrompt =
      direction === 'ja-uz'
        ? `Siz yapon tilidan o'zbek tiliga yuqori aniqlikdagi professional tarjimon va yapon tili o'qituvchisisiz. 
Berilgan yaponcha matnni o'zbek tiliga tabiiy, to'g'ri va ravon tarjima qiling.
Javobni FAQAT QUYIDAGI JSON formatida qaytaring:
{
  "translation": "O'zbek tilidagi to'liq tarjimasi",
  "romaji": "Kiritilgan yaponcha matnning lotin alifbosidagi to'liq romaji o'qilishi",
  "furigana": "Kanjilarning hiragana/furigana o'qilishi",
  "notes": "Qisqa grammatika yoki ma'no izohi (o'zbek tilida)"
}`
        : `Siz o'zbek tilidan yapon tiliga yuqori aniqlikdagi professional tarjimon va yapon tili mutaxassisisiz. 
Berilgan o'zbekcha matnni zamonaviy va tabiiy yapon tiliga (kanji va hiragana/katakana bilan) tarjima qiling.
Javobni FAQAT QUYIDAGI JSON formatida qaytaring:
{
  "translation": "Yaponcha tarjimasi (kanji va kana bilan)",
  "romaji": "Yaponcha tarjimaning lotin alifbosidagi romaji o'qilishi",
  "furigana": "Kanjilarning hiragana o'qilishi",
  "notes": "Muloyimlik darajasi (polite/casual/formal) yoki kontekstual qisqa izoh (o'zbek tilida)"
}`;

    const raw = await this.callGroq(systemPrompt, text, 0.2);
    try {
      const parsed = this.cleanJson(raw);
      return {
        translation: parsed.translation || raw,
        romaji: parsed.romaji || undefined,
        furigana: parsed.furigana || undefined,
        notes: parsed.notes || undefined,
      };
    } catch {
      return { translation: raw };
    }
  }

  // === 2. LESSON KAIWA (5-STEP BOUNDED SENSEI DIALOG) ===
  async chatKaiwa(
    dto: KaiwaMessageDto,
    userId?: string,
  ): Promise<KaiwaResponse> {
    const isLastStep = dto.step >= 5;

    const systemPrompt = `Siz yapon tili o'qituvchisi "Sensei"siz.
Dars nomi: "${dto.lessonTitle || 'Yapon tili darsi'}".
Mavzu: "${dto.topic || 'Dars muloqoti'}".
Suhbat maqsadi: "${dto.goal || 'Yaponcha muloqot qilish'}".
Hozirgi bosqich: ${dto.step} / 5-qadam.

TALABLAR:
1. Talabaning kiritgan xabarini tahlil qiling.
2. Agar talaba grammatik yoki lug'at xatosi qilgan bo'lsa, "correction" maydonida o'zbek tilida do'stona tuzatish bering (masalan: "Yaxshi javob! Lekin 'ni' o'rniga 'de' yuklamasi to'g'ri bo'ladi: ..."). Agar xato bo'lmasa, null qiling.
3. Yapon tilida tabiiy, qisqa (1-2 gap) va boshlang'ich talaba darajasiga mos javob qaytaring.
4. "encouragement" maydoniga o'zbekcha qisqa motivatsiya yozing (masalan: "Ajoyib!", "Barakalla!", "Zo'r harakat!").
5. ${
      isLastStep
        ? `Bu 5-QADAM (SO'NGGI BOSQICH). Suhbatni ijobiy xulosa bilan yakunlang. "isCompleted": true bo'lsin.
"summary" obyektini to'ldiring:
- accuracyPercent: 80 dan 100 gacha son
- wordsUsedCount: ishlatilgan yangi so'zlar soni (1 dan 6 gacha)
- feedback: O'zbek tilida talabaning umumiy darsdagi harakatiga 1-2 gaplik chiroyli xulosa
- rewardCoins: 20`
        : `Bu oraliq qadam (${dto.step}/5). Suhbatni mantiqiy davom ettirish uchun keyingi qisqa savolni bering. "isCompleted": false bo'lsin.`
    }

JAVOBNI FAQAT SHU JSON FORMATIDA QAYTARING:
{
  "japanese": "Senseining yaponcha javobi",
  "romaji": "Yaponcha javobning lotincha romaji o'qilishi",
  "uzbek": "Sensei javobining o'zbekcha tarjimasi",
  "correction": "Xatoni o'zbekcha tushuntirish yoki null",
  "encouragement": "Qisqa motivatsion so'z",
  "isCompleted": ${isLastStep ? 'true' : 'false'}${
    isLastStep
      ? `,
  "summary": {
    "accuracyPercent": 90,
    "wordsUsedCount": 4,
    "feedback": "Darsdagi iboralarni juda yaxshi o'zlashtiribsiz!",
    "rewardCoins": 20
  }`
      : ''
  }
}`;

    const userPrompt = JSON.stringify({
      history: dto.history.slice(-6),
      currentStep: dto.step,
      userMessage: dto.userMessage,
    });

    const raw = await this.callGroq(systemPrompt, userPrompt, 0.4);
    let parsed: any;
    try {
      parsed = this.cleanJson(raw);
    } catch {
      parsed = {
        japanese: 'よくできました！',
        romaji: 'Yoku dekimashita!',
        uzbek: 'Ajoyib, juda yaxshi bajardingiz!',
        isCompleted: isLastStep,
      };
    }

    const response: KaiwaResponse = {
      japanese: parsed.japanese || 'はい、わかりました。',
      romaji: parsed.romaji || '',
      uzbek: parsed.uzbek || '',
      correction: parsed.correction || undefined,
      encouragement: parsed.encouragement || undefined,
      isCompleted: Boolean(parsed.isCompleted || isLastStep),
      summary: parsed.summary || undefined,
    };

    // Agar so'nggi qadam bo'lsa va foydalanuvchi tizimga kirgan bo'lsa, tanga berish va dars progressini saqlash
    if (response.isCompleted && userId) {
      try {
        const rewardCoins = response.summary?.rewardCoins || 20;
        const updatedUser = await this.prisma.user.update({
          where: { id: userId },
          data: {
            coins: { increment: rewardCoins },
          },
          select: { coins: true },
        });

        await this.prisma.coinTransaction.create({
          data: {
            userId,
            amount: rewardCoins,
            type: 'KAIWA_REWARD',
            description: `"${dto.lessonTitle || 'Dars'}" bo'yicha AI muloqotni muvaffaqiyatli yakunlaganlik uchun mukofot`,
          },
        });

        // Dars progressiga 'kaiwa' bo'limini qo'shish
        const progress = await this.prisma.userLessonProgress.findUnique({
          where: {
            userId_lessonId: {
              userId,
              lessonId: dto.lessonId,
            },
          },
        });

        const currentSections = Array.isArray(progress?.completedSections)
          ? (progress.completedSections as string[])
          : [];

        if (!currentSections.includes('kaiwa')) {
          const newSections = [...currentSections, 'kaiwa'];
          await this.prisma.userLessonProgress.upsert({
            where: {
              userId_lessonId: {
                userId,
                lessonId: dto.lessonId,
              },
            },
            create: {
              userId,
              lessonId: dto.lessonId,
              completedSections: newSections,
            },
            update: {
              completedSections: newSections,
            },
          });
        }

        response.coinsAwarded = rewardCoins;
        response.newBalance = updatedUser.coins;
      } catch (e) {
        this.logger.error('Failed to reward coins for kaiwa', e);
      }
    }

    return response;
  }

  // === 3. TEST EXPLAINER ("Nega bu javob xato?") ===
  async explainMistake(
    dto: ExplainMistakeDto,
  ): Promise<ExplainMistakeResponse> {
    const systemPrompt = `Siz tajribali va do'stona Yapon tili o'qituvchisisiz.
Talaba test savolini yechishda xato javobni tanladi.
Savol: "${dto.question}"
Talaba tanlagan xato variant: "${dto.userAnswer}"
To'g'ri variant: "${dto.correctAnswer}"
Daraja: "${dto.level || 'N5'}".
${dto.explanation ? `Mavjud qisqa izoh: "${dto.explanation}"` : ''}

Talabaga o'zbek tilida juda sodda, qiziqarli va aniq qilib quyidagi JSON formatida tushuntiring:
{
  "whyWrong": "Talaba nima sababdan bu variantni tanlab adashganligi va u nega xato ekanligi (1-2 gap)",
  "whyCorrect": "To'g'ri variantning grammatik qoidasi yoki qo'llanish o'rni (1-2 gap)",
  "tip": "Kelgusida bu qoidada adashmaslik uchun oson eslab qolish maslahati (1 gap)"
}
FAQAT SHU JSON FORMATIDA QAYTARING.`;

    const raw = await this.callGroq(systemPrompt, 'Tushuntirib bering.', 0.3);
    try {
      const parsed = this.cleanJson(raw);
      return {
        whyWrong:
          parsed.whyWrong ||
          'Tanlangan variant ushbu gap tuzilishiga mos kelmaydi.',
        whyCorrect:
          parsed.whyCorrect || `To'g'ri javob: "${dto.correctAnswer}".`,
        tip:
          parsed.tip ||
          "Grammatik yuklamalar va so'z ma'nosiga e'tibor bering.",
      };
    } catch {
      return {
        whyWrong: "Tanlangan variant bu kontekstda to'g'ri kelmaydi.",
        whyCorrect: `To'g'ri javob "${dto.correctAnswer}" hisoblanadi.`,
        tip: 'Qoidalarni takrorlab, darsdagi misollarga yana bir bor qarang.',
      };
    }
  }

  // === 4. DOKKAI GENERATOR ===
  async generateDokkai(
    dto: GenerateDokkaiDto,
  ): Promise<GeneratedDokkaiResponse> {
    const systemPrompt = `Siz Yapon tili bo'yicha JLPT mutaxassisisiz.
${dto.level} darajasiga mos qiziqarli o'qish (Dokkai) matni yaratib bering.
Mavzu: "${dto.topic}".

TALABLAR:
- Matn ${dto.level} darajasidagi grammatika va so'zlarga to'liq mos kelishi kerak.
- Hajmi 4-6 ta mazmunli gapdan iborat bo'lsin.
- Kanjilarning furigana o'qilishini bering.
- Matndan 4 ta asosiy yangi so'zni ajrating.
- Matn tushunilganini tekshirish uchun 1 ta qiziqarli savol (4 ta variant, 1 ta to'g'ri indeks 0..3) tuzing.

JAVOBNI FAQAT QUYIDAGI JSON FORMATIDA QAYTARING:
{
  "title": "Yaponcha sarlavha",
  "titleUz": "O'zbekcha sarlavha",
  "readingTime": "3 daqiqa",
  "japaneseText": "To'liq yaponcha matn (kanji va kana bilan)",
  "furiganaText": "Matnning hiragana/furigana o'qilishi",
  "uzbekTranslation": "O'zbekcha ravon tarjimasi",
  "vocabulary": [
    { "word": "家族 (かぞく)", "meaning": "Oila" },
    { "word": "公園 (こうえん)", "meaning": "Bog'" }
  ],
  "question": {
    "prompt": "Savol yaponcha va o'zbekcha",
    "options": ["Variant 1", "Variant 2", "Variant 3", "Variant 4"],
    "correctIndex": 0,
    "explanation": "To'g'ri javobning qisqa tushuntirishi"
  }
}`;

    const raw = await this.callGroq(systemPrompt, 'Matn yarat.', 0.4);
    try {
      return this.cleanJson(raw);
    } catch {
      throw new HttpException(
        "Dokkai matnini yaratishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
