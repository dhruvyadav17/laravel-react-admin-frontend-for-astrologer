<?php
// PATH: app/Http/Controllers/Api/App/ConsultationController.php
// User side: book, my list, cancel, chat

namespace App\Http\Controllers\Api\App;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConsultationResource;
use App\Models\Astrologer;
use App\Models\Consultation;
use App\Services\App\ConsultationService;
use App\Support\Pagination;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function __construct(protected ConsultationService $service) {}

    /* ── POST /consultations — Book ─────────────── */
    public function store(Request $request)
    {
        $data = $request->validate([
            'astrologer_id' => 'required|integer|exists:astrologers,id',
            'type'          => 'required|in:chat,call,video',
            'user_note'     => 'nullable|string|max:500',
        ]);

        $astrologer   = Astrologer::findOrFail($data['astrologer_id']);
        $consultation = $this->service->book($request->user(), $astrologer, $data);

        return $this->success(
            'Consultation request sent successfully',
            new ConsultationResource($consultation->load(['user', 'astrologer'])),
            [],
            201
        );
    }

    /* ── GET /consultations — My list ───────────── */
    public function index(Request $request)
    {
        $list = $this->service->userList($request->user(), $request->status);
        return $this->success(
            'Consultations fetched',
            ConsultationResource::collection($list),
            ['pagination' => Pagination::meta($list)]
        );
    }

    /* ── GET /consultations/{id} — Single ──────── */
    public function show(Request $request, Consultation $consultation)
    {
        $this->authorizeUser($request, $consultation);
        return $this->success('Consultation fetched',
            new ConsultationResource($consultation->load(['user', 'astrologer'])));
    }

    /* ── DELETE /consultations/{id} — Cancel ───── */
    public function cancel(Request $request, Consultation $consultation)
    {
        $this->authorizeUser($request, $consultation);
        $updated = $this->service->cancel($consultation, $request->user());
        return $this->success('Consultation cancelled', new ConsultationResource($updated));
    }

    /* ── GET /consultations/{id}/messages ───────── */
    public function messages(Request $request, Consultation $consultation)
    {
        $this->authorizeUser($request, $consultation);
        $this->service->markRead($consultation, $request->user());
        return $this->success('Messages fetched', $this->service->messages($consultation));
    }

    /* ── POST /consultations/{id}/messages ─────── */
    public function sendMessage(Request $request, Consultation $consultation)
    {
        $this->authorizeUser($request, $consultation);
        $data = $request->validate(['message' => 'required|string|max:2000']);
        $msg  = $this->service->sendMessage($consultation, $request->user(), $data['message']);
        return $this->success('Message sent', $msg->load('sender:id,name,profile_image'), [], 201);
    }

    /* ── Helper: check user owns this consultation ── */
    private function authorizeUser(Request $request, Consultation $c): void
    {
        if ($c->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }
    }
}