<?php

namespace App\Domains\Consultation\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Consultation\Resources\ConsultationResource;
use App\Models\Consultation;
use App\Domains\Consultation\Services\ConsultationService;
use App\Support\Pagination;
use Illuminate\Http\Request;

class AstrologerConsultationController extends Controller
{
    public function __construct(protected ConsultationService $service) {}

    public function index(Request $request)
    {
        // FIX BE-C: use query() not magic property, and validate status
        $request->validate([
            'status' => ['nullable', 'in:pending,accepted,in_progress,completed,rejected,cancelled'],
        ]);

        $astrologer = $request->user()->astrologer()->firstOrFail();
        $list       = $this->service->astrologerList($astrologer, $request->query('status'));
        return $this->success('Consultations fetched',
            ConsultationResource::collection($list),
            ['pagination' => Pagination::meta($list)]);
    }

    public function show(Request $request, Consultation $consultation)
    {
        $this->authorizeAstrologer($request, $consultation);
        return $this->success('Fetched',
            new ConsultationResource($consultation->load(['user', 'astrologer'])));
    }

    public function accept(Request $request, Consultation $consultation)
    {
        $this->authorizeAstrologer($request, $consultation);
        return $this->success('Accepted', new ConsultationResource($this->service->accept($consultation)));
    }

    public function reject(Request $request, Consultation $consultation)
    {
        $this->authorizeAstrologer($request, $consultation);
        $data = $request->validate(['reason' => 'nullable|string|max:300']);
        return $this->success('Rejected',
            new ConsultationResource($this->service->reject($consultation, $data['reason'] ?? '')));
    }

    public function start(Request $request, Consultation $consultation)
    {
        $this->authorizeAstrologer($request, $consultation);
        return $this->success('Started', new ConsultationResource($this->service->start($consultation)));
    }

    public function end(Request $request, Consultation $consultation)
    {
        $this->authorizeAstrologer($request, $consultation);
        $updated = $this->service->end($consultation);
        return $this->success(
            "Ended. {$updated->duration_minutes} min. ₹{$updated->total_amount}",
            new ConsultationResource($updated)
        );
    }

    public function messages(Request $request, Consultation $consultation)
    {
        $this->authorizeAstrologer($request, $consultation);
        $this->service->markRead($consultation, $request->user());
        return $this->success('Messages fetched', $this->service->messages($consultation));
    }

    public function sendMessage(Request $request, Consultation $consultation)
    {
        $this->authorizeAstrologer($request, $consultation);
        $data = $request->validate(['message' => 'required|string|max:2000']);
        $msg  = $this->service->sendMessage($consultation, $request->user(), $data['message']);
        return $this->success('Sent', $msg->load('sender:id,name,profile_image'), [], 201);
    }

    public function sendSignal(Request $request, Consultation $consultation)
    {
        $this->authorizeAstrologer($request, $consultation);
        $data = $request->validate([
            'signal_type' => ['required', 'in:offer,answer,ice-candidate,hang-up'],
            'signal_data' => ['required'],
        ]);
        $signal = $this->service->sendSignal(
            $consultation, $request->user(),
            $data['signal_type'], $data['signal_data']
        );
        return $this->success('Signal sent', ['id' => $signal->id]);
    }

    public function getSignals(Request $request, Consultation $consultation)
    {
        $this->authorizeAstrologer($request, $consultation);
        $signals = $this->service->getSignals(
            $consultation, $request->user(),
            $request->has('after') ? (int) $request->query('after') : null
        );
        return $this->success('Signals fetched', $signals);
    }

    public function updateCallStatus(Request $request, Consultation $consultation)
    {
        $this->authorizeAstrologer($request, $consultation);
        $data    = $request->validate(['call_status' => ['required', 'in:idle,ringing,active,ended']]);
        $updated = $this->service->updateCallStatus($consultation, $data['call_status']);
        return $this->success('Updated', ['call_status' => $updated->call_status]);
    }

    private function authorizeAstrologer(Request $request, Consultation $c): void
    {
        $astrologer = $request->user()->astrologer()->firstOrFail();
        if ($c->astrologer_id !== $astrologer->id) abort(403, 'Unauthorized');
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
