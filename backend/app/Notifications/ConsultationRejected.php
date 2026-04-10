<?php
// PATH: app/Notifications/ConsultationRejected.php
namespace App\Notifications;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ConsultationRejected extends Notification
{
    use Queueable;

    public function __construct(public Consultation $consultation) {}

    public function via($notifiable): array { return ['database']; }

    public function toArray($notifiable): array
    {
        return [
            'type'            => 'consultation_rejected',
            'title'           => 'Consultation Rejected',
            'message'         => "Your consultation request was declined. Reason: {$this->consultation->rejection_reason}",
            'consultation_id' => $this->consultation->id,
            'url'             => "/astrologers",
            'icon'            => 'fa-times-circle',
            'color'           => 'danger',
        ];
    }
}
