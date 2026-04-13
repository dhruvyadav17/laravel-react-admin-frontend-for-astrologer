<?php
// GET  /api/v1/favorites       -- list user's favorites
// POST /api/v1/favorites/{id}  -- toggle (add/remove)

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Astrologer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $ids = DB::table('favorites')
            ->where('user_id', $request->user()->id)
            ->pluck('astrologer_id');

        return $this->success('Favorites fetched', ['ids' => $ids]);
    }

    public function toggle(Request $request, int $id): JsonResponse
    {
        $user        = $request->user();
        $astrologer  = Astrologer::where('is_verified', true)->findOrFail($id);

        $exists = DB::table('favorites')
            ->where('user_id', $user->id)
            ->where('astrologer_id', $astrologer->id)
            ->exists();

        if ($exists) {
            DB::table('favorites')
                ->where('user_id', $user->id)
                ->where('astrologer_id', $astrologer->id)
                ->delete();
            $action = 'removed';
        } else {
            DB::table('favorites')->insert([
                'user_id'       => $user->id,
                'astrologer_id' => $astrologer->id,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
            $action = 'added';
        }

        return $this->success("Favorite {$action}", [
            'action'        => $action,
            'astrologer_id' => $id,
        ]);
    }
}
