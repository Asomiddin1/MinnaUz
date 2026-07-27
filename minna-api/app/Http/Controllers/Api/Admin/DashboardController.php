<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Test;
use App\Models\VideoLesson;
use App\Models\Grammar;
use App\Models\Kanji;
use App\Models\Vocabulary;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Umumiy va premium foydalanuvchilar
        $totalUsers = User::count();
        $premiumUsers = User::where('is_premium', true)->count();
        $adminUsers = User::where('role', 'admin')->count();
        $teacherUsers = User::where('role', 'teacher')->count();
        $standardUsers = User::where('role', 'user')->count();

        // 2. Kontent (Testlar va Videolar)
        $totalTests = Test::count();
        $totalVideos = VideoLesson::count();

        // 3. Materiallar taqsimoti
        $totalGrammars = Grammar::count();
        $totalKanjis = Kanji::count();
        $totalVocabularies = Vocabulary::count();

        // 4. Foydalanuvchilar o'sishi (oxirgi 6 oy)
        $sixMonthsAgo = now()->subMonths(5)->startOfMonth();
        
        $driver = DB::connection()->getDriverName();
        $dateExpression = $driver === 'sqlite' 
            ? "strftime('%Y-%m', created_at)" 
            : "DATE_FORMAT(created_at, '%Y-%m')";
        
        $monthlyUsers = User::select(
            DB::raw("$dateExpression as month"),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', $sixMonthsAgo)
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        // Grafika uchun to'g'ri formatlash
        $monthsMap = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthString = now()->subMonths($i)->format('Y-m');
            $monthsMap[$monthString] = 0;
        }

        foreach ($monthlyUsers as $mu) {
            if (isset($monthsMap[$mu->month])) {
                $monthsMap[$mu->month] = $mu->count;
            }
        }

        $userGrowthChart = [];
        foreach ($monthsMap as $month => $count) {
            $userGrowthChart[] = [
                'name' => date('M', strtotime($month)), // Jan, Feb, Mar...
                'foydalanuvchi' => $count
            ];
        }

        // 5. Material grafiki
        $materialsDistribution = [
            ['name' => 'Grammatika', 'value' => $totalGrammars],
            ['name' => 'Kanji', 'value' => $totalKanjis],
            ['name' => 'Lug\'at', 'value' => $totalVocabularies]
        ];

        // Natija
        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'totalUsers' => $totalUsers,
                    'premiumUsers' => $premiumUsers,
                    'freeUsers' => $totalUsers - $premiumUsers,
                    'adminUsers' => $adminUsers,
                    'teacherUsers' => $teacherUsers,
                    'standardUsers' => $standardUsers,
                    'totalTests' => $totalTests,
                    'totalVideos' => $totalVideos,
                ],
                'userGrowth' => $userGrowthChart,
                'materialsDistribution' => $materialsDistribution
            ]
        ]);
    }
}
