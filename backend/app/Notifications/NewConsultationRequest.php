<?php
namespace App\Notifications;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewConsultationRequest extends Notification
{
    use Queueable;

    public function __construct(public Consultation $consultation) {}

    public function via($notifiable): array
    {
        $channels = ['database'];
        if ($notifiable->hasVerifiedEmail()) $channels[] = 'mail';
        return $channels;
    }

    public function toMail($notifiable): MailMessage
    {
        $url = config('app.frontend_url', 'http://localhost:5173')
            . '/astrologer/consultations/' . $this->consultation->id;

        return (new MailMessage)
            ->subject('New Consultation Request! 🔔')
            ->greeting("Hello, {$notifiable->name}!")
            ->line("**{$this->consultation->user->name}** has requested a {$this->consultation->type} consultation.")
            ->line("Note: " . ($this->consultation->user_note ?? 'No note provided'))
            ->action('Accept or Decline', $url)
            ->line('Please respond quickly -- users prefer fast responses!')
            ->salutation('Team AstroPortal');
    }

    public function toArray($notifiable): array
    {
        return [
            'type'            => 'new_consultation_request',
            'title'           => 'New Consultation Request! 🔔',
            'message'         => "{$this->consultation->user->name} has sent a {$this->consultation->type} consultation request.",
            'consultation_id' => $this->consultation->id,
            'url'             => "/astrologer/consultations/{$this->consultation->id}",
            'icon'            => 'fa-bell',
            'color'           => 'primary',
        ];
    }
}
