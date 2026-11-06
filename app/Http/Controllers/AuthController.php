<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'login'    => 'required|string|max:100|unique:users,login',
            'telegram' => 'nullable|string|max:32',
            'password' => 'required|string|min:6',
        ]);

        $user = new User([
            'login'      => $validated['login'],
            // пустая строка вместо null, если колонка NOT NULL
            'usernametg' => $validated['telegram'] ?? '',
            'password'   => $validated['password'], // хешируется кастом 'hashed'
            'level'      => 1,
            'cases'      => 0,
            'upgrads'    => 0,
            'conclusion' => 0,
        ]);
        // Роль задаётся только здесь, всегда "user". Админов назначают вручную в БД.
        $user->role = User::ROLE_USER;
        $user->save();

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('home');
    }

    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'login'    => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        // remember не используем: в таблице users нет колонки remember_token
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->intended(route('home'));
        }

        return back()->withErrors([
            'login' => 'Неверный логин или пароль.',
        ])->onlyInput('login');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Полная перезагрузка страницы, чтобы в <meta name="csrf-token"> попал
        // новый токен (его используют fetch-запросы в кейсах/апгрейде/профиле).
        return Inertia::location(route('home'));
    }
}
