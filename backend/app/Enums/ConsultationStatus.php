<?php
// Magic strings ki jagah type-safe PHP Enum
// Usage: ConsultationStatus::Pending->value

namespace App\Enums;

enum ConsultationStatus: string
{
    case Pending    = 'pending';
    case Accepted   = 'accepted';
    case InProgress = 'in_progress';
    case Completed  = 'completed';
    case Rejected   = 'rejected';
    case Cancelled  = 'cancelled';

    /** Terminal statuses -- koi aur transition nahi hogi */
    public function isTerminal(): bool
    {
        return in_array($this, [
            self::Completed,
            self::Rejected,
            self::Cancelled,
        ]);
    }

    /** Active statuses -- message bhej sakte hain */
    public function allowsChat(): bool
    {
        return in_array($this, [self::Accepted, self::InProgress]);
    }

    public function label(): string
    {
        return match($this) {
            self::Pending    => 'Pending',
            self::Accepted   => 'Accepted',
            self::InProgress => 'In Progress',
            self::Completed  => 'Completed',
            self::Rejected   => 'Rejected',
            self::Cancelled  => 'Cancelled',
        };
    }
}
