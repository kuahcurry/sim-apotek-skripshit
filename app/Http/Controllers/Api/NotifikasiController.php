<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $kategori = $request->get('kategori');

        $query = Notifikasi::forUser(auth()->id())
            ->latest();

        if ($kategori) {
            $query->kategori($kategori);
        }

        $notifikasi = $query->paginate($perPage);

        return response()->json($notifikasi);
    }

    /**
     * Get unread notifications
     */
    public function unread(Request $request): JsonResponse
    {
        $notifikasi = Notifikasi::forUser(auth()->id())
            ->unread()
            ->latest()
            ->get();

        return response()->json($notifikasi);
    }

    /**
     * Get unread notification count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = Notifikasi::forUser(auth()->id())
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Notifikasi $notifikasi): JsonResponse
    {
        $notifikasi->markAsRead();

        return response()->json([
            'message' => 'Notifikasi ditandai sebagai dibaca',
            'notifikasi' => $notifikasi,
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        Notifikasi::forUser(auth()->id())
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'Semua notifikasi ditandai sebagai dibaca',
        ]);
    }
}
