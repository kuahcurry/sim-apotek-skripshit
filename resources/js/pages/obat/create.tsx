import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Save, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Data Obat', href: '/obat' },
    { title: 'Tambah Obat', href: '/obat/create' },
];

interface KategoriObat {
    id: number;
    nama_kategori: string;
}

interface JenisObat {
    id: number;
    nama_jenis: string;
}

interface SatuanObat {
    id: number;
    nama_satuan: string;
}

interface CreateProps {
    kategori: KategoriObat[];
    jenis: JenisObat[];
    satuan: SatuanObat[];
}

export default function CreateObat({ kategori, jenis, satuan }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        kode_obat: '',
        nama_obat: '',
        nama_generik: '',
        nama_brand: '',
        kategori_id: '',
        jenis_id: '',
        satuan_id: '',
        stok_minimum: '10',
        harga_beli: '0',
        harga_jual: '0',
        lokasi_penyimpanan: '',
        deskripsi: '',
        efek_samping: '',
        indikasi: '',
        kontraindikasi: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/obat');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Obat" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Obat Baru</h1>
                        <p className="text-sm text-muted-foreground">
                            Masukkan data obat yang akan ditambahkan
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-xl border border-sidebar-border/70 bg-card p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Kode Obat */}
                        <div className="space-y-2">
                            <Label htmlFor="kode_obat">
                                Kode Obat <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="kode_obat"
                                value={data.kode_obat}
                                onChange={(e) => setData('kode_obat', e.target.value)}
                                placeholder="Contoh: OBT001"
                                required
                            />
                            {errors.kode_obat && (
                                <p className="text-sm text-destructive">{errors.kode_obat}</p>
                            )}
                        </div>

                        {/* Nama Obat */}
                        <div className="space-y-2">
                            <Label htmlFor="nama_obat">
                                Nama Obat <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="nama_obat"
                                value={data.nama_obat}
                                onChange={(e) => setData('nama_obat', e.target.value)}
                                placeholder="Contoh: Paracetamol"
                                required
                            />
                            {errors.nama_obat && (
                                <p className="text-sm text-destructive">{errors.nama_obat}</p>
                            )}
                        </div>

                        {/* Nama Generik */}
                        <div className="space-y-2">
                            <Label htmlFor="nama_generik">Nama Generik</Label>
                            <Input
                                id="nama_generik"
                                value={data.nama_generik}
                                onChange={(e) => setData('nama_generik', e.target.value)}
                                placeholder="Contoh: Acetaminophen"
                            />
                        </div>

                        {/* Nama Brand */}
                        <div className="space-y-2">
                            <Label htmlFor="nama_brand">Nama Brand</Label>
                            <Input
                                id="nama_brand"
                                value={data.nama_brand}
                                onChange={(e) => setData('nama_brand', e.target.value)}
                                placeholder="Contoh: Biogesic"
                            />
                        </div>

                        {/* Kategori */}
                        <div className="space-y-2">
                            <Label htmlFor="kategori_id">
                                Kategori <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.kategori_id}
                                onValueChange={(value) => setData('kategori_id', value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {kategori.map((item) => (
                                        <SelectItem key={item.id} value={item.id.toString()}>
                                            {item.nama_kategori}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.kategori_id && (
                                <p className="text-sm text-destructive">{errors.kategori_id}</p>
                            )}
                        </div>

                        {/* Jenis */}
                        <div className="space-y-2">
                            <Label htmlFor="jenis_id">
                                Jenis <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.jenis_id}
                                onValueChange={(value) => setData('jenis_id', value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jenis.map((item) => (
                                        <SelectItem key={item.id} value={item.id.toString()}>
                                            {item.nama_jenis}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.jenis_id && (
                                <p className="text-sm text-destructive">{errors.jenis_id}</p>
                            )}
                        </div>

                        {/* Satuan */}
                        <div className="space-y-2">
                            <Label htmlFor="satuan_id">
                                Satuan <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={data.satuan_id}
                                onValueChange={(value) => setData('satuan_id', value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih satuan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {satuan.map((item) => (
                                        <SelectItem key={item.id} value={item.id.toString()}>
                                            {item.nama_satuan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.satuan_id && (
                                <p className="text-sm text-destructive">{errors.satuan_id}</p>
                            )}
                        </div>

                        {/* Stok Minimum */}
                        <div className="space-y-2">
                            <Label htmlFor="stok_minimum">
                                Stok Minimum <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="stok_minimum"
                                type="number"
                                value={data.stok_minimum}
                                onChange={(e) => setData('stok_minimum', e.target.value)}
                                placeholder="10"
                                required
                            />
                            {errors.stok_minimum && (
                                <p className="text-sm text-destructive">{errors.stok_minimum}</p>
                            )}
                        </div>

                        {/* Harga Beli */}
                        <div className="space-y-2">
                            <Label htmlFor="harga_beli">Harga Beli</Label>
                            <Input
                                id="harga_beli"
                                type="number"
                                step="0.01"
                                value={data.harga_beli}
                                onChange={(e) => setData('harga_beli', e.target.value)}
                                placeholder="0"
                            />
                        </div>

                        {/* Harga Jual */}
                        <div className="space-y-2">
                            <Label htmlFor="harga_jual">Harga Jual</Label>
                            <Input
                                id="harga_jual"
                                type="number"
                                step="0.01"
                                value={data.harga_jual}
                                onChange={(e) => setData('harga_jual', e.target.value)}
                                placeholder="0"
                            />
                        </div>

                        {/* Lokasi Penyimpanan */}
                        <div className="space-y-2">
                            <Label htmlFor="lokasi_penyimpanan">Lokasi Penyimpanan</Label>
                            <Input
                                id="lokasi_penyimpanan"
                                value={data.lokasi_penyimpanan}
                                onChange={(e) => setData('lokasi_penyimpanan', e.target.value)}
                                placeholder="Contoh: Rak A-1"
                            />
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="deskripsi">Deskripsi</Label>
                            <textarea
                                id="deskripsi"
                                value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                                placeholder="Deskripsi obat"
                                className="w-full rounded-lg border border-sidebar-border bg-background px-3 py-2 text-sm"
                                rows={3}
                            />
                        </div>

                        {/* Indikasi */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="indikasi">Indikasi</Label>
                            <textarea
                                id="indikasi"
                                value={data.indikasi}
                                onChange={(e) => setData('indikasi', e.target.value)}
                                placeholder="Indikasi penggunaan obat"
                                className="w-full rounded-lg border border-sidebar-border bg-background px-3 py-2 text-sm"
                                rows={3}
                            />
                        </div>

                        {/* Kontraindikasi */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="kontraindikasi">Kontraindikasi</Label>
                            <textarea
                                id="kontraindikasi"
                                value={data.kontraindikasi}
                                onChange={(e) => setData('kontraindikasi', e.target.value)}
                                placeholder="Kontraindikasi obat"
                                className="w-full rounded-lg border border-sidebar-border bg-background px-3 py-2 text-sm"
                                rows={3}
                            />
                        </div>

                        {/* Efek Samping */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="efek_samping">Efek Samping</Label>
                            <textarea
                                id="efek_samping"
                                value={data.efek_samping}
                                onChange={(e) => setData('efek_samping', e.target.value)}
                                placeholder="Efek samping obat"
                                className="w-full rounded-lg border border-sidebar-border bg-background px-3 py-2 text-sm"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-2">
                        <Button type="button" variant="outline" asChild>
                            <a href="/obat">
                                <X className="mr-2 size-4" />
                                Batal
                            </a>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 size-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Obat'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
