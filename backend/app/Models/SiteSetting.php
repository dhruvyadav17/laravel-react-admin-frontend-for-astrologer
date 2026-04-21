<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value', 'group', 'type'];

    // Get a setting value by key, with cache
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (!$setting) return $default;

        return match($setting->type) {
            'json'    => json_decode($setting->value, true) ?? $default,
            'boolean' => (bool) $setting->value,
            default   => $setting->value ?? $default,
        };
    }

    // Get all settings for a group as key=>value array
    public static function getGroup(string $group): array
    {
        return static::where('group', $group)->get()
            ->mapWithKeys(function ($item) {
                $value = match($item->type) {
                    'json'    => json_decode($item->value, true),
                    'boolean' => (bool) $item->value,
                    default   => $item->value,
                };
                return [$item->key => $value];
            })->toArray();
    }

    // Bulk update settings
    public static function setMany(array $data): void
    {
        foreach ($data as $key => $value) {
            $setting = static::where('key', $key)->first();
            if (!$setting) continue;

            $stored = match($setting->type) {
                'json'    => json_encode($value),
                'boolean' => $value ? '1' : '0',
                default   => (string) $value,
            };

            $setting->update(['value' => $stored]);
        }
    }
}
