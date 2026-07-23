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
    // UPDATE NAME
    // ==========================================
    #[OA\Patch(
        path: '/api/user/name',
        summary: 'Foydalanuvchi ismini yangilash',
        description: 'Joriy foydalanuvchining to\'liq ismini o\'zgartiradi. Min 2, max 100 belgi.',
        tags: ['User Profile'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', minLength: 2, maxLength: 100, example: 'Asomiddin Nazarov'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Ism muvaffaqiyatli yangilandi',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Ism muvaffaqiyatli yangilandi'),
                        new OA\Property(property: 'name', type: 'string', example: 'Asomiddin Nazarov'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Autentifikatsiya talab qilinadi'),
            new OA\Response(response: 422, description: 'Validatsiya xatosi'),
        ]
    )]
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
    #[OA\Post(
        path: '/api/user/avatar',
        summary: 'Profil rasmini yuklash',
        description: 'Foydalanuvchi o\'z profiliga yangi rasm yuklaydi. Faqat bitta rasm saqlanadi — oldingi mahalliy rasm o\'chib ketadi. Max hajm: 2MB.',
        tags: ['Avatar'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    required: ['avatar'],
                    properties: [
                        new OA\Property(
                            property: 'avatar',
                            type: 'string',
                            format: 'binary',
                            description: 'Rasm fayli (jpeg, png, jpg, gif, webp — max 2MB)'
                        ),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Rasm muvaffaqiyatli yuklandi',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Avatar muvaffaqiyatli yuklandi'),
                        new OA\Property(property: 'avatar', type: 'string', example: '/storage/avatars/abc123.jpg'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Autentifikatsiya talab qilinadi'),
            new OA\Response(response: 422, description: 'Fayl noto\'g\'ri format yoki hajmi katta'),
        ]
    )]
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
    #[OA\Post(
        path: '/api/user/avatar/default',
        summary: 'Google rasmiga qaytish',
        description: 'Foydalanuvchi maxsus yuklagan rasmini o\'chirib, asl Google profilidagi rasmiga qaytadi. Faqat Google orqali kirgan foydalanuvchilar uchun ishlaydi.',
        tags: ['Avatar'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Google rasmiga muvaffaqiyatli qaytildi',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Default Google rasmiga qaytildi'),
                        new OA\Property(property: 'avatar', type: 'string', example: 'https://lh3.googleusercontent.com/...'),
                    ]
                )
            ),
            new OA\Response(response: 400, description: 'Google avatar topilmadi (Google orqali kirmagansiz)'),
            new OA\Response(response: 401, description: 'Autentifikatsiya talab qilinadi'),
        ]
    )]
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
    #[OA\Post(
        path: '/api/user/check-in',
        summary: 'Kunlik check-in',
        description: 'Foydalanuvchi har kuni bir marta check-in qiladi. Agar bugun allaqachon check-in qilingan bo\'lsa, streak o\'zgarmaydi.',
        tags: ['User Profile'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Check-in natijasi',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'streak', type: 'integer', example: 7),
                        new OA\Property(property: 'checked_in', type: 'boolean', description: 'true — yangi check-in, false — bugun allaqachon bajarilgan', example: true),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Autentifikatsiya talab qilinadi'),
        ]
    )]
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
    #[OA\Get(
        path: '/api/user/streaks',
        summary: 'Streak kalendarini olish',
        description: 'Berilgan yil va oy uchun foydalanuvchi kirgan kunlar ro\'yxatini qaytaradi (streak calendar uchun).',
        tags: ['User Profile'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'year', in: 'query', required: false, description: 'Yil (default: joriy yil)', schema: new OA\Schema(type: 'integer', example: 2026)),
            new OA\Parameter(name: 'month', in: 'query', required: false, description: 'Oy (1-12, default: joriy oy)', schema: new OA\Schema(type: 'integer', example: 7)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Kirish sanalari ro\'yxati',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'string', example: '2026-07-15')),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Autentifikatsiya talab qilinadi'),
        ]
    )]
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
    #[OA\Get(
        path: '/api/user/devices',
        summary: 'Faol qurilmalar ro\'yxati',
        description: 'Joriy foydalanuvchining barcha faol sessiyalari (qurilmalari) ro\'yxatini qaytaradi. Joriy sessiya `is_current: true` bilan belgilanadi.',
        tags: ['Devices'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Qurilmalar ro\'yxati',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: 'id', type: 'integer', example: 5),
                                    new OA\Property(property: 'name', type: 'string', example: 'Windows • Chrome'),
                                    new OA\Property(property: 'last_used_at', type: 'string', nullable: true, example: '2026-07-23T12:00:00Z'),
                                    new OA\Property(property: 'created_at', type: 'string', example: '2026-07-20T08:00:00Z'),
                                    new OA\Property(property: 'is_current', type: 'boolean', example: true),
                                ]
                            )
                        ),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Autentifikatsiya talab qilinadi'),
        ]
    )]
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

    #[OA\Delete(
        path: '/api/user/devices/{id}',
        summary: 'Bitta qurilmadan chiqish',
        description: 'Berilgan token ID ga tegishli sessiyani (qurilmani) o\'chirib, o\'sha qurilmadan chiqadi. Faqat o\'z tokenini o\'chirishga ruxsat beriladi.',
        tags: ['Devices'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, description: 'Token ID', schema: new OA\Schema(type: 'integer', example: 5)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Qurilmadan chiqildi',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Qurilmadan muvaffaqiyatli chiqildi'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Autentifikatsiya talab qilinadi'),
        ]
    )]
    public function logoutDevice(Request $request, $tokenId)
    {
        $request->user()->tokens()->where('id', $tokenId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Qurilmadan muvaffaqiyatli chiqildi'
        ]);
    }

    #[OA\Delete(
        path: '/api/user/devices/logout-others',
        summary: 'Boshqa barcha qurilmalardan chiqish',
        description: 'Joriy sessiyadan tashqari barcha boshqa faol sessiyalarni (qurilmalarni) o\'chiradi.',
        tags: ['Devices'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Boshqa qurilmalardan chiqildi',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Boshqa barcha qurilmalardan chiqildi'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Autentifikatsiya talab qilinadi'),
        ]
    )]
    public function logoutOtherDevices(Request $request)
    {
        $currentTokenId = $request->user()->currentAccessToken()->id;
        $request->user()->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Boshqa barcha qurilmalardan chiqildi'
        ]);
    }

    // ==========================================
    // GET PROFILE (for /api/user)
    // ==========================================
    #[OA\Get(
        path: '/api/user/profile',
        summary: 'Profil ma\'lumotlarini olish',
        description: 'Joriy foydalanuvchining to\'liq profil ma\'lumotlarini qaytaradi.',
        tags: ['User Profile'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Profil ma\'lumotlari'),
            new OA\Response(response: 401, description: 'Autentifikatsiya talab qilinadi'),
        ]
    )]
    public function getProfile(Request $request)
    {
        return response()->json([
            'success' => true,
            'user'    => $request->user(),
        ]);
    }
}