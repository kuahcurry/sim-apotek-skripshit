import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Pencil, 
    Package, 
    User, 
    Calendar,
    Hospital,
    Wallet,
    FileText,
    ArrowUpCircle,
    ArrowDownCircle,
    ShoppingCart
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transaksi', href: '/transaksi' },
    { title: 'Detail Transaksi', href: '#' },
];

interface Obat {
    nama_obat: string;
    kode_obat: string;
    satuan?: {
        nama_satuan: string;
    };
    kategori?: {
        nama_kategori: string;
    };
}

interface Batch {
    nomor_batch: string;
    tanggal_expired: string;
}

interface User {
    name: string;
    email: string;
}

interface Unit {
    nama_unit: string;
    kode_unit: string;
}

interface Transaksi {
    id: number;
    kode_transaksi: string;
    jenis_transaksi: string;
    tanggal_transaksi: string;
    waktu_transaksi: string;
    jumlah: number;
    harga_satuan: number;
    total_harga: number;
    keterangan?: string;
    nomor_referensi?: string;
    obat: Obat;
    batch?: Batch;
    user: User;
    unit?: Unit;
    created_at: string;
}

interface Props {
    transaksi: Transaksi;
}

export default function TransaksiShow({ transaksi }: Props) {
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
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getJenisBadge = (jenis: string) => {
        switch (jenis) {
            case 'masuk':
                return (
                    <Badge className="bg-green-600 hover:bg-green-700 text-lg px-4 py-1">
                        <ArrowDownCircle className="mr-2 size-5" />
                        Barang Masuk
                    </Badge>
                );
            case 'keluar':
                return (
                    <Badge className="bg-orange-600 hover:bg-orange-700 text-lg px-4 py-1">
                        <ArrowUpCircle className="mr-2 size-5" />
                        Barang Keluar
                    </Badge>
                );
            case 'penjualan':
                return (
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-lg px-4 py-1">
                        <ShoppingCart className="mr-2 size-5" />
                        Penjualan
                    </Badge>
                );
            default:
                return <Badge variant="outline">{jenis}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Transaksi ${transaksi.kode_transaksi}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Detail Transaksi</h1>
                        <p className="text-sm text-muted-foreground">
                            Informasi lengkap transaksi obat
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href={`/transaksi/${transaksi.id}/edit`}>
                                <Pencil className="mr-2 size-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/transaksi">
                                <ArrowLeft className="mr-2 size-4" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Informasi Transaksi */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <FileText className="size-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">Informasi Transaksi</h3>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Kode Transaksi:</span>
                                <code className="font-mono font-medium bg-muted px-2 py-1 rounded">
                                    {transaksi.kode_transaksi}
                                </code>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Jenis:</span>
                                {getJenisBadge(transaksi.jenis_transaksi)}
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tanggal:</span>
                                <span className="font-medium">{formatDate(transaksi.tanggal_transaksi)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Waktu:</span>
                                <span>{transaksi.waktu_transaksi.substring(0, 5)} WIB</span>
                            </div>
                            {transaksi.nomor_referensi && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">No. Referensi:</span>
                                    <span className="font-medium">{transaksi.nomor_referensi}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Package className="size-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">Detail Obat</h3>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nama Obat:</span>
                                <span className="font-medium">{transaksi.obat.nama_obat}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Kode Obat:</span>
                                <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                    {transaksi.obat.kode_obat}
                                </code>
                            </div>
                            {transaksi.obat.kategori && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Kategori:</span>
                                    <Badge variant="outline">{transaksi.obat.kategori.nama_kategori}</Badge>
                                </div>
                            )}
                            {transaksi.batch && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Batch:</span>
                                        <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                            {transaksi.batch.nomor_batch}
                                        </code>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Expired:</span>
                                        <span>{formatDate(transaksi.batch.tanggal_expired)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Wallet className="size-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">Nilai Transaksi</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Jumlah:</span>
                                <span className="font-medium text-lg">
                                    {transaksi.jumlah} {transaksi.obat.satuan?.nama_satuan || 'unit'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Harga Satuan:</span>
                                <span className="font-medium">{formatCurrency(transaksi.harga_satuan)}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-medium">Total Harga:</span>
                                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {formatCurrency(transaksi.total_harga)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <User className="size-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">Info Petugas & Unit</h3>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Petugas:</span>
                                <span className="font-medium">{transaksi.user.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span>{transaksi.user.email}</span>
                            </div>
                            {transaksi.unit && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Unit Tujuan:</span>
                                        <span className="font-medium">{transaksi.unit.nama_unit}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Kode Unit:</span>
                                        <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                            {transaksi.unit.kode_unit}
                                        </code>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Keterangan */}
                {transaksi.keterangan && (
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="size-5 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">Keterangan</h3>
                        </div>
                        <p className="text-sm">{transaksi.keterangan}</p>
                    </div>
                )}

                {/* Audit Info */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
                    <p className="text-xs text-muted-foreground">
                        Dibuat pada: {formatDateTime(transaksi.created_at)}
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
