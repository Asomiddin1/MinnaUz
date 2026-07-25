<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

/**
 * ============================================================
 * AUTHENTICATION (Google, OTP, Me)
 * ============================================================
 */
class AuthAnnotations
{
    #[OA\Get(
        path: '/api/user',
        summary: 'Joriy foydalanuvchi ma\'lumotlari',
        description: 'Bearer token orqali tizimga kirgan foydalanuvchining to\'liq ma\'lumotlarini qaytaradi.',
        tags: ['User Profile'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Muvaffaqiyatli',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'id', type: 'integer', example: 1),
                        new OA\Property(property: 'name', type: 'string', example: 'Asomiddin'),
                        new OA\Property(property: 'email', type: 'string', example: 'user@example.com'),
                        new OA\Property(property: 'avatar', type: 'string', nullable: true),
                        new OA\Property(property: 'role', type: 'string', example: 'user'),
                        new OA\Property(property: 'coins', type: 'integer', example: 100),
                        new OA\Property(property: 'streak', type: 'integer', example: 5),
                        new OA\Property(property: 'is_premium', type: 'boolean', example: false),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Autentifikatsiya talab qilinadi'),
        ]
    )]
    public function me() {}

    #[OA\Post(
        path: '/api/auth/google',
        summary: 'Google orqali kirish',
        description: 'Google ID token orqali tizimga kirish yoki yangi hisob yaratish. Muvaffaqiyatli bo\'lganda Sanctum access token qaytaradi.',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['token'],
                properties: [
                    new OA\Property(property: 'token', type: 'string', description: 'Google OAuth ID token', example: 'eyJhbGci...'),
                    new OA\Property(property: 'device_name', type: 'string', description: 'Qurilma nomi (ixtiyoriy)', example: 'Windows • Chrome'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Muvaffaqiyatli kirish',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'access_token', type: 'string', example: '1|abc123...'),
                        new OA\Property(property: 'user', type: 'object',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 1),
                                new OA\Property(property: 'name', type: 'string', example: 'Asomiddin'),
                                new OA\Property(property: 'email', type: 'string', example: 'user@gmail.com'),
                                new OA\Property(property: 'avatar', type: 'string', nullable: true),
                                new OA\Property(property: 'role', type: 'string', example: 'user'),
                                new OA\Property(property: 'is_premium', type: 'boolean', example: false),
                            ]
                        ),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Token noto\'g\'ri yoki muddati o\'tgan'),
        ]
    )]
    public function googleLogin() {}

    #[OA\Post(
        path: '/api/auth/send-otp',
        summary: 'OTP kodni emailga yuborish',
        description: 'Berilgan email manziliga 6 xonali OTP tasdiqlash kodi yuboradi. Kod 10 daqiqa amal qiladi.',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Kod muvaffaqiyatli yuborildi',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Kod emailga yuborildi'),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validatsiya xatosi'),
        ]
    )]
    public function sendOtp() {}

    #[OA\Post(
        path: '/api/auth/verify-otp',
        summary: 'OTP kodni tekshirish va kirish',
        description: 'Email va OTP kodni tekshiradi. To\'g\'ri bo\'lsa foydalanuvchi yaratiladi (yoki topiladi) va Sanctum access token qaytaradi.',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'otp_code'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
                    new OA\Property(property: 'otp_code', type: 'string', example: '123456'),
                    new OA\Property(property: 'device_name', type: 'string', description: 'Qurilma nomi (ixtiyoriy)', example: 'Android • Chrome'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Muvaffaqiyatli kirish',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'access_token', type: 'string', example: '2|xyz789...'),
                        new OA\Property(property: 'user', type: 'object',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 2),
                                new OA\Property(property: 'name', type: 'string', example: 'user'),
                                new OA\Property(property: 'email', type: 'string', example: 'user@example.com'),
                                new OA\Property(property: 'role', type: 'string', example: 'user'),
                                new OA\Property(property: 'is_premium', type: 'boolean', example: false),
                            ]
                        ),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'OTP noto\'g\'ri yoki muddati tugagan'),
        ]
    )]
    public function verifyOtp() {}
}
