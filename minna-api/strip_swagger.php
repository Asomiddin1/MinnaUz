<?php

function stripSwagger($file) {
    $content = file_get_contents($file);
    
    // We want to remove #[OA\... ] and all its contents.
    // Since attributes can have nested brackets [], we'll use a more robust approach.
    // This regex looks for #[OA\ and then non-greedily matches until the end of the attribute.
    // However, nested arrays make it tricky.
    
    // Let's just remove everything between #[OA\ and )] + whitespace.
    // Wait, the end is )] for attributes with arguments, or ] for attributes without arguments.
    // Example: #[OA\Get(...)]
    $content = preg_replace('/#\[OA\\\\(?:[a-zA-Z]+)\(.*?\)\]\s*/s', '', $content);
    
    file_put_contents($file, $content);
    echo "Stripped: $file\n";
}

stripSwagger('app/Http/Controllers/Api/Auth/AuthController.php');
stripSwagger('app/Http/Controllers/Api/User/UserController.php');

