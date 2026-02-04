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
    ClipboardCheck, 
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Eye,
    Pencil,
    Trash,
    Plus,
    FileCheck,
    FileEdit,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    nama_unit: string;
    kode_unit: string;
}

interface StokOpname {
    id: number;
    nomor_opname: string;
    tanggal_opname: string;
    status: 'draft' | 'in_progress' | 'completed' | 'approved';
    penanggung_jawab: User;
    unit: Unit;
    approved_by: User | null;
    approved_at: string | null;
    catatan: string | null;
    details_count?: number;
}

interface PaginatedData {
    data: StokOpname[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Stats {
    total_draft: number;
    total_in_progress: number;
    total_completed: number;
    total_approved: number;
}

interface Filters {
    search?: string;
    status?: string;
    unit_id?: string;
    start_date?: string;
    end_date?: string;
}

interface Props {
    stokOpname: PaginatedData;
    stats: Stats;
    units: Unit[];
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Stok Opname', href: '/stok-opname' },
];

export default function StokOpnameIndex({ stokOpname, stats, units, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/stok-opname/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const handleFilter = () => {
        router.get('/stok-opname', {
            search: search || undefined,
            status: status || undefined,
            unit_id: unitId || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setUnitId('');
        setStartDate('');
        setEndDate('');
        router.get('/stok-opname');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { color: string; label: string }> = {
            draft: { color: 'border-gray-500 text-gray-500', label: 'Draft' },
            in_progress: { color: 'border-blue-500 text-blue-500', label: 'In Progress' },
            completed: { color: 'border-yellow-500 text-yellow-500', label: 'Selesai' },
            approved: { color: 'border-green-500 text-green-500', label: 'Disetujui' },
        };
        const variant = variants[status] || variants.draft;
        return <Badge variant="outline" className={variant.color}>{variant.label}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stok Opname" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Stok Opname</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola stock taking dan penghitungan stok fisik
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/stok-opname/create">
                            <Plus className="mr-2 size-4" />
                            Buat Stok Opname
                        </Link>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                                <p className="text-2xl font-bold">{stats.total_draft}</p>
                                <p className="text-xs text-muted-foreground mt-1">Belum Dimulai</p>
                            </div>
                            <FileEdit className="size-8 text-gray-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                                <p className="text-2xl font-bold">{stats.total_in_progress}</p>
                                <p className="text-xs text-muted-foreground mt-1">Sedang Berjalan</p>
                            </div>
                            <ClipboardCheck className="size-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Selesai</p>
                                <p className="text-2xl font-bold">{stats.total_completed}</p>
                                <p className="text-xs text-muted-foreground mt-1">Menunggu Approval</p>
                            </div>
                            <FileCheck className="size-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Disetujui</p>
                                <p className="text-2xl font-bold">{stats.total_approved}</p>
                                <p className="text-xs text-muted-foreground mt-1">Stok Diperbarui</p>
                            </div>
                            <CheckCircle2 className="size-8 text-green-500" />
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
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                <div className="space-y-2 lg:col-span-2">
                                    <Label htmlFor="search">Pencarian</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Nomor opname, unit..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Semua Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Semua</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Selesai</SelectItem>
                                            <SelectItem value="approved">Disetujui</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit_id">Unit</Label>
                                    <Select value={unitId} onValueChange={setUnitId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Semua Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Semua</SelectItem>
                                            {units.map(unit => (
                                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                                    {unit.nama_unit}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                    <TableHead className="w-[160px]">Nomor Opname</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Penanggung Jawab</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Disetujui Oleh</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stokOpname.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <ClipboardCheck className="mx-auto mb-2 size-12 text-muted-foreground" />
                                            <p className="text-muted-foreground">Belum ada stok opname</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stokOpname.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-sm font-medium">
                                                {item.nomor_opname}
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm">{formatDate(item.tanggal_opname)}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{item.unit.nama_unit}</p>
                                                    <p className="text-xs text-muted-foreground">{item.unit.kode_unit}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">{item.penanggung_jawab.name}</p>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                                            <TableCell>
                                                {item.approved_by ? (
                                                    <div>
                                                        <p className="font-medium">{item.approved_by.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.approved_at && formatDate(item.approved_at)}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/stok-opname/${item.id}`}>
                                                            <Eye className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    {item.status === 'draft' && (
                                                        <>
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/stok-opname/${item.id}/edit`}>
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
                    </div>

                    {/* Pagination */}
                    {stokOpname.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {stokOpname.from} - {stokOpname.to} dari {stokOpname.total} stok opname
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(`/stok-opname?page=${stokOpname.current_page - 1}`)}
                                    disabled={stokOpname.current_page === 1}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <div className="flex items-center gap-2 px-3">
                                    <span className="text-sm">
                                        Halaman {stokOpname.current_page} dari {stokOpname.last_page}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(`/stok-opname?page=${stokOpname.current_page + 1}`)}
                                    disabled={stokOpname.current_page === stokOpname.last_page}
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
                            <DialogTitle>Hapus Stok Opname</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus stok opname ini?
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
