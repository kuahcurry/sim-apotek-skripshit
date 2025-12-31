<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            KategoriObatSeeder::class,
            JenisObatSeeder::class,
            SatuanObatSeeder::class,
            UnitRumahSakitSeeder::class,
            UserSeeder::class,
            ObatSeeder::class,
        ]);
    }
}
