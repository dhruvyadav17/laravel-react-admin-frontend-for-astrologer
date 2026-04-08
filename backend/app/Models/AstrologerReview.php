<?php
// PATH: app/Models/AstrologerReview.php
// NEW FILE — Review system ke liye model

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AstrologerReview extends Model
{
    use SoftDeletes;

    protected $fillable = ['user_id','astrologer_id','rating','comment','is_approved'];
    protected $casts    = ['rating' => 'integer', 'is_approved' => 'boolean'];

    public function user()       { return $this->belongsTo(User::class); }
    public function astrologer() { return $this->belongsTo(Astrologer::class); }
}