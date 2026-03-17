<?php

namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;

use App\Services\Sidebar\SidebarService;

class SidebarController extends Controller

{
    public function __construct(
        protected SidebarService $service
    ) {}

    /**
     * GET /api/v1/admin/sidebar
     */
    public function __invoke()
    {
        return $this->success(
            'Sidebar loaded',
            $this->service->get()
        );
    }
}
