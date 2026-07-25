<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

/**
 * ============================================================
 * TESTS / JLPT
 * ============================================================
 */
class ApiAnnotations
{
    #[OA\Get(
        path: '/api/user/tests',
        summary: 'Testlar ro\'yxatini olish',
        description: 'JLPT testlari ro\'yxati. Premium testlar faqat premium foydalanuvchilarga ochiq.',
        tags: ['Tests / JLPT'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'level', in: 'query', required: false, description: 'JLPT darajasi (N5, N4, N3, N2, N1)', schema: new OA\Schema(type: 'string', example: 'N5')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Testlar ro\'yxati',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'title', type: 'string', example: 'JLPT N5 Mock Test 1'),
                            new OA\Property(property: 'level', type: 'string', example: 'N5'),
                            new OA\Property(property: 'time', type: 'integer', description: 'Daqiqalarda', example: 110),
                            new OA\Property(property: 'pass_score', type: 'integer', example: 55),
                            new OA\Property(property: 'is_premium', type: 'boolean', example: false),
                            new OA\Property(property: 'locked', type: 'boolean', example: false),
                        ]
                    )
                )
            ),
            new OA\Response(response: 401, description: 'Autentifikatsiya talab qilinadi'),
        ]
    )]
    public function index_1() {}

    #[OA\Get(
        path: '/api/user/tests/{id}',
        summary: 'Test batafsil ma\'lumoti',
        description: 'Bitta testning barcha bo\'limlari va savollari bilan batafsil ma\'lumoti. To\'g\'ri javoblar yashirilgan.',
        tags: ['Tests / JLPT'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'Test ID', schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Test ma\'lumotlari'),
            new OA\Response(response: 403, description: 'Premium test — obuna talab qilinadi'),
            new OA\Response(response: 404, description: 'Test topilmadi'),
        ]
    )]
    public function show_2() {}

    #[OA\Post(
        path: '/api/user/tests/{id}/submit',
        summary: 'Testni topshirish',
        description: 'Foydalanuvchi javoblarini yuboradi va natija hisoblanadi. Har bir savol uchun `question_id` va `selected_option` talab qilinadi.',
        tags: ['Tests / JLPT'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'Test ID', schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['answers'],
                properties: [
                    new OA\Property(
                        property: 'answers',
                        type: 'array',
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: 'question_id', type: 'integer', example: 42),
                                new OA\Property(property: 'selected_option', type: 'string', nullable: true, example: 'A'),
                            ]
                        )
                    ),
                    new OA\Property(property: 'time_spent', type: 'integer', description: 'Sarflangan vaqt (soniyada)', example: 3600),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Test topshirildi, natija qaytarildi',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Test topshirildi'),
                        new OA\Property(property: 'data', type: 'object',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 15),
                                new OA\Property(property: 'score', type: 'integer', example: 72),
                                new OA\Property(property: 'passed', type: 'boolean', example: true),
                                new OA\Property(property: 'correct_count', type: 'integer', example: 36),
                                new OA\Property(property: 'wrong_count', type: 'integer', example: 14),
                            ]
                        ),
                    ]
                )
            ),
            new OA\Response(response: 403, description: 'Premium talab qilinadi'),
            new OA\Response(response: 422, description: 'Validatsiya xatosi'),
        ]
    )]
    public function submit_3() {}

    #[OA\Get(
        path: '/api/user/results/{resultId}',
        summary: 'Test natijasini batafsil ko\'rish',
        description: 'Bitta test natijasining to\'liq ko\'rinishi — har bir savol, tanlangan javob va to\'g\'ri javob bilan.',
        tags: ['Tests / JLPT'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'resultId', in: 'path', required: true, description: 'Natija ID', schema: new OA\Schema(type: 'integer', example: 15)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Natija batafsil'),
            new OA\Response(response: 404, description: 'Natija topilmadi'),
        ]
    )]
    public function result_4() {}

    #[OA\Get(
        path: '/api/user/results',
        summary: 'Test natijalari tarixi',
        description: 'Foydalanuvchining so\'nggi 7 ta test natijasi. Eskilari avtomatik o\'chiriladi.',
        tags: ['Tests / JLPT'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Natijalar tarixi'),
        ]
    )]
    public function history_5() {}

    #[OA\Post(
        path: '/api/ai/chat',
        summary: 'AI suhbat — yapon tili repetitori',
        description: 'Yapon tilida muloqot qilish uchun AI-ga xabar yuboradi. AI yapon tilida javob beradi, o\'zbek tilida fikr-mulohaza bildiradi. Har bir xabar chat tarixi bilan birgalikda yuboriladi.',
        tags: ['AI Chat'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['message'],
                properties: [
                    new OA\Property(property: 'message', type: 'string', description: 'Foydalanuvchi xabari (yapon yoki o\'zbek tilida)', example: 'こんにちは！'),
                    new OA\Property(property: 'topic', type: 'string', description: 'Suhbat mavzusi', example: 'Tanishish'),
                    new OA\Property(property: 'level', type: 'string', description: 'JLPT darajasi', example: 'N5'),
                    new OA\Property(property: 'lang', type: 'string', description: 'Til (TTS uchun)', example: 'uz-UZ'),
                    new OA\Property(
                        property: 'history',
                        type: 'array',
                        description: 'Chat tarixi (oxirgi 10 ta xabar)',
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: 'role', type: 'string', enum: ['user', 'assistant'], example: 'user'),
                                new OA\Property(property: 'content', type: 'string', example: 'こんにちは！'),
                            ]
                        )
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'AI javobi',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'japanese_reply', type: 'string', example: 'こんにちは！お元気ですか？'),
                        new OA\Property(property: 'uzbek_feedback', type: 'string', example: 'Juda yaxshi! Salomlashdingiz.'),
                        new OA\Property(property: 'corrections', type: 'array', items: new OA\Items(type: 'string')),
                        new OA\Property(property: 'audio_base64', type: 'string', description: 'TTS audio (base64 MP3)', nullable: true),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Autentifikatsiya talab qilinadi'),
        ]
    )]
    public function chat_6() {}

    #[OA\Get(
        path: '/api/ai/history',
        summary: 'AI chat tarixini olish',
        description: 'Foydalanuvchining AI bilan suhbat tarixini qaytaradi.',
        tags: ['AI Chat'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Chat tarixi'),
        ]
    )]
    public function history_7() {}

    #[OA\Get(
        path: '/api/levels',
        summary: 'Kurs darajalari ro\'yxati (ochiq)',
        description: 'Barcha kurs darajalari ro\'yxatini qaytaradi. Autentifikatsiya talab qilinmaydi.',
        tags: ['Levels & Modules'],
        responses: [
            new OA\Response(response: 200, description: 'Darajalar ro\'yxati'),
        ]
    )]
    public function index_8() {}

    #[OA\Get(
        path: '/api/levels/{slug}',
        summary: 'Daraja batafsil ma\'lumoti (ochiq)',
        description: 'Slug orqali bitta darajaning modullari va darslari bilan batafsil ma\'lumoti.',
        tags: ['Levels & Modules'],
        parameters: [
            new OA\Parameter(name: 'slug', in: 'path', required: true, description: 'Daraja slugi', schema: new OA\Schema(type: 'string', example: 'n5-basics')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Daraja ma\'lumotlari'),
            new OA\Response(response: 404, description: 'Daraja topilmadi'),
        ]
    )]
    public function show_9() {}

    #[OA\Get(
        path: '/api/levels/{slug}/grammars',
        summary: 'Grammar ro\'yxati',
        description: 'Berilgan daraja (slug) uchun grammatika qoidalari ro\'yxati.',
        tags: ['Materials'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'slug', in: 'path', required: true, schema: new OA\Schema(type: 'string', example: 'n5-basics')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Grammar ro\'yxati'),
        ]
    )]
    public function grammars_10() {}

    #[OA\Get(
        path: '/api/levels/{slug}/kanjis',
        summary: 'Kanji ro\'yxati',
        description: 'Berilgan daraja uchun kanji belgilari ro\'yxati.',
        tags: ['Materials'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'slug', in: 'path', required: true, schema: new OA\Schema(type: 'string', example: 'n5-basics')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Kanji ro\'yxati'),
        ]
    )]
    public function kanjis_11() {}

    #[OA\Get(
        path: '/api/levels/{slug}/vocabularies',
        summary: 'Vocabulary (lug\'at) ro\'yxati',
        description: 'Berilgan daraja uchun so\'z boyligi ro\'yxati.',
        tags: ['Materials'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'slug', in: 'path', required: true, schema: new OA\Schema(type: 'string', example: 'n5-basics')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Vocabulary ro\'yxati'),
        ]
    )]
    public function vocabularies_12() {}

    #[OA\Get(
        path: '/api/search',
        summary: 'Umumiy qidiruv',
        description: 'Grammar, Kanji, Vocabulary bo\'yicha umumiy qidiruv.',
        tags: ['Search'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'q', in: 'query', required: true, description: 'Qidiruv so\'zi', schema: new OA\Schema(type: 'string', example: '食べる')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Qidiruv natijalari'),
            new OA\Response(response: 422, description: 'Qidiruv so\'zi talab qilinadi'),
        ]
    )]
    public function search_13() {}

    #[OA\Get(
        path: '/api/videos',
        summary: 'Video darslar ro\'yxati',
        description: 'Barcha video darslar ro\'yxatini qaytaradi.',
        tags: ['Videos'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Video darslar ro\'yxati'),
        ]
    )]
    public function index_14() {}

    #[OA\Get(
        path: '/api/videos/{id}',
        summary: 'Video darsi batafsil',
        tags: ['Videos'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Video darsi ma\'lumotlari'),
            new OA\Response(response: 404, description: 'Video topilmadi'),
        ]
    )]
    public function show_15() {}

    #[OA\Get(
        path: '/api/articles',
        summary: 'Maqolalar ro\'yxati (Dokkai)',
        tags: ['Articles / Dokkai'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Maqolalar ro\'yxati'),
        ]
    )]
    public function index_16() {}

    #[OA\Get(
        path: '/api/articles/{id}',
        summary: 'Maqola batafsil',
        tags: ['Articles / Dokkai'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Maqola ma\'lumotlari va quiz savollari'),
            new OA\Response(response: 404, description: 'Maqola topilmadi'),
        ]
    )]
    public function show_17() {}

    #[OA\Post(
        path: '/api/articles/{id}/submit-quiz',
        summary: 'Maqola quizini topshirish',
        tags: ['Articles / Dokkai'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'answers', type: 'array', items: new OA\Items(type: 'object')),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Quiz natijasi'),
        ]
    )]
    public function submitQuiz_18() {}

    #[OA\Post(
        path: '/api/user/lessons/{lesson}/like',
        summary: 'Darsga like bosish / olib tashlash (toggle)',
        tags: ['Lessons'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'lesson', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 5)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Like holati yangilandi'),
        ]
    )]
    public function toggleLike_19() {}

    #[OA\Post(
        path: '/api/user/lessons/{lesson}/comments',
        summary: 'Darsga izoh qoldirish',
        tags: ['Lessons'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'lesson', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 5)),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['body'],
                properties: [
                    new OA\Property(property: 'body', type: 'string', example: 'Juda foydali dars edi!'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Izoh qo\'shildi'),
        ]
    )]
    public function addComment_20() {}
}
