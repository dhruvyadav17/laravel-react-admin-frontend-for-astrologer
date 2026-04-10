<?php
// PATH: app/Enums/ConsultationType.php

namespace App\Enums;

enum ConsultationType: string
{
    case Chat  = 'chat';
    case Call  = 'call';
    case Video = 'video';
    case All   = 'all';   // Astrologer setting — sab accept karta hai

    public function icon(): string
    {
        return match($this) {
            self::Chat  => 'fa-comment',
            self::Call  => 'fa-phone',
            self::Video => 'fa-video',
            self::All   => 'fa-star',
        };
    }

    public function label(): string
    {
        return match($this) {
            self::Chat  => 'Chat',
            self::Call  => 'Voice Call',
            self::Video => 'Video Call',
            self::All   => 'All Types',
        };
    }
}
