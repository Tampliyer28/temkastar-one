<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gift extends Model
{
    protected $table = 'gifts';
    protected $primaryKey = 'id_gift';
    public $timestamps = false;
    protected $guarded = [];

    // В вашей схеме enum: common, uncommon, rare, epic, legendary
}