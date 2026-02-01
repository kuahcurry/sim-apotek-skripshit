import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import type { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Batch Obat', href: '/batch' },
    { title: 'Edit Batch', href: '#' },
];

interface Batch {
    id: number;
    obat_id: number;
    supplier_id: number | null;
    nomor_batch: string;
    tanggal_produksi: string | null;
    tanggal_expired: string;
    tanggal_masuk: string;
    stok_awal: number;
    harga_beli: number;
    status: string;
    catatan: string | null;
}

interface Obat {
    id: number;
    kode_obat: string;
    nama_obat: string;
    kategori?: { nama_kategori: string };
    jenis?: { nama_jenis: string };
    satuan?: { nama_satuan: string };
}

interface Supplier {
    id: number;
    kode_supplier: string;
    nama_supplier: string;
}

interface Props {
    batch: Batch;
    obat: Obat[];
    suppliers: Supplier[];
}

export default function BatchEdit({ batch, obat, suppliers }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        obat_id: batch.obat_id.toString(),
        supplier_id: batch.supplier_id?.toString() || '',
        nomor_batch: batch.nomor_batch,
        tanggal_produksi: batch.tanggal_produksi || '',
        tanggal_expired: batch.tanggal_expired,
        tanggal_masuk: batch.tanggal_masuk,
        stok_awal: batch.stok_awal.toString(),
        harga_beli: batch.harga_beli.toString(),
        status: batch.status,
        catatan: batch.catatan || '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        
        put(`/batch/${batch.id}`, {
            onSuccess: () => {
                console.log('Batch updated successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            },
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Batch Obat" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Batch Obat</h1>
                        <p className="text-sm text-muted-foreground">
                            Edit informasi batch obat: {batch.nomor_batch}
                        </p>
                    </div>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="max-w-3xl rounded-xl border border-destructive/50 bg-destructive/10 p-4">
                        <h4 className="font-semibold text-destructive mb-2">Terdapat kesalahan pada form:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                            {Object.entries(errors).map(([key, value]) => (
                                <li key={key}>{value}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Informasi Obat</h3>
                            <p className="text-sm text-muted-foreground">
                                Pilih obat dan supplier untuk batch ini
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="obat_id">Obat *</Label>
                                <Select value={data.obat_id} onValueChange={(value) => setData('obat_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih obat" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {obat.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.nama_obat} ({item.kode_obat})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.obat_id && (
                                    <p className="text-sm text-destructive">{errors.obat_id}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="supplier_id">Supplier</Label>
                                <Select value={data.supplier_id} onValueChange={(value) => setData('supplier_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih supplier (opsional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                {supplier.nama_supplier} ({supplier.kode_supplier})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.supplier_id && (
                                    <p className="text-sm text-destructive">{errors.supplier_id}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Informasi Batch</h3>
                            <p className="text-sm text-muted-foreground">
                                Detail batch dan tanggal penting
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nomor_batch">Nomor Batch / Lot *</Label>
                                <Input
                                    id="nomor_batch"
                                    value={data.nomor_batch}
                                    onChange={(e) => setData('nomor_batch', e.target.value)}
                                    placeholder="Contoh: LOT2024A123"
                                    required
                                />
                                {errors.nomor_batch && (
                                    <p className="text-sm text-destructive">{errors.nomor_batch}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="tanggal_produksi">Tanggal Produksi</Label>
                                    <Input
                                        id="tanggal_produksi"
                                        type="date"
                                        value={data.tanggal_produksi}
                                        onChange={(e) => setData('tanggal_produksi', e.target.value)}
                                    />
                                    {errors.tanggal_produksi && (
                                        <p className="text-sm text-destructive">{errors.tanggal_produksi}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="tanggal_expired">Tanggal Expired *</Label>
                                    <Input
                                        id="tanggal_expired"
                                        type="date"
                                        value={data.tanggal_expired}
                                        onChange={(e) => setData('tanggal_expired', e.target.value)}
                                        required
                                    />
                                    {errors.tanggal_expired && (
                                        <p className="text-sm text-destructive">{errors.tanggal_expired}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="tanggal_masuk">Tanggal Masuk *</Label>
                                    <Input
                                        id="tanggal_masuk"
                                        type="date"
                                        value={data.tanggal_masuk}
                                        onChange={(e) => setData('tanggal_masuk', e.target.value)}
                                        required
                                    />
                                    {errors.tanggal_masuk && (
                                        <p className="text-sm text-destructive">{errors.tanggal_masuk}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Stok dan Harga</h3>
                            <p className="text-sm text-muted-foreground">
                                Informasi stok awal dan harga pembelian
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="stok_awal">Stok Awal *</Label>
                                    <Input
                                        id="stok_awal"
                                        type="number"
                                        min="1"
                                        value={data.stok_awal}
                                        onChange={(e) => setData('stok_awal', e.target.value)}
                                        placeholder="Jumlah stok awal"
                                        required
                                    />
                                    {errors.stok_awal && (
                                        <p className="text-sm text-destructive">{errors.stok_awal}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="harga_beli">Harga Beli (per unit) *</Label>
                                    <Input
                                        id="harga_beli"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.harga_beli}
                                        onChange={(e) => setData('harga_beli', e.target.value)}
                                        placeholder="Harga per satuan"
                                        required
                                    />
                                    {errors.harga_beli && (
                                        <p className="text-sm text-destructive">{errors.harga_beli}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Tersedia</SelectItem>
                                        <SelectItem value="empty">Habis</SelectItem>
                                        <SelectItem value="expired">Kadaluarsa</SelectItem>
                                        <SelectItem value="recalled">Ditarik</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="catatan">Catatan</Label>
                                <Textarea
                                    id="catatan"
                                    value={data.catatan}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('catatan', e.target.value)}
                                    placeholder="Catatan tambahan (opsional)"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 size-4" />
                            {processing ? 'Menyimpan...' : 'Update Batch'}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/batch">
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
