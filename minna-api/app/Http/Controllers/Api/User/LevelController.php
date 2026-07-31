<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Level;

class LevelController extends Controller
{
    // Bosh sahifa uchun barcha darajalar ro'yxati
    public function index()
    {
        // Faqat kerakli maydonlarni olamiz (tez ishlashi uchun)
        $levels = Level::select('id', 'slug', 'title', 'tags', 'video_count', 'lesson_count')->get();
        return response()->json($levels);
    }

    // Sizning jlpt-levels page'ingiz uchun bitta daraja barcha darslari bilan
    public function show($slug)
    {
        $level = Level::with([
            'modules' => function ($query) {
                $query->orderBy('order'); // Bo'limlarni tartibi bo'yicha
            },
            'modules.lessons.comments.user' // Modul ichidagi darslarni va ularning izohlarini yozuvchi user bilan qo'shib beradi
        ])
        ->where('slug', $slug)
        ->firstOrFail();

        $user = auth('sanctum')->user();
        if ($user) {
            $completedLessonIds = \App\Models\UserLessonProgress::where('user_id', $user->id)
                ->where('level_id', $level->id)
                ->where('is_completed', true)
                ->pluck('lesson_id')
                ->toArray();
                
            $favoriteLessonIds = \App\Models\Favorite::where('user_id', $user->id)
                ->pluck('lesson_id')
                ->toArray();

            foreach ($level->modules as $module) {
                foreach ($module->lessons as $lesson) {
                    $lesson->is_completed = in_array($lesson->id, $completedLessonIds);
                    $lesson->is_favorite = in_array($lesson->id, $favoriteLessonIds);
                }
            }
        }


        return response()->json($level);
    }
}