import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    TrendingUp, 
    TrendingDown, 
    Package, 
    Wallet,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    ArrowUpCircle,
    ArrowDownCircle,
    ShoppingCart,
    Calendar,
    Eye,
    Pencil,
    Trash,
    Plus
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transaksi', href: '/transaksi' },
];

interface Obat {
    nama_obat: string;
    kode_obat: string;
    satuan?: {
        nama_satuan: string;
    };
}

interface Batch {
    nomor_batch: string;
}

interface User {
    name: string;
}

interface Unit {
    nama_unit: string;
}

interface TransaksiItem {
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
}

interface Stats {
    total_today: number;
    total_masuk_today: number;
    total_keluar_today: number;
    total_value_today: number;
}

interface Filters {
    jenis?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
}

interface Props {
    transaksi: {
        data: TransaksiItem[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        total: number;
        from: number;
        to: number;
    };
    stats: Stats;
    filters: Filters;
}

export default function SemuaTransaksi({ transaksi, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [jenis, setJenis] = useState(filters.jenis || '');
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
        router.get('/transaksi', {
            search: search || undefined,
            jenis: jenis || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setJenis('');
        setStartDate('');
        setEndDate('');
        router.get('/transaksi');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5); // HH:mm
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
                    <Badge className="bg-green-600 hover:bg-green-700">
                        <ArrowDownCircle className="mr-1 size-3" />
                        Masuk
                    </Badge>
                );
            case 'keluar':
                return (
                    <Badge className="bg-orange-600 hover:bg-orange-700">
                        <ArrowUpCircle className="mr-1 size-3" />
                        Keluar
                    </Badge>
                );
            case 'penjualan':
                return (
                    <Badge className="bg-blue-600 hover:bg-blue-700">
                        <ShoppingCart className="mr-1 size-3" />
                        Penjualan
                    </Badge>
                );
            default:
                return <Badge variant="outline">{jenis}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Semua Transaksi" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Semua Transaksi</h1>
                        <p className="text-sm text-muted-foreground">
                            Riwayat lengkap transaksi obat masuk dan keluar
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
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Transaksi Hari Ini</p>
                                <p className="text-2xl font-bold">{stats.total_today}</p>
                            </div>
                            <Package className="size-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Barang Masuk</p>
                                <p className="text-2xl font-bold text-green-600">{stats.total_masuk_today}</p>
                            </div>
                            <TrendingDown className="size-8 text-green-600" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Barang Keluar</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.total_keluar_today}</p>
                            </div>
                            <TrendingUp className="size-8 text-orange-600" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Nilai (Rp)</p>
                                <p className="text-xl font-bold">{formatCurrency(stats.total_value_today)}</p>
                            </div>
                            <Wallet className="size-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Filter className="size-5 text-muted-foreground" />
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
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Cari Transaksi</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Kode / Obat..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jenis">Jenis Transaksi</Label>
                                    <Select value={jenis} onValueChange={setJenis}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Semua" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Semua Jenis</SelectItem>
                                            <SelectItem value="masuk">Barang Masuk</SelectItem>
                                            <SelectItem value="keluar">Barang Keluar</SelectItem>
                                            <SelectItem value="penjualan">Penjualan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Dari Tanggal</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
                                        <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
                                <Button onClick={handleFilter} size="sm">
                                    <Search className="mr-2 size-4" />
                                    Terapkan Filter
                                </Button>
                                <Button onClick={handleReset} variant="outline" size="sm">
                                    Reset
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card">
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
                                            <p className="text-muted-foreground">Belum ada transaksi</p>
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
                                            <TableCell className="text-right font-bold">
                                                {formatCurrency(item.total_harga)}
                                            </TableCell>
                                            <TableCell>
                                                {item.unit?.nama_unit || '-'}
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
                                    onClick={() => router.get(transaksi.prev_page_url!)}
                                    disabled={!transaksi.prev_page_url}
                                >
                                    <ChevronLeft className="size-4" />
                                    Sebelumnya
                                </Button>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                        Halaman {transaksi.current_page} dari {transaksi.last_page}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(transaksi.next_page_url!)}
                                    disabled={!transaksi.next_page_url}
                                >
                                    Selanjutnya
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
