<?php
$level = App\Models\Level::first();

if (!$level) {
    echo "No level found.\n";
    exit;
}

App\Models\Vocabulary::create([
    'level_id' => $level->id,
    'word' => '私',
    'reading' => 'watashi',
    'meaning' => 'Men (I)',
    'type' => 'Noun',
    'examples' => []
]);

App\Models\Kanji::create([
    'level_id' => $level->id,
    'character' => '日',
    'meaning' => 'Quyosh, Kun (Sun, Day)',
    'kunyomi' => 'hi, -bi, -ka',
    'onyomi' => 'nichi, jitsu',
    'examples' => []
]);

App\Models\Grammar::create([
    'level_id' => $level->id,
    'title' => ['uz' => '〜は (wa)'],
    'meaning' => ['uz' => 'Mavzu belgisi'],
    'description' => ['uz' => 'Gapning mavzusini belgilaydi.'],
    'examples' => []
]);

App\Models\VideoLesson::create([
    'category' => 'Grammar',
    'title' => 'Minna no Nihongo 1-dars',
    'thumbnail' => 'https://via.placeholder.com/150',
    'description' => 'Asosiy tanishuv va wa partiklini o\'rganish',
    'youtube_id' => 'dQw4w9WgXcQ',
    'views' => 0,
    'transcript' => ['uz' => 'Assalomu alaykum!']
]);

echo "Test data inserted successfully!\n";
