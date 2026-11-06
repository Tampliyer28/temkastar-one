<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $table = 'inventory';
    protected $primaryKey = 'id_inv';
    public $timestamps = false;

    protected $guarded = [];

    // Связь с подарком
    public function gift()
    {
        return $this->belongsTo(Gift::class, 'gift_id', 'id_gift');
    }

    // Связь с пользователем
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id_user');
    }
}