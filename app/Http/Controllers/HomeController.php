<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Models\CaseCategory;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $categories = CaseCategory::with('cases.currency')->get();

        // Передаем данные во фронтенд (React)
        return Inertia::render('Home', [
            'categories' => $categories
        ]);
    }
}
