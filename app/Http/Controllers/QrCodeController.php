<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QrCodeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('obat/qr/index');
    }

    public function analytics(): Response
    {
        return Inertia::render('obat/qr/analytics');
    }
}
