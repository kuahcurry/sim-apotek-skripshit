import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen,
    Package,
    TrendingUp,
    ClipboardCheck,
    FileText,
    Users,
    Database,
    Shield,
    Zap,
    CheckCircle2,
    AlertCircle,
    Info,
    Layers,
    GitBranch,
    Activity,
    Settings,
    MessageCircleQuestion
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Dokumentasi', href: '/dokumentasi' },
];

export default function Dokumentasi() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dokumentasi Sistem" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="size-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Dokumentasi Sistem</h1>
                        <p className="text-muted-foreground">
                            Panduan lengkap penggunaan SIMRS Apotek PKU Muhammadiyah Gombong
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="features">Fitur</TabsTrigger>
                        <TabsTrigger value="guide">Panduan</TabsTrigger>
                        <TabsTrigger value="technical">Teknis</TabsTrigger>
                        <TabsTrigger value="workflow">Workflow</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* System Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="size-5" />
                                    Tentang Sistem
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="mb-2 font-semibold">Apa itu SIMRS Apotek PKU?</h3>
                                    <p className="text-muted-foreground">
                                        SIMRS Apotek PKU adalah Sistem Informasi Manajemen Rumah Sakit khusus untuk bagian 
                                        farmasi/apotek di PKU Muhammadiyah Gombong. Sistem ini dirancang untuk mengotomatisasi 
                                        dan mempermudah proses manajemen obat, transaksi, stok, resep, dan pelaporan secara 
                                        terintegrasi dan real-time.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-2 font-semibold">Tujuan Sistem</h3>
                                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                                        <li>Meningkatkan efisiensi pengelolaan inventori obat</li>
                                        <li>Mengurangi kesalahan manual dalam pencatatan</li>
                                        <li>Mempercepat proses transaksi dan pelaporan</li>
                                        <li>Memastikan ketersediaan obat yang optimal</li>
                                        <li>Mencegah kerugian akibat obat kadaluarsa</li>
                                        <li>Menyediakan data real-time untuk pengambilan keputusan</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="mb-2 font-semibold">Teknologi yang Digunakan</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg border p-4">
                                            <h4 className="mb-2 font-semibold">Backend</h4>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <div className="flex items-center justify-between">
                                                    <span>Framework:</span>
                                                    <Badge variant="secondary">Laravel 12.x</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Language:</span>
                                                    <Badge variant="secondary">PHP 8.5</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Database:</span>
                                                    <Badge variant="secondary">MySQL</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <h4 className="mb-2 font-semibold">Frontend</h4>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <div className="flex items-center justify-between">
                                                    <span>Library:</span>
                                                    <Badge variant="secondary">React 19</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Language:</span>
                                                    <Badge variant="secondary">TypeScript</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Bridge:</span>
                                                    <Badge variant="secondary">Inertia.js</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Features Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="size-5" />
                                    Fitur Utama
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex gap-3 rounded-lg border p-4">
                                        <Package className="size-5 text-blue-600" />
                                        <div>
                                            <h4 className="font-semibold">Manajemen Inventori</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Kelola data obat, batch, stok, dan tracking kadaluarsa
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 rounded-lg border p-4">
                                        <TrendingUp className="size-5 text-green-600" />
                                        <div>
                                            <h4 className="font-semibold">Transaksi</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Catat barang masuk/keluar dengan sistem FEFO
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 rounded-lg border p-4">
                                        <ClipboardCheck className="size-5 text-purple-600" />
                                        <div>
                                            <h4 className="font-semibold">Stok Opname</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Perhitungan fisik dan rekonsiliasi stok
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 rounded-lg border p-4">
                                        <FileText className="size-5 text-orange-600" />
                                        <div>
                                            <h4 className="font-semibold">Pelaporan</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Laporan stok, transaksi, dan kadaluarsa
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* FEATURES TAB */}
                    <TabsContent value="features" className="space-y-6">
                        {/* Medicine Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="size-5" />
                                    Manajemen Obat
                                </CardTitle>
                                <CardDescription>
                                    Fitur lengkap untuk mengelola data obat dan inventori
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div>
                                            <p className="font-medium">Data Obat Master</p>
                                            <p className="text-sm text-muted-foreground">
                                                CRUD lengkap untuk data obat dengan informasi detail (nama, generik, brand, 
                                                kategori, jenis, satuan, stok, harga, indikasi, efek samping, dll)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div>
                                            <p className="font-medium">Import/Export Excel</p>
                                            <p className="text-sm text-muted-foreground">
                                                Bulk import data obat dari Excel/CSV dengan template yang sudah disediakan, 
                                                dan export data untuk backup atau analisis
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div>
                                            <p className="font-medium">Batch Management</p>
                                            <p className="text-sm text-muted-foreground">
                                                Pengelolaan batch obat berdasarkan nomor batch dan tanggal expired, 
                                                mendukung multiple batch per obat
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div>
                                            <p className="font-medium">Expiry Tracking</p>
                                            <p className="text-sm text-muted-foreground">
                                                Deteksi otomatis obat yang akan/sudah kadaluarsa dengan color-coding 
                                                (merah: expired, kuning: 3 bulan, biru: 6 bulan)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div>
                                            <p className="font-medium">Low Stock Alert</p>
                                            <p className="text-sm text-muted-foreground">
                                                Notifikasi otomatis ketika stok obat mencapai atau di bawah stok minimum
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div>
                                            <p className="font-medium">QR Code Scanning</p>
                                            <p className="text-sm text-muted-foreground">
                                                Generate dan scan QR code untuk akses cepat informasi obat
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transaction Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="size-5" />
                                    Manajemen Transaksi
                                </CardTitle>
                                <CardDescription>
                                    Pencatatan transaksi masuk dan keluar dengan sistem FEFO
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div>
                                            <p className="font-medium">Barang Masuk</p>
                                            <p className="text-sm text-muted-foreground">
                                                Pencatatan penerimaan obat dari supplier dengan nomor faktur, batch, 
                                                tanggal expired, dan harga beli
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div>
                                            <p className="font-medium">Barang Keluar</p>
                                            <p className="text-sm text-muted-foreground">
                                                Pencatatan pengeluaran obat ke unit/pasien dengan otomatis menggunakan 
                                                batch yang akan expired lebih dulu (FEFO)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div>
                                            <p className="font-medium">FEFO (First Expired First Out)</p>
                                            <p className="text-sm text-muted-foreground">
                                                Sistem otomatis memilih batch dengan tanggal expired terdekat untuk 
                                                mengurangi waste dan kerugian
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div>
                                            <p className="font-medium">Transaction History</p>
                                            <p className="text-sm text-muted-foreground">
                                                Riwayat lengkap semua transaksi dengan filter tanggal, jenis, dan status
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div>
                                            <p className="font-medium">Real-time Stock Update</p>
                                            <p className="text-sm text-muted-foreground">
                                                Stok otomatis terupdate setelah setiap transaksi untuk akurasi data
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Layers className="size-5" />
                                    Fitur Tambahan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="mb-2 flex items-center gap-2 font-semibold">
                                            <Activity className="size-4" />
                                            Permintaan Unit
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Unit rumah sakit dapat membuat permintaan obat ke apotek dengan workflow 
                                            approval (pending → diproses → selesai)
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 flex items-center gap-2 font-semibold">
                                            <ClipboardCheck className="size-4" />
                                            Stok Opname
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Perhitungan fisik stok dengan deteksi selisih otomatis dan workflow approval 
                                            dari supervisor
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 flex items-center gap-2 font-semibold">
                                            <FileText className="size-4" />
                                            Resep
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Manajemen resep dokter dengan detail obat, dosis, dan instruksi penggunaan
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 flex items-center gap-2 font-semibold">
                                            <AlertCircle className="size-4" />
                                            Pemusnahan Obat
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Dokumentasi pemusnahan obat expired dengan berita acara, saksi, dan metode pemusnahan
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* GUIDE TAB */}
                    <TabsContent value="guide" className="space-y-6">
                        {/* Quick Start */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Start Guide</CardTitle>
                                <CardDescription>Panduan cepat untuk memulai menggunakan sistem</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="mb-3 font-semibold">1. Login ke Sistem</h3>
                                    <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                                        <li>Buka aplikasi di browser (Chrome, Firefox, Edge recommended)</li>
                                        <li>Masukkan email dan password yang diberikan admin</li>
                                        <li>Jika 2FA aktif, masukkan kode dari aplikasi authenticator</li>
                                        <li>Klik tombol "Masuk"</li>
                                    </ol>
                                </div>

                                <div>
                                    <h3 className="mb-3 font-semibold">2. Menyiapkan Data Master</h3>
                                    <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                                        <li>Buka menu "Master Data Obat"</li>
                                        <li>Lengkapi kategori obat (contoh: Analgesik, Antibiotik)</li>
                                        <li>Lengkapi jenis obat (contoh: Tablet, Kapsul, Sirup)</li>
                                        <li>Lengkapi satuan obat (contoh: Strip, Botol, Box)</li>
                                        <li>Tambahkan data supplier</li>
                                        <li>Tambahkan unit rumah sakit jika belum ada</li>
                                    </ol>
                                </div>

                                <div>
                                    <h3 className="mb-3 font-semibold">3. Menambahkan Obat</h3>
                                    <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                                        <li>Buka menu "Obat" → "Data Obat"</li>
                                        <li>Klik "Tambah Obat"</li>
                                        <li>Isi form dengan lengkap atau gunakan Import Excel untuk bulk entry</li>
                                        <li>Klik "Simpan"</li>
                                    </ol>
                                </div>

                                <div>
                                    <h3 className="mb-3 font-semibold">4. Mencatat Transaksi Pertama</h3>
                                    <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                                        <li>Buka menu "Transaksi" → "Barang Masuk"</li>
                                        <li>Klik "Buat Transaksi Baru"</li>
                                        <li>Pilih supplier dan obat yang masuk</li>
                                        <li>Masukkan nomor batch dan tanggal expired</li>
                                        <li>Klik "Simpan Transaksi"</li>
                                        <li>Stok akan otomatis bertambah</li>
                                    </ol>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Best Practices */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Best Practices</CardTitle>
                                <CardDescription>Praktik terbaik untuk penggunaan optimal</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950/20">
                                        <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                                            Pengelolaan Stok
                                        </h4>
                                        <ul className="list-inside list-disc space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                            <li>Lakukan stok opname minimal 1 bulan sekali</li>
                                            <li>Set stok minimum yang realistis untuk setiap obat</li>
                                            <li>Periksa dashboard setiap hari untuk low stock alert</li>
                                            <li>Selalu catat transaksi sesegera mungkin setelah terjadi</li>
                                        </ul>
                                    </div>

                                    <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-950/20">
                                        <h4 className="mb-2 font-semibold text-green-900 dark:text-green-100">
                                            Batch Management
                                        </h4>
                                        <ul className="list-inside list-disc space-y-1 text-sm text-green-800 dark:text-green-200">
                                            <li>Selalu input nomor batch dan tanggal expired saat barang masuk</li>
                                            <li>Gunakan sistem FEFO untuk mengurangi waste</li>
                                            <li>Monitor laporan kadaluarsa setiap minggu</li>
                                            <li>Segera laporkan batch yang akan expired ke supervisor</li>
                                        </ul>
                                    </div>

                                    <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-950/20">
                                        <h4 className="mb-2 font-semibold text-amber-900 dark:text-amber-100">
                                            Keamanan Data
                                        </h4>
                                        <ul className="list-inside list-disc space-y-1 text-sm text-amber-800 dark:text-amber-200">
                                            <li>Aktifkan Two-Factor Authentication untuk semua user</li>
                                            <li>Gunakan password yang kuat (min. 8 karakter, kombinasi huruf-angka-simbol)</li>
                                            <li>Jangan share kredensial login ke orang lain</li>
                                            <li>Logout setelah selesai menggunakan sistem</li>
                                        </ul>
                                    </div>

                                    <div className="rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4 dark:bg-purple-950/20">
                                        <h4 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
                                            Pelaporan
                                        </h4>
                                        <ul className="list-inside list-disc space-y-1 text-sm text-purple-800 dark:text-purple-200">
                                            <li>Export laporan secara berkala untuk backup</li>
                                            <li>Gunakan filter untuk mendapatkan data yang spesifik</li>
                                            <li>Review laporan transaksi setiap akhir hari</li>
                                            <li>Simpan laporan bulanan untuk audit</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TECHNICAL TAB */}
                    <TabsContent value="technical" className="space-y-6">
                        {/* System Architecture */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Layers className="size-5" />
                                    Arsitektur Sistem
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="mb-3 font-semibold">Stack Teknologi</h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-lg border p-4">
                                            <h4 className="mb-2 font-semibold text-blue-600">Frontend</h4>
                                            <ul className="space-y-1 text-sm text-muted-foreground">
                                                <li>• React 19.2.0</li>
                                                <li>• TypeScript 5.x</li>
                                                <li>• Inertia.js 2.0</li>
                                                <li>• TailwindCSS 4.0</li>
                                                <li>• shadcn/ui Components</li>
                                            </ul>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <h4 className="mb-2 font-semibold text-green-600">Backend</h4>
                                            <ul className="space-y-1 text-sm text-muted-foreground">
                                                <li>• Laravel 12.43.0</li>
                                                <li>• PHP 8.5.0</li>
                                                <li>• Laravel Fortify (Auth)</li>
                                                <li>• PhpSpreadsheet (Excel)</li>
                                                <li>• Laravel Events</li>
                                            </ul>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <h4 className="mb-2 font-semibold text-purple-600">Database</h4>
                                            <ul className="space-y-1 text-sm text-muted-foreground">
                                                <li>• MySQL 8.0+</li>
                                                <li>• 19+ Tables</li>
                                                <li>• Foreign Key Constraints</li>
                                                <li>• Indexes untuk Performance</li>
                                                <li>• Soft Deletes</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 font-semibold">Database Schema</h3>
                                    <div className="rounded-lg bg-muted p-4">
                                        <p className="mb-2 text-sm font-medium">Tabel Utama:</p>
                                        <div className="grid gap-2 text-sm md:grid-cols-2">
                                            <div className="font-mono">
                                                <span className="text-blue-600">obat</span> - Data master obat
                                            </div>
                                            <div className="font-mono">
                                                <span className="text-blue-600">batch_obat</span> - Batch & expired tracking
                                            </div>
                                            <div className="font-mono">
                                                <span className="text-blue-600">transaksi</span> - Transaksi masuk/keluar
                                            </div>
                                            <div className="font-mono">
                                                <span className="text-blue-600">resep</span> - Data resep dokter
                                            </div>
                                            <div className="font-mono">
                                                <span className="text-blue-600">stok_opname</span> - Perhitungan fisik
                                            </div>
                                            <div className="font-mono">
                                                <span className="text-blue-600">permintaan_unit</span> - Permintaan dari unit
                                            </div>
                                            <div className="font-mono">
                                                <span className="text-blue-600">pemusnahan_obat</span> - Dokumentasi pemusnahan
                                            </div>
                                            <div className="font-mono">
                                                <span className="text-blue-600">log_aktivitas</span> - Audit trail
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="size-5" />
                                    Keamanan Sistem
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="mb-2 font-semibold">Autentikasi & Autorisasi</h4>
                                        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                                            <li>Laravel Fortify untuk authentication</li>
                                            <li>Two-Factor Authentication (2FA) dengan QR code</li>
                                            <li>Role-based access control (Admin, Pharmacist, Staff)</li>
                                            <li>Session management dengan secure cookies</li>
                                            <li>Password hashing dengan bcrypt</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="mb-2 font-semibold">Data Protection</h4>
                                        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                                            <li>CSRF protection untuk semua form</li>
                                            <li>SQL injection prevention dengan Eloquent ORM</li>
                                            <li>XSS protection dengan output escaping</li>
                                            <li>HTTPS enforcement (production)</li>
                                            <li>Activity logging untuk audit trail</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="mb-2 font-semibold">Data Validation</h4>
                                        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                                            <li>Server-side validation dengan Laravel Form Requests</li>
                                            <li>Client-side validation dengan TypeScript types</li>
                                            <li>Foreign key constraints di database</li>
                                            <li>Unique constraints untuk data kritis</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="size-5" />
                                    Performance & Optimization
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div className="text-sm">
                                            <span className="font-medium">Eager Loading:</span>
                                            <span className="text-muted-foreground"> Mengurangi N+1 query problem dengan relationship loading</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div className="text-sm">
                                            <span className="font-medium">Database Indexing:</span>
                                            <span className="text-muted-foreground"> Index pada kolom yang sering di-query (foreign keys, dates)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div className="text-sm">
                                            <span className="font-medium">Pagination:</span>
                                            <span className="text-muted-foreground"> Data besar dipaginasi untuk mengurangi memory usage</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 size-4 text-green-600" />
                                        <div className="text-sm">
                                            <span className="font-medium">Vite Bundling:</span>
                                            <span className="text-muted-foreground"> Code splitting dan tree shaking untuk bundle size optimal</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* WORKFLOW TAB */}
                    <TabsContent value="workflow" className="space-y-6">
                        {/* Medicine Flow */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GitBranch className="size-5" />
                                    Alur Kerja Obat
                                </CardTitle>
                                <CardDescription>
                                    Workflow lengkap dari penerimaan hingga pengeluaran obat
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Step 1 */}
                                    <div className="flex gap-4">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950">
                                            1
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="mb-1 font-semibold">Penerimaan Obat dari Supplier</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Staff farmasi menerima obat dari supplier → Cek fisik barang → Buat transaksi masuk 
                                                di sistem → Input nomor batch & tanggal expired → Stok otomatis bertambah
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex gap-4">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950">
                                            2
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="mb-1 font-semibold">Penyimpanan & Monitoring</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Obat disimpan di rak sesuai lokasi → Sistem monitoring stok minimum → 
                                                Alert otomatis untuk low stock & expired soon → Dashboard menampilkan status real-time
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex gap-4">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950">
                                            3
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="mb-1 font-semibold">Permintaan dari Unit/Resep</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Unit membuat permintaan obat OR Dokter menulis resep → Apoteker review → 
                                                Verifikasi ketersediaan stok → Persiapan obat sesuai FEFO
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="flex gap-4">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950">
                                            4
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="mb-1 font-semibold">Pengeluaran Obat</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Buat transaksi keluar → Sistem otomatis pilih batch dengan expired terdekat (FEFO) → 
                                                Catat tujuan (unit/pasien) → Stok berkurang otomatis → Cetak label/bukti keluar
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 5 */}
                                    <div className="flex gap-4">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950">
                                            5
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="mb-1 font-semibold">Pemusnahan (jika expired)</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Identifikasi batch expired → Buat dokumen pemusnahan → Libatkan saksi → 
                                                Lakukan pemusnahan sesuai prosedur → Catat di sistem → Cetak berita acara
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stock Opname Flow */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardCheck className="size-5" />
                                    Alur Stok Opname
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-900">
                                            ①
                                        </div>
                                        <div>
                                            <p className="font-medium">Persiapan</p>
                                            <p className="text-sm text-muted-foreground">
                                                Tentukan jadwal opname → Siapkan form → Brief tim pelaksana
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-900">
                                            ②
                                        </div>
                                        <div>
                                            <p className="font-medium">Pelaksanaan</p>
                                            <p className="text-sm text-muted-foreground">
                                                Buat stok opname baru di sistem → Hitung fisik di rak → Input jumlah ke sistem → 
                                                Sistem otomatis hitung selisih
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-900">
                                            ③
                                        </div>
                                        <div>
                                            <p className="font-medium">Verifikasi</p>
                                            <p className="text-sm text-muted-foreground">
                                                Cek ulang item dengan selisih besar → Isi keterangan untuk setiap selisih → 
                                                Selesaikan opname
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-900">
                                            ④
                                        </div>
                                        <div>
                                            <p className="font-medium">Approval</p>
                                            <p className="text-sm text-muted-foreground">
                                                Supervisor/admin review hasil → Approve jika sesuai → Sistem update stok otomatis 
                                                sesuai hasil fisik
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-900">
                                            ⑤
                                        </div>
                                        <div>
                                            <p className="font-medium">Tindak Lanjut</p>
                                            <p className="text-sm text-muted-foreground">
                                                Analisis penyebab selisih → Dokumentasi → Perbaikan SOP jika diperlukan
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Report Generation Flow */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="size-5" />
                                    Alur Pelaporan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 text-sm">
                                    <p className="text-muted-foreground">
                                        Sistem menyediakan 3 jenis laporan utama yang dapat diakses kapan saja:
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-lg border p-4">
                                            <h4 className="mb-2 font-semibold text-blue-600">Laporan Stok</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Menampilkan semua obat dengan stok saat ini, status (normal/low/out), 
                                                kategori, dan nilai inventori
                                            </p>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <h4 className="mb-2 font-semibold text-green-600">Laporan Transaksi</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Riwayat semua transaksi (masuk/keluar) dengan filter tanggal, 
                                                total nilai, dan statistik
                                            </p>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <h4 className="mb-2 font-semibold text-red-600">Laporan Kadaluarsa</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Daftar batch yang sudah/akan expired dengan kategori waktu 
                                                dan nilai kerugian potensial
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground">
                                        <strong>Cara Export:</strong> Setelah laporan ditampilkan, klik tombol "Export Excel" 
                                        untuk download dalam format .xlsx yang bisa diolah lebih lanjut.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Footer */}
                <Card className="bg-muted/50">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <div>
                                <h3 className="font-semibold">Butuh Bantuan Lebih Lanjut?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Kunjungi halaman FAQ atau hubungi administrator sistem
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <a 
                                    href="/faq" 
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    <MessageCircleQuestion className="size-4" />
                                    Lihat FAQ
                                </a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
