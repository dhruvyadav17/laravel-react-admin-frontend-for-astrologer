<?php
// PATH: app/Http/Controllers/Api/Astrologer/ConsultationController.php
// Astrologer side: pending requests, accept, reject, start, end, messages

namespace App\Http\Controllers\Api\Astrologer;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConsultationResource;
use App\Models\Consultation;
use App\Services\App\ConsultationService;
use App\Support\Pagination;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function __construct(protected ConsultationService $service) {}

    /* ── GET /astrologer/consultations ──────────── */
    public function index(Request $request)
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();
        $list       = $this->service->astrologerList($astrologer, $request->status);

        return $this->success(
            'Consultations fetched',
            ConsultationResource::collection($list),
            ['pagination' => Pagination::meta($list)]
        );
    }

    /* ── GET /astrologer/consultations/{id} ─────── */
    public function show(Request $request, Consultation $consultation)
    {
        $this->authorize($request, $consultation);
        return $this->success('Consultation fetched',
            new ConsultationResource($consultation->load(['user', 'astrologer'])));
    }

    /* ── PATCH /astrologer/consultations/{id}/accept */
    public function accept(Request $request, Consultation $consultation)
    {
        $this->authorize($request, $consultation);
        $updated = $this->service->accept($consultation);
        return $this->success('Consultation accepted', new ConsultationResource($updated));
    }

    /* ── PATCH /astrologer/consultations/{id}/reject */
    public function reject(Request $request, Consultation $consultation)
    {
        $this->authorize($request, $consultation);
        $data    = $request->validate(['reason' => 'nullable|string|max:300']);
        $updated = $this->service->reject($consultation, $data['reason'] ?? '');
        return $this->success('Consultation rejected', new ConsultationResource($updated));
    }

    /* ── PATCH /astrologer/consultations/{id}/start */
    public function start(Request $request, Consultation $consultation)
    {
        $this->authorize($request, $consultation);
        $updated = $this->service->start($consultation);
        return $this->success('Consultation started', new ConsultationResource($updated));
    }

    /* ── PATCH /astrologer/consultations/{id}/end */
    public function end(Request $request, Consultation $consultation)
    {
        $this->authorize($request, $consultation);
        $updated = $this->service->end($consultation);
        return $this->success(
            "Consultation ended. Duration: {$updated->duration_minutes} min. Total: ₹{$updated->total_amount}",
            new ConsultationResource($updated)
        );
    }

    /* ── GET /astrologer/consultations/{id}/messages */
    public function messages(Request $request, Consultation $consultation)
    {
        $this->authorize($request, $consultation);
        $this->service->markRead($consultation, $request->user());
        return $this->success('Messages fetched', $this->service->messages($consultation));
    }

    /* ── POST /astrologer/consultations/{id}/messages */
    public function sendMessage(Request $request, Consultation $consultation)
    {
        $this->authorize($request, $consultation);
        $data = $request->validate(['message' => 'required|string|max:2000']);
        $msg  = $this->service->sendMessage($consultation, $request->user(), $data['message']);
        return $this->success('Message sent', $msg->load('sender:id,name,profile_image'), [], 201);
    }

    /* ── Verify astrologer owns this consultation ── */
    private function authorize(Request $request, Consultation $c): void
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();
        if ($c->astrologer_id !== $astrologer->id) abort(403, 'Unauthorized');
    }
}