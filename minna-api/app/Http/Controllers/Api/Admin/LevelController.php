<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Level;
use Illuminate\Http\Request;

class LevelController extends Controller
{
    // Barcha darajalarni ko'rish
    public function index()
    {
        // modules_count va lessons_count bilan birga olamiz
        $levels = Level::withCount('modules')->get();
        return response()->json($levels);
    }

    // Yangi daraja qo'shish
    public function store(Request $request)
    {
        $validated = $request->validate([
            'slug' => 'required|string|unique:levels',
            'title' => 'required|array',
            'title.uz' => 'required|string|max:255',
            'tags' => 'nullable|array',
            'video_count' => 'nullable|string',
            'lesson_count' => 'nullable|integer',
            'description' => 'nullable|string'
        ]);

        $level = Level::create($validated);

        return response()->json([
            'message' => 'Daraja muvaffaqiyatli yaratildi!',
            'data' => $level
        ], 201);
    }

    // Bitta darajani tahrirlash uchun ko'rish
    public function show(Level $level)
    {
        return response()->json($level->load(['modules', 'modules.lessons']));
    }

    // Darajani yangilash (Edit)
    public function update(Request $request, Level $level)
    {
        $validated = $request->validate([
            'slug' => 'required|string|unique:levels,slug,' . $level->id,
            'title' => 'required|array',
            'title.uz' => 'required|string|max:255',
            'tags' => 'nullable|array',
            'description' => 'nullable|string'
        ]);

        $level->update($validated);

        return response()->json([
            'message' => 'Daraja yangilandi!',
            'data' => $level
        ]);
    }

    // Darajani o'chirish
    public function destroy(Level $level)
    {
        $level->delete();
        return response()->json(['message' => 'Daraja o\'chirildi!']);
    }
}