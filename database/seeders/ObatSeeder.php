<?php

namespace Database\Seeders;

use App\Models\BatchObat;
use App\Models\Obat;
use Illuminate\Database\Seeder;

class ObatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample medicines with Indonesian common drugs
        $obats = [
            [
                'kode_obat' => 'OBT-001',
                'nama_obat' => 'Paracetamol 500mg',
                'nama_generik' => 'Paracetamol',
                'nama_brand' => 'Panadol',
                'kategori_id' => 3, // Antipiretik
                'jenis_id' => 1, // Tablet
                'satuan_id' => 1, // Tablet
                'stok_minimum' => 100,
                'harga_beli' => 500,
                'harga_jual' => 1000,
                'lokasi_penyimpanan' => 'Rak A-1',
                'deskripsi' => 'Obat penurun demam dan pereda nyeri',
                'indikasi' => 'Demam, sakit kepala, nyeri ringan hingga sedang',
                'efek_samping' => 'Jarang terjadi, dapat menyebabkan reaksi alergi pada beberapa orang',
                'kontraindikasi' => 'Hipersensitif terhadap paracetamol, gangguan fungsi hati berat',
            ],
            [
                'kode_obat' => 'OBT-002',
                'nama_obat' => 'Amoxicillin 500mg',
                'nama_generik' => 'Amoxicillin',
                'nama_brand' => 'Amoxsan',
                'kategori_id' => 1, // Antibiotik
                'jenis_id' => 2, // Kapsul
                'satuan_id' => 2, // Kapsul
                'stok_minimum' => 50,
                'harga_beli' => 1500,
                'harga_jual' => 2500,
                'lokasi_penyimpanan' => 'Rak B-1',
                'deskripsi' => 'Antibiotik golongan penisilin',
                'indikasi' => 'Infeksi saluran pernapasan, infeksi saluran kemih, infeksi kulit',
                'efek_samping' => 'Diare, mual, ruam kulit',
                'kontraindikasi' => 'Hipersensitif terhadap penisilin',
            ],
            [
                'kode_obat' => 'OBT-003',
                'nama_obat' => 'Omeprazole 20mg',
                'nama_generik' => 'Omeprazole',
                'nama_brand' => 'Losec',
                'kategori_id' => 8, // Antasida
                'jenis_id' => 2, // Kapsul
                'satuan_id' => 2, // Kapsul
                'stok_minimum' => 30,
                'harga_beli' => 3000,
                'harga_jual' => 5000,
                'lokasi_penyimpanan' => 'Rak C-1',
                'deskripsi' => 'Penghambat pompa proton untuk asam lambung',
                'indikasi' => 'GERD, tukak lambung, tukak duodenum',
                'efek_samping' => 'Sakit kepala, diare, mual',
                'kontraindikasi' => 'Hipersensitif terhadap omeprazole',
            ],
            [
                'kode_obat' => 'OBT-004',
                'nama_obat' => 'Cetirizine 10mg',
                'nama_generik' => 'Cetirizine',
                'nama_brand' => 'Incidal',
                'kategori_id' => 7, // Antihistamin
                'jenis_id' => 1, // Tablet
                'satuan_id' => 1, // Tablet
                'stok_minimum' => 50,
                'harga_beli' => 800,
                'harga_jual' => 1500,
                'lokasi_penyimpanan' => 'Rak A-2',
                'deskripsi' => 'Antihistamin generasi kedua',
                'indikasi' => 'Rinitis alergi, urtikaria, gatal-gatal',
                'efek_samping' => 'Mengantuk ringan, mulut kering',
                'kontraindikasi' => 'Hipersensitif terhadap cetirizine',
            ],
            [
                'kode_obat' => 'OBT-005',
                'nama_obat' => 'Metformin 500mg',
                'nama_generik' => 'Metformin HCl',
                'nama_brand' => 'Glucophage',
                'kategori_id' => 6, // Antidiabetes
                'jenis_id' => 1, // Tablet
                'satuan_id' => 1, // Tablet
                'stok_minimum' => 100,
                'harga_beli' => 600,
                'harga_jual' => 1200,
                'lokasi_penyimpanan' => 'Rak D-1',
                'deskripsi' => 'Obat antidiabetes oral',
                'indikasi' => 'Diabetes mellitus tipe 2',
                'efek_samping' => 'Mual, diare, nyeri perut',
                'kontraindikasi' => 'Gangguan ginjal berat, asidosis metabolik',
            ],
            [
                'kode_obat' => 'OBT-006',
                'nama_obat' => 'Amlodipine 5mg',
                'nama_generik' => 'Amlodipine Besylate',
                'nama_brand' => 'Norvasc',
                'kategori_id' => 5, // Antihipertensi
                'jenis_id' => 1, // Tablet
                'satuan_id' => 1, // Tablet
                'stok_minimum' => 50,
                'harga_beli' => 2000,
                'harga_jual' => 3500,
                'lokasi_penyimpanan' => 'Rak D-2',
                'deskripsi' => 'Penghambat kanal kalsium',
                'indikasi' => 'Hipertensi, angina pektoris',
                'efek_samping' => 'Edema perifer, sakit kepala, pusing',
                'kontraindikasi' => 'Hipotensi berat, syok kardiogenik',
            ],
            [
                'kode_obat' => 'OBT-007',
                'nama_obat' => 'Salbutamol Inhaler 100mcg',
                'nama_generik' => 'Salbutamol',
                'nama_brand' => 'Ventolin',
                'kategori_id' => 9, // Bronkodilator
                'jenis_id' => 18, // Inhaler
                'satuan_id' => 15, // Buah
                'stok_minimum' => 20,
                'harga_beli' => 35000,
                'harga_jual' => 55000,
                'lokasi_penyimpanan' => 'Rak E-1',
                'deskripsi' => 'Bronkodilator untuk asma',
                'indikasi' => 'Asma bronkial, bronkospasme',
                'efek_samping' => 'Tremor, palpitasi, sakit kepala',
                'kontraindikasi' => 'Hipersensitif terhadap salbutamol',
            ],
            [
                'kode_obat' => 'OBT-008',
                'nama_obat' => 'Vitamin C 500mg',
                'nama_generik' => 'Ascorbic Acid',
                'nama_brand' => 'Vitacimin',
                'kategori_id' => 11, // Vitamin & Suplemen
                'jenis_id' => 1, // Tablet
                'satuan_id' => 1, // Tablet
                'stok_minimum' => 100,
                'harga_beli' => 300,
                'harga_jual' => 600,
                'lokasi_penyimpanan' => 'Rak F-1',
                'deskripsi' => 'Suplemen vitamin C',
                'indikasi' => 'Pencegahan dan pengobatan defisiensi vitamin C',
                'efek_samping' => 'Gangguan pencernaan pada dosis tinggi',
                'kontraindikasi' => 'Batu ginjal oksalat',
            ],
            [
                'kode_obat' => 'OBT-009',
                'nama_obat' => 'NaCl 0.9% 500ml',
                'nama_generik' => 'Sodium Chloride',
                'nama_brand' => 'Otsu-NS',
                'kategori_id' => 18, // Cairan Infus
                'jenis_id' => 8, // Infus
                'satuan_id' => 4, // Botol
                'stok_minimum' => 50,
                'harga_beli' => 12000,
                'harga_jual' => 18000,
                'lokasi_penyimpanan' => 'Rak G-1',
                'deskripsi' => 'Cairan infus isotonik',
                'indikasi' => 'Penggantian cairan dan elektrolit',
                'efek_samping' => 'Overload cairan jika berlebihan',
                'kontraindikasi' => 'Gagal jantung kongestif, edema',
            ],
            [
                'kode_obat' => 'OBT-010',
                'nama_obat' => 'Ibuprofen 400mg',
                'nama_generik' => 'Ibuprofen',
                'nama_brand' => 'Proris',
                'kategori_id' => 4, // Antiinflamasi
                'jenis_id' => 1, // Tablet
                'satuan_id' => 1, // Tablet
                'stok_minimum' => 50,
                'harga_beli' => 800,
                'harga_jual' => 1500,
                'lokasi_penyimpanan' => 'Rak A-3',
                'deskripsi' => 'NSAID untuk nyeri dan radang',
                'indikasi' => 'Nyeri, demam, peradangan',
                'efek_samping' => 'Gangguan pencernaan, sakit kepala',
                'kontraindikasi' => 'Tukak lambung aktif, gagal ginjal berat',
            ],
        ];

        foreach ($obats as $obatData) {
            $obat = Obat::create($obatData);

            // Create sample batches for each medicine
            $this->createSampleBatches($obat);
        }
    }

    private function createSampleBatches(Obat $obat): void
    {
        // Create 2-3 batches per medicine
        $batchCount = rand(2, 3);
        $totalStok = 0;

        for ($i = 1; $i <= $batchCount; $i++) {
            $stokAwal = rand(50, 200);
            $stokTersedia = rand(intval($stokAwal * 0.3), $stokAwal);
            $totalStok += $stokTersedia;

            $tanggalMasuk = now()->subDays(rand(30, 180));
            $tanggalExpired = $tanggalMasuk->copy()->addMonths(rand(12, 36));

            // Some batches should be expiring soon for testing alerts
            if ($i === 1 && rand(1, 3) === 1) {
                $tanggalExpired = now()->addDays(rand(7, 30));
            }

            BatchObat::create([
                'obat_id' => $obat->id,
                'nomor_batch' => sprintf('BATCH-%s-%03d', $obat->kode_obat, $i),
                'tanggal_produksi' => $tanggalMasuk->copy()->subMonths(2),
                'tanggal_expired' => $tanggalExpired,
                'tanggal_masuk' => $tanggalMasuk,
                'stok_awal' => $stokAwal,
                'stok_tersedia' => $stokTersedia,
                'harga_beli' => $obat->harga_beli,
                'status' => $tanggalExpired->isPast() ? 'expired' : 'active',
                'catatan' => "Batch ke-{$i} untuk {$obat->nama_obat}",
            ]);
        }

        // Update total stock in medicine
        $obat->update(['stok_total' => $totalStok]);
    }
}
