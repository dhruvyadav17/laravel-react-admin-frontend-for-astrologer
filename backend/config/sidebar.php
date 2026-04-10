<?php
// PATH: config/sidebar.php
// UPDATED: Activity Log link added

return [
    [
        'label' => 'Main',
        'icon'  => 'fas fa-home',
        'children' => [
            ['label' => 'Dashboard',   'route' => '/admin/dashboard', 'permission' => 'dashboard-view'],
        ],
    ],
    [
        'label' => 'Management',
        'icon'  => 'fas fa-cogs',
        'children' => [
            ['label' => 'Users',       'route' => '/admin/users',       'permission' => 'user-view'],
            ['label' => 'Astrologers', 'route' => '/admin/astrologers', 'permission' => 'astrologer-view'],
        ],
    ],
    [
        'label' => 'Access Control',
        'icon'  => 'fas fa-shield-alt',
        'children' => [
            ['label' => 'Roles',       'route' => '/admin/roles',       'permission' => 'role-manage'],
            ['label' => 'Permissions', 'route' => '/admin/permissions', 'permission' => 'permission-manage'],
        ],
    ],
    [
        'label' => 'Reports',
        'icon'  => 'fas fa-chart-bar',
        'children' => [
            ['label' => 'Activity Log','route' => '/admin/activity',    'permission' => 'dashboard-view'],
        ],
    ],
    [
        'label' => 'Account',
        'icon'  => 'fas fa-user-circle',
        'children' => [
            ['label' => 'My Profile',  'route' => '/admin/profile'],
            ['label' => 'Logout',      'action' => 'logout'],
        ],
    ],
];
