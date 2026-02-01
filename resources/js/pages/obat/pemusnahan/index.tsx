import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Trash2, Plus, Eye, Pencil, Trash, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pemusnahan Obat', href: '/pemusnahan' },
];

interface Detail {
    id: number;
    jumlah: number;
    nilai_perolehan: number;
}

interface Pemusnahan {
    id: number;
    nomor_berita_acara: string;
    tanggal_pemusnahan: string;
    penanggung_jawab?: {
        name: string;
    };
    lokasi_pemusnahan?: string;
    alasan: string;
    status: string;
    approvedBy?: {
        name: string;
    };
    approved_at?: string;
    details: Detail[];
}

interface Props {
    pemusnahan: {
        data: Pemusnahan[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
}

export default function PemusnahanIndex({ pemusnahan }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/pemusnahan/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            draft: { label: 'Draft', variant: 'secondary' as const },
            completed: { label: 'Selesai', variant: 'default' as const },
            approved: { label: 'Disetujui', variant: 'default' as const },
        };
        const config = variants[status as keyof typeof variants] || variants.draft;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getAlasanLabel = (alasan: string) => {
        const labels = {
            expired: 'Kadaluarsa',
            rusak: 'Rusak',
            recall: 'Recall',
            lainnya: 'Lainnya',
        };
        return labels[alasan as keyof typeof labels] || alasan;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getTotalNilai = (details: Detail[]) => {
        return details.reduce((sum, detail) => sum + Number(detail.nilai_perolehan), 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pemusnahan Obat" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Pemusnahan Obat</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola dokumentasi pemusnahan obat kadaluarsa atau rusak
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/pemusnahan/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Pemusnahan
                        </Link>
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Berita Acara</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Penanggung Jawab</TableHead>
                                <TableHead>Alasan</TableHead>
                                <TableHead>Total Nilai</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pemusnahan.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <Trash2 className="mx-auto mb-2 size-12 text-muted-foreground" />
                                        <p className="text-muted-foreground">Belum ada data pemusnahan</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pemusnahan.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.nomor_berita_acara}</TableCell>
                                        <TableCell>{formatDate(item.tanggal_pemusnahan)}</TableCell>
                                        <TableCell>{item.penanggung_jawab?.name || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{getAlasanLabel(item.alasan)}</Badge>
                                        </TableCell>
                                        <TableCell>{formatCurrency(getTotalNilai(item.details))}</TableCell>
                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/pemusnahan/${item.id}`}>
                                                        <Eye className="size-4" />
                                                    </Link>
                                                </Button>
                                                {item.status === 'draft' && (
                                                    <>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/pemusnahan/${item.id}/edit`}>
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeleteId(item.id)}
                                                        >
                                                            <Trash className="size-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {pemusnahan.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Halaman {pemusnahan.current_page} dari {pemusnahan.last_page}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pemusnahan.prev_page_url}
                                    onClick={() => pemusnahan.prev_page_url && router.visit(pemusnahan.prev_page_url)}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pemusnahan.next_page_url}
                                    onClick={() => pemusnahan.next_page_url && router.visit(pemusnahan.next_page_url)}
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus data pemusnahan ini? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

