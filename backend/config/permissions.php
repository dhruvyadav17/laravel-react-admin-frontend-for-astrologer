<?php
// PATH: config/permissions.php
// UPDATE: astrologer group add kiya with verify + restore
// REASON: astrologer-verify, astrologer-restore pehle missing the.
//         Frontend RBAC constants se sync hona chahiye.

return [
    'user' => [
        'user-view','user-create','user-update','user-delete',
        'user-restore','user-assign-role','user-assign-permission',
    ],
    // NEW: astrologer permissions group
    'astrologer' => [
        'astrologer-view','astrologer-create','astrologer-update',
        'astrologer-delete','astrologer-restore','astrologer-verify',
    ],
    'rbac'      => ['role-manage','permission-manage'],
    'dashboard' => ['dashboard-view'],
];