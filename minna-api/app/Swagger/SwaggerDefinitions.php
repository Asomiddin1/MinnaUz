<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="MinnaUz API",
 *     description="MinnaUz — yapon tili o'quv platformasi uchun REST API hujjatlari.
 *
 * ## Autentifikatsiya
 * Ko'pgina endpointlar **Bearer token** talab qiladi. Tokenni olish uchun avval `/api/auth/google` yoki `/api/auth/verify-otp` ni chaqiring va qaytgan `access_token` ni Authorization headeriga qo'ying:
 *
 * `Authorization: Bearer YOUR_TOKEN_HERE`",
 *     @OA\Contact(email="support@minnauz.com")
 * )
 *
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="API Server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Sanctum Bearer token. Olish uchun /auth/google yoki /auth/verify-otp dan foydalaning."
 * )
 *
 * @OA\Tag(name="Auth", description="Autentifikatsiya — Google va OTP")
 * @OA\Tag(name="User Profile", description="Foydalanuvchi profili va sozlamalar")
 * @OA\Tag(name="Devices", description="Qurilmalarni boshqarish")
 * @OA\Tag(name="Avatar", description="Profil rasmi yuklash va boshqarish")
 * @OA\Tag(name="Tests / JLPT", description="JLPT testlari — ro'yxat, javob topshirish, natijalar")
 * @OA\Tag(name="Levels & Modules", description="Kurs darajalari va modullar")
 * @OA\Tag(name="Lessons", description="Darslar — like va izoh")
 * @OA\Tag(name="Materials", description="Grammar, Kanji, Vocabulary")
 * @OA\Tag(name="Videos", description="Video darslar")
 * @OA\Tag(name="Articles / Dokkai", description="O'qish mashqlari — maqolalar va quiz")
 * @OA\Tag(name="AI Chat", description="Yapon tili AI suhbat repetitori")
 * @OA\Tag(name="Search", description="Umumiy qidiruv")
 * @OA\Tag(name="Admin — Users", description="[Admin] Foydalanuvchilarni boshqarish")
 * @OA\Tag(name="Admin — Tests", description="[Admin] Testlarni boshqarish")
 * @OA\Tag(name="Admin — Questions", description="[Admin] Savollarni boshqarish")
 * @OA\Tag(name="Admin — Levels", description="[Admin] Darajalarni boshqarish")
 * @OA\Tag(name="Admin — Modules", description="[Admin] Modullarni boshqarish")
 * @OA\Tag(name="Admin — Lessons", description="[Admin] Darslarni boshqarish")
 * @OA\Tag(name="Admin — Grammar", description="[Admin] Grammatikani boshqarish")
 * @OA\Tag(name="Admin — Kanji", description="[Admin] Kanjini boshqarish")
 * @OA\Tag(name="Admin — Vocabulary", description="[Admin] Lug'atni boshqarish")
 * @OA\Tag(name="Admin — Videos", description="[Admin] Video darslarni boshqarish")
 * @OA\Tag(name="Admin — Articles", description="[Admin] Maqolalarni boshqarish")
 * @OA\Tag(name="Admin — AI", description="[Admin] AI kontentni yaratish")
 */
class SwaggerDefinitions
{
    // Bu fayl faqat Swagger global annotatsiyalari uchun
}
