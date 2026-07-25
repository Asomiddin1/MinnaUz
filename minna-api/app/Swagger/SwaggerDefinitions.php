<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "MinnaUz API",
    description: "MinnaUz — yapon tili o'quv platformasi uchun REST API hujjatlari.",
    contact: new OA\Contact(
        email: "support@minnauz.com"
    )
)]

#[OA\Server(
    url: L5_SWAGGER_CONST_HOST,
    description: "API Server"
)]

#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Sanctum Bearer token"
)]

#[OA\Tag(
    name: "Auth",
    description: "Google va OTP autentifikatsiya"
)]

#[OA\Tag(
    name: "User Profile",
    description: "Foydalanuvchi profili"
)]

#[OA\Tag(
    name: "JLPT",
    description: "JLPT testlari"
)]

#[OA\Tag(
    name: "Lessons",
    description: "Darslar"
)]

#[OA\Tag(
    name: "AI Chat",
    description: "AI yapon tili repetitori"
)]

class SwaggerDefinitions
{
}