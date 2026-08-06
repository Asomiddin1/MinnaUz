<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Grammar;
use App\Models\Kanji;
use App\Models\Vocabulary;
use App\Models\VideoLesson;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');

        if (!$query) {
            return response()->json(['data' => []]);
        }

        $limit = 5;

        $grammars = Grammar::with('level:id,slug')
            ->where('title', 'LIKE', "%{$query}%")
            ->orWhere('meaning', 'LIKE', "%{$query}%")
            ->orWhere('examples', 'LIKE', "%{$query}%")
            ->take($limit)
            ->get();

        $kanjis = Kanji::with('level:id,slug')
            ->where('character', 'LIKE', "%{$query}%")
            ->orWhere('meaning', 'LIKE', "%{$query}%")
            ->orWhere('examples', 'LIKE', "%{$query}%")
            ->take($limit)
            ->get();

        $vocabularies = Vocabulary::with('level:id,slug')
            ->where('word', 'LIKE', "%{$query}%")
            ->orWhere('meaning', 'LIKE', "%{$query}%")
            ->orWhere('reading', 'LIKE', "%{$query}%")
            ->orWhere('examples', 'LIKE', "%{$query}%")
            ->take($limit)
            ->get();

        $videos = VideoLesson::where('title', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->take($limit)
            ->get();

        return response()->json([
            'data' => [
                'grammars' => $grammars,
                'kanjis' => $kanjis,
                'vocabularies' => $vocabularies,
                'videos' => $videos,
            ]
        ]);
    }
}