import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { formatCurrency } from '@/lib/utils';
import { 
    BarChart3, 
    Download, 
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Package,
    AlertTriangle,
    TrendingUp,
    DollarSign
} from 'lucide-react';
import { useState } from 'react';

interface Satuan {
    id: number;
    nama_satuan: string;
}

interface Kategori {
    id: number;
    nama_kategori: string;
}

interface Batch {
    id: number;
    nomor_batch: string;
    stok_tersedia: number;
    tanggal_expired: string;
}

interface Obat {
    id: number;
    kode_obat: string;
    nama_obat: string;
    stok_total: number;
    stok_minimum: number;
    kategori?: Kategori;
    satuan?: Satuan;
    batches: Batch[];
}

interface PaginatedData {
    data: Obat[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Stats {
    total_obat: number;
    total_stok: number;
    stok_minimum: number;
    stok_habis: number;
    total_value: number;
}

interface Filters {
    search?: string;
    kategori_id?: string;
    status?: string;
}

interface Props {
    obat: PaginatedData;
    stats: Stats;
    kategori: Kategori[];
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan', href: '/reports/stock' },
    { title: 'Laporan Stok', href: '/reports/stock' },
];

export default function ReportStock({ obat, stats, kategori, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [kategoriId, setKategoriId] = useState(filters.kategori_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleFilter = () => {
        router.get('/reports/stock', {
            search: search || undefined,
            kategori_id: kategoriId || undefined,
            status: status || undefined,
        }, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setKategoriId('');
        setStatus('');
        router.get('/reports/stock');
    };

    const handleExport = () => {
        window.open('/reports/stock/export?' + new URLSearchParams({
            search: search || '',
            kategori_id: kategoriId || '',
            status: status || '',
        }), '_blank');
    };

    const getStockStatus = (stokTotal: number, stokMinimum: number) => {
        if (stokTotal === 0) {
            return <Badge variant="outline" className="border-red-500 text-red-500">Habis</Badge>;
        } else if (stokTotal <= stokMinimum) {
            return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Minimum</Badge>;
        } else {
            return <Badge variant="outline" className="border-green-500 text-green-500">Tersedia</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Stok" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Laporan Stok</h1>
                        <p className="text-sm text-muted-foreground">
                            Laporan persediaan dan nilai stok obat
                        </p>
                    </div>
                    <Button onClick={handleExport}>
                        <Download className="mr-2 size-4" />
                        Export Excel
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Obat</p>
                                <p className="text-2xl font-bold">{stats.total_obat}</p>
                                <p className="text-xs text-muted-foreground mt-1">Jenis</p>
                            </div>
                            <Package className="size-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Stok</p>
                                <p className="text-2xl font-bold">{stats.total_stok.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground mt-1">Unit</p>
                            </div>
                            <TrendingUp className="size-8 text-green-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Stok Minimum</p>
                                <p className="text-2xl font-bold">{stats.stok_minimum}</p>
                                <p className="text-xs text-muted-foreground mt-1">Perlu Restok</p>
                            </div>
                            <AlertTriangle className="size-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Stok Habis</p>
                                <p className="text-2xl font-bold">{stats.stok_habis}</p>
                                <p className="text-xs text-muted-foreground mt-1">Obat</p>
                            </div>
                            <Package className="size-8 text-red-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Nilai Stok</p>
                                <p className="text-xl font-bold">{formatCurrency(stats.total_value)}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total Nilai</p>
                            </div>
                            <DollarSign className="size-8 text-purple-500" />
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
                                            placeholder="Nama atau kode obat..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kategori_id">Kategori</Label>
                                    <Select value={kategoriId || undefined} onValueChange={setKategoriId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Semua Kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kategori.map(kat => (
                                                <SelectItem key={kat.id} value={kat.id.toString()}>
                                                    {kat.nama_kategori}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status Stok</Label>
                                    <Select value={status || undefined} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Semua Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tersedia">Tersedia</SelectItem>
                                            <SelectItem value="minimum">Minimum</SelectItem>
                                            <SelectItem value="habis">Habis</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Nama Obat</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead className="text-right">Stok Total</TableHead>
                                    <TableHead className="text-right">Stok Minimum</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Jumlah Batch</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {obat.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <BarChart3 className="mx-auto mb-2 size-12 text-muted-foreground" />
                                            <p className="text-muted-foreground">Tidak ada data</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    obat.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-sm">
                                                {item.kode_obat}
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">{item.nama_obat}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm">{item.kategori?.nama_kategori || '-'}</p>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-medium">
                                                    {item.stok_total.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    {item.satuan?.nama_satuan || 'unit'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {item.stok_minimum.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {getStockStatus(item.stok_total, item.stok_minimum)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-sm text-muted-foreground">
                                                    {item.batches.length} batch
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {obat.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {obat.from} - {obat.to} dari {obat.total} obat
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(`/reports/stock?page=${obat.current_page - 1}`)}
                                    disabled={obat.current_page === 1}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <div className="flex items-center gap-2 px-3">
                                    <span className="text-sm">
                                        Halaman {obat.current_page} dari {obat.last_page}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(`/reports/stock?page=${obat.current_page + 1}`)}
                                    disabled={obat.current_page === obat.last_page}
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
