<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Level extends Model
{
    use HasTranslations;

    protected $fillable = ['slug', 'title', 'tags', 'video_count', 'lesson_count', 'description'];
    
    public $translatable = ['title', 'description'];

    protected $casts = [
        'tags' => 'array',
    ];

    public function modules()
    {
        return $this->hasMany(Module::class)->orderBy('order');
    }

    public function kanjis()
    {
        return $this->hasMany(Kanji::class);
    }

    public function vocabularies()
    {
        return $this->hasMany(Vocabulary::class);
    }

    public function grammars()
{
    return $this->hasMany(Grammar::class);
}
}