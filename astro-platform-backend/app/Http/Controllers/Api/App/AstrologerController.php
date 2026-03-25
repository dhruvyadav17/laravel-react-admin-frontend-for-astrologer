<?php

namespace App\Http\Controllers\Api\App;

use App\Http\Controllers\Controller;
use App\Http\Resources\AstroResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class AstrologerController extends Controller
{
    /* ================= LIST ================= */

    public function index(Request $request)
    {
        $query = User::role('astrologer')
            ->where('is_active', true);

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $astrologers = $query->get();

        return $this->success(
            'Astrologers fetched successfully',
            AstroResource::collection($astrologers)
        );
    }

    /* ================= DETAIL ================= */

    public function show(User $user)
    {
        if (! $user->hasRole('astrologer')) {
            return $this->error('Astrologer not found', null, 404);
        }

        return $this->success(
            'Astrologer detail',
            new AstroResource($user)
        );
    }
}