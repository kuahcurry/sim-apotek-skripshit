import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Resep', href: '/resep' },
];

interface ResepDetail {
    id: number;
    obat: {
        nama_obat: string;
    };
    jumlah: number;
    dosis?: string;
    aturan_pakai?: string;
}

interface Resep {
    id: number;
    nomor_resep: string;
    nomor_rm: string;
    nama_pasien: string;
    nama_dokter: string;
    unit?: {
        nama_unit: string;
    };
    tanggal_resep: string;
    jenis_pasien: string;
    cara_bayar: string;
    status: string;
    details: ResepDetail[];
}

interface Props {
    resep: {
        data: Resep[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
}

export default function ResepIndex({ resep }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/resep/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: { label: 'Pending', variant: 'secondary' as const },
            processed: { label: 'Diproses', variant: 'default' as const },
            completed: { label: 'Selesai', variant: 'default' as const },
            cancelled: { label: 'Dibatalkan', variant: 'destructive' as const },
        };
        const config = variants[status as keyof typeof variants] || variants.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getJenisPasienLabel = (jenis: string) => {
        const labels = {
            rawat_jalan: 'Rawat Jalan',
            rawat_inap: 'Rawat Inap',
            igd: 'IGD',
        };
        return labels[jenis as keyof typeof labels] || jenis;
    };

    const getCaraBayarLabel = (cara: string) => {
        const labels = {
            umum: 'Umum',
            bpjs: 'BPJS',
            asuransi: 'Asuransi',
        };
        return labels[cara as keyof typeof labels] || cara;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resep" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Resep Obat</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola resep obat dari dokter
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/resep/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Resep
                        </Link>
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Resep</TableHead>
                                <TableHead>No. RM</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Dokter</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resep.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8">
                                        <FileText className="mx-auto mb-2 size-12 text-muted-foreground" />
                                        <p className="text-muted-foreground">Belum ada data resep</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                resep.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.nomor_resep}</TableCell>
                                        <TableCell>{item.nomor_rm}</TableCell>
                                        <TableCell>{item.nama_pasien}</TableCell>
                                        <TableCell>{item.nama_dokter}</TableCell>
                                        <TableCell>{item.unit?.nama_unit || '-'}</TableCell>
                                        <TableCell>{formatDate(item.tanggal_resep)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{getJenisPasienLabel(item.jenis_pasien)}</Badge>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/resep/${item.id}`}>
                                                        <Eye className="size-4" />
                                                    </Link>
                                                </Button>
                                                {item.status === 'pending' && (
                                                    <>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/resep/${item.id}/edit`}>
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeleteId(item.id)}
                                                        >
                                                            <Trash2 className="size-4" />
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

                    {resep.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Halaman {resep.current_page} dari {resep.last_page}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!resep.prev_page_url}
                                    onClick={() => resep.prev_page_url && router.visit(resep.prev_page_url)}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!resep.next_page_url}
                                    onClick={() => resep.next_page_url && router.visit(resep.next_page_url)}
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
                            Apakah Anda yakin ingin menghapus resep ini? Tindakan ini tidak dapat dibatalkan.
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

