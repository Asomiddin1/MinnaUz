<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::orderBy('created_at', 'desc')->get();
        // Append full url if image is stored locally
        $banners->transform(function ($banner) {
            if ($banner->image && !str_starts_with($banner->image, 'http')) {
                $banner->image = asset('storage/' . $banner->image);
            }
            return $banner;
        });
        return response()->json(['data' => $banners]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $data = $request->only(['title', 'description']);
        $data['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('image_file')) {
            $request->validate([
                'image_file' => 'image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048'
            ]);
            $path = $request->file('image_file')->store('banners', 'public');
            $data['image'] = $path;
        } else {
            $request->validate([
                'image_url' => 'required|string'
            ]);
            $data['image'] = $request->image_url;
        }

        $banner = Banner::create($data);
        return response()->json(['message' => 'Banner created successfully', 'data' => $banner], 201);
    }

    public function show(string $id)
    {
        $banner = Banner::findOrFail($id);
        if ($banner->image && !str_starts_with($banner->image, 'http')) {
            $banner->image = asset('storage/' . $banner->image);
        }
        return response()->json(['data' => $banner]);
    }

    public function update(Request $request, string $id)
    {
        $banner = Banner::findOrFail($id);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $data = $request->only(['title', 'description']);
        
        // Handle boolean correctly for form-data
        if ($request->has('is_active')) {
            $data['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('image_file')) {
            $request->validate([
                'image_file' => 'image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048'
            ]);
            
            // Delete old if exists and not external url
            if ($banner->image && !str_starts_with($banner->image, 'http')) {
                Storage::disk('public')->delete($banner->image);
            }

            $path = $request->file('image_file')->store('banners', 'public');
            $data['image'] = $path;
        } elseif ($request->has('image_url') && $request->image_url) {
            $imageUrl = $request->image_url;
            $storageUrl = asset('storage');
            
            // If the URL is our own storage URL, strip it to get the local path
            if (str_starts_with($imageUrl, $storageUrl)) {
                $imageUrl = str_replace($storageUrl . '/', '', $imageUrl);
            }

            $data['image'] = $imageUrl;
            
            // Delete old if switching from local to a different URL
            if ($banner->image && !str_starts_with($banner->image, 'http') && $banner->image !== $imageUrl) {
                Storage::disk('public')->delete($banner->image);
            }
        }

        $banner->update($data);
        return response()->json(['message' => 'Banner updated successfully', 'data' => $banner]);
    }

    public function destroy(string $id)
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();
        return response()->json(['message' => 'Banner deleted successfully']);
    }
}
