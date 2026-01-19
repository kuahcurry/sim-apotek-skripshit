import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertCircle, Package, TrendingDown, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardStats {
    total_obat: number;
    total_stok: number;
    low_stock_count: number;
    expired_soon_count: number;
    pending_requests: number;
    urgent_requests: number;
    today_transactions: number;
    today_incoming: number;
    today_outgoing: number;
}

interface LowStockItem {
    id: number;
    nama_obat: string;
    stok_total: number;
    stok_minimum: number;
    kategori: { nama_kategori: string };
    satuan: { nama_satuan: string };
}

interface ExpiringItem {
    id: number;
    nomor_batch: string;
    tanggal_expired: string;
    stok_batch: number;
    obat: {
        nama_obat: string;
        kategori: { nama_kategori: string };
    };
}

interface PendingRequest {
    id: number;
    nomor_permintaan: string;
    tanggal_permintaan: string;
    status: string;
    prioritas: string;
    unit: { nama_unit: string };
}

interface DashboardProps {
    stats: DashboardStats;
    lowStock: LowStockItem[];
    expiringSoon: ExpiringItem[];
    pendingRequests: PendingRequest[];
}

export default function Dashboard({
    stats,
    lowStock,
    expiringSoon,
    pendingRequests,
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Total Medicines */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Obat
                                </p>
                                <p className="text-3xl font-bold">
                                    {stats.total_obat}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Total stok: {stats.total_stok.toLocaleString()}
                                </p>
                            </div>
                            <Package className="size-8 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Low Stock */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Stok Rendah
                                </p>
                                <p className="text-3xl font-bold text-orange-600">
                                    {stats.low_stock_count}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Perlu restock
                                </p>
                            </div>
                            <TrendingDown className="size-8 text-orange-600" />
                        </div>
                    </div>

                    {/* Expiring Soon */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Kadaluarsa Segera
                                </p>
                                <p className="text-3xl font-bold text-red-600">
                                    {stats.expired_soon_count}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Dalam 30 hari
                                </p>
                            </div>
                            <AlertCircle className="size-8 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Today's Activity */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                    <h3 className="mb-4 text-lg font-semibold">
                        Aktivitas Hari Ini
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Transaksi
                            </p>
                            <p className="text-2xl font-bold">
                                {stats.today_transactions}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Barang Masuk
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.today_incoming}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Barang Keluar
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.today_outgoing}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Data Tables */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Low Stock Table */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <h3 className="mb-4 text-lg font-semibold">
                            Stok Rendah
                        </h3>
                        <div className="space-y-2">
                            {lowStock.length > 0 ? (
                                lowStock.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-lg border border-sidebar-border/50 p-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.nama_obat}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.kategori.nama_kategori}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-orange-600">
                                                {item.stok_total}{' '}
                                                {item.satuan.nama_satuan}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Min: {item.stok_minimum}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Tidak ada stok rendah
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Expiring Soon Table */}
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-6 dark:border-sidebar-border">
                        <h3 className="mb-4 text-lg font-semibold">
                            Segera Kadaluarsa
                        </h3>
                        <div className="space-y-2">
                            {expiringSoon.length > 0 ? (
                                expiringSoon.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-lg border border-sidebar-border/50 p-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.obat.nama_obat}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Batch: {item.nomor_batch}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-red-600">
                                                {new Date(
                                                    item.tanggal_expired
                                                ).toLocaleDateString('id-ID')}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Stok: {item.stok_batch}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Tidak ada yang kadaluarsa
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
