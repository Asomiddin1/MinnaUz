<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Barcha foydalanuvchilarni qidiruv va paginatsiya bilan olish.
     */
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('role') && !empty($request->role)) {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate(50);
        return response()->json($users);
    }

    /**
     * Muayyan foydalanuvchi ma'lumotlarini ko'rish.
     */
    public function show($id)
    {
        $user = User::with('loginHistories')->findOrFail($id);
        return response()->json($user);
    }

    /**
     * Foydalanuvchi ma'lumotlarini yangilash (Role, Premium, Name).
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => 'sometimes|string|in:user,admin,teacher',
            'is_premium' => 'sometimes|boolean',
            'coins' => 'sometimes|integer',
            'password' => 'sometimes|string|min:6'
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        // O'zini o'zi adminlikdan olib tashlashni taqiqlash
        if (auth()->id() == $user->id && isset($data['role']) && $data['role'] !== 'admin') {
            return response()->json(['message' => 'O‘zingizning adminlik huquqingizni bekor qila olmaysiz!'], 403);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Foydalanuvchi muvaffaqiyatli yangilandi',
            'user' => $user
        ]);
    }

    /**
     * Foydalanuvchini tizimdan o'chirish.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Admin o'zini o'zi o'chirib yubormasligi uchun tekshiruv
        if (auth()->id() == $user->id) {
            return response()->json(['message' => 'O‘zingizni o‘chira olmaysiz!'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Foydalanuvchi o‘chirib tashlandi']);
    }

    /**
     * Foydalanuvchining Premium statusini tezkor o'zgartirish.
     */
    public function togglePremium($id)
    {
        $user = User::findOrFail($id);
        $user->is_premium = !$user->is_premium;
        $user->save();

        return response()->json([
            'message' => $user->is_premium ? 'Premium yoqildi' : 'Premium o‘chirildi',
            'is_premium' => $user->is_premium
        ]);
    }
}