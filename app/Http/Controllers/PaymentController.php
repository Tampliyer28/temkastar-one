<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Promocode;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index()
    {
        return Inertia::render('Payment');
    }

    public function process(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:50',
            'payment_method' => 'required|in:qr,card',
            'promo' => 'nullable|string',
        ], [
            'amount.min' => 'Минимальная сумма пополнения — 50 ₽.',
            'amount.required' => 'Введите сумму пополнения.',
        ]);

        $amount = $validated['amount'];
        $bonusMessage = '';

        $user = $request->user();

        DB::transaction(function () use ($request, $user, $validated, &$amount, &$bonusMessage) {
            // 1. Начисляем основную сумму в рублях (currency_id = 1)
            $rubBalance = DB::table('user_balances')
                ->where('user_id', $user->id_user)
                ->where('currency_id', 1)
                ->first();

            if ($rubBalance) {
                DB::table('user_balances')
                    ->where('user_id', $user->id_user)
                    ->where('currency_id', 1)
                    ->increment('amount', $amount);
            } else {
                DB::table('user_balances')->insert([
                    'user_id' => $user->id_user,
                    'currency_id' => 1,
                    'amount' => $amount
                ]);
            }

            // 2. Обработка промокода
            if (!empty($validated['promo'])) {
                $promo = Promocode::where('code', $validated['promo'])
                    ->where('is_active', 1)
                    ->first();

                if ($promo) {
                    // Бонус процентами (рубли)
                    if ($promo->bonus_percent > 0) {
                        $percentBonus = $amount * ($promo->bonus_percent / 100);
                        
                        DB::table('user_balances')
                            ->where('user_id', $user->id_user)
                            ->where('currency_id', 1)
                            ->increment('amount', $percentBonus);
                            
                        $bonusMessage .= " +{$promo->bonus_percent}% к пополнению.";
                    }

                    // Бонус монетами
                    if ($promo->bonus_coins > 0) {
                        $coinBalance = DB::table('user_balances')
                            ->where('user_id', $user->id_user)
                            ->where('currency_id', 2)
                            ->first();

                        if ($coinBalance) {
                            DB::table('user_balances')
                                ->where('user_id', $user->id_user)
                                ->where('currency_id', 2)
                                ->increment('amount', $promo->bonus_coins);
                        } else {
                            DB::table('user_balances')->insert([
                                'user_id' => $user->id_user,
                                'currency_id' => 2,
                                'amount' => $promo->bonus_coins
                            ]);
                        }
                        $bonusMessage .= " +{$promo->bonus_coins} монет.";
                    }
                } else {
                    $bonusMessage = " (Промокод недействителен)";
                }
            }
        });

        return redirect()->back()->with('success', "Баланс пополнен на {$amount} ₽.{$bonusMessage}");
    }
}