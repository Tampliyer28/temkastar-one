<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    // Показ страницы
    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    // Обработка формы
    public function register(Request $request)
    {
        $validated = $request->validate([
            'login' => 'required|string|max:100|unique:users,login',
            'telegram' => 'nullable|string|max:32',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'login' => $validated['login'],
            'usernametg' => $validated['telegram'],
            'password' => $validated['password'], // <-- Убрали Hash::make()
            
            // Заполняем обязательные поля, если они есть в БД
            'level' => 1,
            'cases' => 0,
            'upgrads' => 0,
            'conclusion' => 0,
            'role' => 1,
        ]);

        Auth::login($user);

        return redirect()->route('home');
    }

    // Показ страницы авторизации
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    // Обработка формы входа
    public function login(Request $request)
    {
        // Валидация данных
        $credentials = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        // Попытка авторизации (используем поле login вместо email)
        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            // Защита от фиксации сессии
            $request->session()->regenerate();

            // Редирект на главную после успешного входа
            return redirect()->intended(route('home'));
        }

        // Если не удалось войти, возвращаем ошибку
        return back()->withErrors([
            'login' => 'Неверный логин или пароль.',
        ])->onlyInput('login');
    }

    // Выход из системы
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}