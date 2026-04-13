<?php
namespace App\Notifications;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ConsultationCompleted extends Notification
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
            . '/astrologers/' . $this->consultation->astrologer_id;

        return (new MailMessage)
            ->subject('Session Complete -- Leave a Review!')
            ->greeting("Hi, {$notifiable->name}!")
            ->line("Your {$this->consultation->duration_minutes}-minute consultation with **{$this->consultation->astrologer->name}** is complete.")
            ->line("Amount charged: ₹{$this->consultation->total_amount}")
            ->action('Rate Your Experience', $url)
            ->line('Your feedback helps other users find great astrologers.')
            ->salutation('Team AstroPortal');
    }

    public function toArray($notifiable): array
    {
        return [
            'type'            => 'consultation_completed',
            'title'           => 'Session Completed ✅',
            'message'         => "Your {$this->consultation->duration_minutes} min session is complete. Total: ₹{$this->consultation->total_amount}",
            'consultation_id' => $this->consultation->id,
            'url'             => "/consultations/{$this->consultation->id}",
            'icon'            => 'fa-star',
            'color'           => 'warning',
        ];
    }
}
