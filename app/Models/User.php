<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use App\Models\Inventory;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public const ROLE_USER  = 1;
    public const ROLE_ADMIN = 2;

    public $timestamps = false;

    protected $table = 'users';
    protected $primaryKey = 'id_user';

    protected $fillable = [
        'login',
        'usernametg',
        'password',
        'level',
        'xp',
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
            'xp'       => 'integer',
        ];
    }

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

    // ─────────────────────────────────────────────────────────────
    // СИСТЕМА ОПЫТА И УРОВНЕЙ
    // ─────────────────────────────────────────────────────────────

    /**
     * Начислить опыт и вернуть данные о повышении (или null).
     */
    public function addXp(int $amount)
    {
        $oldLevel = $this->level;
        $this->xp += $amount;
        $newLevel = self::calculateLevel($this->xp);

        $levelUpData = null;

        if ($newLevel > $oldLevel) {
            $this->level = $newLevel;
            for ($lvl = $oldLevel + 1; $lvl <= $newLevel; $lvl++) {
                $this->grantLevelReward($lvl);
            }

            $levelUpData = [
                'old_level' => $oldLevel,
                'new_level' => $newLevel,
            ];
        }

        $this->save();

        return $levelUpData;
    }

    private function grantLevelReward(int $level)
    {
        $rubles = 0;
        $coins = 0;

        switch ($level) {
            case 2: $rubles = 500; break;
            case 3: $coins = 100; break;
            case 4: $rubles = 1500; break;
            case 5: $coins = 500; break;
            case 6: $rubles = 3000; break;
            case 7: $coins = 1000; break;
            case 8: $rubles = 5000; break;
            case 9: $coins = 2000; break;
            case 10: $rubles = 10000; break;
            case 15: $rubles = 25000; break;
            case 20: $coins = 5000; break;
            case 25: $rubles = 50000; break;
            case 30: $rubles = 100000; break;
            case 40: $rubles = 250000; break;
            case 50: $rubles = 1000000; break;
        }

        if ($rubles > 0) {
            $exists = DB::table('user_balances')->where('user_id', $this->id_user)->where('currency_id', 1)->exists();
            if ($exists) {
                DB::table('user_balances')->where('user_id', $this->id_user)->where('currency_id', 1)->increment('amount', $rubles);
            } else {
                DB::table('user_balances')->insert(['user_id' => $this->id_user, 'currency_id' => 1, 'amount' => $rubles]);
            }
        }

        if ($coins > 0) {
            $exists = DB::table('user_balances')->where('user_id', $this->id_user)->where('currency_id', 2)->exists();
            if ($exists) {
                DB::table('user_balances')->where('user_id', $this->id_user)->where('currency_id', 2)->increment('amount', $coins);
            } else {
                DB::table('user_balances')->insert(['user_id' => $this->id_user, 'currency_id' => 2, 'amount' => $coins]);
            }
        }

        // Замените ID на реальные из вашей таблицы `gifts`
        $giftIdToGive = null;
        if ($level === 5) $giftIdToGive = 41;
        if ($level === 10) $giftIdToGive = 52;
        if ($level === 20) $giftIdToGive = 55;
        if ($level === 50) $giftIdToGive = 61;

        if ($giftIdToGive) {
            $inventory = Inventory::where('user_id', $this->id_user)->where('gift_id', $giftIdToGive)->first();
            if ($inventory) {
                $inventory->increment('count_gifts');
            } else {
                Inventory::create([
                    'user_id' => $this->id_user,
                    'gift_id' => $giftIdToGive,
                    'count_gifts' => 1
                ]);
            }
        }
    }

    public static function calculateLevel(int $xp): int
    {
        if ($xp >= 60000000) return 50;
        if ($xp >= 25000000) return 40;
        if ($xp >= 10000000) return 30;
        if ($xp >= 5000000)  return 25;
        if ($xp >= 2500000)  return 20;
        if ($xp >= 1200000)  return 15;
        if ($xp >= 550000)   return 10;
        if ($xp >= 350000)   return 9;
        if ($xp >= 220000)   return 8;
        if ($xp >= 130000)   return 7;
        if ($xp >= 75000)    return 6;
        if ($xp >= 40000)    return 5;
        if ($xp >= 18000)    return 4;
        if ($xp >= 7500)     return 3;
        if ($xp >= 2500)     return 2;
        return 1;
    }

    /**
     * Минимальный порог XP для указанного уровня.
     * Точная инверсия calculateLevel().
     * Уровень 1 = 0 XP (стартовый).
     */
    public static function xpForLevel(int $level): int
    {
        return match (true) {
            $level >= 50 => 60000000,
            $level >= 40 => 25000000,
            $level >= 30 => 10000000,
            $level >= 25 => 5000000,
            $level >= 20 => 2500000,
            $level >= 15 => 1200000,
            $level >= 10 => 550000,
            $level >= 9  => 350000,
            $level >= 8  => 220000,
            $level >= 7  => 130000,
            $level >= 6  => 75000,
            $level >= 5  => 40000,
            $level >= 4  => 18000,
            $level >= 3  => 7500,
            $level >= 2  => 2500,
            default      => 0,
        };
    }

    /**
     * Возвращает следующий уровень и порог XP для него.
     * Если достигнут максимум — вернёт ['next' => null, 'xp' => null].
     */
    public static function nextLevelInfo(int $currentLevel): array
    {
        // Реальные "ступени" уровней из calculateLevel()
        $tiers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50];

        foreach ($tiers as $tier) {
            if ($tier > $currentLevel) {
                return [
                    'next' => $tier,
                    'xp'   => self::xpForLevel($tier),
                ];
            }
        }

        return ['next' => null, 'xp' => null];
    }
}