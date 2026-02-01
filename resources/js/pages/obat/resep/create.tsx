import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Resep', href: '/resep' },
    { title: 'Tambah Resep', href: '/resep/create' },
];

interface Obat {
    id: number;
    kode_obat: string;
    nama_obat: string;
    kategori?: { nama_kategori: string };
    jenis?: { nama_jenis: string };
    satuan?: { nama_satuan: string };
    stok_total: number;
}

interface Unit {
    id: number;
    kode_unit: string;
    nama_unit: string;
}

interface Props {
    obat: Obat[];
    units: Unit[];
}

interface DetailItem {
    obat_id: string;
    jumlah: string;
    dosis: string;
    aturan_pakai: string;
    catatan: string;
}

export default function ResepCreate({ obat, units }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nomor_rm: '',
        nama_pasien: '',
        nama_dokter: '',
        unit_id: '',
        tanggal_resep: new Date().toISOString().split('T')[0],
        jenis_pasien: 'rawat_jalan',
        cara_bayar: 'umum',
        catatan: '',
        details: [
            {
                obat_id: '',
                jumlah: '',
                dosis: '',
                aturan_pakai: '',
                catatan: '',
            },
        ] as DetailItem[],
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/resep', {
            onSuccess: () => {
                console.log('Resep saved successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            },
            preserveScroll: true,
        });
    };

    const addDetailRow = () => {
        setData('details', [
            ...data.details,
            {
                obat_id: '',
                jumlah: '',
                dosis: '',
                aturan_pakai: '',
                catatan: '',
            },
        ]);
    };

    const removeDetailRow = (index: number) => {
        const newDetails = data.details.filter((_, i) => i !== index);
        setData('details', newDetails);
    };

    const updateDetail = (index: number, field: keyof DetailItem, value: string) => {
        const newDetails = [...data.details];
        newDetails[index][field] = value;
        setData('details', newDetails);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Resep" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Resep Obat</h1>
                        <p className="text-sm text-muted-foreground">
                            Buat resep baru dari dokter
                        </p>
                    </div>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="max-w-5xl rounded-xl border border-destructive/50 bg-destructive/10 p-4">
                        <h4 className="font-semibold text-destructive mb-2">Terdapat kesalahan pada form:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                            {Object.entries(errors).map(([key, value]) => (
                                <li key={key}>{value}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
                    {/* Informasi Pasien */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Informasi Pasien</h3>
                            <p className="text-sm text-muted-foreground">
                                Data pasien dan dokter pemberi resep
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="nomor_rm">No. Rekam Medis *</Label>
                                <Input
                                    id="nomor_rm"
                                    value={data.nomor_rm}
                                    onChange={(e) => setData('nomor_rm', e.target.value)}
                                    placeholder="Contoh: RM001234"
                                    required
                                />
                                {errors.nomor_rm && (
                                    <p className="text-sm text-destructive">{errors.nomor_rm}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="nama_pasien">Nama Pasien *</Label>
                                <Input
                                    id="nama_pasien"
                                    value={data.nama_pasien}
                                    onChange={(e) => setData('nama_pasien', e.target.value)}
                                    placeholder="Nama lengkap pasien"
                                    required
                                />
                                {errors.nama_pasien && (
                                    <p className="text-sm text-destructive">{errors.nama_pasien}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="nama_dokter">Nama Dokter *</Label>
                                <Input
                                    id="nama_dokter"
                                    value={data.nama_dokter}
                                    onChange={(e) => setData('nama_dokter', e.target.value)}
                                    placeholder="Nama dokter pemberi resep"
                                    required
                                />
                                {errors.nama_dokter && (
                                    <p className="text-sm text-destructive">{errors.nama_dokter}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="unit_id">Unit / Poli</Label>
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

                            <div className="grid gap-2">
                                <Label htmlFor="tanggal_resep">Tanggal Resep *</Label>
                                <Input
                                    id="tanggal_resep"
                                    type="date"
                                    value={data.tanggal_resep}
                                    onChange={(e) => setData('tanggal_resep', e.target.value)}
                                    required
                                />
                                {errors.tanggal_resep && (
                                    <p className="text-sm text-destructive">{errors.tanggal_resep}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="jenis_pasien">Jenis Pasien *</Label>
                                <Select value={data.jenis_pasien} onValueChange={(value) => setData('jenis_pasien', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rawat_jalan">Rawat Jalan</SelectItem>
                                        <SelectItem value="rawat_inap">Rawat Inap</SelectItem>
                                        <SelectItem value="igd">IGD</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.jenis_pasien && (
                                    <p className="text-sm text-destructive">{errors.jenis_pasien}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cara_bayar">Cara Bayar *</Label>
                                <Select value={data.cara_bayar} onValueChange={(value) => setData('cara_bayar', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="umum">Umum</SelectItem>
                                        <SelectItem value="bpjs">BPJS</SelectItem>
                                        <SelectItem value="asuransi">Asuransi</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.cara_bayar && (
                                    <p className="text-sm text-destructive">{errors.cara_bayar}</p>
                                )}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="catatan">Catatan</Label>
                                <Textarea
                                    id="catatan"
                                    value={data.catatan}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('catatan', e.target.value)}
                                    placeholder="Catatan tambahan (opsional)"
                                    rows={2}
                                />
                                {errors.catatan && (
                                    <p className="text-sm text-destructive">{errors.catatan}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detail Obat */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Detail Obat</h3>
                                <p className="text-sm text-muted-foreground">
                                    Daftar obat yang diresepkan
                                </p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addDetailRow}>
                                <Plus className="mr-2 size-4" />
                                Tambah Obat
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {data.details.map((detail, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                                    {data.details.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={() => removeDetailRow(index)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    )}

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor={`obat_${index}`}>Obat *</Label>
                                            <Select
                                                value={detail.obat_id}
                                                onValueChange={(value) => updateDetail(index, 'obat_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih obat" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {obat.map((item) => (
                                                        <SelectItem key={item.id} value={item.id.toString()}>
                                                            {item.nama_obat} - Stok: {item.stok_total} ({item.kode_obat})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors[`details.${index}.obat_id`] && (
                                                <p className="text-sm text-destructive">{errors[`details.${index}.obat_id`]}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor={`jumlah_${index}`}>Jumlah *</Label>
                                            <Input
                                                id={`jumlah_${index}`}
                                                type="number"
                                                min="1"
                                                value={detail.jumlah}
                                                onChange={(e) => updateDetail(index, 'jumlah', e.target.value)}
                                                placeholder="Jumlah"
                                                required
                                            />
                                            {errors[`details.${index}.jumlah`] && (
                                                <p className="text-sm text-destructive">{errors[`details.${index}.jumlah`]}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor={`dosis_${index}`}>Dosis</Label>
                                            <Input
                                                id={`dosis_${index}`}
                                                value={detail.dosis}
                                                onChange={(e) => updateDetail(index, 'dosis', e.target.value)}
                                                placeholder="Contoh: 500mg"
                                            />
                                            {errors[`details.${index}.dosis`] && (
                                                <p className="text-sm text-destructive">{errors[`details.${index}.dosis`]}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor={`aturan_pakai_${index}`}>Aturan Pakai</Label>
                                            <Input
                                                id={`aturan_pakai_${index}`}
                                                value={detail.aturan_pakai}
                                                onChange={(e) => updateDetail(index, 'aturan_pakai', e.target.value)}
                                                placeholder="Contoh: 3 x sehari sesudah makan"
                                            />
                                            {errors[`details.${index}.aturan_pakai`] && (
                                                <p className="text-sm text-destructive">{errors[`details.${index}.aturan_pakai`]}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor={`catatan_detail_${index}`}>Catatan</Label>
                                            <Input
                                                id={`catatan_detail_${index}`}
                                                value={detail.catatan}
                                                onChange={(e) => updateDetail(index, 'catatan', e.target.value)}
                                                placeholder="Catatan untuk obat ini (opsional)"
                                            />
                                            {errors[`details.${index}.catatan`] && (
                                                <p className="text-sm text-destructive">{errors[`details.${index}.catatan`]}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 size-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Resep'}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/resep">
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
