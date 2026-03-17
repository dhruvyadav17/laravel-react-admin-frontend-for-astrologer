<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Models\Permission as SpatieRole;

class Permission extends SpatieRole
{
    use SoftDeletes;
    protected $fillable = [
        'name',
        'guard_name',
        'is_active'
    ];
}
