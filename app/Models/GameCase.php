<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameCase extends Model
{
    protected $table = 'cases'; 
    protected $primaryKey = 'id_case';
    public $timestamps = false;
    protected $guarded = [];

    public function currency()
    {
        return $this->belongsTo(Currency::class, 'id_currency', 'id_currency');
    }

    // ДОБАВИТЬ ВОТ ЭТО:
    public function rewards()
    {
        return $this->hasMany(CaseReward::class, 'id_case', 'id_case');
    }
}