<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserActivityLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ActivityController extends Controller
{
    /**
     * Ping endpoint to record user activity time.
     * Expected to be called every X minutes.
     */
    public function ping(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();
        
        // Interval default is 1 minute
        $interval = $request->input('interval_minutes', 1);

        $log = UserActivityLog::firstOrCreate(
            ['user_id' => $user->id, 'date' => $today],
            ['duration_minutes' => 0]
        );

        $log->increment('duration_minutes', $interval);

        return response()->json([
            'status' => 'success',
            'data' => [
                'today_duration_minutes' => $log->duration_minutes
            ]
        ]);
    }

    /**
     * Get user progress/activity stats
     */
    public function progress(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();
        
        // Get today's total time
        $todayLog = UserActivityLog::where('user_id', $user->id)
            ->where('date', $today)
            ->first();
            
        $todayMinutes = $todayLog ? $todayLog->duration_minutes : 0;
        
        // Format to hours and minutes
        $hours = floor($todayMinutes / 60);
        $minutes = $todayMinutes % 60;
        $formattedTime = ($hours > 0 ? $hours . 'so ' : '') . $minutes . 'd';

        // Get current week's chart data (Monday to Sunday)
        $startOfWeek = Carbon::today()->startOfWeek(); // Default is Monday
        
        $weekDays = collect();
        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);
            $weekDays->put($date->toDateString(), [
                'day' => $this->getShortDayName($date->dayOfWeek),
                'date' => $date->toDateString(),
                'duration_minutes' => 0
            ]);
        }
        
        $logs = UserActivityLog::where('user_id', $user->id)
            ->where('date', '>=', $startOfWeek->toDateString())
            ->where('date', '<=', $startOfWeek->copy()->endOfWeek()->toDateString())
            ->get();
            
        foreach ($logs as $log) {
            if ($weekDays->has($log->date)) {
                $item = $weekDays->get($log->date);
                $item['duration_minutes'] = $log->duration_minutes;
                $weekDays->put($log->date, $item);
            }
        }
        
        // Normalize for chart (find max duration for relative height)
        $chartData = array_values($weekDays->toArray());
        $maxDuration = max(array_column($chartData, 'duration_minutes'));
        $maxDuration = $maxDuration > 0 ? $maxDuration : 1; // Prevent division by zero
        
        foreach ($chartData as &$data) {
            $data['height_percent'] = round(($data['duration_minutes'] / $maxDuration) * 100);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'today' => [
                    'minutes' => $todayMinutes,
                    'formatted' => $formattedTime
                ],
                'chart' => $chartData
            ]
        ]);
    }
    
    private function getShortDayName($dayOfWeek)
    {
        $days = [
            0 => 'Ya', // Yakshanba
            1 => 'Du', // Dushanba
            2 => 'Se', // Seshanba
            3 => 'Ch', // Chorshanba
            4 => 'Pa', // Payshanba
            5 => 'Ju', // Juma
            6 => 'Sh'  // Shanba
        ];
        
        return $days[$dayOfWeek] ?? '';
    }
}
