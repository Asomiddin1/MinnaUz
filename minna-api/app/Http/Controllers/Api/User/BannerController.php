<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::where('is_active', true)->orderBy('created_at', 'desc')->get();
        // Append full url if image is stored locally
        $banners->transform(function ($banner) {
            if ($banner->image && !str_starts_with($banner->image, 'http')) {
                $banner->image = asset('storage/' . $banner->image);
            }
            return $banner;
        });
        return response()->json(['data' => $banners]);
    }
}
