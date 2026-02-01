<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function stock(): Response
    {
        return Inertia::render('laporan/stok');
    }

    public function transactions(): Response
    {
        return Inertia::render('laporan/transaksi');
    }

    public function expiry(): Response
    {
        return Inertia::render('laporan/kadaluarsa');
    }
}
