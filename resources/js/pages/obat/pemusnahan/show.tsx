import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Package, User, Calendar, MapPin, FileText, CheckCircle2, AlertCircle, Clock, Edit, ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pemusnahan Obat', href: '/pemusnahan' },
    { title: 'Detail Pemusnahan', href: '#' },
];

interface BatchObat {
    id: number;
    nomor_batch: string;
    obat: {
        nama_obat: string;
        kode_obat: string;
        satuan?: {
            nama_satuan: string;
        };
    };
}

interface PemusnahanDetail {
    id: number;
    jumlah: number;
    nilai_perolehan: number;
    kondisi: string;
    batch: BatchObat;
}

interface SaksiItem {
    nama: string;
    jabatan: string;
}

interface UserInfo {
    id: number;
    name: string;
    email: string;
}

interface Pemusnahan {
    id: number;
    nomor_berita_acara: string;
    tanggal_pemusnahan: string;
    lokasi_pemusnahan: string;
    metode_pemusnahan: string;
    saksi: SaksiItem[];
    alasan: string;
    status: string;
    keterangan: string;
    approved_at: string | null;
    created_at: string;
    updated_at: string;
    penanggung_jawab: UserInfo;
    approved_by: UserInfo | null;
    details: PemusnahanDetail[];
}

interface Props {
    pemusnahan: Pemusnahan;
}

