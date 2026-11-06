<?php

namespace App\Http\Controllers;

use App\Models\GameCase;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CaseController extends Controller
{
    public function show($id)
    {
        $case = GameCase::with(['rewards.gift', 'currency'])->findOrFail($id);

        $prizes = $case->rewards->map(function ($reward) {
            $gift = $reward->gift;
            return [
                'id'     => $gift->id_gift,
                'name'   => $gift->name,
                'price'  => $gift->price ?? 0,
                'chance' => (float) $reward->chance,
                'rarity' => $gift->rarity,
                'img'    => '/images/gifts/' . basename($gift->icon_url),
            ];
        });

        return Inertia::render('CasePage', [
            'caseData' => [
                'id'    => $case->id_case,
                'name'  => $case->name_case,
                'price' => $case->price,
                'icon'  => $case->icon_url,
                'currency_img' => $case->currency ? $case->currency->url_cur : '/images/ui/coin.png',
            ],
            'prizes' => $prizes,
        ]);
    }

    public function open(Request $request, $id)
    {
        $user = $request->user();
        $case = GameCase::with('rewards.gift')->findOrFail($id);
        $currencyId = (int) $case->id_currency;

        // 1. Получаем количество (по умолчанию 1, максимум 10)
        $count = (int) $request->input('count', 1);
        if ($count < 1 || $count > 10) {
            return response()->json(['message' => 'Можно открыть от 1 до 10 кейсов за раз.'], 422);
        }

        // 2. Проверка баланса (умножаем цену на количество)
        $totalPrice = $case->price * $count;
        $balance = DB::table('user_balances')
            ->where('user_id', $user->id_user)
            ->where('currency_id', $currencyId)
            ->first();
        $currentAmount = $balance ? $balance->amount : 0;

        if ($currentAmount < $totalPrice) {
            return response()->json(['message' => 'Недостаточно средств для открытия ' . $count . ' кейсов.'], 422);
        }

        $winners = [];

        // 3. Транзакция
        DB::transaction(function () use ($user, $case, $currencyId, $count, $totalPrice, &$winners) {
            // Списываем общую сумму
            DB::table('user_balances')
                ->where('user_id', $user->id_user)
                ->where('currency_id', $currencyId)
                ->decrement('amount', $totalPrice);

            // Начисляем 1% в монетах (от общей суммы)
            $coinBonus = $totalPrice * 0.01;
            $coinBalance = DB::table('user_balances')
                ->where('user_id', $user->id_user)
                ->where('currency_id', 2)
                ->first();

            if ($coinBalance) {
                DB::table('user_balances')
                    ->where('user_id', $user->id_user)
                    ->where('currency_id', 2)
                    ->increment('amount', $coinBonus);
            } else {
                DB::table('user_balances')->insert([
                    'user_id' => $user->id_user,
                    'currency_id' => 2,
                    'amount' => $coinBonus
                ]);
            }

            // Выбираем выигрыши в цикле
            for ($i = 0; $i < $count; $i++) {
                $totalChance = $case->rewards->sum('chance');
                $random = mt_rand() / mt_getrandmax() * $totalChance;
                $winnerReward = null;
                
                foreach ($case->rewards as $reward) {
                    $random -= $reward->chance;
                    if ($random <= 0) {
                        $winnerReward = $reward;
                        break;
                    }
                }
                if (!$winnerReward) $winnerReward = $case->rewards->first();

                $gift = $winnerReward->gift;

                // Запись в инвентарь (и получение ID записи для продажи)
                $inventoryItem = Inventory::where('user_id', $user->id_user)
                    ->where('gift_id', $gift->id_gift)
                    ->first();

                if ($inventoryItem) {
                    $inventoryItem->increment('count_gifts');
                    $invId = $inventoryItem->id_inv;
                } else {
                    $newItem = Inventory::create([
                        'user_id' => $user->id_user,
                        'gift_id' => $gift->id_gift,
                        'count_gifts' => 1,
                    ]);
                    $invId = $newItem->id_inv;
                }

                $winners[] = [
                    'id'     => $gift->id_gift,
                    'id_inv' => $invId, // <--- ДОБАВЛЯЕМ ID ИНВЕНТАРЯ ДЛЯ ПРОДАЖИ
                    'name'   => $gift->name,
                    'price'  => $gift->price ?? 0,
                    'rarity' => $gift->rarity,
                    'img'    => '/images/gifts/' . basename($gift->icon_url),
                ];
            }

            // Статистика
            $user->increment('cases', $count);
        });

        return response()->json([
            'prizes' => $winners, // Возвращаем массив призов
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
            return response()->json(['message' => 'Подарок не найден.'], 404);
        }

        $price = $inventoryItem->gift->price ?? 0;

        DB::transaction(function () use ($user, $inventoryItem, $price) {
            // Начисляем ТОЛЬКО рубли (currency_id = 1)
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

            // Уменьшаем количество или удаляем
            if ($inventoryItem->count_gifts > 1) {
                $inventoryItem->decrement('count_gifts');
            } else {
                $inventoryItem->delete();
            }
        });

        return response()->json(['message' => "Подарок продан за {$price} ₽"]);
    }
}