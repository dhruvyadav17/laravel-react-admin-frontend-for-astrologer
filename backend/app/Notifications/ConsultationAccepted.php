<?php
// Email config: Set MAIL_* in .env (use Mailtrap for testing)

namespace App\Notifications;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ConsultationAccepted extends Notification
{
    use Queueable;

    public function __construct(public Consultation $consultation) {}

    public function via($notifiable): array
    {
        $channels = ['database'];
        // Send email if user has a verified email
        if ($notifiable->hasVerifiedEmail()) {
            $channels[] = 'mail';
        }
        return $channels;
    }

    public function toMail($notifiable): MailMessage
    {
        $astrologer = $this->consultation->astrologer;
        $url        = config('app.frontend_url', 'http://localhost:5173')
            . '/consultations/' . $this->consultation->id;

        return (new MailMessage)
            ->subject('Your Consultation Has Been Accepted! ✅')
            ->greeting("Hello, {$notifiable->name}!")
            ->line("Great news! **{$astrologer->name}** has accepted your consultation request.")
            ->line("Type: " . ucfirst($this->consultation->type))
            ->line("Rate: ₹{$this->consultation->rate_per_minute}/min")
            ->action('Join Consultation', $url)
            ->line('The session will start shortly. Please be ready.')
            ->salutation('Team AstroPortal');
    }

    public function toArray($notifiable): array
    {
        return [
            'type'            => 'consultation_accepted',
            'title'           => 'Consultation Accepted! 🎉',
            'message'         => "Your consultation with {$this->consultation->astrologer->name} has been accepted.",
            'consultation_id' => $this->consultation->id,
            'url'             => "/consultations/{$this->consultation->id}",
            'icon'            => 'fa-check-circle',
            'color'           => 'success',
        ];
    }
}
