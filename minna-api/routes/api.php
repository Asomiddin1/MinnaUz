<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;

// ==========================================
// MAVJUD CONTROLLERLAR
// ==========================================
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\User\UserController as UserProfileController;
use App\Http\Controllers\Api\User\ExamController as UserExamController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\TestController as AdminTestController;
use App\Http\Controllers\Api\Admin\QuestionController as AdminQuestionController;
use App\Http\Controllers\Api\Admin\GroqController;

// ==========================================
// LMS (O'QUV KURS) CONTROLLERLARI
// ==========================================
use App\Http\Controllers\Api\Admin\LevelController as AdminLevelController;
use App\Http\Controllers\Api\Admin\ModuleController as AdminModuleController;
use App\Http\Controllers\Api\Admin\LessonController as AdminLessonController;
use App\Http\Controllers\Api\Admin\DashboardController;

use App\Http\Controllers\Api\User\LevelController as UserLevelController;
use App\Http\Controllers\Api\User\InteractionController;

// ==========================================
// MATERIALLAR VA QIDIRUV CONTROLLERLARI
// ==========================================
use App\Http\Controllers\Api\Admin\GrammarController as AdminGrammarController;
use App\Http\Controllers\Api\Admin\KanjiController as AdminKanjiController;
use App\Http\Controllers\Api\Admin\VocabularyController as AdminVocabularyController;

use App\Http\Controllers\Api\User\MaterialController as UserMaterialController;
use App\Http\Controllers\Api\User\SearchController;

// ==========================================
// VIDEO DARSLAR CONTROLLERLARI
// ==========================================
use App\Http\Controllers\Api\Admin\VideoLessonController as AdminVideoController;
use App\Http\Controllers\Api\User\VideoLessonController as UserVideoController;

// ==========================================
// DOKKAI (MAQOLALAR) CONTROLLERLARI
// ==========================================
use App\Http\Controllers\Api\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\Api\User\ArticleController as UserArticleController;

