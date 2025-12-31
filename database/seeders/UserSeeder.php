<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@pharmacy.local',
            'password' => Hash::make('password'),
            'nomor_str' => null,
            'no_hp' => '081234567890',
            'alamat' => 'Jl. Admin No. 1',
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Pharmacist users
        User::create([
            'name' => 'Apoteker Utama',
            'email' => 'pharmacist@pharmacy.local',
            'password' => Hash::make('password'),
            'nomor_str' => 'STR-APT-2024-001',
            'no_hp' => '081234567891',
            'alamat' => 'Jl. Apoteker No. 1',
            'role' => User::ROLE_PHARMACIST,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Apoteker Pendamping',
            'email' => 'pharmacist2@pharmacy.local',
            'password' => Hash::make('password'),
            'nomor_str' => 'STR-APT-2024-002',
            'no_hp' => '081234567892',
            'alamat' => 'Jl. Apoteker No. 2',
            'role' => User::ROLE_PHARMACIST,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Manager user
        User::create([
            'name' => 'Manajer Farmasi',
            'email' => 'manager@pharmacy.local',
            'password' => Hash::make('password'),
            'nomor_str' => null,
            'no_hp' => '081234567893',
            'alamat' => 'Jl. Manajer No. 1',
            'role' => User::ROLE_MANAGER,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }
}
