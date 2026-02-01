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
    { title: 'Edit Obat', href: '#' },
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

interface Obat {
    id: number;
    kode_obat: string;
    nama_obat: string;
    nama_generik?: string;
    nama_brand?: string;
    kategori_id: number;
    jenis_id: number;
    satuan_id: number;
    stok_minimum: number;
    harga_beli: number;
    harga_jual: number;
    lokasi_penyimpanan?: string;
    deskripsi?: string;
    efek_samping?: string;
    indikasi?: string;
    kontraindikasi?: string;
}

interface EditProps {
    obat: Obat;
    kategori: KategoriObat[];
    jenis: JenisObat[];
    satuan: SatuanObat[];
}

export default function EditObat({ obat, kategori, jenis, satuan }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        kode_obat: obat.kode_obat,
        nama_obat: obat.nama_obat,
        nama_generik: obat.nama_generik || '',
        nama_brand: obat.nama_brand || '',
        kategori_id: obat.kategori_id.toString(),
        jenis_id: obat.jenis_id.toString(),
        satuan_id: obat.satuan_id.toString(),
        stok_minimum: obat.stok_minimum.toString(),
        harga_beli: obat.harga_beli.toString(),
        harga_jual: obat.harga_jual.toString(),
        lokasi_penyimpanan: obat.lokasi_penyimpanan || '',
        deskripsi: obat.deskripsi || '',
        efek_samping: obat.efek_samping || '',
        indikasi: obat.indikasi || '',
        kontraindikasi: obat.kontraindikasi || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/obat/${obat.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Obat" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Obat</h1>
                        <p className="text-sm text-muted-foreground">
                            Perbarui data obat
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
                            />
                        </div>

                        {/* Nama Brand */}
                        <div className="space-y-2">
                            <Label htmlFor="nama_brand">Nama Brand</Label>
                            <Input
                                id="nama_brand"
                                value={data.nama_brand}
                                onChange={(e) => setData('nama_brand', e.target.value)}
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
                            />
                        </div>

                        {/* Lokasi Penyimpanan */}
                        <div className="space-y-2">
                            <Label htmlFor="lokasi_penyimpanan">Lokasi Penyimpanan</Label>
                            <Input
                                id="lokasi_penyimpanan"
                                value={data.lokasi_penyimpanan}
                                onChange={(e) => setData('lokasi_penyimpanan', e.target.value)}
                            />
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="deskripsi">Deskripsi</Label>
                            <textarea
                                id="deskripsi"
                                value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
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
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
