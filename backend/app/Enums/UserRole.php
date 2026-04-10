<?php
// PATH: app/Enums/UserRole.php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super-admin';
    case Admin      = 'admin';
    case Manager    = 'manager';
    case Astrologer = 'astrologer';
    case User       = 'user';

    public function isAdminLevel(): bool
    {
        return in_array($this, [
            self::SuperAdmin,
            self::Admin,
            self::Manager,
        ]);
    }
}
