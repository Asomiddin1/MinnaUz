<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. O'zgaruvchan ustunlarni text turiga o'tkazish
        Schema::table('levels', function (Blueprint $table) {
            $table->text('title')->change();
        });
        Schema::table('modules', function (Blueprint $table) {
            $table->text('title')->change();
        });
        Schema::table('lessons', function (Blueprint $table) {
            $table->text('title')->change();
        });

        // 2. Eski ma'lumotlarni JSON formatiga o'tkazish (faqat oddiy matn bo'lsa)
        $levels = \Illuminate\Support\Facades\DB::table('levels')->get();
        foreach ($levels as $item) {
            $title = (!empty($item->title) && !is_array(json_decode($item->title, true)))
                ? json_encode(['uz' => $item->title, 'ru' => $item->title, 'en' => $item->title], JSON_UNESCAPED_UNICODE)
                : $item->title;
                
            $desc = (!empty($item->description) && !is_array(json_decode($item->description, true)))
                ? json_encode(['uz' => $item->description, 'ru' => $item->description, 'en' => $item->description], JSON_UNESCAPED_UNICODE)
                : $item->description;

            \Illuminate\Support\Facades\DB::table('levels')->where('id', $item->id)->update(['title' => $title, 'description' => $desc]);
        }

        $modules = \Illuminate\Support\Facades\DB::table('modules')->get();
        foreach ($modules as $item) {
            $title = (!empty($item->title) && !is_array(json_decode($item->title, true)))
                ? json_encode(['uz' => $item->title, 'ru' => $item->title, 'en' => $item->title], JSON_UNESCAPED_UNICODE)
                : $item->title;

            \Illuminate\Support\Facades\DB::table('modules')->where('id', $item->id)->update(['title' => $title]);
        }

        $lessons = \Illuminate\Support\Facades\DB::table('lessons')->get();
        foreach ($lessons as $item) {
            $title = (!empty($item->title) && !is_array(json_decode($item->title, true)))
                ? json_encode(['uz' => $item->title, 'ru' => $item->title, 'en' => $item->title], JSON_UNESCAPED_UNICODE)
                : $item->title;
                
            $content = (!empty($item->content) && !is_array(json_decode($item->content, true)))
                ? json_encode(['uz' => $item->content, 'ru' => $item->content, 'en' => $item->content], JSON_UNESCAPED_UNICODE)
                : $item->content;

            \Illuminate\Support\Facades\DB::table('lessons')->where('id', $item->id)->update(['title' => $title, 'content' => $content]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Orqaga qaytishda string turiga qaytarish (qisman xavfli bo'lishi mumkin)
        Schema::table('levels', function (Blueprint $table) {
            $table->string('title')->change();
        });
        Schema::table('modules', function (Blueprint $table) {
            $table->string('title')->change();
        });
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('title')->change();
        });
    }
};
