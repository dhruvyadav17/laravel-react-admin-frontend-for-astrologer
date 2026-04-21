<?php

namespace App\Http\Controllers\Api\Shared;

use App\Http\Controllers\Controller;
use App\Domains\Astrologer\Resources\AstrologerResource;
use App\Models\Astrologer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    /**
     * GET /favorites — returns full astrologer objects (not just IDs)
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Get full astrologer data for all favorites
        $astrologers = Astrologer::with('user:id,name,email')
            ->whereHas('favorites', fn($q) => $q->where('user_id', $userId))
            ->whereNull('deleted_at')
            ->get();

        // Also return IDs for the useFavorites hook
        $ids = $astrologers->pluck('id');

        return $this->success('Favorites fetched', [
            'ids'         => $ids,
            'astrologers' => AstrologerResource::collection($astrologers),
        ]);
    }

    /**
     * POST /favorites/{id} — toggle favorite
     */
    public function toggle(Request $request, int $id): JsonResponse
    {
        $user       = $request->user();
        $astrologer = Astrologer::where('is_verified', true)->findOrFail($id);

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

        $isFavorite = !$exists;
        return $this->success("Astrologer {$action} from favorites", [
            'is_favorite'  => $isFavorite,
            'astrologer_id'=> $id,
        ]);
    }
}
