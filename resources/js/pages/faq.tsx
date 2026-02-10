import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { MessageCircleQuestion, Package, TrendingUp, ClipboardCheck, FileText, Users, Settings, AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'FAQ', href: '/faq' },
];

export default function FAQ() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="FAQ - Frequently Asked Questions" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                        <MessageCircleQuestion className="size-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">FAQ</h1>
                        <p className="text-muted-foreground">
                            Frequently Asked Questions - Panduan penggunaan sistem
                        </p>
                    </div>
                </div>

                {/* General Questions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="size-5" />
                            Pertanyaan Umum
                        </CardTitle>
                        <CardDescription>
                            Informasi dasar tentang sistem SIMRS Apotek PKU
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Apa itu SIMRS Apotek PKU?</AccordionTrigger>
                                <AccordionContent>
                                    SIMRS Apotek PKU adalah Sistem Informasi Manajemen Rumah Sakit untuk bagian farmasi/apotek 
                                    PKU Muhammadiyah Gombong. Sistem ini membantu mengelola inventori obat, transaksi, stok opname, 
                                    resep, dan pelaporan secara terintegrasi.
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2">
                                <AccordionTrigger>Siapa saja yang bisa menggunakan sistem ini?</AccordionTrigger>
                                <AccordionContent>
                                    Sistem ini dapat digunakan oleh:
                                    <ul className="mt-2 list-inside list-disc space-y-1">
                                        <li><strong>Admin:</strong> Memiliki akses penuh ke semua fitur sistem</li>
                                        <li><strong>Apoteker:</strong> Dapat mengelola obat, transaksi, resep, dan laporan</li>
                                        <li><strong>Staff Farmasi:</strong> Dapat mengelola stok dan transaksi harian</li>
                                        <li><strong>Unit Rumah Sakit:</strong> Dapat membuat permintaan obat dari apotek</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3">
                                <AccordionTrigger>Bagaimana cara login ke sistem?</AccordionTrigger>
                                <AccordionContent>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Buka halaman login sistem</li>
                                        <li>Masukkan email dan password yang telah diberikan admin</li>
                                        <li>Klik tombol "Masuk"</li>
                                        <li>Jika Two-Factor Authentication aktif, masukkan kode verifikasi</li>
                                    </ol>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Hubungi administrator jika lupa password atau belum memiliki akun.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger>Bagaimana cara mengubah password?</AccordionTrigger>
                                <AccordionContent>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Klik foto profil di pojok kanan atas</li>
                                        <li>Pilih menu "Settings"</li>
                                        <li>Klik tab "Password"</li>
                                        <li>Masukkan password lama dan password baru</li>
                                        <li>Klik "Simpan Perubahan"</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                {/* Medicine Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="size-5" />
                            Manajemen Obat
                        </CardTitle>
                        <CardDescription>
                            Cara mengelola data obat dan inventori
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="medicine-1">
                                <AccordionTrigger>Bagaimana cara menambah obat baru?</AccordionTrigger>
                                <AccordionContent>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Buka menu "Obat" → "Data Obat"</li>
                                        <li>Klik tombol "Tambah Obat" di pojok kanan atas</li>
                                        <li>Isi form dengan data obat:
                                            <ul className="ml-6 mt-1 list-inside list-disc">
                                                <li>Kode Obat (unik, tidak boleh duplikat)</li>
                                                <li>Nama Obat</li>
                                                <li>Nama Generik</li>
                                                <li>Kategori, Jenis, dan Satuan</li>
                                                <li>Stok dan Harga</li>
                                                <li>Informasi tambahan (indikasi, efek samping, dll)</li>
                                            </ul>
                                        </li>
                                        <li>Klik "Simpan"</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="medicine-2">
                                <AccordionTrigger>Bagaimana cara import obat dari Excel/CSV?</AccordionTrigger>
                                <AccordionContent>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Buka menu "Obat" → "Data Obat"</li>
                                        <li>Klik tombol "Tambah Obat"</li>
                                        <li>Pilih tab "Import Excel/CSV"</li>
                                        <li>Download template Excel dengan klik "Download Template"</li>
                                        <li>Isi template dengan data obat sesuai format</li>
                                        <li>Upload file yang sudah diisi</li>
                                        <li>Klik "Import"</li>
                                    </ol>
                                    <p className="mt-2 text-sm text-amber-600">
                                        ⚠️ Pastikan kategori_id, jenis_id, dan satuan_id sudah ada di Master Data.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="medicine-3">
                                <AccordionTrigger>Apa itu Batch Obat dan bagaimana mengelolanya?</AccordionTrigger>
                                <AccordionContent>
                                    <strong>Batch Obat</strong> adalah pengelompokan obat berdasarkan nomor batch dan tanggal expired 
                                    dari supplier. Setiap batch memiliki:
                                    <ul className="mt-2 list-inside list-disc space-y-1">
                                        <li>Nomor Batch unik</li>
                                        <li>Tanggal Expired</li>
                                        <li>Stok tersedia</li>
                                        <li>Harga beli dari supplier</li>
                                    </ul>
                                    <p className="mt-2"><strong>Cara menambah batch:</strong></p>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Buka menu "Obat" → "Batch Obat"</li>
                                        <li>Klik "Tambah Batch"</li>
                                        <li>Pilih obat, masukkan nomor batch, tanggal expired, dan stok</li>
                                        <li>Klik "Simpan"</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="medicine-4">
                                <AccordionTrigger>Bagaimana sistem mendeteksi obat kadaluarsa?</AccordionTrigger>
                                <AccordionContent>
                                    Sistem otomatis mendeteksi obat yang akan/sudah kadaluarsa:
                                    <ul className="mt-2 list-inside list-disc space-y-1">
                                        <li><span className="text-red-600">Merah:</span> Sudah kadaluarsa (lewat tanggal expired)</li>
                                        <li><span className="text-amber-600">Kuning:</span> Akan kadaluarsa dalam 3 bulan</li>
                                        <li><span className="text-blue-600">Biru:</span> Akan kadaluarsa dalam 6 bulan</li>
                                    </ul>
                                    <p className="mt-2">
                                        Dashboard menampilkan jumlah batch yang akan kadaluarsa, dan Anda bisa melihat 
                                        detail di menu "Laporan" → "Laporan Kadaluarsa".
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="medicine-5">
                                <AccordionTrigger>Apa yang harus dilakukan jika obat expired?</AccordionTrigger>
                                <AccordionContent>
                                    Obat yang sudah expired harus dimusnahkan:
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Buka menu "Obat" → "Pemusnahan"</li>
                                        <li>Klik "Buat Pemusnahan Baru"</li>
                                        <li>Pilih batch obat yang akan dimusnahkan</li>
                                        <li>Isi alasan pemusnahan dan metode</li>
                                        <li>Tambahkan saksi (minimal 2 orang)</li>
                                        <li>Klik "Simpan"</li>
                                    </ol>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Berita acara pemusnahan dapat dicetak untuk dokumentasi dan audit.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                {/* Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="size-5" />
                            Transaksi
                        </CardTitle>
                        <CardDescription>
                            Cara mencatat transaksi masuk dan keluar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="trans-1">
                                <AccordionTrigger>Bagaimana cara mencatat barang masuk?</AccordionTrigger>
                                <AccordionContent>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Buka menu "Transaksi" → "Barang Masuk"</li>
                                        <li>Klik "Buat Transaksi Baru"</li>
                                        <li>Pilih jenis transaksi "Masuk"</li>
                                        <li>Pilih supplier (jika dari pembelian)</li>
                                        <li>Tambahkan obat:
                                            <ul className="ml-6 mt-1 list-inside list-disc">
                                                <li>Pilih obat</li>
                                                <li>Pilih/buat batch</li>
                                                <li>Masukkan jumlah</li>
                                            </ul>
                                        </li>
                                        <li>Isi nomor faktur dan catatan</li>
                                        <li>Klik "Simpan Transaksi"</li>
                                    </ol>
                                    <p className="mt-2 text-sm text-green-600">
                                        ✓ Stok akan otomatis bertambah setelah transaksi disimpan.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="trans-2">
                                <AccordionTrigger>Bagaimana cara mencatat barang keluar?</AccordionTrigger>
                                <AccordionContent>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Buka menu "Transaksi" → "Barang Keluar"</li>
                                        <li>Klik "Buat Transaksi Baru"</li>
                                        <li>Pilih jenis transaksi "Keluar"</li>
                                        <li>Pilih tujuan (unit rumah sakit atau pasien)</li>
                                        <li>Tambahkan obat yang keluar</li>
                                        <li>Sistem akan otomatis menggunakan batch dengan FEFO (First Expired First Out)</li>
                                        <li>Klik "Simpan Transaksi"</li>
                                    </ol>
                                    <p className="mt-2 text-sm text-amber-600">
                                        ⚠️ Pastikan stok mencukupi sebelum mencatat transaksi keluar.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="trans-3">
                                <AccordionTrigger>Apa itu FEFO dan mengapa penting?</AccordionTrigger>
                                <AccordionContent>
                                    <strong>FEFO (First Expired First Out)</strong> adalah metode pengeluaran obat dimana 
                                    obat dengan tanggal expired paling dekat dikeluarkan terlebih dahulu.
                                    <p className="mt-2"><strong>Kenapa penting?</strong></p>
                                    <ul className="mt-1 list-inside list-disc space-y-1">
                                        <li>Mencegah obat expired sebelum digunakan</li>
                                        <li>Mengurangi pemborosan (waste)</li>
                                        <li>Memastikan obat yang diberikan masih layak konsumsi</li>
                                        <li>Sesuai standar farmasi rumah sakit</li>
                                    </ul>
                                    <p className="mt-2 text-sm text-blue-600">
                                        💡 Sistem secara otomatis menerapkan FEFO saat Anda menambahkan obat ke transaksi keluar.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="trans-4">
                                <AccordionTrigger>Bagaimana cara melihat riwayat transaksi?</AccordionTrigger>
                                <AccordionContent>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Buka menu "Transaksi" → "Semua Transaksi"</li>
                                        <li>Gunakan filter untuk mempersempit pencarian:
                                            <ul className="ml-6 mt-1 list-inside list-disc">
                                                <li>Jenis transaksi (Masuk/Keluar)</li>
                                                <li>Tanggal</li>
                                                <li>Nomor transaksi</li>
                                            </ul>
                                        </li>
                                        <li>Klik pada transaksi untuk melihat detail lengkap</li>
                                        <li>Cetak atau export jika diperlukan</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                {/* Stock Opname */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="size-5" />
                            Stok Opname
                        </CardTitle>
                        <CardDescription>
                            Cara melakukan perhitungan stok fisik
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="so-1">
                                <AccordionTrigger>Apa itu Stok Opname?</AccordionTrigger>
                                <AccordionContent>
                                    <strong>Stok Opname</strong> adalah proses perhitungan fisik obat yang ada di apotek 
                                    dan membandingkannya dengan stok di sistem. Tujuannya:
                                    <ul className="mt-2 list-inside list-disc space-y-1">
                                        <li>Memastikan data stok di sistem akurat</li>
                                        <li>Mendeteksi kehilangan atau kelebihan stok</li>
                                        <li>Audit internal</li>
                                        <li>Pemenuhan regulasi</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="so-2">
                                <AccordionTrigger>Bagaimana cara melakukan Stok Opname?</AccordionTrigger>
                                <AccordionContent>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Buka menu "Stok Opname"</li>
                                        <li>Klik "Buat Stok Opname"</li>
                                        <li>Pilih unit dan tanggal opname</li>
                                        <li>Klik "Mulai Opname"</li>
                                        <li>Untuk setiap batch obat:
                                            <ul className="ml-6 mt-1 list-inside list-disc">
                                                <li>Hitung jumlah fisik di rak</li>
                                                <li>Masukkan jumlah ke kolom "Stok Fisik"</li>
                                                <li>Sistem otomatis menghitung selisih</li>
                                                <li>Isi keterangan jika ada selisih</li>
                                            </ul>
                                        </li>
                                        <li>Klik "Selesaikan Opname"</li>
                                        <li>Admin/supervisor akan menyetujui</li>
                                    </ol>
                                    <p className="mt-2 text-sm text-blue-600">
                                        💡 Disarankan melakukan stok opname minimal 1 bulan sekali atau sesuai kebijakan rumah sakit.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="so-3">
                                <AccordionTrigger>Bagaimana jika ada selisih stok?</AccordionTrigger>
                                <AccordionContent>
                                    Jika terjadi selisih antara stok sistem dan stok fisik:
                                    <ul className="mt-2 list-inside list-disc space-y-1">
                                        <li><strong>Selisih Positif:</strong> Stok fisik lebih banyak dari sistem (mungkin ada transaksi yang belum dicatat)</li>
                                        <li><strong>Selisih Negatif:</strong> Stok fisik lebih sedikit dari sistem (mungkin ada kehilangan atau kerusakan)</li>
                                    </ul>
                                    <p className="mt-2"><strong>Langkah yang harus dilakukan:</strong></p>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Cek ulang perhitungan fisik</li>
                                        <li>Cek riwayat transaksi terakhir</li>
                                        <li>Isi keterangan lengkap pada kolom catatan</li>
                                        <li>Laporkan ke supervisor untuk persetujuan</li>
                                        <li>Setelah disetujui, sistem akan menyesuaikan stok otomatis</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                {/* Reports */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="size-5" />
                            Laporan
                        </CardTitle>
                        <CardDescription>
                            Cara membuat dan mencetak laporan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="report-1">
                                <AccordionTrigger>Laporan apa saja yang tersedia?</AccordionTrigger>
                                <AccordionContent>
                                    Sistem menyediakan 3 jenis laporan utama:
                                    <ul className="mt-2 list-inside list-disc space-y-1">
                                        <li><strong>Laporan Stok:</strong> Daftar obat dengan stok saat ini, stok minimum, dan status</li>
                                        <li><strong>Laporan Transaksi:</strong> Riwayat semua transaksi masuk dan keluar dengan filter tanggal</li>
                                        <li><strong>Laporan Kadaluarsa:</strong> Daftar batch obat yang sudah/akan kadaluarsa</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="report-2">
                                <AccordionTrigger>Bagaimana cara membuat laporan?</AccordionTrigger>
                                <AccordionContent>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Buka menu "Laporan"</li>
                                        <li>Pilih jenis laporan yang diinginkan</li>
                                        <li>Gunakan filter untuk menyaring data:
                                            <ul className="ml-6 mt-1 list-inside list-disc">
                                                <li>Rentang tanggal</li>
                                                <li>Kategori obat</li>
                                                <li>Status stok</li>
                                            </ul>
                                        </li>
                                        <li>Klik "Tampilkan Laporan"</li>
                                        <li>Gunakan tombol "Export Excel" atau "Cetak" untuk menyimpan</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="report-3">
                                <AccordionTrigger>Bagaimana cara export laporan ke Excel?</AccordionTrigger>
                                <AccordionContent>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Tampilkan laporan yang diinginkan dengan filter yang sesuai</li>
                                        <li>Klik tombol "Export Excel" di pojok kanan atas</li>
                                        <li>File Excel akan otomatis didownload</li>
                                        <li>Buka file dengan Microsoft Excel atau Google Sheets</li>
                                    </ol>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Format Excel memudahkan analisis lebih lanjut atau presentasi ke manajemen.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                {/* User Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="size-5" />
                            Manajemen Pengguna
                        </CardTitle>
                        <CardDescription>
                            Cara mengelola akun pengguna (khusus Admin)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="user-1">
                                <AccordionTrigger>Bagaimana cara menambah pengguna baru? (Admin)</AccordionTrigger>
                                <AccordionContent>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Buka menu "Users" (hanya tersedia untuk Admin)</li>
                                        <li>Klik "Tambah User"</li>
                                        <li>Isi data pengguna:
                                            <ul className="ml-6 mt-1 list-inside list-disc">
                                                <li>Nama lengkap</li>
                                                <li>Email (akan digunakan untuk login)</li>
                                                <li>Password</li>
                                                <li>Role (Admin/Pharmacist/Staff)</li>
                                            </ul>
                                        </li>
                                        <li>Klik "Simpan"</li>
                                        <li>Berikan informasi login kepada user baru</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="user-2">
                                <AccordionTrigger>Apa perbedaan role Admin, Pharmacist, dan Staff?</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-2">
                                        <li>
                                            <strong>Admin:</strong>
                                            <ul className="ml-6 mt-1 list-inside list-disc">
                                                <li>Akses penuh ke semua fitur</li>
                                                <li>Dapat mengelola pengguna</li>
                                                <li>Dapat approve stok opname</li>
                                                <li>Dapat mengelola master data</li>
                                            </ul>
                                        </li>
                                        <li>
                                            <strong>Pharmacist (Apoteker):</strong>
                                            <ul className="ml-6 mt-1 list-inside list-disc">
                                                <li>Dapat mengelola obat dan transaksi</li>
                                                <li>Dapat membuat resep</li>
                                                <li>Dapat melakukan stok opname</li>
                                                <li>Dapat melihat semua laporan</li>
                                            </ul>
                                        </li>
                                        <li>
                                            <strong>Staff Farmasi:</strong>
                                            <ul className="ml-6 mt-1 list-inside list-disc">
                                                <li>Dapat mencatat transaksi harian</li>
                                                <li>Dapat melihat stok</li>
                                                <li>Dapat membuat permintaan</li>
                                                <li>Akses terbatas ke fitur tertentu</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                {/* Settings & Troubleshooting */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="size-5" />
                            Pengaturan & Troubleshooting
                        </CardTitle>
                        <CardDescription>
                            Masalah umum dan cara mengatasinya
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="setting-1">
                                <AccordionTrigger>Bagaimana cara mengaktifkan Two-Factor Authentication (2FA)?</AccordionTrigger>
                                <AccordionContent>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Klik foto profil → "Settings"</li>
                                        <li>Pilih tab "Two-Factor Authentication"</li>
                                        <li>Klik "Enable Two-Factor Authentication"</li>
                                        <li>Scan QR code dengan aplikasi authenticator (Google Authenticator, Authy, dll)</li>
                                        <li>Masukkan kode verifikasi 6 digit</li>
                                        <li>Simpan recovery codes di tempat aman</li>
                                    </ol>
                                    <p className="mt-2 text-sm text-green-600">
                                        ✓ 2FA meningkatkan keamanan akun Anda secara signifikan.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="setting-2">
                                <AccordionTrigger>Data yang saya input tidak tersimpan, kenapa?</AccordionTrigger>
                                <AccordionContent>
                                    Kemungkinan penyebab:
                                    <ul className="mt-2 list-inside list-disc space-y-1">
                                        <li><strong>Koneksi internet terputus:</strong> Pastikan koneksi internet stabil</li>
                                        <li><strong>Session expired:</strong> Login ulang ke sistem</li>
                                        <li><strong>Validasi error:</strong> Periksa semua field yang wajib diisi (ditandai dengan *)</li>
                                        <li><strong>Duplikat data:</strong> Kode obat/nomor batch mungkin sudah ada</li>
                                    </ul>
                                    <p className="mt-2 text-sm">
                                        Jika masalah berlanjut, hubungi administrator atau IT support.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="setting-3">
                                <AccordionTrigger>Laporan tidak muncul atau kosong?</AccordionTrigger>
                                <AccordionContent>
                                    Coba langkah berikut:
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Periksa filter yang Anda gunakan - pastikan rentang tanggal sudah benar</li>
                                        <li>Hapus semua filter dan coba lagi</li>
                                        <li>Refresh halaman (F5 atau Ctrl+R)</li>
                                        <li>Clear cache browser</li>
                                        <li>Pastikan ada data untuk periode yang dipilih</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="setting-4">
                                <AccordionTrigger>Stok tidak berkurang saat transaksi keluar?</AccordionTrigger>
                                <AccordionContent>
                                    Pastikan:
                                    <ul className="mt-2 list-inside list-disc space-y-1">
                                        <li>Anda sudah klik tombol "Simpan Transaksi"</li>
                                        <li>Tidak ada error message yang muncul</li>
                                        <li>Transaksi muncul di "Semua Transaksi"</li>
                                        <li>Batch yang dipilih memiliki stok yang cukup</li>
                                    </ul>
                                    <p className="mt-2 text-sm text-amber-600">
                                        Jika stok tetap tidak berkurang, segera hubungi administrator untuk investigasi lebih lanjut.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="setting-5">
                                <AccordionTrigger>Bagaimana cara mengubah tema (Light/Dark Mode)?</AccordionTrigger>
                                <AccordionContent>
                                    <ol className="list-inside list-decimal space-y-1">
                                        <li>Klik foto profil di pojok kanan atas</li>
                                        <li>Pilih "Settings"</li>
                                        <li>Klik tab "Appearance"</li>
                                        <li>Pilih tema yang diinginkan:
                                            <ul className="ml-6 mt-1 list-inside list-disc">
                                                <li>Light (Terang)</li>
                                                <li>Dark (Gelap)</li>
                                                <li>System (Ikuti pengaturan sistem)</li>
                                            </ul>
                                        </li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

                {/* Contact Support */}
                <Card>
                    <CardHeader>
                        <CardTitle>Butuh Bantuan Lebih Lanjut?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            Jika pertanyaan Anda tidak terjawab di FAQ ini, silakan hubungi:
                        </p>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border p-4">
                                <h4 className="font-semibold">Administrator Sistem</h4>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Email: admin@pkugombong.ac.id
                                </p>
                            </div>
                            <div className="rounded-lg border p-4">
                                <h4 className="font-semibold">IT Support</h4>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Telp: (0287) 123-4567 ext. 100
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Untuk dokumentasi lengkap, kunjungi menu <strong>Dokumentasi</strong>.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
