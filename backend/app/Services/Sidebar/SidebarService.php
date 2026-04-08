<?php

namespace App\Services\Sidebar;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class SidebarService
{
    public function get(): array
    {
        $user = Auth::user();

        // 🔥 unique cache per user role/permission
        $cacheKey = 'sidebar_user_' . $user->id;

        return Cache::remember($cacheKey, 3600, function () use ($user) {

            $sidebar = config('sidebar');

            return collect($sidebar)
                ->map(fn ($group) => $this->transformGroup($group, $user))
                ->filter(fn ($group) => !empty($group['children']))
                ->values()
                ->toArray();
        });
    }

    protected function canAccess(array $item, $user): bool
    {
        if (!isset($item['permission']) && !isset($item['role'])) {
            return true;
        }

        if (isset($item['permission'])) {
            return $user->can($item['permission']);
        }

        if (isset($item['role'])) {
            return $user->hasAnyRole((array) $item['role']);
        }

        return false;
    }

    protected function transformGroup(array $group, $user): array
    {
        return [
            'label' => $group['label'],
            'icon'  => $group['icon'] ?? 'fas fa-circle',
            'children' => collect($group['children'] ?? [])
                ->filter(fn ($item) => $this->canAccess($item, $user))
                ->map(fn ($item) => [
                    'label'  => $item['label'],
                    'path'   => $item['route'] ?? null,
                    'action' => $item['action'] ?? null,
                ])
                ->values()
                ->toArray(),
        ];
    }
}