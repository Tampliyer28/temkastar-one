<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    // public function share(Request $request): array
    // {
    //     return [
    //         ...parent::share($request),
    //         //
    //     ];
    // }

    public function share(Request $request): array
    {
        $user = $request->user();
        $balance = ['coins' => 0, 'rubles' => 0];

        if ($user) {
            $balances = $user->balances;
            $coins = $balances->where('currency_id', 2)->first();
            $rubles = $balances->where('currency_id', 1)->first();

            $balance = [
                'coins' => $coins ? $coins->amount : 0,
                'rubles' => $rubles ? $rubles->amount : 0,
            ];
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id_user,
                    'login' => $user->login,
                ] : null,
            ],
            'balance' => $balance,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
        ]);
    }
}
