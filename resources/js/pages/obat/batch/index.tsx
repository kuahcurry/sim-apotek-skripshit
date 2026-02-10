import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Package, Plus, Pencil, Trash2, AlertTriangle, CheckCircle2, XCircle, QrCode, Eye, Download, Printer, Copy } from 'lucide-react';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Batch Obat', href: '/batch' },
];

interface Batch {
    id: number;
    nomor_batch: string;
    kode_qr: string;
    tanggal_produksi?: string;
    tanggal_expired: string;
    tanggal_masuk: string;
    stok_awal: number;
    stok_tersedia: number;
    harga_beli: number;
    status: string;
    obat: {
        id: number;
        kode_obat: string;
        nama_obat: string;
        kategori?: { nama_kategori: string };
        jenis?: { nama_jenis: string };
        satuan?: { nama_satuan: string };
    };
    supplier?: {
        nama_supplier: string;
    };
}

interface Props {
    batches: {
        data: Batch[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function BatchIndex({ batches }: Props) {
    const [qrCode, setQrCode] = useState<string>('');
    const [qrData, setQrData] = useState<any>(null);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [generatingQr, setGeneratingQr] = useState(false);

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus batch ini?')) {
            router.delete(`/batch/${id}`);
        }
    };

    const generateQr = async (batch: Batch) => {
        setGeneratingQr(true);
        try {
            const response = await axios.get(`/api/qr/generate/${batch.id}`);
            setQrCode(response.data.qr_code);
            setQrData(response.data.qr_data);
            setQrDialogOpen(true);
        } catch (error) {
            console.error('Failed to generate QR:', error);
            alert('Gagal generate QR code');
        } finally {
            setGeneratingQr(false);
        }
    };

    const downloadQr = () => {
        if (!qrCode || !qrData) return;
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `QR-${qrData.batch?.nomor || 'code'}.png`;
        link.click();
    };

    const printQr = () => {
        if (!qrCode || !qrData) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print QR Code</title>
                        <style>
                            body { 
                                display: flex; 
                                justify-content: center; 
                                align-items: center; 
                                height: 100vh; 
                                margin: 0; 
                                flex-direction: column;
                                font-family: Arial, sans-serif;
                            }
                            img { max-width: 400px; border: 2px solid #ddd; padding: 20px; background: white; }
                            .info { text-align: center; margin-top: 20px; }
                            .medicine { font-size: 18px; font-weight: bold; margin: 5px 0; }
                            .batch { font-size: 16px; color: #666; margin: 5px 0; }
                            .code { font-size: 14px; color: #999; font-family: monospace; }
                        </style>
                    </head>
                    <body>
                        <img src="${qrCode}" />
                        <div class="info">
                            <div class="medicine">${qrData.obat?.nama || ''}</div>
                            <div class="batch">Batch: ${qrData.batch?.nomor || ''}</div>
                            <div class="code">Kode: ${qrData.kode_qr || ''}</div>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const copyQrCode = () => {
        if (qrData?.kode_qr) {
            navigator.clipboard.writeText(qrData.kode_qr);
            alert('Kode QR berhasil disalin!');
        }
    };

    const getExpiryStatus = (expiredDate: string) => {
        const today = new Date();
        const expiry = new Date(expiredDate);
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { status: 'expired', label: 'Kadaluarsa', variant: 'destructive' as const, days: diffDays };
        } else if (diffDays <= 30) {
            return { status: 'warning', label: `${diffDays} hari lagi`, variant: 'default' as const, days: diffDays };
        } else if (diffDays <= 90) {
            return { status: 'caution', label: `${diffDays} hari lagi`, variant: 'secondary' as const, days: diffDays };
        }
        return { status: 'ok', label: `${diffDays} hari lagi`, variant: 'outline' as const, days: diffDays };
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Batch Obat" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Batch Obat</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola batch dan nomor lot obat dengan tracking expiry date
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/batch/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Batch
                        </Link>
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border/70 bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nomor Batch</TableHead>
                                <TableHead>Obat</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Tanggal Masuk</TableHead>
                                <TableHead>Tanggal Expired</TableHead>
                                <TableHead className="text-right">Stok</TableHead>
                                <TableHead className="text-right">Harga Beli</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">QR</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batches.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Package className="size-12 text-muted-foreground mb-2" />
                                            <p className="text-muted-foreground">Belum ada batch obat</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                batches.data.map((batch) => {
                                    const expiryStatus = getExpiryStatus(batch.tanggal_expired);
                                    
                                    return (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <span>{batch.nomor_batch}</span>
                                                    {expiryStatus.status === 'expired' && (
                                                        <AlertTriangle className="size-4 text-destructive" />
                                                    )}
                                                    {expiryStatus.status === 'warning' && (
                                                        <AlertTriangle className="size-4 text-orange-500" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{batch.obat.nama_obat}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {batch.obat.kode_obat} • {batch.obat.kategori?.nama_kategori}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {batch.supplier?.nama_supplier || '-'}
                                            </TableCell>
                                            <TableCell>{formatDate(batch.tanggal_masuk)}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div>{formatDate(batch.tanggal_expired)}</div>
                                                    <Badge variant={expiryStatus.variant} className="text-xs mt-1">
                                                        {expiryStatus.label}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div>
                                                    <div className="font-medium">{batch.stok_tersedia}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        dari {batch.stok_awal} {batch.obat.satuan?.nama_satuan}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(batch.harga_beli)}
                                            </TableCell>
                                            <TableCell>
                                                {batch.status === 'active' && (
                                                    <Badge variant="default">
                                                        <CheckCircle2 className="size-3 mr-1" />
                                                        Aktif
                                                    </Badge>
                                                )}
                                                {batch.status === 'expired' && (
                                                    <Badge variant="destructive">
                                                        <XCircle className="size-3 mr-1" />
                                                        Kadaluarsa
                                                    </Badge>
                                                )}
                                                {batch.status === 'empty' && (
                                                    <Badge variant="secondary">Habis</Badge>
                                                )}
                                                {batch.status === 'recalled' && (
                                                    <Badge variant="outline">Ditarik</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => generateQr(batch)}
                                                    disabled={generatingQr}
                                                    title="Generate QR Code"
                                                >
                                                    <QrCode className="size-4 text-primary" />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/batch/${batch.id}`}>
                                                            <Eye className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/batch/${batch.id}/edit`}>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleDelete(batch.id)}
                                                    >
                                                        <Trash2 className="size-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {batches.last_page > 1 && (
                    <div className="flex items-center justify-between px-2">
                        <div className="text-sm text-muted-foreground">
                            Menampilkan {batches.data.length} dari {batches.total} batch
                        </div>
                        <div className="flex gap-2">
                            {batches.current_page > 1 && (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => router.get(`/batch?page=${batches.current_page - 1}`)}
                                >
                                    Previous
                                </Button>
                            )}
                            {batches.current_page < batches.last_page && (
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => router.get(`/batch?page=${batches.current_page + 1}`)}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>QR Code</DialogTitle>
                            <DialogDescription>
                                QR code untuk batch {qrData?.batch?.nomor || ''}
                            </DialogDescription>
                        </DialogHeader>
                        {qrCode && (
                            <div className="space-y-4">
                                <div className="flex justify-center p-4 border rounded-lg bg-white">
                                    <img src={qrCode} alt="QR Code" className="max-w-[300px] w-full" />
                                </div>
                                
                                {qrData && (
                                    <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Obat:</p>
                                            <p className="font-semibold">{qrData.obat?.nama}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Batch:</p>
                                            <p className="font-mono">{qrData.batch?.nomor}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Kode QR:</p>
                                            <p className="font-mono text-sm">{qrData.kode_qr}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-2">
                                    <Button onClick={downloadQr} variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                    </Button>
                                    <Button onClick={printQr} variant="outline" size="sm">
                                        <Printer className="h-4 w-4 mr-1" />
                                        Print
                                    </Button>
                                    <Button onClick={copyQrCode} variant="outline" size="sm">
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copy
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
