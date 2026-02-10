import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    Package, 
    Calendar, 
    TrendingUp, 
    DollarSign, 
    Building2,
    QrCode,
    Download,
    Printer,
    Copy,
    ArrowLeft,
    AlertTriangle,
    CheckCircle2,
    History,
    Pencil
} from 'lucide-react';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Batch Obat', href: '/batch' },
    { title: 'Detail Batch', href: '#' },
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
    catatan?: string;
    obat: {
        id: number;
        kode_obat: string;
        nama_obat: string;
        nama_generik?: string;
        kategori?: { nama_kategori: string };
        jenis?: { nama_jenis: string };
        satuan?: { nama_satuan: string };
    };
    supplier?: {
        nama_supplier: string;
        kode_supplier: string;
    };
    transaksi?: Array<{
        id: number;
        nomor_transaksi: string;
        jenis_transaksi: string;
        jumlah: number;
        tanggal_transaksi: string;
    }>;
}

interface Props {
    batch: Batch;
}

export default function BatchShow({ batch }: Props) {
    const [qrCode, setQrCode] = useState<string>('');
    const [qrData, setQrData] = useState<any>(null);
    const [generatingQr, setGeneratingQr] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);

    const getExpiryStatus = (expiredDate: string) => {
        const today = new Date();
        const expiry = new Date(expiredDate);
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { status: 'expired', label: 'Kadaluarsa', variant: 'destructive' as const, icon: AlertTriangle };
        } else if (diffDays <= 30) {
            return { status: 'warning', label: `${diffDays} hari lagi`, variant: 'default' as const, icon: AlertTriangle };
        } else if (diffDays <= 90) {
            return { status: 'caution', label: `${diffDays} hari lagi`, variant: 'secondary' as const, icon: CheckCircle2 };
        }
        return { status: 'ok', label: `${diffDays} hari lagi`, variant: 'outline' as const, icon: CheckCircle2 };
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
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

    const generateQr = async () => {
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
        if (!qrCode) return;
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `QR-${batch.nomor_batch}.png`;
        link.click();
    };

    const printQr = () => {
        if (!qrCode) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print QR Code - ${batch.nomor_batch}</title>
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
                            .expiry { font-size: 14px; color: #ff6b6b; margin: 10px 0; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        <img src="${qrCode}" />
                        <div class="info">
                            <div class="medicine">${batch.obat.nama_obat}</div>
                            <div class="batch">Batch: ${batch.nomor_batch}</div>
                            <div class="code">Kode: ${batch.kode_qr}</div>
                            <div class="expiry">Exp: ${formatDate(batch.tanggal_expired)}</div>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const copyQrCode = () => {
        if (batch.kode_qr) {
            navigator.clipboard.writeText(batch.kode_qr);
            alert('Kode QR berhasil disalin!');
        }
    };

    const expiryStatus = getExpiryStatus(batch.tanggal_expired);
    const ExpiryIcon = expiryStatus.icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Batch ${batch.nomor_batch}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/batch">
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Kembali
                                </Link>
                            </Button>
                        </div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Package className="h-6 w-6" />
                            {batch.nomor_batch}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Detail informasi batch obat
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={generateQr} disabled={generatingQr}>
                            <QrCode className="h-4 w-4 mr-2" />
                            {generatingQr ? 'Generating...' : 'QR Code'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/batch/${batch.id}/edit`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                Informasi Obat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Nama Obat</p>
                                <p className="text-lg font-semibold">{batch.obat.nama_obat}</p>
                            </div>
                            {batch.obat.nama_generik && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Nama Generik</p>
                                    <p className="font-medium">{batch.obat.nama_generik}</p>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Badge variant="outline">{batch.obat.kategori?.nama_kategori}</Badge>
                                <Badge variant="secondary">{batch.obat.jenis?.nama_jenis}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Kode Obat</p>
                                <p className="font-mono">{batch.obat.kode_obat}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                Tanggal & Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Tanggal Masuk</p>
                                <p className="font-medium">{formatDate(batch.tanggal_masuk)}</p>
                            </div>
                            {batch.tanggal_produksi && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Tanggal Produksi</p>
                                    <p className="font-medium">{formatDate(batch.tanggal_produksi)}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground">Tanggal Expired</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="font-medium">{formatDate(batch.tanggal_expired)}</p>
                                    <Badge variant={expiryStatus.variant} className="gap-1">
                                        <ExpiryIcon className="h-3 w-3" />
                                        {expiryStatus.label}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge className="mt-1">
                                    {batch.status === 'active' && <><CheckCircle2 className="h-3 w-3 mr-1" />Aktif</>}
                                    {batch.status === 'expired' && <><AlertTriangle className="h-3 w-3 mr-1" />Kadaluarsa</>}
                                    {batch.status === 'empty' && 'Habis'}
                                    {batch.status === 'recalled' && 'Ditarik'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                Stok & Harga
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Stok Tersedia</p>
                                <p className="text-2xl font-bold">{batch.stok_tersedia} <span className="text-base font-normal text-muted-foreground">{batch.obat.satuan?.nama_satuan}</span></p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Stok Awal</p>
                                <p className="font-medium">{batch.stok_awal} {batch.obat.satuan?.nama_satuan}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Harga Beli</p>
                                <p className="text-lg font-semibold">{formatCurrency(batch.harga_beli)}</p>
                            </div>
                            {batch.supplier && (
                                <div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Building2 className="h-3 w-3" />
                                        Supplier
                                    </p>
                                    <p className="font-medium">{batch.supplier.nama_supplier}</p>
                                    <p className="text-xs text-muted-foreground">{batch.supplier.kode_supplier}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {batch.catatan && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Catatan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{batch.catatan}</p>
                        </CardContent>
                    </Card>
                )}

                {batch.transaksi && batch.transaksi.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Riwayat Transaksi
                            </CardTitle>
                            <CardDescription>
                                Daftar transaksi yang menggunakan batch ini
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {batch.transaksi.map((transaksi) => (
                                    <div key={transaksi.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-mono text-sm">{transaksi.nomor_transaksi}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(transaksi.tanggal_transaksi)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={transaksi.jenis_transaksi === 'masuk' ? 'default' : 'secondary'}>
                                                {transaksi.jenis_transaksi.toUpperCase()}
                                            </Badge>
                                            <p className="text-sm font-semibold mt-1">
                                                {transaksi.jumlah} {batch.obat.satuan?.nama_satuan}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>QR Code - {batch.nomor_batch}</DialogTitle>
                        <DialogDescription>
                            QR code untuk batch {batch.nomor_batch}
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
        </AppLayout>
    );
}
