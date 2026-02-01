<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransaksiController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('transaksi/semua-transaksi');
    }

    public function masuk(): Response
    {
        return Inertia::render('transaksi/barang-masuk');
    }

    public function keluar(): Response
    {
        return Inertia::render('transaksi/barang-keluar');
    }
}
