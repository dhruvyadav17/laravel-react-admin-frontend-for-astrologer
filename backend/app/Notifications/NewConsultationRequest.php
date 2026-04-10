<?php
// PATH: app/Notifications/NewConsultationRequest.php — For Astrologer
namespace App\Notifications;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewConsultationRequest extends Notification
{
    use Queueable;

    public function __construct(public Consultation $consultation) {}

    public function via($notifiable): array { return ['database']; }

    public function toArray($notifiable): array
    {
        return [
            'type'            => 'new_consultation_request',
            'title'           => 'New Consultation Request! 🔔',
            'message'         => "{$this->consultation->user->name} ne {$this->consultation->type} consultation request bheja hai.",
            'consultation_id' => $this->consultation->id,
            'url'             => "/astrologer/consultations/{$this->consultation->id}",
            'icon'            => 'fa-bell',
            'color'           => 'primary',
        ];
    }
}
