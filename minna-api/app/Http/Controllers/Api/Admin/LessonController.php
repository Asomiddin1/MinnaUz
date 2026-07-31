<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LessonController extends Controller
{
    /**
     * Barcha video darslarni ko'rsatish
     */
    public function index(Request $request)
    {
        // Admin panelda dars qaysi modulga va darajaga tegishliligini ko'rish uchun munosabatlarni yuklaymiz
        $query = Lesson::with('module.level');

        // Filtr: Agar faqat bitta modulga (masalan, N5 Grammatika) tegishli darslarni ko'rmoqchi bo'lsak
        if ($request->has('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        return response()->json($query->get());
    }

    /**
     * Yangi video dars qo'shish
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_id'  => 'required|exists:modules,id',
            'title'      => 'required|array',
            'title.uz'   => 'required|string|max:255',
            'video_type' => 'required|in:youtube,server',
            'video_url'  => 'required_if:video_type,youtube|nullable|url',
            'video_file' => 'required_if:video_type,server|nullable|mimes:mp4,mov,ogg,qt|max:500000', // 500MB gacha
            'content'    => 'nullable|array',
            'duration'   => 'nullable|string',
            'is_free'    => 'nullable|boolean'
        ]);

        $data = $request->only(['module_id', 'title', 'content', 'duration', 'is_free']);

        if ($request->video_type === 'server' && $request->hasFile('video_file')) {
            $path = $request->file('video_file')->store('lessons/videos', 'public');
            $data['video_url'] = '/storage/' . $path;
        } else {
            $data['video_url'] = $request->video_url;
        }

        $lesson = Lesson::create($data);

        return response()->json([
            'message' => 'Video dars muvaffaqiyatli yaratildi!',
            'data'    => $lesson
        ], 201);
    }

    /**
     * Bitta darsni to'liq ko'rish
     */
    public function show(Lesson $lesson)
    {
        return response()->json($lesson->load('module.level'));
    }

    /**
     * Video darsni tahrirlash (Edit)
     */
    public function update(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'module_id'  => 'required|exists:modules,id',
            'title'      => 'required|array',
            'title.uz'   => 'required|string|max:255',
            'video_type' => 'required|in:youtube,server',
            'video_url'  => 'nullable|url', // youtube tipida faqat kiritilgan bo'lsa
            'video_file' => 'nullable|mimes:mp4,mov,ogg,qt|max:500000',
            'content'    => 'nullable|array',
            'duration'   => 'nullable|string',
            'is_free'    => 'nullable|boolean'
        ]);

        $data = $request->only(['module_id', 'title', 'content', 'duration', 'is_free']);

        if ($request->video_type === 'server' && $request->hasFile('video_file')) {
            // Eski faylni o'chirish
            if ($lesson->video_url && str_starts_with($lesson->video_url, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $lesson->video_url));
            }
            $path = $request->file('video_file')->store('lessons/videos', 'public');
            $data['video_url'] = '/storage/' . $path;
        } elseif ($request->video_type === 'youtube') {
            if ($lesson->video_url && str_starts_with($lesson->video_url, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $lesson->video_url));
            }
            $data['video_url'] = $request->video_url;
        }

        $lesson->update($data);

        return response()->json([
            'message' => 'Video dars yangilandi!',
            'data'    => $lesson
        ]);
    }

    /**
     * Video darsni o'chirish
     */
    public function destroy(Lesson $lesson)
    {
        // Agar local video bo'lsa, o'chiramiz
        if ($lesson->video_url && str_starts_with($lesson->video_url, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $lesson->video_url));
        }
        
        $lesson->delete();

        return response()->json([
            'message' => 'Video dars muvaffaqiyatli o\'chirildi!'
        ]);
    }
}