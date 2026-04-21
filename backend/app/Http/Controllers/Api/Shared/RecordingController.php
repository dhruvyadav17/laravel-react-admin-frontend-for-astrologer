<?php
/**
 * RecordingController -- consultation recording upload and retrieval.
 *
 * ENDPOINTS
 * ----------
 * POST /consultations/:id/recordings
 *   -- Accepts a multipart/form-data blob from MediaRecorder (browser).
 *   -- Saves to storage/app/public/recordings/{year}/{month}/{uuid}.webm.
 *   -- Creates a ConsultationRecording row with status = "ready".
 *
 * GET /consultations/:id/recordings
 *   -- Lists all "ready" recordings for the consultation.
 *   -- Returns public URL, duration, type, file size.
 *
 * ACCESS: Only participants (user or astrologer of the consultation) can
 *         upload or view recordings. Validated inside store() and index().
 *
 * TO STORE ON S3 / CLOUDFLARE R2:
 * 1. Set FILESYSTEM_DISK=s3 in .env and configure S3 credentials.
 * 2. Change Storage::disk('public') to Storage::disk('s3') here.
 * 3. Return a pre-signed URL instead of Storage::url().
 */

// Handles consultation recording uploads from browser MediaRecorder

namespace App\Http\Controllers\Api\Shared;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\ConsultationRecording;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RecordingController extends Controller
{
    /**
     * POST /consultations/{id}/recordings
     * Upload a webm blob from MediaRecorder
     */
    public function store(Request $request, Consultation $consultation): JsonResponse
    {
        $request->validate([
            'recording' => ['required', 'file', 'mimetypes:video/webm,audio/webm,video/mp4,audio/ogg'],
            'type'      => ['required', 'in:audio,video'],
            'duration'  => ['nullable', 'integer', 'min:0'],
        ]);

        // Ensure user is participant
        $user = $request->user();
        $isParticipant = $consultation->user_id === $user->id
            || ($user->astrologer && $user->astrologer->id === $consultation->astrologer_id);

        if (!$isParticipant) {
            return $this->error('Not authorized', 403);
        }

        $file      = $request->file('recording');
        $yearMonth = now()->format('Y/m');
        $filename  = "recordings/{$yearMonth}/" . Str::uuid() . '.webm';

        Storage::disk('public')->put($filename, file_get_contents($file->getRealPath()));

        $recording = ConsultationRecording::create([
            'consultation_id'  => $consultation->id,
            'filename'         => $filename,
            'disk'             => 'public',
            'type'             => $request->type,
            'size_bytes'       => $file->getSize(),
            'duration_seconds' => (int) $request->input('duration', 0),
            'status'           => 'ready',
        ]);

        return $this->success('Recording saved', [
            'id'  => $recording->id,
            'url' => Storage::disk('public')->url($filename),
        ], [], 201);
    }

    /**
     * GET /consultations/{id}/recordings
     * List recordings for a consultation
     */
    public function index(Request $request, Consultation $consultation): JsonResponse
    {
        $user = $request->user();
        $isParticipant = $consultation->user_id === $user->id
            || ($user->astrologer && $user->astrologer->id === $consultation->astrologer_id);

        if (!$isParticipant) {
            return $this->error('Not authorized', 403);
        }

        $recordings = ConsultationRecording::where('consultation_id', $consultation->id)
            ->where('status', 'ready')
            ->latest()
            ->get()
            ->map(fn ($r) => [
                'id'               => $r->id,
                'type'             => $r->type,
                'duration_seconds' => $r->duration_seconds,
                'size_bytes'       => $r->size_bytes,
                'url'              => Storage::disk('public')->url($r->filename),
                'created_at'       => $r->created_at->toISOString(),
            ]);

        return $this->success('Recordings fetched', $recordings);
    }
}
