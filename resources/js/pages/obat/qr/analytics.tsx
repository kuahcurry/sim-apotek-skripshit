import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
    BarChart3, 
    TrendingUp, 
    Activity, 
    AlertCircle,
    CheckCircle2,
    Clock,
    Users,
    Package,
    Scan,
    Camera,
    Keyboard,
    Download
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const breadcrumbItems: BreadcrumbItem[] = [
    { title: 'QR Code', href: '/qr' },
    { title: 'Analisis', href: '/obat/qr/analytics' },
];

interface AnalyticsData {
    period: string;
    date_from: string;
    summary: {
        total_scans: number;
        success_count: number;
        success_rate: number;
        error_count: number;
        error_rate: number;
        expired_count: number;
    };
    scans_by_result: Record<string, number>;
    scans_by_method: Record<string, number>;
    most_scanned_batches: Array<{
        batch_id: number;
        batch: any;
        scan_count: number;
    }>;
    most_scanned_medicines: Array<{
        obat_id: number;
        obat: any;
        scan_count: number;
    }>;
    scans_by_user: Array<{
        user_id: number;
        user: any;
        scan_count: number;
    }>;
    scans_by_hour: Record<number, number>;
    scans_trend: Array<{
        date: string;
        count: number;
    }>;
}

const COLORS = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    expired: '#f97316',
    not_found: '#6b7280',
    camera: '#3b82f6',
    manual: '#8b5cf6',
};

export default function QrAnalytics() {
    const [period, setPeriod] = useState('today');
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/qr/analytics', {
                params: { period }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPeriodLabel = () => {
        switch (period) {
            case 'today': return 'Hari Ini';
            case 'week': return 'Minggu Ini';
            case 'month': return 'Bulan Ini';
            case 'year': return 'Tahun Ini';
            default: return 'Semua';
        }
    };

    // Prepare chart data
    const scansByResultData = analytics ? Object.entries(analytics.scans_by_result).map(([key, value]) => ({
        name: key === 'success' ? 'Sukses' : 
              key === 'expired' ? 'Kadaluarsa' : 
              key === 'not_found' ? 'Tidak Ditemukan' : 
              'Error',
        value: value,
        color: key === 'success' ? COLORS.success : 
               key === 'expired' ? COLORS.expired : 
               key === 'not_found' ? COLORS.not_found : 
               COLORS.error,
    })) : [];

    const scansByMethodData = analytics ? Object.entries(analytics.scans_by_method).map(([key, value]) => ({
        name: key === 'camera' ? 'Kamera' : 'Manual',
        value: value,
        color: key === 'camera' ? COLORS.camera : COLORS.manual,
    })) : [];

    const hourlyData = analytics?.scans_by_hour ? Object.entries(analytics.scans_by_hour).map(([hour, count]) => ({
        hour: `${hour.padStart(2, '0')}:00`,
        scans: count,
    })) : [];

    const trendData = analytics?.scans_trend?.map(item => ({
        date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        scans: item.count,
    })) || [];

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbItems}>
                <Head title="QR Analytics" />
                <div className="flex h-full items-center justify-center p-4">
                    <div className="text-center">
                        <Activity className="mx-auto size-12 animate-pulse text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Memuat data analytics...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title="QR Analytics" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <BarChart3 className="size-7" />
                            QR Scan Analytics
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Statistik dan analisis pemindaian QR code
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Hari Ini</SelectItem>
                                <SelectItem value="week">Minggu Ini</SelectItem>
                                <SelectItem value="month">Bulan Ini</SelectItem>
                                <SelectItem value="year">Tahun Ini</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon">
                            <Download className="size-4" />
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Scan</p>
                                <p className="text-3xl font-bold mt-2">{analytics?.summary.total_scans || 0}</p>
                                <p className="text-xs text-muted-foreground mt-1">{getPeriodLabel()}</p>
                            </div>
                            <Scan className="size-8 text-blue-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Sukses</p>
                                <p className="text-3xl font-bold mt-2 text-green-600">
                                    {analytics?.summary.success_count || 0}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    {analytics?.summary.success_rate || 0}% success rate
                                </p>
                            </div>
                            <CheckCircle2 className="size-8 text-green-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Error</p>
                                <p className="text-3xl font-bold mt-2 text-red-600">
                                    {analytics?.summary.error_count || 0}
                                </p>
                                <p className="text-xs text-red-600 mt-1">
                                    {analytics?.summary.error_rate || 0}% error rate
                                </p>
                            </div>
                            <AlertCircle className="size-8 text-red-500" />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Kadaluarsa</p>
                                <p className="text-3xl font-bold mt-2 text-orange-600">
                                    {analytics?.summary.expired_count || 0}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Batch expired</p>
                            </div>
                            <Clock className="size-8 text-orange-500" />
                        </div>
                    </Card>
                </div>

                {/* Charts Row 1 */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Scan Trend */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="size-5" />
                            Tren Pemindaian
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="scans" 
                                    name="Jumlah Scan"
                                    stroke="#3b82f6" 
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Scans by Result */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Activity className="size-5" />
                            Status Pemindaian
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={scansByResultData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {scansByResultData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Charts Row 2 */}
                {period === 'today' && (
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Clock className="size-5" />
                            Pemindaian per Jam (Hari Ini)
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="scans" name="Jumlah Scan" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Scans by Method */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Scan className="size-5" />
                            Metode Pemindaian
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={scansByMethodData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={70}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {scansByMethodData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 flex justify-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Camera className="size-4 text-blue-500" />
                                <span>Kamera: {analytics?.scans_by_method.camera || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Keyboard className="size-4 text-purple-500" />
                                <span>Manual: {analytics?.scans_by_method.manual || 0}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Top Users */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Users className="size-5" />
                            Pengguna Teraktif
                        </h3>
                        <div className="space-y-3">
                            {analytics?.scans_by_user.slice(0, 5).map((item, index) => (
                                <div key={item.user_id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{item.user.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.user.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">{item.scan_count} scan</Badge>
                                </div>
                            ))}
                            {(!analytics?.scans_by_user || analytics.scans_by_user.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Belum ada data pengguna
                                </p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Tables */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Most Scanned Medicines */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Package className="size-5" />
                            Obat Paling Banyak Discan
                        </h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Obat</TableHead>
                                    <TableHead className="text-right">Jumlah Scan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analytics?.most_scanned_medicines.slice(0, 5).map((item) => (
                                    <TableRow key={item.obat_id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{item.obat?.nama_obat}</p>
                                                <p className="text-xs text-muted-foreground">{item.obat?.kode_obat}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline">{item.scan_count}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!analytics?.most_scanned_medicines || analytics.most_scanned_medicines.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                                            Belum ada data
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>

                    {/* Most Scanned Batches */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Package className="size-5" />
                            Batch Paling Banyak Discan
                        </h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch</TableHead>
                                    <TableHead className="text-right">Jumlah Scan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analytics?.most_scanned_batches.map((item) => (
                                    <TableRow key={item.batch_id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{item.batch?.nomor_batch}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.batch?.obat?.nama_obat}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline">{item.scan_count}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!analytics?.most_scanned_batches || analytics.most_scanned_batches.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                                            Belum ada data
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
