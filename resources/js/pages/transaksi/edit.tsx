import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Save, X, Package } from 'lucide-react';
import type { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transaksi', href: '/transaksi' },
    { title: 'Edit Transaksi', href: '/transaksi/edit' },
];

interface Obat {
    id: number;
    kode_obat: string;
    nama_obat: string;
    satuan?: {
        nama_satuan: string;
    };
    kategori?: {
        nama_kategori: string;
    };
}

interface Batch {
    id: number;
    nomor_batch: string;
    tanggal_expired: string;
    stok_tersedia: number;
    harga_beli: number;
    obat: {
        nama_obat: string;
        kode_obat: string;
    };
}

interface Unit {
    id: number;
    kode_unit: string;
    nama_unit: string;
}

interface Transaksi {
    id: number;
    obat_id: number;
    batch_id: number | null;
    unit_id: number | null;
    jenis_transaksi: string;
    jumlah: number;
    harga_satuan: number;
    tanggal_transaksi: string;
    keterangan: string | null;
    nomor_referensi: string | null;
}

interface Props {
    transaksi: Transaksi;
    obat: Obat[];
    batches: Batch[];
    units: Unit[];
}

export default function TransaksiEdit({ transaksi, obat, batches, units }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        obat_id: transaksi.obat_id.toString(),
        batch_id: transaksi.batch_id?.toString() || '',
        unit_id: transaksi.unit_id?.toString() || '',
        jenis_transaksi: transaksi.jenis_transaksi,
        jumlah: transaksi.jumlah.toString(),
        harga_satuan: transaksi.harga_satuan.toString(),
        tanggal_transaksi: transaksi.tanggal_transaksi,
        keterangan: transaksi.keterangan || '',
        nomor_referensi: transaksi.nomor_referensi || '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/transaksi/${transaksi.id}`, {
            onSuccess: () => {
                console.log('Transaksi updated successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            },
            preserveScroll: true,
        });
    };

    const handleObatChange = (value: string) => {
        setData('obat_id', value);
        // Auto-select batch if only one available for this medicine
        const obatBatches = batches.filter(b => b.obat.kode_obat === obat.find(o => o.id.toString() === value)?.kode_obat);
        if (obatBatches.length === 1) {
            setData('batch_id', obatBatches[0].id.toString());
            setData('harga_satuan', obatBatches[0].harga_beli.toString());
        }
    };

    const handleBatchChange = (value: string) => {
        setData('batch_id', value);
        const batch = batches.find(b => b.id.toString() === value);
        if (batch) {
            setData('harga_satuan', batch.harga_beli.toString());
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getTotalHarga = () => {
        const jumlah = parseFloat(data.jumlah) || 0;
        const harga = parseFloat(data.harga_satuan) || 0;
        return jumlah * harga;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Transaksi" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Transaksi</h1>
                        <p className="text-sm text-muted-foreground">
                            Ubah transaksi obat masuk atau keluar
                        </p>
                    </div>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="max-w-4xl rounded-xl border border-destructive/50 bg-destructive/10 p-4">
                        <h4 className="font-semibold text-destructive mb-2">Terdapat kesalahan pada form:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                            {Object.entries(errors).map(([key, value]) => (
                                <li key={key}>{value}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                    {/* Jenis Transaksi */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Jenis Transaksi</h3>
                            <p className="text-sm text-muted-foreground">
                                Pilih jenis transaksi yang akan dicatat
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="jenis_transaksi">Jenis Transaksi *</Label>
                                <Select value={data.jenis_transaksi} onValueChange={(value) => setData('jenis_transaksi', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="masuk">Barang Masuk</SelectItem>
                                        <SelectItem value="keluar">Barang Keluar</SelectItem>
                                        <SelectItem value="penjualan">Penjualan</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.jenis_transaksi && (
                                    <p className="text-sm text-destructive">{errors.jenis_transaksi}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tanggal_transaksi">Tanggal Transaksi *</Label>
                                <Input
                                    id="tanggal_transaksi"
                                    type="date"
                                    value={data.tanggal_transaksi}
                                    onChange={(e) => setData('tanggal_transaksi', e.target.value)}
                                    required
                                />
                                {errors.tanggal_transaksi && (
                                    <p className="text-sm text-destructive">{errors.tanggal_transaksi}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detail Obat */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Detail Obat</h3>
                            <p className="text-sm text-muted-foreground">
                                Informasi obat dan batch yang ditransaksikan
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="obat_id">Obat *</Label>
                                <Select value={data.obat_id} onValueChange={handleObatChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih obat" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {obat.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.nama_obat} ({item.kode_obat}) - {item.kategori?.nama_kategori}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.obat_id && (
                                    <p className="text-sm text-destructive">{errors.obat_id}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="batch_id">Batch (Opsional untuk Barang Masuk)</Label>
                                <Select value={data.batch_id} onValueChange={handleBatchChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih batch (opsional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map((batch) => (
                                            <SelectItem key={batch.id} value={batch.id.toString()}>
                                                <div className="flex flex-col">
                                                    <span>{batch.obat.nama_obat} - Batch: {batch.nomor_batch}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Expired: {formatDate(batch.tanggal_expired)} | Stok: {batch.stok_tersedia}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.batch_id && (
                                    <p className="text-sm text-destructive">{errors.batch_id}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="unit_id">Unit Tujuan (Opsional)</Label>
                                <Select value={data.unit_id} onValueChange={(value) => setData('unit_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih unit (opsional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                {unit.nama_unit} ({unit.kode_unit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && (
                                    <p className="text-sm text-destructive">{errors.unit_id}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Jumlah & Harga */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Jumlah & Harga</h3>
                            <p className="text-sm text-muted-foreground">
                                Informasi kuantitas dan nilai transaksi
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="jumlah">Jumlah *</Label>
                                <Input
                                    id="jumlah"
                                    type="number"
                                    min="1"
                                    value={data.jumlah}
                                    onChange={(e) => setData('jumlah', e.target.value)}
                                    placeholder="Jumlah"
                                    required
                                />
                                {errors.jumlah && (
                                    <p className="text-sm text-destructive">{errors.jumlah}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="harga_satuan">Harga Satuan (Rp) *</Label>
                                <Input
                                    id="harga_satuan"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.harga_satuan}
                                    onChange={(e) => setData('harga_satuan', e.target.value)}
                                    placeholder="Harga per unit"
                                    required
                                />
                                {errors.harga_satuan && (
                                    <p className="text-sm text-destructive">{errors.harga_satuan}</p>
                                )}
                            </div>
                        </div>

                        {data.jumlah && data.harga_satuan && (
                            <div className="rounded-lg bg-purple-50 dark:bg-purple-950/20 p-4 border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Total Harga:</span>
                                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {formatCurrency(getTotalHarga())}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Informasi Tambahan */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Informasi Tambahan</h3>
                            <p className="text-sm text-muted-foreground">
                                Catatan dan referensi transaksi
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nomor_referensi">Nomor Referensi</Label>
                                <Input
                                    id="nomor_referensi"
                                    value={data.nomor_referensi}
                                    onChange={(e) => setData('nomor_referensi', e.target.value)}
                                    placeholder="Nomor PO, Invoice, dll (opsional)"
                                />
                                {errors.nomor_referensi && (
                                    <p className="text-sm text-destructive">{errors.nomor_referensi}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="keterangan">Keterangan</Label>
                                <Textarea
                                    id="keterangan"
                                    value={data.keterangan}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('keterangan', e.target.value)}
                                    placeholder="Keterangan tambahan (opsional)"
                                    rows={3}
                                />
                                {errors.keterangan && (
                                    <p className="text-sm text-destructive">{errors.keterangan}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 size-4" />
                            {processing ? 'Menyimpan...' : 'Update Transaksi'}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/transaksi">
                                <X className="mr-2 size-4" />
                                Batal
                            </Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
