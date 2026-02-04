import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, Search } from 'lucide-react';
import { useState } from 'react';

interface Obat {
    id: number;
    nama_obat: string;
    kode_obat: string;
    kategori?: {
        nama_kategori: string;
    };
    satuan?: {
        nama_satuan: string;
    };
}

interface Batch {
    id: number;
    nomor_batch: string;
    obat: Obat;
    stok_tersedia: number;
    tanggal_kadaluarsa: string;
}

interface Unit {
    id: number;
    nama_unit: string;
    kode_unit: string;
}

interface Detail {
    batch_id: number;
    stok_fisik: number;
    keterangan_selisih: string;
}

interface Props {
    units: Unit[];
    batches: Batch[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Stok Opname', href: '/stok-opname' },
    { title: 'Buat Stok Opname', href: '/stok-opname/create' },
];

export default function StokOpnameCreate({ units, batches }: Props) {
    const [selectedBatches, setSelectedBatches] = useState<Map<number, { batch: Batch; stok_fisik: number; keterangan_selisih: string }>>(new Map());
    const [searchBatch, setSearchBatch] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        unit_id: '',
        tanggal_opname: new Date().toISOString().split('T')[0],
        catatan: '',
        details: [] as Detail[],
    });

    const filteredBatches = batches.filter(batch => 
        !selectedBatches.has(batch.id) && (
            batch.nomor_batch.toLowerCase().includes(searchBatch.toLowerCase()) ||
            batch.obat.nama_obat.toLowerCase().includes(searchBatch.toLowerCase()) ||
            batch.obat.kode_obat.toLowerCase().includes(searchBatch.toLowerCase())
        )
    );

    const addBatch = (batch: Batch) => {
        const newMap = new Map(selectedBatches);
        newMap.set(batch.id, {
            batch,
            stok_fisik: batch.stok_tersedia,
            keterangan_selisih: ''
        });
        setSelectedBatches(newMap);
        setSearchBatch('');
    };

    const removeBatch = (batchId: number) => {
        const newMap = new Map(selectedBatches);
        newMap.delete(batchId);
        setSelectedBatches(newMap);
    };

    const updateStokFisik = (batchId: number, value: number) => {
        const newMap = new Map(selectedBatches);
        const item = newMap.get(batchId);
        if (item) {
            item.stok_fisik = value;
            newMap.set(batchId, item);
            setSelectedBatches(newMap);
        }
    };

    const updateKeterangan = (batchId: number, value: string) => {
        const newMap = new Map(selectedBatches);
        const item = newMap.get(batchId);
        if (item) {
            item.keterangan_selisih = value;
            newMap.set(batchId, item);
            setSelectedBatches(newMap);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const details: Detail[] = Array.from(selectedBatches.values()).map(item => ({
            batch_id: item.batch.id,
            stok_fisik: item.stok_fisik,
            keterangan_selisih: item.keterangan_selisih,
        }));

        // Post with form data and details combined
        post('/stok-opname', {
            data: {
                unit_id: data.unit_id,
                tanggal_opname: data.tanggal_opname,
                catatan: data.catatan,
                details,
            },
        });
    };

    const calculateSelisih = (stokSistem: number, stokFisik: number) => {
        return stokFisik - stokSistem;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Stok Opname" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/stok-opname">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Buat Stok Opname</h1>
                        <p className="text-sm text-muted-foreground">
                            Buat stock taking baru untuk penghitungan stok fisik
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Header Information */}
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="font-semibold mb-4">Informasi Stok Opname</h3>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="unit_id">
                                        Unit Rumah Sakit <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.unit_id}
                                        onValueChange={(value) => setData('unit_id', value)}
                                    >
                                        <SelectTrigger className={errors.unit_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Pilih unit rumah sakit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.map((unit) => (
                                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                                    <div>
                                                        <p className="font-medium">{unit.nama_unit}</p>
                                                        <p className="text-xs text-muted-foreground">{unit.kode_unit}</p>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.unit_id && (
                                        <p className="text-sm text-destructive">{errors.unit_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tanggal_opname">
                                        Tanggal Opname <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="tanggal_opname"
                                        type="date"
                                        value={data.tanggal_opname}
                                        onChange={(e) => setData('tanggal_opname', e.target.value)}
                                        className={errors.tanggal_opname ? 'border-destructive' : ''}
                                    />
                                    {errors.tanggal_opname && (
                                        <p className="text-sm text-destructive">{errors.tanggal_opname}</p>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="catatan">Catatan</Label>
                                    <Textarea
                                        id="catatan"
                                        value={data.catatan}
                                        onChange={(e) => setData('catatan', e.target.value)}
                                        placeholder="Catatan tambahan untuk stok opname..."
                                        rows={3}
                                        className={errors.catatan ? 'border-destructive' : ''}
                                    />
                                    {errors.catatan && (
                                        <p className="text-sm text-destructive">{errors.catatan}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Add Batch Section */}
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="font-semibold mb-4">Tambah Batch Obat</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Cari batch, obat, atau kode obat..."
                                            value={searchBatch}
                                            onChange={(e) => setSearchBatch(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                {searchBatch && filteredBatches.length > 0 && (
                                    <div className="rounded-lg border max-h-64 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Batch</TableHead>
                                                    <TableHead>Obat</TableHead>
                                                    <TableHead>Stok</TableHead>
                                                    <TableHead>Kadaluarsa</TableHead>
                                                    <TableHead className="text-right">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredBatches.slice(0, 10).map((batch) => (
                                                    <TableRow key={batch.id}>
                                                        <TableCell className="font-mono text-sm">
                                                            {batch.nomor_batch}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{batch.obat.nama_obat}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {batch.obat.kode_obat} • {batch.obat.kategori?.nama_kategori}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {batch.stok_tersedia} {batch.obat.satuan?.nama_satuan || 'unit'}
                                                        </TableCell>
                                                        <TableCell>{formatDate(batch.tanggal_kadaluarsa)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                onClick={() => addBatch(batch)}
                                                            >
                                                                <Plus className="mr-2 size-4" />
                                                                Tambah
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected Batches Table */}
                        <div className="rounded-lg border bg-card">
                            <div className="p-6 border-b">
                                <h3 className="font-semibold">Detail Stok Opname</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedBatches.size} batch ditambahkan
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Batch</TableHead>
                                            <TableHead>Obat</TableHead>
                                            <TableHead className="text-right">Stok Sistem</TableHead>
                                            <TableHead className="text-right">Stok Fisik</TableHead>
                                            <TableHead className="text-right">Selisih</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedBatches.size === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                    Belum ada batch yang ditambahkan
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            Array.from(selectedBatches.values()).map((item) => {
                                                const selisih = calculateSelisih(item.batch.stok_tersedia, item.stok_fisik);
                                                return (
                                                    <TableRow key={item.batch.id}>
                                                        <TableCell className="font-mono text-sm">
                                                            {item.batch.nomor_batch}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{item.batch.obat.nama_obat}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.batch.obat.kode_obat}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {item.batch.stok_tersedia}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={item.stok_fisik}
                                                                onChange={(e) => updateStokFisik(item.batch.id, parseInt(e.target.value) || 0)}
                                                                className="w-24 text-right"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={`font-bold ${
                                                                selisih === 0 ? 'text-muted-foreground' :
                                                                selisih > 0 ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {selisih > 0 ? '+' : ''}{selisih}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                placeholder="Keterangan..."
                                                                value={item.keterangan_selisih}
                                                                onChange={(e) => updateKeterangan(item.batch.id, e.target.value)}
                                                                className="w-48"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeBatch(item.batch.id)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-4 border-t px-6 py-4 bg-muted/50">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/stok-opname">Batal</Link>
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing || selectedBatches.size === 0}
                                >
                                    <Save className="mr-2 size-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Stok Opname'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
