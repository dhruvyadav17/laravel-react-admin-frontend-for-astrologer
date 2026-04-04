<?php
// PATH: app/Models/AstrologerSchedule.php
// NEW FILE — Weekly schedule system ke liye model

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AstrologerSchedule extends Model
{
    protected $fillable = ['astrologer_id','day_of_week','start_time','end_time','is_active'];
    protected $casts    = ['day_of_week' => 'integer', 'is_active' => 'boolean'];

    public function astrologer() { return $this->belongsTo(Astrologer::class); }

    public static function dayName(int $day): string
    {
        return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][$day] ?? 'Unknown';
    }
}