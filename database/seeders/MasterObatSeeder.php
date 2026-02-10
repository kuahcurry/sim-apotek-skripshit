<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KategoriObat;
use App\Models\JenisObat;
use App\Models\SatuanObat;

class MasterObatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kategori Obat
        $kategoris = [
            ['id' => 1, 'nama_kategori' => 'Analgesik & Antipiretik', 'deskripsi' => 'Obat pereda nyeri dan penurun panas'],
            ['id' => 2, 'nama_kategori' => 'Antibiotik', 'deskripsi' => 'Obat untuk infeksi bakteri'],
            ['id' => 3, 'nama_kategori' => 'Obat Saluran Cerna', 'deskripsi' => 'Obat untuk masalah pencernaan'],
            ['id' => 4, 'nama_kategori' => 'Kardiovaskular', 'deskripsi' => 'Obat jantung dan pembuluh darah'],
            ['id' => 5, 'nama_kategori' => 'Obat Pernapasan', 'deskripsi' => 'Obat untuk sistem pernapasan'],
            ['id' => 6, 'nama_kategori' => 'Vitamin & Suplemen', 'deskripsi' => 'Vitamin dan nutrisi tambahan'],
            ['id' => 7, 'nama_kategori' => 'Antidiabetes', 'deskripsi' => 'Obat untuk diabetes'],
            ['id' => 8, 'nama_kategori' => 'Obat Kulit', 'deskripsi' => 'Obat untuk masalah kulit'],
            ['id' => 9, 'nama_kategori' => 'Obat Topikal & Antiseptik', 'deskripsi' => 'Obat oles dan antiseptik'],
        ];

        foreach ($kategoris as $kategori) {
            KategoriObat::updateOrCreate(
                ['id' => $kategori['id']], 
                array_merge($kategori, ['is_active' => true])
            );
        }

        // Jenis Obat
        $jenis = [
            ['id' => 1, 'nama_jenis' => 'Tablet', 'deskripsi' => 'Obat dalam bentuk tablet'],
            ['id' => 2, 'nama_jenis' => 'Kapsul', 'deskripsi' => 'Obat dalam bentuk kapsul'],
            ['id' => 3, 'nama_jenis' => 'Sirup', 'deskripsi' => 'Obat cair'],
            ['id' => 4, 'nama_jenis' => 'Injeksi', 'deskripsi' => 'Obat suntik'],
            ['id' => 5, 'nama_jenis' => 'Salep', 'deskripsi' => 'Obat oles'],
            ['id' => 6, 'nama_jenis' => 'Tetes', 'deskripsi' => 'Obat tetes'],
            ['id' => 7, 'nama_jenis' => 'Inhaler', 'deskripsi' => 'Obat hirup'],
        ];

        foreach ($jenis as $j) {
            JenisObat::updateOrCreate(
                ['id' => $j['id']], 
                array_merge($j, ['is_active' => true])
            );
        }

        // Satuan Obat
        $satuans = [
            ['id' => 1, 'nama_satuan' => 'Tablet', 'singkatan' => 'tab'],
            ['id' => 2, 'nama_satuan' => 'Kapsul', 'singkatan' => 'kaps'],
            ['id' => 3, 'nama_satuan' => 'Botol', 'singkatan' => 'btl'],
            ['id' => 4, 'nama_satuan' => 'Ampul', 'singkatan' => 'amp'],
            ['id' => 5, 'nama_satuan' => 'Vial', 'singkatan' => 'vial'],
            ['id' => 6, 'nama_satuan' => 'Tube', 'singkatan' => 'tube'],
            ['id' => 7, 'nama_satuan' => 'Pcs', 'singkatan' => 'pcs'],
            ['id' => 8, 'nama_satuan' => 'Box', 'singkatan' => 'box'],
        ];

        foreach ($satuans as $satuan) {
            SatuanObat::updateOrCreate(
                ['id' => $satuan['id']], 
                array_merge($satuan, ['is_active' => true])
            );
        }

        $this->command->info('✅ Master data obat berhasil di-seed!');
        $this->command->info("   - {$this->count(KategoriObat::class)} Kategori");
        $this->command->info("   - {$this->count(JenisObat::class)} Jenis");
        $this->command->info("   - {$this->count(SatuanObat::class)} Satuan");
    }

    private function count($model)
    {
        return $model::count();
    }
}
