<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaseReward extends Model
{
    protected $table = 'case_rewards';
    public $timestamps = false;
    protected $guarded = [];

    public function gift()
    {
        return $this->belongsTo(Gift::class, 'gift_id', 'id_gift');
    }
}