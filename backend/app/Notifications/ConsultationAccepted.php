<?php
// PATH: app/Notifications/ConsultationAccepted.php
namespace App\Notifications;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ConsultationAccepted extends Notification
{
    use Queueable;

    public function __construct(public Consultation $consultation) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type'            => 'consultation_accepted',
            'title'           => 'Consultation Accepted! 🎉',
            'message'         => "Your consultation with {$this->consultation->astrologer->name} has been accepted. Session will start shortly.",
            'consultation_id' => $this->consultation->id,
            'url'             => "/consultations/{$this->consultation->id}",
            'icon'            => 'fa-check-circle',
            'color'           => 'success',
        ];
    }
}
