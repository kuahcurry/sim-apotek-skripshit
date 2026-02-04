import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { 
    Package, 
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Eye,
    Pencil,
    Trash,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
    Calendar
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

interface Unit {
    id: number;
    nama_unit: string;
}

interface User {
    id: number;
    name: string;
}

interface Permintaan {
    id: number;
    kode_permintaan: string;
    unit: Unit;
    obat: Obat;
    jumlah_diminta: number;
    jumlah_disetujui: number | null;
    tanggal_permintaan: string;
    status: 'pending' | 'processed' | 'completed' | 'cancelled';
    prioritas: 'normal' | 'urgent' | 'emergency';
    catatan: string | null;
    catatan_farmasi: string | null;
    processed_by: User | null;
    processed_at: string | null;
}

interface PaginatedData {
    data: Permintaan[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Stats {
    total_pending: number;
    total_processed: number;
    total_urgent: number;
    total_today: number;
}

interface Filters {
    search?: string;
    status?: string;
    prioritas?: string;
    unit_id?: string;
    start_date?: string;
    end_date?: string;
}

interface Props {
    permintaan: PaginatedData;
    stats: Stats;
    units: Unit[];
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Permintaan Unit', href: '/permintaan' },
];

export default function PermintaanIndex({ permintaan, stats, units, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [prioritas, setPrioritas] = useState(filters.prioritas || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [showFilters, setShowFilters] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [processId, setProcessId] = useState<number | null>(null);

    const processForm = useForm({
        action: 'approve',
        jumlah_disetujui: 0,
        catatan_farmasi: '',
    });

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/permintaan/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const handleProcess = (e: React.FormEvent) => {
        e.preventDefault();
        if (processId) {
            processForm.post(`/permintaan/${processId}/process`, {
                onSuccess: () => {
                    setProcessId(null);
                    processForm.reset();
                },
            });
        }
    };

    const handleFilter = () => {
        router.get('/permintaan', {
            search: search || undefined,
            status: status || undefined,
            prioritas: prioritas || undefined,
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
        setPrioritas('');
        setUnitId('');
        setStartDate('');
        setEndDate('');
        router.get('/permintaan');
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
            pending: { color: 'border-yellow-500 text-yellow-500', label: 'Pending' },
            processed: { color: 'border-blue-500 text-blue-500', label: 'Diproses' },
            completed: { color: 'border-green-500 text-green-500', label: 'Selesai' },
            cancelled: { color: 'border-red-500 text-red-500', label: 'Dibatalkan' },
        };
        const variant = variants[status] || variants.pending;
        return <Badge variant="outline" className={variant.color}>{variant.label}</Badge>;
    };

    const getPrioritasBadge = (prioritas: string) => {
        const variants: Record<string, { color: string; label: string }> = {
            normal: { color: 'border-gray-500 text-gray-500', label: 'Normal' },
            urgent: { color: 'border-orange-500 text-orange-500', label: 'Urgent' },
            emergency: { color: 'border-red-500 text-red-500 font-bold', label: 'Emergency' },
        };
        const variant = variants[prioritas] || variants.normal;
        return <Badge variant="outline" className={variant.color}>{variant.label}</Badge>;
    };

    const openProcessDialog = (item: Permintaan) => {
        setProcessId(item.id);
        processForm.setData({
            action: 'approve',
            jumlah_disetujui: item.jumlah_diminta,
            catatan_farmasi: '',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permintaan Unit" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Permintaan Unit</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola permintaan obat dari unit-unit rumah sakit
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/permintaan/create">
                            <Plus className="mr-2 size-4" />
                            Buat Permintaan
                        </Link>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold">{stats.total_pending}</p>
                                <p className="text-xs text-muted-foreground mt-1">Menunggu</p>
                            </div>
                            <Clock className="size-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Diproses</p>
                                <p className="text-2xl font-bold">{stats.total_processed}</p>
                                <p className="text-xs text-muted-foreground mt-1">Sedang Proses</p>
                            </div>
                            <CheckCircle className="size-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                                <p className="text-2xl font-bold">{stats.total_urgent}</p>
                                <p className="text-xs text-muted-foreground mt-1">Perlu Perhatian</p>
                            </div>
                            <AlertCircle className="size-8 text-red-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Hari Ini</p>
                                <p className="text-2xl font-bold">{stats.total_today}</p>
                                <p className="text-xs text-muted-foreground mt-1">Permintaan</p>
                            </div>
                            <FileText className="size-8 text-purple-500" />
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
                            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                                <div className="space-y-2 lg:col-span-2">
                                    <Label htmlFor="search">Pencarian</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Kode, obat, unit..."
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
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="processed">Diproses</SelectItem>
                                            <SelectItem value="completed">Selesai</SelectItem>
                                            <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="prioritas">Prioritas</Label>
                                    <Select value={prioritas} onValueChange={setPrioritas}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Semua Prioritas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Semua</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                            <SelectItem value="emergency">Emergency</SelectItem>
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
                                    <TableHead className="w-[140px]">Kode</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Obat</TableHead>
                                    <TableHead className="text-right">Diminta</TableHead>
                                    <TableHead className="text-right">Disetujui</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Prioritas</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permintaan.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8">
                                            <Package className="mx-auto mb-2 size-12 text-muted-foreground" />
                                            <p className="text-muted-foreground">Belum ada permintaan</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    permintaan.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-sm font-medium">
                                                {item.kode_permintaan}
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm">{formatDate(item.tanggal_permintaan)}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">{item.unit.nama_unit}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{item.obat.nama_obat}</p>
                                                    <p className="text-xs text-muted-foreground">{item.obat.kode_obat}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {item.jumlah_diminta} {item.obat.satuan?.nama_satuan || 'unit'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {item.jumlah_disetujui ? (
                                                    <span>{item.jumlah_disetujui} {item.obat.satuan?.nama_satuan || 'unit'}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                                            <TableCell>{getPrioritasBadge(item.prioritas)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/permintaan/${item.id}`}>
                                                            <Eye className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    {item.status === 'pending' && (
                                                        <>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={() => openProcessDialog(item)}
                                                            >
                                                                <CheckCircle className="size-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/permintaan/${item.id}/edit`}>
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
                    {permintaan.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {permintaan.from} - {permintaan.to} dari {permintaan.total} permintaan
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(`/permintaan?page=${permintaan.current_page - 1}`)}
                                    disabled={permintaan.current_page === 1}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <div className="flex items-center gap-2 px-3">
                                    <span className="text-sm">
                                        Halaman {permintaan.current_page} dari {permintaan.last_page}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(`/permintaan?page=${permintaan.current_page + 1}`)}
                                    disabled={permintaan.current_page === permintaan.last_page}
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Process Dialog */}
                <Dialog open={processId !== null} onOpenChange={(open) => !open && setProcessId(null)}>
                    <DialogContent>
                        <form onSubmit={handleProcess}>
                            <DialogHeader>
                                <DialogTitle>Proses Permintaan</DialogTitle>
                                <DialogDescription>
                                    Setujui atau tolak permintaan obat dari unit
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="action">Aksi</Label>
                                    <Select 
                                        value={processForm.data.action} 
                                        onValueChange={(value) => processForm.setData('action', value as 'approve' | 'reject')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="approve">Setujui</SelectItem>
                                            <SelectItem value="reject">Tolak</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {processForm.data.action === 'approve' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="jumlah_disetujui">Jumlah Disetujui</Label>
                                        <Input
                                            id="jumlah_disetujui"
                                            type="number"
                                            min="1"
                                            value={processForm.data.jumlah_disetujui}
                                            onChange={(e) => processForm.setData('jumlah_disetujui', parseInt(e.target.value))}
                                            required
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="catatan_farmasi">Catatan</Label>
                                    <Textarea
                                        id="catatan_farmasi"
                                        value={processForm.data.catatan_farmasi}
                                        onChange={(e) => processForm.setData('catatan_farmasi', e.target.value)}
                                        placeholder="Catatan tambahan..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setProcessId(null)}
                                    disabled={processForm.processing}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processForm.processing}>
                                    {processForm.data.action === 'approve' ? 'Setujui' : 'Tolak'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Permintaan</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus permintaan ini?
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
