<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Inventory;

class ProfileController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Получаем инвентарь
        $inventory = $user->inventory()->with('gift')->get()->map(function ($item) {
            return [
                'id' => $item->id_inv,
                'name' => $item->gift->name,
                'price' => $item->gift->price,
                'img' => '/images/gifts/' . basename($item->gift->icon_url),
                'count' => $item->count_gifts, // <--- ДОБАВЛЯЕМ КОЛИЧЕСТВО
            ];
        });

        return Inertia::render('Profile', [
            'userData' => [
                'login' => $user->login,
                'telegram' => $user->usernametg,
                'level' => $user->level,
                'registered_at' => $user->created_at ? $user->created_at->format('d.m.Y') : 'Недавно', 
                'stats' => [
                    'cases' => $user->cases ?? 0,
                    'upgrades' => $user->upgrads ?? 0,
                    'withdrawals' => $user->conclusion ?? 0,
                ]
            ],
            'inventory' => $inventory,
        ]);
    }

    public function sell(Request $request, $id)
    {
        $user = $request->user();
        
        $inventoryItem = Inventory::with('gift')
            ->where('id_inv', $id)
            ->where('user_id', $user->id_user)
            ->first();

        if (!$inventoryItem) {
            return response()->json(['message' => 'Подарок не найден'], 404);
        }

        $price = $inventoryItem->gift->price ?? 0;

        DB::transaction(function () use ($user, $inventoryItem, $price) {
            // ЖЕСТКО УКАЗЫВАЕМ, ЧТО НАЧИСЛЯЕМ ТОЛЬКО РУБЛИ (currency_id = 1)
            $rubBalance = DB::table('user_balances')
                ->where('user_id', $user->id_user)
                ->where('currency_id', 1)
                ->first();

            if ($rubBalance) {
                DB::table('user_balances')
                    ->where('user_id', $user->id_user)
                    ->where('currency_id', 1)
                    ->increment('amount', $price);
            } else {
                DB::table('user_balances')->insert([
                    'user_id' => $user->id_user,
                    'currency_id' => 1,
                    'amount' => $price
                ]);
            }

            // Удаляем или уменьшаем
            if ($inventoryItem->count_gifts > 1) {
                $inventoryItem->decrement('count_gifts');
            } else {
                $inventoryItem->delete();
            }
        });

        return response()->json(['message' => "Подарок продан за {$price} ₽"]);
    }

    public function sellAll(Request $request)
    {
        $user = $request->user();
        
        // Получаем весь инвентарь пользователя вместе с ценами подарков
        $inventory = \App\Models\Inventory::with('gift')
            ->where('user_id', $user->id_user)
            ->get();

        if ($inventory->isEmpty()) {
            return response()->json(['message' => 'Инвентарь пуст'], 400);
        }

        // Считаем общую сумму
        $totalPrice = 0;
        foreach ($inventory as $item) {
            $totalPrice += ($item->gift->price ?? 0) * $item->count_gifts;
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($user, $inventory, $totalPrice) {
            // Начисляем рубли (currency_id = 1)
            $rubBalance = \Illuminate\Support\Facades\DB::table('user_balances')
                ->where('user_id', $user->id_user)
                ->where('currency_id', 1)
                ->first();

            if ($rubBalance) {
                \Illuminate\Support\Facades\DB::table('user_balances')
                    ->where('user_id', $user->id_user)
                    ->where('currency_id', 1)
                    ->increment('amount', $totalPrice);
            } else {
                \Illuminate\Support\Facades\DB::table('user_balances')->insert([
                    'user_id' => $user->id_user,
                    'currency_id' => 1,
                    'amount' => $totalPrice
                ]);
            }

            // Очищаем инвентарь пользователя
            \App\Models\Inventory::where('user_id', $user->id_user)->delete();
        });

        return response()->json(['message' => "Все подарки проданы за {$totalPrice} ₽"]);
    }
}