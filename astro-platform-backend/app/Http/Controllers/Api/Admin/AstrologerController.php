<?php
// PATH: app/Http/Controllers/Api/Admin/AstrologerController.php
// FIX BUG-2: index() mein pagination meta missing tha — Pagination::meta() add kiya
// FIX BUG-5: verify() mein $astrologer->is_verified stale tha after update()
//             ab $astrologer->refresh() call karte hain fresh value ke liye
// IMPROVEMENT: store() mein 201 status code (tha nahi), response format consistent

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AstrologerRequest;
use App\Http\Resources\AstroResource;
use App\Models\Astrologer;
use App\Services\App\AstrologerService;
use App\Support\Pagination;
use Illuminate\Http\Request;

class AstrologerController extends Controller
{
    public function __construct(protected AstrologerService $service) {}

    /* ── Index with pagination ──────────────────────── */
    // FIX BUG-2: meta.pagination missing tha — frontend mein pagination kaam nahi karta tha
    public function index(Request $request)
    {
        $list = $this->service->adminList(
            $request->only(['search', 'is_verified', 'page'])
        );

        return $this->success(
            'Astrologers fetched',
            AstroResource::collection($list),
            ['pagination' => Pagination::meta($list)]  // FIX: meta add kiya
        );
    }

    /* ── Create ─────────────────────────────────────── */
    public function store(AstrologerRequest $request)
    {
        $result = $this->service->createWithUser($request->validated());

        return $this->success(
            'Astrologer created successfully',
            [
                'astrologer' => new AstroResource($result['astrologer']),
                'email'      => $result['user']->email,
                'password'   => $result['password'],  // shown once — frontend pe display karo
            ],
            [],
            201   // FIX: 201 Created (pehle 200 tha implicitly)
        );
    }

    /* ── Update ─────────────────────────────────────── */
    public function update(AstrologerRequest $request, Astrologer $astrologer)
    {
        $updated = $this->service->update($astrologer, $request->validated());
        return $this->success('Astrologer updated', new AstroResource($updated));
    }

    /* ── Soft Delete ────────────────────────────────── */
    public function destroy(Astrologer $astrologer)
    {
        $this->service->delete($astrologer);
        return $this->success('Astrologer deleted');
    }

    /* ── Restore ────────────────────────────────────── */
    public function restore(int $id)
    {
        $astrologer = $this->service->restore($id);
        return $this->success('Astrologer restored', new AstroResource($astrologer));
    }

    /* ── Verify / Unverify ──────────────────────────── */
    // FIX BUG-5: update() ke baad PHP model instance stale rehta hai
    //            refresh() call karo fresh DB value ke liye
    public function verify(Astrologer $astrologer)
    {
        $astrologer->update(['is_verified' => !$astrologer->is_verified]);
        $astrologer->refresh();  // FIX: stale $astrologer->is_verified fix

        $message = $astrologer->is_verified
            ? 'Astrologer verified successfully'
            : 'Verification revoked';

        return $this->success($message, new AstroResource($astrologer->load('user')));
    }
}
