<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\CaseController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UpgradeController;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/leaders', [LeaderboardController::class, 'index'])->name('leaders');

Route::get('/about', fn() => Inertia::render('About'))->name('about');

Route::get('/case/{id}', [CaseController::class, 'show'])->name('case.show');

Route::middleware('auth')->group(function () {
    Route::post('/api/case/{id}/open', [CaseController::class, 'open'])->name('case.open');
    Route::post('/api/inventory/sell-won', [CaseController::class, 'sellWon'])->name('inventory.sellWon');
    Route::post('/api/inventory/{id}/sell', [ProfileController::class, 'sell'])->name('inventory.sell');

    Route::get('/cabinet', [ProfileController::class, 'index'])->name('cabinet');

    Route::get('/deposit', [PaymentController::class, 'index'])->name('deposit');
    Route::post('/deposit', [PaymentController::class, 'process'])->name('deposit.process');

    Route::post('/api/inventory/sell-all', [ProfileController::class, 'sellAll'])->name('inventory.sellAll');

    Route::get('/upgrade', [UpgradeController::class, 'index'])->name('upgrade');
    Route::post('/api/upgrade', [UpgradeController::class, 'process'])->name('upgrade.process');

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::post('/api/inventory/{id}/withdraw', [ProfileController::class, 'withdraw'])->name('inventory.withdraw');
    Route::post('/api/inventory/withdraw-all', [ProfileController::class, 'withdrawAll'])->name('inventory.withdrawAll');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index'])->name('admin');
    Route::post('/admin/promocodes', [AdminController::class, 'storePromo'])->name('admin.promocodes.store');
});

Route::middleware('guest')->group(function () {
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});
