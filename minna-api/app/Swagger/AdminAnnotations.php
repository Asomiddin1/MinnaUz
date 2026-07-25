<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

/**
 * ============================================================
 * ADMIN API ANNOTATIONS
 * ============================================================
 */
class AdminAnnotations
{
    // ==========================================
    // MODULES
    // ==========================================
    #[OA\Get(
        path: '/api/admin/modules',
        summary: 'Barcha modullarni olish',
        tags: ['Admin — Modules'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Modullar ro\'yxati'),
            new OA\Response(response: 401, description: 'Autentifikatsiya talab qilinadi'),
        ]
    )]
    public function getModules() {}

    #[OA\Post(
        path: '/api/admin/modules',
        summary: 'Yangi modul yaratish',
        tags: ['Admin — Modules'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['level_id', 'title'],
                properties: [
                    new OA\Property(property: 'level_id', type: 'integer'),
                    new OA\Property(property: 'title', type: 'string'),
                    new OA\Property(property: 'order', type: 'integer', nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Modul yaratildi'),
        ]
    )]
    public function createModule() {}

    #[OA\Get(
        path: '/api/admin/modules/{module}',
        summary: 'Modulni ko\'rish',
        tags: ['Admin — Modules'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'module', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Modul ma\'lumotlari'),
        ]
    )]
    public function getModule() {}

    #[OA\Put(
        path: '/api/admin/modules/{module}',
        summary: 'Modulni yangilash',
        tags: ['Admin — Modules'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'module', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'level_id', type: 'integer'),
                    new OA\Property(property: 'title', type: 'string'),
                    new OA\Property(property: 'order', type: 'integer'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Modul yangilandi'),
        ]
    )]
    public function updateModule() {}

    #[OA\Delete(
        path: '/api/admin/modules/{module}',
        summary: 'Modulni o\'chirish',
        tags: ['Admin — Modules'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'module', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Modul o\'chirildi'),
        ]
    )]
    public function deleteModule() {}


    // ==========================================
    // QUESTIONS
    // ==========================================
    #[OA\Get(
        path: '/api/admin/questions',
        summary: 'Savollar ro\'yxati',
        tags: ['Admin — Questions'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Savollar ro\'yxati'),
        ]
    )]
    public function getQuestions() {}

    #[OA\Post(
        path: '/api/admin/questions',
        summary: 'Savol yaratish',
        tags: ['Admin — Questions'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'test_id', type: 'integer'),
                    new OA\Property(property: 'content', type: 'string'),
                    new OA\Property(property: 'type', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Savol yaratildi'),
        ]
    )]
    public function createQuestion() {}

    #[OA\Get(
        path: '/api/admin/questions/{question}',
        summary: 'Savolni ko\'rish',
        tags: ['Admin — Questions'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'question', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Savol ma\'lumoti'),
        ]
    )]
    public function getQuestion() {}

    #[OA\Put(
        path: '/api/admin/questions/{question}',
        summary: 'Savolni yangilash',
        tags: ['Admin — Questions'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'question', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Savol yangilandi'),
        ]
    )]
    public function updateQuestion() {}

    #[OA\Delete(
        path: '/api/admin/questions/{question}',
        summary: 'Savolni o\'chirish',
        tags: ['Admin — Questions'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'question', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Savol o\'chirildi'),
        ]
    )]
    public function deleteQuestion() {}


    // ==========================================
    // TESTS
    // ==========================================
    #[OA\Get(
        path: '/api/admin/tests',
        summary: 'Testlar ro\'yxati',
        tags: ['Admin — Tests'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Testlar ro\'yxati'),
        ]
    )]
    public function getAdminTests() {}

    #[OA\Post(
        path: '/api/admin/tests',
        summary: 'Test yaratish',
        tags: ['Admin — Tests'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 201, description: 'Test yaratildi'),
        ]
    )]
    public function createAdminTest() {}

    #[OA\Get(
        path: '/api/admin/tests/{testId}/questions',
        summary: 'Testning savollarini olish',
        tags: ['Admin — Tests'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'testId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Test savollari'),
        ]
    )]
    public function getAdminTestQuestions() {}

    #[OA\Get(
        path: '/api/admin/tests/{test}',
        summary: 'Testni ko\'rish',
        tags: ['Admin — Tests'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'test', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Test ma\'lumoti'),
        ]
    )]
    public function getAdminTest() {}

    #[OA\Put(
        path: '/api/admin/tests/{test}',
        summary: 'Testni yangilash',
        tags: ['Admin — Tests'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'test', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Test yangilandi'),
        ]
    )]
    public function updateAdminTest() {}

    #[OA\Delete(
        path: '/api/admin/tests/{test}',
        summary: 'Testni o\'chirish',
        tags: ['Admin — Tests'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'test', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Test o\'chirildi'),
        ]
    )]
    public function deleteAdminTest() {}


    // ==========================================
    // USERS
    // ==========================================
    #[OA\Get(
        path: '/api/admin/users',
        summary: 'Foydalanuvchilar ro\'yxati',
        tags: ['Admin — Users'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Foydalanuvchilar ro\'yxati'),
        ]
    )]
    public function getAdminUsers() {}

    #[OA\Get(
        path: '/api/admin/users/{user}',
        summary: 'Foydalanuvchini ko\'rish',
        tags: ['Admin — Users'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Foydalanuvchi ma\'lumoti'),
        ]
    )]
    public function getAdminUser() {}

    #[OA\Put(
        path: '/api/admin/users/{user}',
        summary: 'Foydalanuvchini yangilash',
        tags: ['Admin — Users'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Foydalanuvchi yangilandi'),
        ]
    )]
    public function updateAdminUser() {}

    #[OA\Delete(
        path: '/api/admin/users/{user}',
        summary: 'Foydalanuvchini o\'chirish',
        tags: ['Admin — Users'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'user', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Foydalanuvchi o\'chirildi'),
        ]
    )]
    public function deleteAdminUser() {}

    #[OA\Post(
        path: '/api/admin/users/{id}/toggle-premium',
        summary: 'Premium statusini o\'zgartirish',
        tags: ['Admin — Users'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Premium statusi yangilandi'),
        ]
    )]
    public function togglePremium() {}


    // ==========================================
    // VIDEOS
    // ==========================================
    #[OA\Get(
        path: '/api/admin/videos',
        summary: 'Video darslar ro\'yxati',
        tags: ['Admin — Videos'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Videolar ro\'yxati'),
        ]
    )]
    public function getAdminVideos() {}

    #[OA\Post(
        path: '/api/admin/videos',
        summary: 'Video dars yaratish',
        tags: ['Admin — Videos'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 201, description: 'Video dars yaratildi'),
        ]
    )]
    public function createAdminVideo() {}

    #[OA\Post(
        path: '/api/admin/videos/fetch-youtube',
        summary: 'YouTube orqali video dars yaratish',
        tags: ['Admin — Videos'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'youtube_url', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Video muvaffaqiyatli tortib olindi'),
        ]
    )]
    public function fetchYoutube() {}

    #[OA\Get(
        path: '/api/admin/videos/{video}',
        summary: 'Video darsni ko\'rish',
        tags: ['Admin — Videos'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'video', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Video ma\'lumoti'),
        ]
    )]
    public function getAdminVideo() {}

    #[OA\Put(
        path: '/api/admin/videos/{video}',
        summary: 'Video darsni yangilash',
        tags: ['Admin — Videos'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'video', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Video yangilandi'),
        ]
    )]
    public function updateAdminVideo() {}

    #[OA\Delete(
        path: '/api/admin/videos/{video}',
        summary: 'Video darsni o\'chirish',
        tags: ['Admin — Videos'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'video', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Video o\'chirildi'),
        ]
    )]
    public function deleteAdminVideo() {}


    // ==========================================
    // VOCABULARIES
    // ==========================================
    #[OA\Get(
        path: '/api/admin/vocabularies',
        summary: 'Lug\'at ro\'yxati',
        tags: ['Admin — Vocabulary'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Lug\'at ro\'yxati'),
        ]
    )]
    public function getAdminVocabularies() {}

    #[OA\Post(
        path: '/api/admin/vocabularies',
        summary: 'Lug\'at so\'zini yaratish',
        tags: ['Admin — Vocabulary'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 201, description: 'Lug\'at so\'zi yaratildi'),
        ]
    )]
    public function createAdminVocabulary() {}

    #[OA\Get(
        path: '/api/admin/vocabularies/{vocabulary}',
        summary: 'Lug\'at so\'zini ko\'rish',
        tags: ['Admin — Vocabulary'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'vocabulary', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lug\'at so\'zi ma\'lumoti'),
        ]
    )]
    public function getAdminVocabulary() {}

    #[OA\Put(
        path: '/api/admin/vocabularies/{vocabulary}',
        summary: 'Lug\'at so\'zini yangilash',
        tags: ['Admin — Vocabulary'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'vocabulary', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lug\'at so\'zi yangilandi'),
        ]
    )]
    public function updateAdminVocabulary() {}

    #[OA\Delete(
        path: '/api/admin/vocabularies/{vocabulary}',
        summary: 'Lug\'at so\'zini o\'chirish',
        tags: ['Admin — Vocabulary'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'vocabulary', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lug\'at so\'zi o\'chirildi'),
        ]
    )]
    public function deleteAdminVocabulary() {}
}
