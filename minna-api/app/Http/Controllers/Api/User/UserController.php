<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\LoginHistory;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class UserController extends Controller
{
    // ==========================================
    // (Admin) LIST
    // ==========================================
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        $users = $query->latest()->paginate(10);

        return response()->json([
            'data' => $users->map(function ($user) {
                return [
                    'id'           => $user->id,
                    'name'         => $user->name,
                    'email'        => $user->email,
                    'role'         => $user->role,
                    'coins'        => $user->coins,
                    'streak'       => $user->streak,
                    'avatar'       => $user->avatar,
                    'is_premium'   => $user->is_premium,
                    'device_limit' => $user->deviceLimit(),
                ];
            }),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'total'        => $users->total(),
            ]
        ]);
    }

    // ==========================================
    // (Admin) UPDATE USER
    // ==========================================
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'       => 'sometimes|string|max:255',
            'role'       => 'sometimes|string|in:user,admin,teacher',
            'coins'      => 'sometimes|integer|min:0',
            'streak'     => 'sometimes|integer|min:0',
            'is_premium' => 'sometimes|boolean',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'user' => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'role'         => $user->role,
                'coins'        => $user->coins,
                'streak'       => $user->streak,
                'avatar'       => $user->avatar,
                'is_premium'   => $user->is_premium,
                'device_limit' => $user->deviceLimit(),
            ]
        ]);
    }

    // ==========================================
    // (Admin) DELETE USER
    // ==========================================
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['success' => true, 'message' => 'User deleted']);
    }

    // ==========================================
    // GET PROFILE
    // ==========================================
    public function getProfile(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'user'    => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'role'         => $user->role,
                'coins'        => $user->coins,
                'streak'       => $user->streak,
                'avatar'       => $user->avatar,
                'is_premium'   => $user->is_premium,
                'device_limit' => $user->deviceLimit(),
            ]
        ]);
    }

    // ==========================================
    // UPDATE NAME
    // ==========================================
    public function updateName(Request $request)
    {
        $request->validate([
            'name' => 'required|string|min:2|max:100',
        ]);

        $user = $request->user();
        $user->name = trim($request->name);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Ism muvaffaqiyatli yangilandi',
            'name'    => $user->name,
        ]);
    }

    // ==========================================
    // AVATAR UPLOAD
    // ==========================================
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $user = $request->user();

        if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar = '/storage/' . $path;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Avatar muvaffaqiyatli yuklandi',
            'avatar'  => $user->avatar
        ]);
    }

    // ==========================================
    // REVERT TO GOOGLE AVATAR
    // ==========================================
    public function revertToDefaultAvatar(Request $request)
    {
        $user = $request->user();

        if (!$user->google_avatar) {
            return response()->json([
                'success' => false,
                'message' => 'Google avatar topilmadi (Google orqali kirmagansiz)'
            ], 400);
        }

        if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
        }

        $user->avatar = $user->google_avatar;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Default Google rasmiga qaytildi',
            'avatar'  => $user->avatar
        ]);
    }

    // ==========================================
    // DAILY CHECK-IN
    // ==========================================
    public function checkIn(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();

        $alreadyCheckedIn = LoginHistory::where('user_id', $user->id)
            ->where('login_date', $today)
            ->exists();

        if (!$alreadyCheckedIn) {
            LoginHistory::create([
                'user_id'    => $user->id,
                'login_date' => $today,
            ]);

            if ($user->last_login_at) {
                if ($user->last_login_at->isYesterday()) {
                    $user->streak += 1;
                } elseif (!$user->last_login_at->isToday()) {
                    $user->streak = 1;
                }
            } else {
                $user->streak = 1;
            }
            $user->last_login_at = Carbon::now();
            $user->save();
        }

        return response()->json([
            'success'    => true,
            'streak'     => $user->streak,
            'checked_in' => !$alreadyCheckedIn,
        ]);
    }

    // ==========================================
    // STREAK CALENDAR
    // ==========================================
    public function getStreaks(Request $request)
    {
        $year   = $request->query('year', Carbon::now()->year);
        $month  = $request->query('month', Carbon::now()->month);
        $userId = auth()->id();

        $dates = LoginHistory::where('user_id', $userId)
            ->whereYear('login_date', $year)
            ->whereMonth('login_date', $month)
            ->pluck('login_date')
            ->toArray();

        return response()->json(['data' => $dates]);
    }

    // ==========================================
    // DEVICE MANAGER
    // ==========================================
    public function getDevices(Request $request)
    {
        $user           = $request->user();
        $currentTokenId = $user->currentAccessToken()->id;

        $devices = $user->tokens->map(function ($token) use ($currentTokenId) {
            return [
                'id'           => $token->id,
                'name'         => $token->name,
                'last_used_at' => $token->last_used_at,
                'created_at'   => $token->created_at,
                'is_current'   => $token->id === $currentTokenId,
            ];
        });

        return response()->json(['success' => true, 'data' => $devices]);
    }

    public function logoutDevice(Request $request, $tokenId)
    {
        $request->user()->tokens()->where('id', $tokenId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Qurilmadan muvaffaqiyatli chiqildi'
        ]);
    }

    public function logoutOtherDevices(Request $request)
    {
        $currentTokenId = $request->user()->currentAccessToken()->id;
        $request->user()->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Boshqa barcha qurilmalardan chiqildi'
        ]);
    }
}