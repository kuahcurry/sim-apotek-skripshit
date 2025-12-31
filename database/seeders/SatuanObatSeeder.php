<?php

namespace Database\Seeders;

use App\Models\SatuanObat;
use Illuminate\Database\Seeder;

class SatuanObatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $satuans = [
            ['nama_satuan' => 'Tablet', 'singkatan' => 'tab'],
            ['nama_satuan' => 'Kapsul', 'singkatan' => 'kaps'],
            ['nama_satuan' => 'Kaplet', 'singkatan' => 'kapl'],
            ['nama_satuan' => 'Botol', 'singkatan' => 'btl'],
            ['nama_satuan' => 'Ampul', 'singkatan' => 'amp'],
            ['nama_satuan' => 'Vial', 'singkatan' => 'vial'],
            ['nama_satuan' => 'Tube', 'singkatan' => 'tube'],
            ['nama_satuan' => 'Pot', 'singkatan' => 'pot'],
            ['nama_satuan' => 'Sachet', 'singkatan' => 'sach'],
            ['nama_satuan' => 'Strip', 'singkatan' => 'str'],
            ['nama_satuan' => 'Blister', 'singkatan' => 'bls'],
            ['nama_satuan' => 'Box', 'singkatan' => 'box'],
            ['nama_satuan' => 'Dus', 'singkatan' => 'dus'],
            ['nama_satuan' => 'Pack', 'singkatan' => 'pack'],
            ['nama_satuan' => 'Buah', 'singkatan' => 'bh'],
            ['nama_satuan' => 'Pcs', 'singkatan' => 'pcs'],
            ['nama_satuan' => 'Set', 'singkatan' => 'set'],
            ['nama_satuan' => 'Liter', 'singkatan' => 'L'],
            ['nama_satuan' => 'Mililiter', 'singkatan' => 'mL'],
            ['nama_satuan' => 'Gram', 'singkatan' => 'g'],
            ['nama_satuan' => 'Miligram', 'singkatan' => 'mg'],
            ['nama_satuan' => 'Kilogram', 'singkatan' => 'kg'],
            ['nama_satuan' => 'Suppositoria', 'singkatan' => 'supp'],
            ['nama_satuan' => 'Ovula', 'singkatan' => 'ovl'],
            ['nama_satuan' => 'Flakon', 'singkatan' => 'flk'],
        ];

        foreach ($satuans as $satuan) {
            SatuanObat::create($satuan);
        }
    }
}
