<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogAktivitas;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogAktivitasController extends Controller
{
    /**
     * Display a listing of activity logs.
     */
    public function index(Request $request): JsonResponse
    {
        $query = LogAktivitas::with(['user:id,name,email', 'loggable']);

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by aktivitas type
        if ($request->has('aktivitas')) {
            $query->where('aktivitas', 'like', "%{$request->aktivitas}%");
        }

        // Filter by model type
        if ($request->has('loggable_type')) {
            $query->where('loggable_type', $request->loggable_type);
        }

        // Date range filter
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('aktivitas', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        // Sorting (latest first by default)
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 20);
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Display the specified log.
     */
    public function show(LogAktivitas $log): JsonResponse
    {
        $log->load(['user:id,name,email,role', 'loggable']);

        return response()->json($log);
    }

    /**
     * Get logs by specific user.
     */
    public function byUser(Request $request, User $user): JsonResponse
    {
        $query = $user->logAktivitas()->with(['loggable']);

        // Date range filter
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Pagination
        $perPage = $request->get('per_page', 20);
        $logs = $query->latest()->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Get activity statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now()->endOfMonth());

        $query = LogAktivitas::whereBetween('created_at', [$dateFrom, $dateTo]);

        $stats = [
            'total_activities' => $query->count(),
            'by_user' => $query->groupBy('user_id')
                ->selectRaw('user_id, count(*) as count')
                ->with('user:id,name')
                ->get(),
            'by_type' => $query->groupBy('loggable_type')
                ->selectRaw('loggable_type, count(*) as count')
                ->get(),
            'recent_activities' => LogAktivitas::with(['user:id,name', 'loggable'])
                ->latest()
                ->limit(10)
                ->get(),
        ];

        return response()->json($stats);
    }
}