// ==========================================
// AI MODELLARINI TEKSHIRISH ROUTE'I (VAQTINCHALIK)
// ==========================================
Route::get('/ai/test-models', function () {
    $apiKey = env('GEMINI_API_KEY');
    $response = Http::withoutVerifying()->get("https://generativelanguage.googleapis.com/v1beta/models?key={$apiKey}");
    return $response->json();
});

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTELAR (Hamma ko'ra oladi)
|--------------------------------------------------------------------------
*/
// Public Auth
Route::prefix('auth')->group(function () {
    Route::post('/google', [AuthController::class, 'googleLogin']);
    Route::post('/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
});

// Kurslar ro'yxati va ma'lumotlar ochiq qoldirilgan
Route::get('/levels', [UserLevelController::class, 'index']);
Route::get('/levels/{slug}', [UserLevelController::class, 'show']);

/*
|--------------------------------------------------------------------------
| AUTHENTICATED USER ROUTELARI (Faqat tizimga kirganlar uchun)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // -------- AI ROUTELARI --------
    Route::post('/ai/chat', [\App\Http\Controllers\AiController::class, 'chat']);
    Route::get('/ai/history', [\App\Http\Controllers\AiController::class, 'history']);
    // ------------------------------

    // DOKKAI / MAQOLALAR (USER QISMI)
    Route::prefix('articles')->group(function () {
        Route::get('/', [UserArticleController::class, 'index']); 
        Route::get('/{id}', [UserArticleController::class, 'show']); 
        Route::post('/{id}/submit-quiz', [UserArticleController::class, 'submitQuiz']); 
    });

    // YOPILGAN MATERIALLAR
    Route::get('/levels/{slug}/grammars', [UserMaterialController::class, 'getGrammars']);
    Route::get('/levels/{slug}/kanjis', [UserMaterialController::class, 'getKanjis']);
    Route::get('/levels/{slug}/vocabularies', [UserMaterialController::class, 'getVocabularies']);
    Route::get('/search', [SearchController::class, 'search']);
    
    // Video Darslar (User qismi)
    Route::get('/videos', [UserVideoController::class, 'index']);
    Route::get('/videos/{id}', [UserVideoController::class, 'show']);

    // User harakatlari va Test qismi
    Route::prefix('user')->group(function () {
        
        // ===== PROFILE =====
        Route::get('/profile', [UserProfileController::class, 'getProfile']);
        // ===================
        
        // ===== STREAKS =====
        Route::get('/streaks', [UserProfileController::class, 'getStreaks']);
        // ===================
        
        // ===== DEVICE MANAGER =====
        Route::get('/devices', [UserProfileController::class, 'getDevices']);
        Route::delete('/devices/logout-others', [UserProfileController::class, 'logoutOtherDevices']); 
        Route::delete('/devices/{id}', [UserProfileController::class, 'logoutDevice']); 
        // ==========================

        // ===== AVATAR =====
        Route::post('/avatar', [UserProfileController::class, 'uploadAvatar']);
        Route::post('/avatar/default', [UserProfileController::class, 'revertToDefaultAvatar']);
        // ==========================

        // ===== NAME UPDATE =====
        Route::patch('/name', [UserProfileController::class, 'updateName']);
        // ==========================

        // ===== DAILY CHECK-IN =====
        Route::post('/check-in', [UserProfileController::class, 'checkIn']);
        // ==========================

        Route::get('/tests', [UserExamController::class, 'index']);
        Route::get('/tests/{id}', [UserExamController::class, 'show']);
        Route::post('/tests/{id}/submit', [UserExamController::class, 'submit']);
        Route::get('/results/{resultId}', [UserExamController::class, 'result']);
        Route::get('/results', [UserExamController::class, 'history']); 
        
        // Darslarga like bosish va izoh yozish
        Route::post('/lessons/{lesson}/like', [InteractionController::class, 'toggleLike']);
        Route::post('/lessons/{lesson}/comments', [InteractionController::class, 'addComment']);
    });
});

/*
|--------------------------------------------------------------------------
| ADMIN ONLY ROUTELARI (Faqat Admin uchun)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // Admin user va test boshqaruvi
    Route::get('/dashboard/stats', [DashboardController::class, 'index']);
    
    Route::apiResource('users', AdminUserController::class)->except(['store']);
    Route::post('/users/{id}/toggle-premium', [AdminUserController::class, 'togglePremium']);
    Route::apiResource('tests', AdminTestController::class);
    Route::get('/tests/{testId}/questions', [AdminTestController::class, 'getQuestions']);
    Route::apiResource('questions', AdminQuestionController::class);

    // LMS Admin
    Route::apiResource('levels', AdminLevelController::class);
    Route::apiResource('modules', AdminModuleController::class);
    Route::apiResource('lessons', AdminLessonController::class);

    // Materiallar (CRUD)
    Route::apiResource('grammars', AdminGrammarController::class);
    Route::patch('grammars/{grammar}/translation', [AdminGrammarController::class, 'updateTranslation']);
    Route::apiResource('kanjis', AdminKanjiController::class);
    Route::apiResource('vocabularies', AdminVocabularyController::class);

    // Video Darslar Admin (CRUD + YouTube API)
    Route::post('/videos/fetch-youtube', [AdminVideoController::class, 'fetchFromYoutube']);
    Route::apiResource('videos', AdminVideoController::class);

    // Dokkai / Maqolalar Admin (CRUD)
    Route::apiResource('articles', AdminArticleController::class);

    // Groq API (va yangi qo'shilgan Dokkai AI marshruti)
    Route::post('/groq/grammar', [GroqController::class, 'fillGrammar']);  
    Route::post('/groq/grammar/examples', [GroqController::class, 'getExamples']);  
    Route::post('/groq/grammar/fill', [GroqController::class, 'fillGrammarInfo']); 
    Route::post('/groq/dokkai-generate', [GroqController::class, 'generateDokkaiContent']); 
});