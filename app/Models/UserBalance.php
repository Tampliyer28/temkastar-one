<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBalance extends Model
{
    protected $table = 'user_balances';
    
    // Указываем составной первичный ключ
    protected $primaryKey = null; 
    public $incrementing = false;
    public $timestamps = false;

    protected $guarded = [];

    // ВАЖНО: указываем, что модель работает с составным ключом
    protected function setKeysForSaveQuery($query)
    {
        $query->where('user_id', $this->getAttribute('user_id'))
              ->where('currency_id', $this->getAttribute('currency_id'));
        return $query;
    }
}