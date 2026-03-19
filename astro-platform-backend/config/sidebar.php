<?php

return [

    [
        'label' => 'Main',
        'icon'  => 'fas fa-tachometer-alt',
        'children' => [
            [
                'label' => 'Dashboard',
                'route' => '/admin/dashboard',
            ],
        ],
    ],

    [
        'label' => 'User Management',
        'icon'  => 'fas fa-users',
        'children' => [
            [
                'label' => 'Users',
                'permission' => 'user-view',
                'route' => '/admin/users',
            ],
            [
                'label' => 'Roles',
                'permission' => 'role-manage',
                'route' => '/admin/roles',
            ],
            [
                'label' => 'Permissions',
                'permission' => 'permission-manage',
                'route' => '/admin/permissions',
            ],
        ],
    ],

    [
        'label' => 'Account',
        'icon'  => 'fas fa-user',
        'children' => [
            [
                'label' => 'Profile',
                'route' => '/admin/profile',
            ],
            [
                'label' => 'Logout',
                'action' => 'logout',
            ],
        ],
    ],

    [
        'label' => 'Astrology',
        'icon'  => 'fas fa-star-and-crescent',
        'children' => [
            [
                'label' => 'Astrologers',
                'route' => '/admin/astrologers',
            ],
            [
                'label' => 'Consultations',
                'route' => '/admin/consultations',
            ],
            [
                'label' => 'Transactions',
                'route' => '/admin/transactions',
            ],
        ],
    ],

];
