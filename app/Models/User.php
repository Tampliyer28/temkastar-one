<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Отключаем стандартные created_at и updated_at, 
     * так как в вашей БД их нет.
     */
    public $timestamps = false;

    /**
     * Указываем ваш первичный ключ.
     */
    protected $primaryKey = 'id_user';

    /**
     * Поля, которые разрешено заполнять (Mass Assignment).
     */
    protected $fillable = [
        'login',
        'usernametg', // Поле для Telegram (судя по вашей схеме БД)
        'password',
        'level',
        'cases',
        'upgrads',
        'conclusion',
        'role',
    ];

    /**
     * Скрываем пароль при выводе JSON.
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Касты (преобразования типов).
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed', // Laravel будет автоматически хешировать пароль!
        ];
    }

    // Связь с балансом (если есть таблица user_balances)
    public function balances()
    {
        return $this->hasMany(UserBalance::class, 'user_id', 'id_user');
    }

    // Связь с инвентарем (если есть таблица inventory)
    public function inventory()
    {
        return $this->hasMany(Inventory::class, 'user_id', 'id_user');
    }

        
}