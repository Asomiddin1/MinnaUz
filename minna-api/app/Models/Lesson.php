<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Lesson extends Model
{
    use HasTranslations;

    protected $fillable = ['module_id', 'title', 'video_url', 'content', 'duration', 'is_free'];

    protected $casts = [
        'is_free' => 'boolean',
    ];

    public $translatable = ['title', 'content'];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    // Darsga yozilgan commentlar
    public function comments()
    {
        return $this->hasMany(Comment::class)->latest();
    }

    // Darsga bosilgan likelar (saqlanganlar)
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }
}