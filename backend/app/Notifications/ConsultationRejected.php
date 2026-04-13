<?php
namespace App\Notifications;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ConsultationRejected extends Notification
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
        $url = config('app.frontend_url', 'http://localhost:5173') . '/astrologers';

        return (new MailMessage)
            ->subject('Consultation Request Update')
            ->greeting("Hi, {$notifiable->name}")
            ->line('Unfortunately, your consultation request was declined.')
            ->line('Reason: ' . ($this->consultation->rejection_reason ?? 'Astrologer not available'))
            ->action('Find Another Astrologer', $url)
            ->line('Don\'t worry -- many other expert astrologers are available.')
            ->salutation('Team AstroPortal');
    }

    public function toArray($notifiable): array
    {
        return [
            'type'            => 'consultation_rejected',
            'title'           => 'Consultation Declined',
            'message'         => "Your request was declined. Reason: {$this->consultation->rejection_reason}",
            'consultation_id' => $this->consultation->id,
            'url'             => '/astrologers',
            'icon'            => 'fa-times-circle',
            'color'           => 'danger',
        ];
    }
}
