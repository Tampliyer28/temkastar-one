<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaseCategory extends Model
{
    protected $table = 'case_categories';
    protected $primaryKey = 'id_casescat';
    public $timestamps = false;

    public function cases(){
        return $this->hasMany(GameCase::class, 'casescat_id', 'id_casescat');
    }

    public function rewards()
    {
        return $this->hasMany(CaseReward::class, 'id_case', 'id_case');
    }
}
