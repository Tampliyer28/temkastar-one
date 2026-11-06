<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    // Значения из таблицы rols
    public const ROLE_USER  = 1;
    public const ROLE_ADMIN = 2;

    public $timestamps = false;

    protected $table = 'users';
    protected $primaryKey = 'id_user';

    /**
     * ИСПРАВЛЕНО: 'role' убрана из fillable, чтобы нельзя было
     * выдать себе права админа через mass assignment.
     * Роль задаётся только явно: $user->role = ...
     */
    protected $fillable = [
        'login',
        'usernametg',
        'password',
        'level',
        'cases',
        'upgrads',
        'conclusion',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'role'     => 'integer',
        ];
    }

    /**
     * ИСПРАВЛЕНО: в таблице users нет колонки remember_token.
     * Пустое имя отключает работу с ней, иначе вход с "remember" падает с SQL-ошибкой.
     */
    public function getRememberTokenName()
    {
        return '';
    }

    public function isAdmin(): bool
    {
        return (int) $this->role === self::ROLE_ADMIN;
    }

    public function balances()
    {
        return $this->hasMany(UserBalance::class, 'user_id', 'id_user');
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class, 'user_id', 'id_user');
    }
}
