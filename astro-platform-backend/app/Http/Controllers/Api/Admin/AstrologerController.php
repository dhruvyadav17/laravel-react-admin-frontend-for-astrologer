<?php
// PATH: app/Http/Controllers/Api/Admin/AstrologerController.php
// UPDATE:
//   - verify() action ADD kiya — admin astrologer verify/unverify kar sake
//   - restore() action ADD kiya — soft-deleted astrologer wapas la sake
//   - index() mein search + is_verified filter pass kiya
// REASON: Pehle verify/restore missing the. Wrong permissions use ho rahi thi (user-* → astrologer-*)

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AstrologerRequest;
use App\Http\Resources\AstroResource;
use App\Models\Astrologer;
use App\Services\App\AstrologerService;
use Illuminate\Http\Request;

class AstrologerController extends Controller
{
    public function __construct(protected AstrologerService $service) {}

    public function index(Request $request)
    {
        $list = $this->service->adminList(
            $request->only(['search', 'is_verified'])
        );
        return $this->success('Astrologers fetched', AstroResource::collection($list));
    }

    public function store(AstrologerRequest $request)
    {
        $result = $this->service->createWithUser($request->validated());
        return $this->success('Astrologer created', [
            'astrologer' => new AstroResource($result['astrologer']),
            'email'      => $result['user']->email,
            'password'   => $result['password'],  // shown once
        ], [], 201);
    }

    public function update(AstrologerRequest $request, Astrologer $astrologer)
    {
        $updated = $this->service->update($astrologer, $request->validated());
        return $this->success('Astrologer updated', new AstroResource($updated));
    }

    public function destroy(Astrologer $astrologer)
    {
        $this->service->delete($astrologer);
        return $this->success('Astrologer deleted');
    }

    // NEW: Soft-deleted astrologer restore
    public function restore(int $id)
    {
        $astrologer = $this->service->restore($id);
        return $this->success('Astrologer restored', new AstroResource($astrologer));
    }

    // NEW: Toggle verify status
    public function verify(Astrologer $astrologer)
    {
        $astrologer->update(['is_verified' => !$astrologer->is_verified]);
        return $this->success(
            $astrologer->is_verified ? 'Astrologer verified' : 'Verification revoked',
            new AstroResource($astrologer->fresh(['user']))
        );
    }
}