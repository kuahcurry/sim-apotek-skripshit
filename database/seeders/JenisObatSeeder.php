<?php

namespace Database\Seeders;

use App\Models\JenisObat;
use Illuminate\Database\Seeder;

class JenisObatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jenis = [
            ['nama_jenis' => 'Tablet', 'deskripsi' => 'Obat bentuk tablet padat'],
            ['nama_jenis' => 'Kapsul', 'deskripsi' => 'Obat dalam cangkang kapsul'],
            ['nama_jenis' => 'Kaplet', 'deskripsi' => 'Tablet berbentuk kapsul'],
            ['nama_jenis' => 'Sirup', 'deskripsi' => 'Obat cair manis'],
            ['nama_jenis' => 'Suspensi', 'deskripsi' => 'Obat cair dengan partikel tersuspensi'],
            ['nama_jenis' => 'Emulsi', 'deskripsi' => 'Campuran dua cairan tidak larut'],
            ['nama_jenis' => 'Injeksi', 'deskripsi' => 'Obat suntik'],
            ['nama_jenis' => 'Infus', 'deskripsi' => 'Cairan infus intravena'],
            ['nama_jenis' => 'Salep', 'deskripsi' => 'Obat oles setengah padat'],
            ['nama_jenis' => 'Krim', 'deskripsi' => 'Obat oles berbentuk krim'],
            ['nama_jenis' => 'Gel', 'deskripsi' => 'Obat oles berbentuk gel'],
            ['nama_jenis' => 'Lotion', 'deskripsi' => 'Cairan untuk kulit'],
            ['nama_jenis' => 'Tetes Mata', 'deskripsi' => 'Obat tetes untuk mata'],
            ['nama_jenis' => 'Tetes Telinga', 'deskripsi' => 'Obat tetes untuk telinga'],
            ['nama_jenis' => 'Tetes Hidung', 'deskripsi' => 'Obat tetes untuk hidung'],
            ['nama_jenis' => 'Suppositoria', 'deskripsi' => 'Obat yang dimasukkan melalui rektum'],
            ['nama_jenis' => 'Ovula', 'deskripsi' => 'Obat yang dimasukkan melalui vagina'],
            ['nama_jenis' => 'Inhaler', 'deskripsi' => 'Obat hirup untuk pernapasan'],
            ['nama_jenis' => 'Nebulizer', 'deskripsi' => 'Obat uap untuk pernapasan'],
            ['nama_jenis' => 'Patch', 'deskripsi' => 'Obat tempel transdermal'],
            ['nama_jenis' => 'Serbuk', 'deskripsi' => 'Obat dalam bentuk serbuk'],
            ['nama_jenis' => 'Granul', 'deskripsi' => 'Obat dalam bentuk butiran'],
            ['nama_jenis' => 'Plester', 'deskripsi' => 'Plester obat'],
            ['nama_jenis' => 'Spray', 'deskripsi' => 'Obat semprot'],
            ['nama_jenis' => 'Lainnya', 'deskripsi' => 'Bentuk sediaan lainnya'],
        ];

        foreach ($jenis as $j) {
            JenisObat::create($j);
        }
    }
}
