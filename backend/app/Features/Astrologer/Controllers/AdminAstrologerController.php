<?php
// PATH: app/Features/Astrologer/Controllers/AdminAstrologerController.php

namespace App\Features\Astrologer\Controllers;

use App\Http\Controllers\Controller;
use App\Features\Astrologer\Requests\AstrologerRequest;
use App\Features\Astrologer\Resources\AstrologerResource;
use App\Features\Astrologer\Services\AstrologerService;
use App\Models\Astrologer;
use App\Support\Pagination;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AdminAstrologerController extends Controller
{
    use ApiResponse;

    public function __construct(protected AstrologerService $service) {}

    /* ── Index ──────────────────────────────────── */
    public function index(Request $request)
    {
        $list = $this->service->adminList(
            $request->only(['search', 'is_verified', 'page'])
        );

        return $this->success(
            'Astrologers fetched',
            AstrologerResource::collection($list),
            ['pagination' => Pagination::meta($list)]
        );
    }

    /* ── Create ─────────────────────────────────── */
    public function store(AstrologerRequest $request)
    {
        $result = $this->service->createWithUser($request->validated());

        return $this->success(
            'Astrologer created successfully',
            [
                'astrologer' => new AstrologerResource($result['astrologer']),
                'email'      => $result['user']->email,
                'password'   => $result['password'],
            ],
            [],
            201
        );
    }

    /* ── Update ─────────────────────────────────── */
    public function update(AstrologerRequest $request, Astrologer $astrologer)
    {
        $updated = $this->service->update($astrologer, $request->validated());
        return $this->success('Astrologer updated', new AstrologerResource($updated));
    }

    /* ── Soft Delete ────────────────────────────── */
    public function destroy(Astrologer $astrologer)
    {
        $this->service->delete($astrologer);
        return $this->success('Astrologer deleted');
    }

    /* ── Restore ────────────────────────────────── */
    public function restore(int $id)
    {
        $astrologer = $this->service->restore($id);
        return $this->success('Astrologer restored', new AstrologerResource($astrologer));
    }

    /* ── Verify / Unverify ──────────────────────── */
    public function verify(Astrologer $astrologer)
    {
        $astrologer->update(['is_verified' => !$astrologer->is_verified]);
        $astrologer->refresh();

        $message = $astrologer->is_verified
            ? 'Astrologer verified successfully'
            : 'Verification revoked';

        return $this->success($message, new AstrologerResource($astrologer->load('user')));
    }
}
