<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Mass assignable fields
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'google_avatar',
        'role',
        'coins',
        'streak',
        'last_login_at',
        'otp_code',
        'otp_expires_at',
        'email_verified_at',
        'is_premium', // ✅ premium flag
    ];

    /**
     * Hidden fields (API response’da ko‘rinmaydi)
     */
    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
    ];

    /**
     * Casts (data type larni to‘g‘rilaydi)
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'otp_expires_at' => 'datetime',
        'is_premium' => 'boolean', // ✅ muhim
        'password' => 'hashed',
    ];

    /**
     * 🔥 DEVICE LIMIT (ENG MUHIM FUNKSIYA)
     * Free → 2 device
     * Premium → 5 device
     */
    public function deviceLimit(): int
    {
        return $this->is_premium ? 5 : 2;
    }

    /**
     * (Optional) User premium ekanligini tekshirish
     */
    public function isPremium(): bool
    {
        return $this->is_premium;
    }
    public function loginHistories()
    {
        return $this->hasMany(LoginHistory::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }
}