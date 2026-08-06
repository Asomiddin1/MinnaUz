<?php
$v = App\Models\VideoLesson::first();
if ($v) {
    $v->transcript = [
        'uz' => [
            ['time' => '00:00', 'text' => 'Assalomu alaykum!']
        ],
        'ja' => [
            ['time' => '00:00', 'text' => 'こんにちは！']
        ]
    ];
    $v->save();
    echo "Fixed video transcript!\n";
}
