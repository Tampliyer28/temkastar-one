<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Inventory;
use App\Models\Gift;
use Illuminate\Support\Facades\DB;

class UpgradeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $inventory = $user->inventory()->with('gift')->get()->map(function ($item) {
            return [
                'id' => $item->id_inv,
                'gift_id' => $item->gift->id_gift,
                'name' => $item->gift->name,
                'price' => $item->gift->price,
                'img' => '/images/gifts/' . basename($item->gift->icon_url),
                'rarity' => $item->gift->rarity,
                'count' => $item->count_gifts,
            ];
        });

        $catalog = Gift::orderBy('price', 'asc')->get()->map(function ($gift) {
            return [
                'id' => $gift->id_gift,
                'name' => $gift->name,
                'price' => $gift->price,
                'img' => '/images/gifts/' . basename($gift->icon_url),
                'rarity' => $gift->rarity,
            ];
        });

        return Inertia::render('Upgrade', [
            'inventory' => $inventory,
            'catalog' => $catalog,
        ]);
    }

    public function process(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'inventory_ids' => 'required|array|min:1|max:5',
            'target_gift_id' => 'required|integer'
        ], [
            'inventory_ids.max' => 'Можно загрузить не более 5 предметов для одного апгрейда.',
        ]);

        $requestedCounts = array_count_values($validated['inventory_ids']);
        $uniqueIds = array_keys($requestedCounts);

        $items = Inventory::with('gift')
            ->whereIn('id_inv', $uniqueIds)
            ->where('user_id', $user->id_user)
            ->get();

        if ($items->count() !== count($uniqueIds)) {
            return response()->json(['message' => 'Ошибка: некоторые предметы не найдены'], 422);
        }

        $currentValue = 0;
        foreach ($items as $item) {
            $needed = $requestedCounts[$item->id_inv];
            if ($item->count_gifts < $needed) {
                return response()->json(['message' => "Недостаточно предметов: {$item->gift->name}"], 422);
            }
            $currentValue += $item->gift->price * $needed;
        }

        $targetGift = Gift::findOrFail($validated['target_gift_id']);
        $targetValue = $targetGift->price;

        if ($currentValue >= $targetValue) {
            return response()->json(['message' => 'Сумма ваших предметов должна быть меньше стоимости цели.'], 422);
        }

        $chance = ($currentValue / $targetValue) * 100;
        $chance = min($chance, 90);
        $win = (mt_rand() / mt_getrandmax()) * 100 <= $chance;

        $levelUpData = null;

        DB::transaction(function () use ($user, $items, $requestedCounts, $targetGift, $win, &$levelUpData) {
            foreach ($items as $item) {
                $needed = $requestedCounts[$item->id_inv];
                if ($item->count_gifts > $needed) {
                    $item->decrement('count_gifts', $needed);
                } else {
                    $item->delete();
                }
            }

            if ($win) {
                $inventoryItem = Inventory::where('user_id', $user->id_user)
                    ->where('gift_id', $targetGift->id_gift)
                    ->first();

                if ($inventoryItem) {
                    $inventoryItem->increment('count_gifts');
                } else {
                    Inventory::create([
                        'user_id' => $user->id_user,
                        'gift_id' => $targetGift->id_gift,
                        'count_gifts' => 1,
                    ]);
                }
                
                $user->increment('upgrads');

                // СОХРАНЯЕМ ДАННЫЕ О ПОВЫШЕНИИ УРОВНЯ
                $levelUpData = $user->addXp(50);
            }
        });

        return response()->json([
            'success' => $win,
            'chance' => round($chance, 2),
            'message' => $win ? 'Вы успешно апгрейдили предмет!' : 'Апгрейд не удался. Предметы сгорели.',
            'levelUp' => $levelUpData,
        ]);
    }
}