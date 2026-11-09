<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Inventory;
use App\Models\User;

class ProfileController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $coins = DB::table('user_balances')->where('user_id', $user->id_user)->where('currency_id', 2)->first();
        $rubles = DB::table('user_balances')->where('user_id', $user->id_user)->where('currency_id', 1)->first();

        $balance = [
            'coins'  => $coins ? $coins->amount : 0,
            'rubles' => $rubles ? $rubles->amount : 0,
        ];

        $inventory = $user->inventory()->with('gift')->get()->map(function ($item) {
            return [
                'id'    => $item->id_inv,
                'name'  => $item->gift->name,
                'price' => $item->gift->price,
                'img'   => '/images/gifts/' . basename($item->gift->icon_url),
                'count' => $item->count_gifts,
            ];
        });

        // ── XP и прогресс до следующего уровня ──
        $currentLevel = (int) ($user->level ?? 1);
        $currentXp    = (int) ($user->xp ?? 0);
        $currentThreshold = User::xpForLevel($currentLevel);
        $nextInfo         = User::nextLevelInfo($currentLevel);

        return Inertia::render('Profile', [
            'userData' => [
                'login'         => $user->login,
                'telegram'      => $user->usernametg,
                'level'         => $currentLevel,
                'xp'            => $currentXp,
                'xp_current_lvl'=> $currentThreshold,
                'xp_next'       => $nextInfo['xp'],       // null на макс. уровне
                'next_level'    => $nextInfo['next'],     // null на макс. уровне
                'registered_at' => $user->created_at ? $user->created_at->format('d.m.Y') : 'Недавно',
                'stats' => [
                    'cases'           => $user->cases ?? 0,
                    'upgrades'        => $user->upgrads ?? 0,
                    'withdrawals_sum' => $user->conclusion ?? 0,
                ],
            ],
            'inventory' => $inventory,
            'balance'   => $balance,
        ]);
    }

    public function sell(Request $request, $id)
    {
        $user = $request->user();

        $validated = $request->validate([
            'count' => 'required|integer|min:1',
        ]);

        $inventoryItem = Inventory::with('gift')
            ->where('id_inv', $id)
            ->where('user_id', $user->id_user)
            ->first();

        if (!$inventoryItem) {
            return response()->json(['message' => 'Подарок не найден'], 404);
        }

        if ($inventoryItem->count_gifts < $validated['count']) {
            return response()->json(['message' => 'Недостаточно подарков для продажи'], 422);
        }

        $price = ($inventoryItem->gift->price ?? 0) * $validated['count'];

        DB::transaction(function () use ($user, $inventoryItem, $price, $validated) {
            $rubBalance = DB::table('user_balances')->where('user_id', $user->id_user)->where('currency_id', 1)->first();

            if ($rubBalance) {
                DB::table('user_balances')->where('user_id', $user->id_user)->where('currency_id', 1)->increment('amount', $price);
            } else {
                DB::table('user_balances')->insert([
                    'user_id'     => $user->id_user,
                    'currency_id' => 1,
                    'amount'      => $price,
                ]);
            }

            if ($inventoryItem->count_gifts > $validated['count']) {
                $inventoryItem->decrement('count_gifts', $validated['count']);
            } else {
                $inventoryItem->delete();
            }
        });

        return response()->json(['message' => "Продано {$validated['count']} шт. за {$price} ₽"]);
    }

    public function sellAll(Request $request)
    {
        $user = $request->user();

        $inventory = Inventory::with('gift')->where('user_id', $user->id_user)->get();

        if ($inventory->isEmpty()) {
            return response()->json(['message' => 'Инвентарь пуст'], 400);
        }

        $totalPrice = 0;
        foreach ($inventory as $item) {
            $totalPrice += ($item->gift->price ?? 0) * $item->count_gifts;
        }

        DB::transaction(function () use ($user, $totalPrice) {
            $rubBalance = DB::table('user_balances')->where('user_id', $user->id_user)->where('currency_id', 1)->first();

            if ($rubBalance) {
                DB::table('user_balances')->where('user_id', $user->id_user)->where('currency_id', 1)->increment('amount', $totalPrice);
            } else {
                DB::table('user_balances')->insert([
                    'user_id'     => $user->id_user,
                    'currency_id' => 1,
                    'amount'      => $totalPrice,
                ]);
            }

            Inventory::where('user_id', $user->id_user)->delete();
        });

        return response()->json(['message' => "Все подарки проданы за {$totalPrice} ₽"]);
    }

    public function withdraw(Request $request, $id)
    {
        $user = $request->user();

        $validated = $request->validate([
            'recipient' => 'required|string|max:255',
            'count'     => 'required|integer|min:1',
        ]);

        $inventoryItem = Inventory::with('gift')
            ->where('id_inv', $id)
            ->where('user_id', $user->id_user)
            ->first();

        if (!$inventoryItem) {
            return response()->json(['message' => 'Подарок не найден'], 404);
        }

        if ($inventoryItem->count_gifts < $validated['count']) {
            return response()->json(['message' => 'Недостаточно подарков для вывода'], 422);
        }

        $price = ($inventoryItem->gift->price ?? 0) * $validated['count'];

        DB::transaction(function () use ($user, $inventoryItem, $price, $validated) {
            $user->increment('conclusion', $price);

            if ($inventoryItem->count_gifts > $validated['count']) {
                $inventoryItem->decrement('count_gifts', $validated['count']);
            } else {
                $inventoryItem->delete();
            }
        });

        return response()->json(['message' => "Выведено {$validated['count']} шт. на сумму {$price} ₽"]);
    }

    public function withdrawAll(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'recipient' => 'required|string|max:255',
        ]);

        $inventory = Inventory::with('gift')->where('user_id', $user->id_user)->get();

        if ($inventory->isEmpty()) {
            return response()->json(['message' => 'Инвентарь пуст'], 400);
        }

        $totalPrice = 0;
        foreach ($inventory as $item) {
            $totalPrice += ($item->gift->price ?? 0) * $item->count_gifts;
        }

        DB::transaction(function () use ($user, $totalPrice) {
            $user->increment('conclusion', $totalPrice);
            Inventory::where('user_id', $user->id_user)->delete();
        });

        return response()->json(['message' => "Все подарки выведены на сумму {$totalPrice} ₽"]);
    }
}