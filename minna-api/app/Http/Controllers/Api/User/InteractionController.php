<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Favorite;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InteractionController extends Controller
{
    // Darsni saqlash (Like) yoki saqlanganlardan olib tashlash (Toggle)
    public function toggleLike(Request $request, $lessonId)
    {
        $userId = Auth::id(); // Tizimga kirgan user ID si

        // Dars bor-yo'qligini tekshiramiz
        $lesson = Lesson::findOrFail($lessonId);

        // User bu darsni oldin saqlaganmi?
        $favorite = Favorite::where('user_id', $userId)
                            ->where('lesson_id', $lessonId)
                            ->first();

        if ($favorite) {
            // Agar saqlagan bo'lsa, o'chiramiz (Unlike)
            $favorite->delete();
            return response()->json(['message' => 'Dars saqlanganlardan olib tashlandi', 'is_saved' => false]);
        } else {
            // Agar saqlamagan bo'lsa, saqlaymiz (Like)
            Favorite::create([
                'user_id' => $userId,
                'lesson_id' => $lessonId
            ]);
            return response()->json(['message' => 'Dars saqlab qo\'yildi', 'is_saved' => true]);
        }
    }

    // Darsga izoh (Comment) yozish
    public function addComment(Request $request, $lessonId)
    {
        $request->validate([
            'comment' => 'required|string|max:1000'
        ]);

        $lesson = Lesson::findOrFail($lessonId);

        $comment = Comment::create([
            'user_id' => Auth::id(),
            'lesson_id' => $lessonId,
            'comment' => $request->comment
        ]);

        // Yozgan odamning ismini ham qaytarish uchun (Frontendda srazu ko'rsatishga)
        $comment->load('user:id,name');

        return response()->json([
            'message' => 'Izoh muvaffaqiyatli qo\'shildi!',
            'data' => $comment
        ], 201);
    }

    // Izohni o'zgartirish (Update)
    public function updateComment(Request $request, $commentId)
    {
        $request->validate([
            'comment' => 'required|string|max:1000'
        ]);

        $comment = Comment::findOrFail($commentId);

        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Ruxsat etilmagan!'], 403);
        }

        $comment->update([
            'comment' => $request->comment
        ]);

        $comment->load('user:id,name');

        return response()->json([
            'message' => 'Izoh yangilandi',
            'data' => $comment
        ]);
    }

    // Izohni o'chirish (Delete)
    public function deleteComment($commentId)
    {
        $comment = Comment::findOrFail($commentId);

        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Ruxsat etilmagan!'], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Izoh o\'chirildi'
        ]);
    }
}