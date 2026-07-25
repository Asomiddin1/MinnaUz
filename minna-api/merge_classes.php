<?php

$file = 'app/Swagger/ApiAnnotations.php';
$content = file_get_contents($file);

// Replace all occurrences of `} class X {` (with comments in between)
// Basically we want to remove the end bracket of previous class and the start of the next class
$content = preg_replace('/}\s*\/\*\*\s*\*\s*=+.*?=+\s*\*\/\s*class [a-zA-Z]+\s*{/s', '', $content);

// Also change the first class name to ApiAnnotations
$content = preg_replace('/class TestsSwagger/', 'class ApiAnnotations', $content);

file_put_contents($file, $content);
echo "Merged classes in $file\n";
