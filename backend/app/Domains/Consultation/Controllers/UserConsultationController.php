<?php
/**
 * ConsultationController -- user-facing consultation endpoints.
 *
 * All routes require auth:sanctum + role:user middleware.
 *
 * ENDPOINTS
 * ----------
 * GET    /consultations              -- list with optional status filter
 * POST   /consultations              -- book a new session
 * GET    /consultations/stats        -- completed count + total spent
 * GET    /consultations/:id          -- single consultation (with astrologer + user)
 * DELETE /consultations/:id/cancel   -- cancel a pending request
 * GET    /consultations/:id/messages -- chat message history
 * POST   /consultations/:id/messages -- send a chat message
 * POST   /consultations/:id/signal   -- send WebRTC SDP/ICE signal
 * GET    /consultations/:id/signals  -- poll for incoming signals
 * PATCH  /consultations/:id/call-status -- update call state
 * GET    /consultations/:id/receipt  -- printable receipt (completed only)
 * GET    /consultations/:id/recordings -- list session recordings
 * POST   /consultations/:id/recordings -- upload a recording blob
 *
 * TO ADD A NEW ENDPOINT: add it here + register the route in routes/api/v1.php.
 */

// EXISTING: receipt(), messages(), etc.

namespace App\Domains\Consultation\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Consultation\Resources\ConsultationResource;
use App\Models\Consultation;
use App\Domains\Consultation\Services\ConsultationService;
use App\Support\Pagination;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserConsultationController extends Controller
{
    public function __construct(protected ConsultationService $service) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->service->userList($request->user(), $request->query('status'));
        return $this->success('Consultations fetched',
            ConsultationResource::collection($paginator),
            ['pagination' => Pagination::meta($paginator)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'astrologer_id' => ['required', 'integer', 'exists:astrologers,id'],
            'type'          => ['required', 'in:chat,call,video'],
            'user_note'     => ['nullable', 'string', 'max:500'],
        ]);
        $astrologer   = \App\Models\Astrologer::findOrFail($data['astrologer_id']);
        $consultation = $this->service->book($request->user(), $astrologer, $data);
        return $this->success('Consultation booked',
            new ConsultationResource($consultation->load(['user', 'astrologer'])), [], 201);
    }

    public function show(Request $request, Consultation $consultation): JsonResponse
    {
        if ($consultation->user_id !== $request->user()->id) return $this->error('Unauthorized', 403);
        return $this->success('Consultation fetched',
            new ConsultationResource($consultation->load(['user', 'astrologer'])));
    }

    public function cancel(Request $request, Consultation $consultation): JsonResponse
    {
        $updated = $this->service->cancel($consultation, $request->user());
        return $this->success('Cancelled', new ConsultationResource($updated));
    }

    public function messages(Request $request, Consultation $consultation): JsonResponse
    {
        if ($consultation->user_id !== $request->user()->id) return $this->error('Unauthorized', 403);
        $messages = $this->service->messages($consultation);
        $this->service->markRead($consultation, $request->user());
        return $this->success('Messages fetched', $messages);
    }

    public function sendMessage(Request $request, Consultation $consultation): JsonResponse
    {
        if ($consultation->user_id !== $request->user()->id) return $this->error('Unauthorized', 403);
        $data    = $request->validate(['message' => ['required', 'string', 'max:2000']]);
        $message = $this->service->sendMessage($consultation, $request->user(), $data['message']);
        return $this->success('Message sent', $message->load('sender:id,name,profile_image'), [], 201);
    }

    /* -- POST /consultations/{id}/signal --- */
    // User sends WebRTC offer / ICE candidate / hang-up
    public function sendSignal(Request $request, Consultation $consultation): JsonResponse
    {
        if ($consultation->user_id !== $request->user()->id) return $this->error('Unauthorized', 403);

        $data = $request->validate([
            'signal_type' => ['required', 'in:offer,answer,ice-candidate,hang-up'],
            'signal_data' => ['required'],  // Any JSON value -- don't restrict to array type
        ]);

        $signal = $this->service->sendSignal(
            $consultation, $request->user(),
            $data['signal_type'], $data['signal_data']
        );

        return $this->success('Signal sent', ['id' => $signal->id]);
    }

    /* -- GET /consultations/{id}/signals --- */
    // User polls for astrologer's signals (answer, ICE)
    public function getSignals(Request $request, Consultation $consultation): JsonResponse
    {
        if ($consultation->user_id !== $request->user()->id) return $this->error('Unauthorized', 403);

        $signals = $this->service->getSignals(
            $consultation, $request->user(),
            $request->has('after') ? (int) $request->query('after') : null
        );

        return $this->success('Signals fetched', $signals);
    }

    /* -- PATCH /consultations/{id}/call-status -- */
    public function updateCallStatus(Request $request, Consultation $consultation): JsonResponse
    {
        if ($consultation->user_id !== $request->user()->id) return $this->error('Unauthorized', 403);
        $data    = $request->validate(['call_status' => ['required', 'in:idle,ringing,active,ended']]);
        $updated = $this->service->updateCallStatus($consultation, $data['call_status']);
        return $this->success('Call status updated', ['call_status' => $updated->call_status]);
    }

    /* -- GET /consultations/{id}/receipt --- */
    public function receipt(Request $request, Consultation $consultation): JsonResponse
    {
        if ($consultation->user_id !== $request->user()->id) return $this->error('Unauthorized', 403);
        if ($consultation->status !== 'completed') return $this->error('Receipt only for completed consultations', 422);

        $consultation->load(['user', 'astrologer']);
        return $this->success('Receipt fetched', [
            'receipt_number'       => 'ASTRO-' . str_pad($consultation->id, 6, '0', STR_PAD_LEFT),
            'date'                 => $consultation->ended_at?->format('d M Y, h:i A'),
            'user_name'            => $consultation->user->name,
            'astrologer_name'      => $consultation->astrologer->name,
            'astrologer_expertise' => $consultation->astrologer->expertise,
            'consultation_type'    => ucfirst($consultation->type),
            'duration_minutes'     => $consultation->duration_minutes,
            'rate_per_minute'      => $consultation->rate_per_minute,
            'gross_amount'         => $consultation->total_amount,
            'status'               => 'Paid',
            'payment_mode'         => 'Wallet',
        ]);
    }

    /* -- GET /consultations/stats --- */
    public function stats(Request $request): JsonResponse
    {
        $user      = $request->user();
        $completed = $user->consultations()->where('status', 'completed')->count();
        $total     = $user->consultations()->count();
        $spent     = (float) $user->consultations()->where('status', 'completed')->sum('total_amount');

        return $this->success('Stats fetched', [
            'completed_sessions'  => $completed,
            'total_consultations' => $total,
            'total_spent'         => $spent,
        ]);
    }


    /* -- Typing indicator (uses cache, not DB) ------- */
    public function typing(Request $request, Consultation $consultation): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $key  = "typing:{$consultation->id}:{$user->id}";
        // Store typing state for 5 seconds
        \Illuminate\Support\Facades\Cache::put($key, [
            'user_id' => $user->id,
            'name'    => $user->name,
        ], now()->addSeconds(5));
        return $this->success('ok');
    }

    public function getTyping(Request $request, Consultation $consultation): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        // Get typing state from the OTHER side
        $otherIds = [$consultation->user_id, $consultation->astrologer->user_id ?? 0];
        $otherIds = array_filter($otherIds, fn($id) => $id !== $user->id);

        $typingUsers = [];
        foreach ($otherIds as $otherId) {
            $key = "typing:{$consultation->id}:{$otherId}";
            $data = \Illuminate\Support\Facades\Cache::get($key);
            if ($data) $typingUsers[] = $data;
        }
        return $this->success('ok', ['typing' => $typingUsers]);
    }

}