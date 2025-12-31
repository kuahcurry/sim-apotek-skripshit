<?php

namespace Database\Seeders;

use App\Models\UnitRumahSakit;
use Illuminate\Database\Seeder;

class UnitRumahSakitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            [
                'nama_unit' => 'Instalasi Gawat Darurat (IGD)',
                'kode_unit' => 'IGD',
                'penanggung_jawab' => 'dr. Emergency',
                'no_telepon' => '119',
                'lokasi' => 'Lantai 1, Gedung A',
            ],
            [
                'nama_unit' => 'Intensive Care Unit (ICU)',
                'kode_unit' => 'ICU',
                'penanggung_jawab' => 'dr. Intensive',
                'no_telepon' => '201',
                'lokasi' => 'Lantai 2, Gedung A',
            ],
            [
                'nama_unit' => 'Rawat Inap Kelas I',
                'kode_unit' => 'RI-1',
                'penanggung_jawab' => 'Perawat Senior',
                'no_telepon' => '301',
                'lokasi' => 'Lantai 3, Gedung B',
            ],
            [
                'nama_unit' => 'Rawat Inap Kelas II',
                'kode_unit' => 'RI-2',
                'penanggung_jawab' => 'Perawat Senior',
                'no_telepon' => '302',
                'lokasi' => 'Lantai 3, Gedung B',
            ],
            [
                'nama_unit' => 'Rawat Inap Kelas III',
                'kode_unit' => 'RI-3',
                'penanggung_jawab' => 'Perawat Senior',
                'no_telepon' => '303',
                'lokasi' => 'Lantai 3, Gedung B',
            ],
            [
                'nama_unit' => 'Poliklinik Umum',
                'kode_unit' => 'POLI-U',
                'penanggung_jawab' => 'dr. Umum',
                'no_telepon' => '101',
                'lokasi' => 'Lantai 1, Gedung C',
            ],
            [
                'nama_unit' => 'Poliklinik Gigi',
                'kode_unit' => 'POLI-G',
                'penanggung_jawab' => 'drg. Gigi',
                'no_telepon' => '102',
                'lokasi' => 'Lantai 1, Gedung C',
            ],
            [
                'nama_unit' => 'Poliklinik Anak',
                'kode_unit' => 'POLI-A',
                'penanggung_jawab' => 'dr. Anak',
                'no_telepon' => '103',
                'lokasi' => 'Lantai 1, Gedung C',
            ],
            [
                'nama_unit' => 'Poliklinik Kebidanan',
                'kode_unit' => 'POLI-K',
                'penanggung_jawab' => 'dr. Obgyn',
                'no_telepon' => '104',
                'lokasi' => 'Lantai 2, Gedung C',
            ],
            [
                'nama_unit' => 'Poliklinik Bedah',
                'kode_unit' => 'POLI-B',
                'penanggung_jawab' => 'dr. Bedah',
                'no_telepon' => '105',
                'lokasi' => 'Lantai 2, Gedung C',
            ],
            [
                'nama_unit' => 'Poliklinik Penyakit Dalam',
                'kode_unit' => 'POLI-PD',
                'penanggung_jawab' => 'dr. Penyakit Dalam',
                'no_telepon' => '106',
                'lokasi' => 'Lantai 2, Gedung C',
            ],
            [
                'nama_unit' => 'Ruang Operasi (OK)',
                'kode_unit' => 'OK',
                'penanggung_jawab' => 'dr. Anestesi',
                'no_telepon' => '401',
                'lokasi' => 'Lantai 4, Gedung A',
            ],
            [
                'nama_unit' => 'Unit Hemodialisa',
                'kode_unit' => 'HD',
                'penanggung_jawab' => 'dr. Nefrologi',
                'no_telepon' => '501',
                'lokasi' => 'Lantai 5, Gedung A',
            ],
            [
                'nama_unit' => 'Ruang Bersalin',
                'kode_unit' => 'VK',
                'penanggung_jawab' => 'Bidan Senior',
                'no_telepon' => '205',
                'lokasi' => 'Lantai 2, Gedung B',
            ],
            [
                'nama_unit' => 'Laboratorium',
                'kode_unit' => 'LAB',
                'penanggung_jawab' => 'dr. Patologi',
                'no_telepon' => '110',
                'lokasi' => 'Lantai 1, Gedung D',
            ],
            [
                'nama_unit' => 'Radiologi',
                'kode_unit' => 'RAD',
                'penanggung_jawab' => 'dr. Radiologi',
                'no_telepon' => '111',
                'lokasi' => 'Lantai 1, Gedung D',
            ],
            [
                'nama_unit' => 'Rehabilitasi Medik',
                'kode_unit' => 'REHAB',
                'penanggung_jawab' => 'dr. Rehabilitasi',
                'no_telepon' => '601',
                'lokasi' => 'Lantai 1, Gedung E',
            ],
            [
                'nama_unit' => 'NICU/PICU',
                'kode_unit' => 'NICU',
                'penanggung_jawab' => 'dr. Neonatologi',
                'no_telepon' => '202',
                'lokasi' => 'Lantai 2, Gedung A',
            ],
        ];

        foreach ($units as $unit) {
            UnitRumahSakit::create($unit);
        }
    }
}
