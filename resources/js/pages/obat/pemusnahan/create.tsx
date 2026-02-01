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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pemusnahan Obat', href: '/pemusnahan' },
    { title: 'Tambah Pemusnahan', href: '/pemusnahan/create' },
];

interface Batch {
    id: number;
    nomor_batch: string;
    tanggal_expired: string;
    stok_tersedia: number;
    harga_beli: number;
    status: string;
    obat: {
        nama_obat: string;
        kode_obat: string;
        satuan?: {
            nama_satuan: string;
        };
    };
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    batches: Batch[];
    users: User[];
}

interface DetailItem {
    batch_id: string;
    jumlah: string;
    nilai_perolehan: string;
    kondisi: string;
}

interface SaksiItem {
    nama: string;
    jabatan: string;
}

export default function PemusnahanCreate({ batches, users }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        tanggal_pemusnahan: new Date().toISOString().split('T')[0],
        penanggung_jawab: '',
        lokasi_pemusnahan: '',
        metode_pemusnahan: '',
        saksi: [
            { nama: '', jabatan: '' },
        ] as SaksiItem[],
        alasan: 'expired',
        keterangan: '',
        status: 'draft',
        details: [
            {
                batch_id: '',
                jumlah: '',
                nilai_perolehan: '',
                kondisi: '',
            },
        ] as DetailItem[],
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/pemusnahan', {
            onSuccess: () => {
                console.log('Pemusnahan saved successfully');
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
                batch_id: '',
                jumlah: '',
                nilai_perolehan: '',
                kondisi: '',
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
        
        // Auto-fill nilai_perolehan when batch is selected
        if (field === 'batch_id' && value) {
            const batch = batches.find(b => b.id.toString() === value);
            if (batch) {
                newDetails[index].nilai_perolehan = batch.harga_beli.toString();
            }
        }
        
        setData('details', newDetails);
    };

    const addSaksiRow = () => {
        setData('saksi', [
            ...data.saksi,
            { nama: '', jabatan: '' },
        ]);
    };

    const removeSaksiRow = (index: number) => {
        const newSaksi = data.saksi.filter((_, i) => i !== index);
        setData('saksi', newSaksi);
    };

    const updateSaksi = (index: number, field: keyof SaksiItem, value: string) => {
        const newSaksi = [...data.saksi];
        newSaksi[index][field] = value;
        setData('saksi', newSaksi);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Pemusnahan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Pemusnahan Obat</h1>
                        <p className="text-sm text-muted-foreground">
                            Buat berita acara pemusnahan obat
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
                    {/* Informasi Umum */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Informasi Berita Acara</h3>
                            <p className="text-sm text-muted-foreground">
                                Data umum pemusnahan obat
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="tanggal_pemusnahan">Tanggal Pemusnahan *</Label>
                                <Input
                                    id="tanggal_pemusnahan"
                                    type="date"
                                    value={data.tanggal_pemusnahan}
                                    onChange={(e) => setData('tanggal_pemusnahan', e.target.value)}
                                    required
                                />
                                {errors.tanggal_pemusnahan && (
                                    <p className="text-sm text-destructive">{errors.tanggal_pemusnahan}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="penanggung_jawab">Penanggung Jawab *</Label>
                                <Select value={data.penanggung_jawab} onValueChange={(value) => setData('penanggung_jawab', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih penanggung jawab" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.penanggung_jawab && (
                                    <p className="text-sm text-destructive">{errors.penanggung_jawab}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="lokasi_pemusnahan">Lokasi Pemusnahan</Label>
                                <Input
                                    id="lokasi_pemusnahan"
                                    value={data.lokasi_pemusnahan}
                                    onChange={(e) => setData('lokasi_pemusnahan', e.target.value)}
                                    placeholder="Contoh: Incinerator Rumah Sakit"
                                />
                                {errors.lokasi_pemusnahan && (
                                    <p className="text-sm text-destructive">{errors.lokasi_pemusnahan}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="alasan">Alasan Pemusnahan *</Label>
                                <Select value={data.alasan} onValueChange={(value) => setData('alasan', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="expired">Kadaluarsa</SelectItem>
                                        <SelectItem value="rusak">Rusak</SelectItem>
                                        <SelectItem value="recall">Recall</SelectItem>
                                        <SelectItem value="lainnya">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.alasan && (
                                    <p className="text-sm text-destructive">{errors.alasan}</p>
                                )}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="metode_pemusnahan">Metode Pemusnahan</Label>
                                <Textarea
                                    id="metode_pemusnahan"
                                    value={data.metode_pemusnahan}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('metode_pemusnahan', e.target.value)}
                                    placeholder="Jelaskan metode/cara pemusnahan sesuai regulasi (Contoh: Insinerasi pada suhu 1200°C)"
                                    rows={2}
                                />
                                {errors.metode_pemusnahan && (
                                    <p className="text-sm text-destructive">{errors.metode_pemusnahan}</p>
                                )}
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="keterangan">Keterangan</Label>
                                <Textarea
                                    id="keterangan"
                                    value={data.keterangan}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('keterangan', e.target.value)}
                                    placeholder="Keterangan tambahan"
                                    rows={2}
                                />
                                {errors.keterangan && (
                                    <p className="text-sm text-destructive">{errors.keterangan}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft (Belum Dilaksanakan)</SelectItem>
                                        <SelectItem value="completed">Selesai (Sudah Dilaksanakan)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-destructive">{errors.status}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Saksi */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Saksi Pemusnahan</h3>
                                <p className="text-sm text-muted-foreground">
                                    Daftar saksi yang menyaksikan pemusnahan
                                </p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addSaksiRow}>
                                <Plus className="mr-2 size-4" />
                                Tambah Saksi
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {data.saksi.map((saksi, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                                    {data.saksi.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={() => removeSaksiRow(index)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    )}

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor={`saksi_nama_${index}`}>Nama Saksi</Label>
                                            <Input
                                                id={`saksi_nama_${index}`}
                                                value={saksi.nama}
                                                onChange={(e) => updateSaksi(index, 'nama', e.target.value)}
                                                placeholder="Nama lengkap"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor={`saksi_jabatan_${index}`}>Jabatan</Label>
                                            <Input
                                                id={`saksi_jabatan_${index}`}
                                                value={saksi.jabatan}
                                                onChange={(e) => updateSaksi(index, 'jabatan', e.target.value)}
                                                placeholder="Jabatan"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detail Obat */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Detail Obat yang Dimusnahkan</h3>
                                <p className="text-sm text-muted-foreground">
                                    Daftar batch obat yang akan dimusnahkan
                                </p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addDetailRow}>
                                <Plus className="mr-2 size-4" />
                                Tambah Batch
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

                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor={`batch_${index}`}>Batch Obat *</Label>
                                            <Select
                                                value={detail.batch_id}
                                                onValueChange={(value) => updateDetail(index, 'batch_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih batch obat" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {batches.map((batch) => (
                                                        <SelectItem key={batch.id} value={batch.id.toString()}>
                                                            <div className="flex flex-col">
                                                                <span>{batch.obat.nama_obat} - Batch: {batch.nomor_batch}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Expired: {formatDate(batch.tanggal_expired)} | 
                                                                    Stok: {batch.stok_tersedia} {batch.obat.satuan?.nama_satuan} | 
                                                                    Status: {batch.status}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors[`details.${index}.batch_id`] && (
                                                <p className="text-sm text-destructive">{errors[`details.${index}.batch_id`]}</p>
                                            )}
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-3">
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
                                                <Label htmlFor={`nilai_${index}`}>Nilai Perolehan (Rp) *</Label>
                                                <Input
                                                    id={`nilai_${index}`}
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={detail.nilai_perolehan}
                                                    onChange={(e) => updateDetail(index, 'nilai_perolehan', e.target.value)}
                                                    placeholder="Harga beli per unit"
                                                    required
                                                />
                                                {errors[`details.${index}.nilai_perolehan`] && (
                                                    <p className="text-sm text-destructive">{errors[`details.${index}.nilai_perolehan`]}</p>
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor={`kondisi_${index}`}>Kondisi</Label>
                                                <Input
                                                    id={`kondisi_${index}`}
                                                    value={detail.kondisi}
                                                    onChange={(e) => updateDetail(index, 'kondisi', e.target.value)}
                                                    placeholder="Kondisi fisik"
                                                />
                                                {errors[`details.${index}.kondisi`] && (
                                                    <p className="text-sm text-destructive">{errors[`details.${index}.kondisi`]}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 size-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Pemusnahan'}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/pemusnahan">
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
