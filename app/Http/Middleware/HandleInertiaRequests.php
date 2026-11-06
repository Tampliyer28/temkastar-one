<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $balance = ['coins' => 0, 'rubles' => 0];

        if ($user) {
            $balances = $user->balances;
            $coins  = $balances->where('currency_id', 2)->first();
            $rubles = $balances->where('currency_id', 1)->first();

            $balance = [
                'coins'  => $coins ? $coins->amount : 0,
                'rubles' => $rubles ? $rubles->amount : 0,
            ];
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id'       => $user->id_user,
                    'login'    => $user->login,
                    'role'     => $user->role,
                    'is_admin' => $user->isAdmin(),
                ] : null,
            ],
            'balance' => $balance,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
        ]);
    }
}