export default function PemusnahanShow({ pemusnahan }: Props) {
    const { post, processing } = useForm();

    const handleApprove = () => {
        if (confirm('Apakah Anda yakin ingin menyetujui pemusnahan ini?')) {
            post(`/pemusnahan/${pemusnahan.id}/approve`, {
                preserveScroll: true,
            });
        }
    };

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="secondary"><Clock className="mr-1 size-3" />Draft</Badge>;
            case 'completed':
                return <Badge variant="default">Selesai</Badge>;
            case 'approved':
                return <Badge variant="default"><CheckCircle2 className="mr-1 size-3" />Approved</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getAlasanLabel = (alasan: string) => {
        const labels: Record<string, string> = {
            expired: 'Kadaluarsa',
            rusak: 'Rusak',
            recall: 'Recall',
            lainnya: 'Lainnya',
        };
        return labels[alasan] || alasan;
    };

    const totalNilaiPerolehan = pemusnahan.details.reduce(
        (sum, detail) => sum + (detail.jumlah * detail.nilai_perolehan),
        0
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pemusnahan - ${pemusnahan.nomor_berita_acara}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{pemusnahan.nomor_berita_acara}</h1>
                            {getStatusBadge(pemusnahan.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Detail berita acara pemusnahan obat
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {pemusnahan.status === 'completed' && (
                            <Button onClick={handleApprove} disabled={processing}>
                                <CheckCircle2 className="mr-2 size-4" />
                                {processing ? 'Memproses...' : 'Approve Pemusnahan'}
                            </Button>
                        )}
                        {pemusnahan.status === 'draft' && (
                            <Button asChild>
                                <Link href={`/pemusnahan/${pemusnahan.id}/edit`}>
                                    <Edit className="mr-2 size-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/pemusnahan">
                                <ArrowLeft className="mr-2 size-4" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Informasi Umum */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Informasi Berita Acara</h3>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-muted p-2">
                                <Calendar className="size-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Tanggal Pemusnahan</p>
                                <p className="font-medium">{formatDate(pemusnahan.tanggal_pemusnahan)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-muted p-2">
                                <User className="size-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Penanggung Jawab</p>
                                <p className="font-medium">{pemusnahan.penanggung_jawab.name}</p>
                                <p className="text-sm text-muted-foreground">{pemusnahan.penanggung_jawab.email}</p>
                            </div>
                        </div>

                        {pemusnahan.lokasi_pemusnahan && (
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-muted p-2">
                                    <MapPin className="size-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Lokasi Pemusnahan</p>
                                    <p className="font-medium">{pemusnahan.lokasi_pemusnahan}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-muted p-2">
                                <AlertCircle className="size-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Alasan Pemusnahan</p>
                                <p className="font-medium">{getAlasanLabel(pemusnahan.alasan)}</p>
                            </div>
                        </div>

                        {pemusnahan.metode_pemusnahan && (
                            <div className="flex items-start gap-3 md:col-span-2">
                                <div className="rounded-lg bg-muted p-2">
                                    <FileText className="size-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Metode Pemusnahan</p>
                                    <p className="font-medium whitespace-pre-wrap">{pemusnahan.metode_pemusnahan}</p>
                                </div>
                            </div>
                        )}

                        {pemusnahan.keterangan && (
                            <div className="flex items-start gap-3 md:col-span-2">
                                <div className="rounded-lg bg-muted p-2">
                                    <FileText className="size-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Keterangan</p>
                                    <p className="font-medium whitespace-pre-wrap">{pemusnahan.keterangan}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Approval Info */}
                    {pemusnahan.approved_by && pemusnahan.approved_at && (
                        <div className="border-t pt-6">
                            <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-green-900 dark:text-green-100">Disetujui oleh {pemusnahan.approved_by.name}</p>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            {formatDateTime(pemusnahan.approved_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Saksi */}
                {pemusnahan.saksi && pemusnahan.saksi.length > 0 && (
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Saksi Pemusnahan</h3>
                            <p className="text-sm text-muted-foreground">
                                Daftar saksi yang menyaksikan pemusnahan
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {pemusnahan.saksi.map((saksi, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-muted p-2">
                                            <User className="size-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{saksi.nama}</p>
                                            <p className="text-sm text-muted-foreground">{saksi.jabatan}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Detail Obat */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Detail Obat yang Dimusnahkan</h3>
                        <p className="text-sm text-muted-foreground">
                            Daftar batch obat yang dimusnahkan
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 font-semibold">No</th>
                                    <th className="text-left p-3 font-semibold">Nama Obat</th>
                                    <th className="text-left p-3 font-semibold">Nomor Batch</th>
                                    <th className="text-right p-3 font-semibold">Jumlah</th>
                                    <th className="text-right p-3 font-semibold">Nilai Perolehan</th>
                                    <th className="text-right p-3 font-semibold">Total</th>
                                    <th className="text-left p-3 font-semibold">Kondisi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pemusnahan.details.map((detail, index) => (
                                    <tr key={detail.id} className="border-b hover:bg-muted/50">
                                        <td className="p-3">{index + 1}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <Package className="size-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{detail.batch.obat.nama_obat}</p>
                                                    <p className="text-xs text-muted-foreground">{detail.batch.obat.kode_obat}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <code className="text-sm bg-muted px-2 py-1 rounded">
                                                {detail.batch.nomor_batch}
                                            </code>
                                        </td>
                                        <td className="p-3 text-right">
                                            {detail.jumlah} {detail.batch.obat.satuan?.nama_satuan || 'unit'}
                                        </td>
                                        <td className="p-3 text-right">
                                            {formatRupiah(detail.nilai_perolehan)}
                                        </td>
                                        <td className="p-3 text-right font-medium">
                                            {formatRupiah(detail.jumlah * detail.nilai_perolehan)}
                                        </td>
                                        <td className="p-3">
                                            {detail.kondisi || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-muted/50 font-semibold">
                                    <td colSpan={5} className="p-3 text-right">
                                        Total Nilai Perolehan:
                                    </td>
                                    <td className="p-3 text-right text-lg">
                                        {formatRupiah(totalNilaiPerolehan)}
                                    </td>
                                    <td className="p-3"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Metadata */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card p-6">
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                        <div>
                            <p className="text-muted-foreground">Dibuat pada</p>
                            <p className="font-medium">{formatDateTime(pemusnahan.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Terakhir diupdate</p>
                            <p className="font-medium">{formatDateTime(pemusnahan.updated_at)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
