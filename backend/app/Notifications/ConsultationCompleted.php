<?php
// PATH: app/Notifications/ConsultationCompleted.php
namespace App\Notifications;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ConsultationCompleted extends Notification
{
    use Queueable;

    public function __construct(public Consultation $consultation) {}

    public function via($notifiable): array { return ['database']; }

    public function toArray($notifiable): array
    {
        return [
            'type'            => 'consultation_completed',
            'title'           => 'Session Completed ✅',
            'message'         => "Your {$this->consultation->duration_minutes} min session with {$this->consultation->astrologer->name} is complete. Total: ₹{$this->consultation->total_amount}",
            'consultation_id' => $this->consultation->id,
            'url'             => "/consultations/{$this->consultation->id}",
            'icon'            => 'fa-star',
            'color'           => 'warning',
        ];
    }
}
