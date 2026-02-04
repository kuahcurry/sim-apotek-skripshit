import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Package, 
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    ArrowUpCircle,
    Calendar,
    Eye,
    Pencil,
    Trash,
    Plus,
    TrendingDown,
    BoxIcon,
    Wallet,
    ShoppingCart
} from 'lucide-react';
import { useState } from 'react';

interface Obat {
    id: number;
    nama_obat: string;
    kode_obat: string;
    satuan?: {
        nama_satuan: string;
    };
}

interface Batch {
    id: number;
    nomor_batch: string;
}

interface User {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    nama_unit: string;
}

interface TransaksiKeluar {
    id: number;
    kode_transaksi: string;
    jenis_transaksi: 'keluar' | 'penjualan';
    tanggal_transaksi: string;
    waktu_transaksi: string;
    obat: Obat;
    batch: Batch | null;
    jumlah: number;
    harga_satuan: number;
    total_harga: number;
    nomor_referensi: string | null;
    keterangan: string | null;
    user: User;
    unit: Unit | null;
}

interface PaginatedData {
    data: TransaksiKeluar[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Stats {
    total_today: number;
    total_quantity_today: number;
    total_value_today: number;
    total_this_month: number;
}

interface Filters {
    search?: string;
    start_date?: string;
    end_date?: string;
}

interface Props {
    transaksi: PaginatedData;
    stats: Stats;
    filters: Filters;
}

const breadcrumbItems: BreadcrumbItem[] = [
    { title: 'Transaksi', href: '/transaksi' },
    { title: 'Barang Keluar', href: '/transaksi/keluar' },
];

export default function BarangKeluar({ transaksi, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/transaksi/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const handleFilter = () => {
        router.get('/transaksi/keluar', {
            search: search || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
        router.get('/transaksi/keluar');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
    };

    const getJenisBadge = (jenis: 'keluar' | 'penjualan') => {
        if (jenis === 'keluar') {
            return <Badge variant="outline" className="border-orange-500 text-orange-500">Keluar</Badge>;
        }
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Penjualan</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title="Barang Keluar" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Barang Keluar</h1>
                        <p className="text-sm text-muted-foreground">
                            Riwayat transaksi obat keluar dan penjualan
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/transaksi/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Transaksi
                        </Link>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Hari Ini</p>
                                <p className="text-2xl font-bold">{stats.total_today}</p>
                                <p className="text-xs text-muted-foreground mt-1">Transaksi</p>
                            </div>
                            <ArrowUpCircle className="size-8 text-orange-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Jumlah Hari Ini</p>
                                <p className="text-2xl font-bold">{stats.total_quantity_today}</p>
                                <p className="text-xs text-muted-foreground mt-1">Item Keluar</p>
                            </div>
                            <BoxIcon className="size-8 text-red-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Nilai Hari Ini</p>
                                <p className="text-2xl font-bold">{formatCurrency(stats.total_value_today)}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total Nilai</p>
                            </div>
                            <Wallet className="size-8 text-purple-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Bulan Ini</p>
                                <p className="text-2xl font-bold">{stats.total_this_month}</p>
                                <p className="text-xs text-muted-foreground mt-1">Transaksi</p>
                            </div>
                            <TrendingDown className="size-8 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card">
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center gap-2">
                            <Filter className="size-4" />
                            <h3 className="font-semibold">Filter & Pencarian</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            {showFilters ? 'Sembunyikan' : 'Tampilkan'}
                        </Button>
                    </div>

                    {showFilters && (
                        <div className="p-4 space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Pencarian</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Kode transaksi, obat..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Dari Tanggal</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">Sampai Tanggal</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleFilter}>
                                    <Search className="mr-2 size-4" />
                                    Terapkan Filter
                                </Button>
                                <Button variant="outline" onClick={handleReset}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[140px]">Kode Transaksi</TableHead>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Tanggal & Waktu</TableHead>
                                    <TableHead>Obat</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    <TableHead className="text-right">Harga Satuan</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Unit/Tujuan</TableHead>
                                    <TableHead>Petugas</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transaksi.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-8">
                                            <Package className="mx-auto mb-2 size-12 text-muted-foreground" />
                                            <p className="text-muted-foreground">Belum ada transaksi keluar</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transaksi.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-sm font-medium">
                                                {item.kode_transaksi}
                                            </TableCell>
                                            <TableCell>{getJenisBadge(item.jenis_transaksi)}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{formatDate(item.tanggal_transaksi)}</p>
                                                    <p className="text-xs text-muted-foreground">{formatTime(item.waktu_transaksi)}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{item.obat.nama_obat}</p>
                                                    <p className="text-xs text-muted-foreground">{item.obat.kode_obat}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {item.batch ? (
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                        {item.batch.nomor_batch}
                                                    </code>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {item.jumlah} {item.obat.satuan?.nama_satuan || 'unit'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.harga_satuan)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-orange-600">
                                                {formatCurrency(item.total_harga)}
                                            </TableCell>
                                            <TableCell>
                                                {item.unit ? (
                                                    <div>
                                                        <p className="text-sm">{item.unit.nama_unit}</p>
                                                        {item.nomor_referensi && (
                                                            <p className="text-xs text-muted-foreground">{item.nomor_referensi}</p>
                                                        )}
                                                    </div>
                                                ) : item.nomor_referensi ? (
                                                    <span className="text-sm">{item.nomor_referensi}</span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{item.user.name}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/transaksi/${item.id}`}>
                                                            <Eye className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/transaksi/${item.id}/edit`}>
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
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {transaksi.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {transaksi.from} - {transaksi.to} dari {transaksi.total} transaksi
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(`/transaksi/keluar?page=${transaksi.current_page - 1}`)}
                                    disabled={transaksi.current_page === 1}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <div className="flex items-center gap-2 px-3">
                                    <span className="text-sm">
                                        Halaman {transaksi.current_page} dari {transaksi.last_page}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(`/transaksi/keluar?page=${transaksi.current_page + 1}`)}
                                    disabled={transaksi.current_page === transaksi.last_page}
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Delete Dialog */}
                <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Transaksi</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus transaksi ini? Stok akan dikembalikan secara otomatis.
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
            </div>
        </AppLayout>
    );
}
