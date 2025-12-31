<?php

namespace Database\Seeders;

use App\Models\KategoriObat;
use Illuminate\Database\Seeder;

class KategoriObatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kategoris = [
            ['nama_kategori' => 'Antibiotik', 'deskripsi' => 'Obat untuk melawan infeksi bakteri'],
            ['nama_kategori' => 'Analgesik', 'deskripsi' => 'Obat penghilang rasa sakit'],
            ['nama_kategori' => 'Antipiretik', 'deskripsi' => 'Obat penurun demam'],
            ['nama_kategori' => 'Antiinflamasi', 'deskripsi' => 'Obat antiradang'],
            ['nama_kategori' => 'Antihipertensi', 'deskripsi' => 'Obat tekanan darah tinggi'],
            ['nama_kategori' => 'Antidiabetes', 'deskripsi' => 'Obat untuk diabetes mellitus'],
            ['nama_kategori' => 'Antihistamin', 'deskripsi' => 'Obat alergi'],
            ['nama_kategori' => 'Antasida', 'deskripsi' => 'Obat maag dan asam lambung'],
            ['nama_kategori' => 'Bronkodilator', 'deskripsi' => 'Obat untuk saluran pernapasan'],
            ['nama_kategori' => 'Kardiovaskular', 'deskripsi' => 'Obat untuk jantung dan pembuluh darah'],
            ['nama_kategori' => 'Vitamin & Suplemen', 'deskripsi' => 'Vitamin dan suplemen kesehatan'],
            ['nama_kategori' => 'Antiemetik', 'deskripsi' => 'Obat antimual dan muntah'],
            ['nama_kategori' => 'Laksatif', 'deskripsi' => 'Obat pencahar'],
            ['nama_kategori' => 'Antidiare', 'deskripsi' => 'Obat untuk diare'],
            ['nama_kategori' => 'Sedatif & Hipnotik', 'deskripsi' => 'Obat penenang dan tidur'],
            ['nama_kategori' => 'Antiseptik', 'deskripsi' => 'Obat antiseptik dan desinfektan'],
            ['nama_kategori' => 'Kortikosteroid', 'deskripsi' => 'Obat hormon steroid'],
            ['nama_kategori' => 'Cairan Infus', 'deskripsi' => 'Cairan infus dan elektrolit'],
            ['nama_kategori' => 'Obat Mata', 'deskripsi' => 'Obat tetes mata dan salep mata'],
            ['nama_kategori' => 'Obat Kulit', 'deskripsi' => 'Obat topikal untuk kulit'],
            ['nama_kategori' => 'Obat THT', 'deskripsi' => 'Obat telinga, hidung, tenggorokan'],
            ['nama_kategori' => 'Narkotika', 'deskripsi' => 'Obat golongan narkotika (terbatas)'],
            ['nama_kategori' => 'Psikotropika', 'deskripsi' => 'Obat golongan psikotropika (terbatas)'],
            ['nama_kategori' => 'Vaksin', 'deskripsi' => 'Vaksin dan imunisasi'],
            ['nama_kategori' => 'Lainnya', 'deskripsi' => 'Kategori obat lainnya'],
        ];

        foreach ($kategoris as $kategori) {
            KategoriObat::create($kategori);
        }
    }
}
