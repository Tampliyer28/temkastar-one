<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $myRanks = [];

        // Если пользователь авторизован, считаем его места
        if ($user) {
            // 1. Кейсы
            $myRanks['cases'] = [
                'id' => $user->id_user,
                'login' => $user->login,
                'value' => $user->cases ?? 0,
                'rank' => DB::table('users')->where('cases', '>', $user->cases ?? 0)->count() + 1,
                'extra' => 'Уровень ' . ($user->level ?? 1)
            ];

            // 2. Апгрейды
            $myRanks['upgrades'] = [
                'id' => $user->id_user,
                'login' => $user->login,
                'value' => $user->upgrads ?? 0,
                'rank' => DB::table('users')->where('upgrads', '>', $user->upgrads ?? 0)->count() + 1,
                'extra' => 'Уровень ' . ($user->level ?? 1)
            ];

            // 3. Выводы
            $myRanks['withdrawals'] = [
                'id' => $user->id_user,
                'login' => $user->login,
                'value' => $user->conclusion ?? 0,
                'rank' => DB::table('users')->where('conclusion', '>', $user->conclusion ?? 0)->count() + 1,
                'extra' => 'Уровень ' . ($user->level ?? 1)
            ];

            // 4. Инвентарь (Кол-во)
            $userInvCount = DB::table('inventory')->where('user_id', $user->id_user)->sum('count_gifts');
            $higherInvCount = DB::table('inventory')
                ->select('user_id', DB::raw('SUM(count_gifts) as total'))
                ->groupBy('user_id')
                ->having('total', '>', $userInvCount)
                ->get()->count();
            
            $myRanks['inventory'] = [
                'id' => $user->id_user,
                'login' => $user->login,
                'value' => $userInvCount,
                'rank' => $higherInvCount + 1,
                'extra' => 'Уровень ' . ($user->level ?? 1)
            ];

            // 5. Инвентарь (Ценность)
            $userInvValue = DB::table('inventory')
                ->join('gifts', 'inventory.gift_id', '=', 'gifts.id_gift')
                ->where('user_id', $user->id_user)
                ->sum(DB::raw('gifts.price * inventory.count_gifts'));
            
            $higherInvValue = DB::table('inventory')
                ->join('gifts', 'inventory.gift_id', '=', 'gifts.id_gift')
                ->select('user_id', DB::raw('SUM(gifts.price * inventory.count_gifts) as total'))
                ->groupBy('user_id')
                ->having('total', '>', $userInvValue)
                ->get()->count();

            $myRanks['inventoryValue'] = [
                'id' => $user->id_user,
                'login' => $user->login,
                'value' => $userInvValue,
                'rank' => $higherInvValue + 1,
                'extra' => 'Уровень ' . ($user->level ?? 1)
            ];
        }

        // Далее идут ваши стандартные запросы на топ-10...
        $cases = DB::table('users')->select('id_user as id', 'login', 'cases as value', 'level as extra')->orderBy('cases', 'desc')->limit(10)->get()->map(fn($u) => ['id'=>$u->id, 'login'=>$u->login, 'value'=>$u->value, 'extra'=>'Уровень '.($u->extra??1)]);
        $upgrades = DB::table('users')->select('id_user as id', 'login', 'upgrads as value', 'level as extra')->orderBy('upgrads', 'desc')->limit(10)->get()->map(fn($u) => ['id'=>$u->id, 'login'=>$u->login, 'value'=>$u->value, 'extra'=>'Уровень '.($u->extra??1)]);
        
        $inventory = DB::table('users')
            ->join('inventory', 'users.id_user', '=', 'inventory.user_id')
            ->select('users.id_user as id', 'users.login', DB::raw('SUM(inventory.count_gifts) as value'), 'users.level as extra')
            ->groupBy('users.id_user', 'users.login', 'users.level')
            ->orderBy('value', 'desc')->limit(10)->get()->map(fn($u) => ['id'=>$u->id, 'login'=>$u->login, 'value'=>$u->value, 'extra'=>'Уровень '.($u->extra??1)]);

        $withdrawals = DB::table('users')->select('id_user as id', 'login', 'conclusion as value', 'level as extra')->orderBy('conclusion', 'desc')->limit(10)->get()->map(fn($u) => ['id'=>$u->id, 'login'=>$u->login, 'value'=>$u->value, 'extra'=>'Уровень '.($u->extra??1)]);

        $inventoryValue = DB::table('users')
            ->join('inventory', 'users.id_user', '=', 'inventory.user_id')
            ->join('gifts', 'inventory.gift_id', '=', 'gifts.id_gift')
            ->select('users.id_user as id', 'users.login', DB::raw('SUM(gifts.price * inventory.count_gifts) as value'), 'users.level as extra')
            ->groupBy('users.id_user', 'users.login', 'users.level')
            ->orderBy('value', 'desc')->limit(10)->get()->map(fn($u) => ['id'=>$u->id, 'login'=>$u->login, 'value'=>$u->value, 'extra'=>'Уровень '.($u->extra??1)]);

        return Inertia::render('Leaders', [
            'leaders' => [
                'cases'          => $cases,
                'upgrades'       => $upgrades,
                'inventory'      => $inventory,
                'withdrawals'    => $withdrawals,
                'inventoryValue' => $inventoryValue,
            ],
            'myRanks' => $myRanks // <-- ПЕРЕДАЕМ МЕСТА ПОЛЬЗОВАТЕЛЯ
        ]);
    }
}