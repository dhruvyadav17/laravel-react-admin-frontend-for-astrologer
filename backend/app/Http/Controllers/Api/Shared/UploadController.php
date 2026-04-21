<?php
// NEW FEATURE: Image upload endpoint
// POST /api/v1/upload/image → returns public URL
// Used by: astrologer profile image, admin profile image
// Storage: public disk → storage/app/public/uploads/
// URL: /storage/uploads/{filename}
// Run: php artisan storage:link (ek baar karna hoga)

namespace App\Http\Controllers\Api\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * POST /api/v1/upload/image
     * Auth required: sanctum
     * Max size: 2MB
     * Types: jpeg, png, webp
     */
    public function image(Request $request)
    {
        $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:2048',  // 2MB
                'dimensions:min_width=100,min_height=100,max_width=2000,max_height=2000',
            ],
        ]);

        $file      = $request->file('image');
        $userId    = $request->user()->id;
        $extension = $file->getClientOriginalExtension();
        $filename  = "profile_{$userId}_" . Str::random(8) . ".{$extension}";

        // Store in public disk → storage/app/public/uploads/
        $path = $file->storeAs('uploads', $filename, 'public');

        return $this->success('Image uploaded successfully', [
            'url'  => asset('storage/' . $path),
            'path' => $path,
        ]);
    }
}
