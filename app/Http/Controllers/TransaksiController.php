<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransaksiController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('transaksi/index');
    }

    public function masuk(): Response
    {
        return Inertia::render('transaksi/index');
    }

    public function keluar(): Response
    {
        return Inertia::render('transaksi/index');
    }
}
