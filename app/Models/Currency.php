<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    protected $table =  'currencys'; 
    protected $primaryKey = 'id_currency';
    public $timestamps = false;
    protected $guarded = [];
}
