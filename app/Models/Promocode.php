<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Promocode extends Model
{
    protected $table = 'promocodes';
    protected $primaryKey = 'id_promo';
    public $timestamps = false;
    protected $guarded = [];
}