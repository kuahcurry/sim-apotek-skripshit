<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function stock(): Response
    {
        return Inertia::render('reports/stock');
    }

    public function transactions(): Response
    {
        return Inertia::render('reports/transactions');
    }

    public function expiry(): Response
    {
        return Inertia::render('reports/expiry');
    }
}
