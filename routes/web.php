<?php

use App\Http\Controllers\CaseController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UpgradeController;
use Inertia\Inertia;

// Главная страница
Route::get('/', [HomeController::class, 'index'])->name('home');

// О нас
Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

// Кейсы
Route::get('/case/{id}', [CaseController::class, 'show'])->name('case.show');

// роуты только для авторизованных
Route::middleware('auth')->group(function () {
    // Открытие кейса
    Route::post('/api/case/{id}/open', [CaseController::class, 'open'])->name('case.open');
    
    // Продажа подарка из модалки
    Route::post('/api/inventory/{id}/sell', [CaseController::class, 'sell'])->name('inventory.sell');
    
    // Личный кабинет
    Route::get('/cabinet', [ProfileController::class, 'index'])->name('cabinet');
    
    // Пополнение баланса
    Route::get('/deposit', [PaymentController::class, 'index'])->name('deposit');
    Route::post('/deposit', [PaymentController::class, 'process'])->name('deposit.process');
    Route::post('/api/inventory/sell-all', [ProfileController::class, 'sellAll'])->name('inventory.sellAll');

    // upgrade
    Route::get('/upgrade', [UpgradeController::class, 'index'])->name('upgrade');
    Route::post('/api/upgrade', [UpgradeController::class, 'process'])->name('upgrade.process');
    
    // Выход
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

// Авторизация и регистрация
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register']);
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);