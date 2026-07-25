<?php

$file = 'app/Swagger/ApiAnnotations.php';
$content = file_get_contents($file);

// Replace function index() {} with unique names, but sequentially.
// Actually, it's easier to just find all `public function name() {}` and rename them uniquely.
$count = 1;
$content = preg_replace_callback('/public function ([a-zA-Z0-9_]+)\s*\(\)\s*\{/s', function($matches) use (&$count) {
    return 'public function ' . $matches[1] . '_' . ($count++) . '() {';
}, $content);

file_put_contents($file, $content);
echo "Renamed methods uniquely in $file\n";
