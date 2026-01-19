<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nomor_str', 'like', "%{$search}%")
                  ->orWhere('no_hp', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:' . implode(',', [User::ROLE_ADMIN, User::ROLE_PHARMACIST, User::ROLE_MANAGER]),
            'nomor_str' => 'nullable|string|max:20|unique:users,nomor_str',
            'no_hp' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // If role is pharmacist, nomor_str is required
        if ($request->role === User::ROLE_PHARMACIST && empty($request->nomor_str)) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => ['nomor_str' => ['Nomor STR wajib diisi untuk Apoteker']],
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'nomor_str' => $request->nomor_str,
            'no_hp' => $request->no_hp,
            'alamat' => $request->alamat,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json([
            'message' => 'User berhasil ditambahkan',
            'data' => $user,
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        return response()->json($user);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:' . implode(',', [User::ROLE_ADMIN, User::ROLE_PHARMACIST, User::ROLE_MANAGER]),
            'nomor_str' => ['nullable', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
            'no_hp' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // If role is pharmacist, nomor_str is required
        if ($request->role === User::ROLE_PHARMACIST && empty($request->nomor_str)) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => ['nomor_str' => ['Nomor STR wajib diisi untuk Apoteker']],
            ], 422);
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'nomor_str' => $request->nomor_str,
            'no_hp' => $request->no_hp,
            'alamat' => $request->alamat,
            'is_active' => $request->boolean('is_active', $user->is_active),
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'message' => 'User berhasil diperbarui',
            'data' => $user,
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): JsonResponse
    {
        // Prevent deleting self
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Tidak dapat menghapus user yang sedang login',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus',
        ]);
    }

    /**
     * Toggle user active status.
     */
    public function toggleActive(User $user): JsonResponse
    {
        // Prevent deactivating self
        if ($user->id === auth()->id() && $user->is_active) {
            return response()->json([
                'message' => 'Tidak dapat menonaktifkan user yang sedang login',
            ], 422);
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        return response()->json([
            'message' => 'Status user berhasil diubah',
            'data' => $user,
        ]);
    }

    /**
     * Get user statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'inactive_users' => User::where('is_active', false)->count(),
            'by_role' => [
                'admin' => User::where('role', User::ROLE_ADMIN)->count(),
                'pharmacist' => User::where('role', User::ROLE_PHARMACIST)->count(),
                'manager' => User::where('role', User::ROLE_MANAGER)->count(),
            ],
        ];

        return response()->json($stats);
    }
}
