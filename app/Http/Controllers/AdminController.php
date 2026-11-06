<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Promocode;
use App\Models\User;
use App\Models\GameCase;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            abort(403, 'Доступ запрещён');
        }

        $stats = [
            'revenue'      => $this->getTotalRevenue(),
            'cases_opened' => (int) DB::table('users')->sum('cases'),
            'upgrades'     => (int) DB::table('users')->sum('upgrads'),
            'users'        => (int) DB::table('users')->count(),
            'withdrawals'  => (int) DB::table('users')->sum('conclusion'),
        ];

        $promocodes = Promocode::orderBy('id_promo', 'desc')
            ->get()
            ->map(function ($promo) {
                return [
                    'id'    => $promo->id_promo,
                    'name'  => $promo->code,
                    'bonus' => (int) $promo->bonus_percent,
                ];
            });

        return Inertia::render('Admin', [
            'stats'      => $stats,
            'promocodes' => $promocodes,
        ]);
    }

    public function storePromo(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            abort(403, 'Доступ запрещён');
        }

        $validated = $request->validate([
            'name'  => 'required|string|max:100|unique:promocodes,code',
            'bonus' => 'required|numeric|min:1|max:100',
        ], [
            'name.unique'   => 'Промокод с таким названием уже существует.',
            'bonus.min'     => 'Бонус должен быть не менее 1%.',
            'bonus.max'     => 'Бонус не может превышать 100%.',
        ]);

        Promocode::create([
            'code'          => strtoupper($validated['name']),
            'bonus_percent' => (int) $validated['bonus'],
            'bonus_coins'   => 0,
            'is_active'     => 1,
        ]);

        return redirect()->back()->with('success', 'Промокод успешно создан!');
    }

    /**
     * Общая выручка = донаты всех пользователей - сумма выводов всех пользователей.
     * Донаты: SUM(payments.amount). Выводы: SUM(users.conclusion).
     */
    private function getTotalRevenue(): float
    {
        $donations   = (float) DB::table('payments')->sum('amount');
        $withdrawals = (float) DB::table('users')->sum('conclusion');

        return round($donations - $withdrawals, 2);
    }
}