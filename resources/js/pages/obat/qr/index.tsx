import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, Link } from '@inertiajs/react';
import { 
    QrCode, 
    History, 
    Scan, 
    Download, 
    Printer, 
    Copy, 
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Camera,
    Search,
    Calendar,
    User,
    Filter,
    BarChart3
} from 'lucide-react';
import { QrScanner } from '@/components/qr-scanner';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'QR Code', href: '/qr' },
];

interface BatchOption {
    id: number;
    nomor_batch: string;
    kode_qr: string;
    tanggal_expired: string;
    stok_tersedia: number;
    obat: {
        nama_obat: string;
        kode_obat: string;
    };
}

interface ScanLog {
    id: number;
    kode_qr_scanned: string;
    metode_scan: 'camera' | 'scanner';
    hasil_scan: 'success' | 'not_found' | 'expired' | 'error';
    pesan_error?: string;
    waktu_scan: string;
    batch?: {
        nomor_batch: string;
        obat: {
            nama_obat: string;
        };
    };
    user?: {
        name: string;
    };
}

export default function QrIndex() {
    const [activeTab, setActiveTab] = useState('scan');
    
    // Generate QR state
    const [batches, setBatches] = useState<BatchOption[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [qrCode, setQrCode] = useState<string>('');
    const [qrData, setQrData] = useState<any>(null);
    const [searchBatch, setSearchBatch] = useState('');
    const [generatingQr, setGeneratingQr] = useState(false);
    
    // Scan logs state
    const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
    const [filterResult, setFilterResult] = useState<string>('all');
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Load batches for QR generation
    useEffect(() => {
        if (activeTab === 'generate') {
            loadBatches();
        }
    }, [activeTab]);

    // Load scan logs
    useEffect(() => {
        if (activeTab === 'history') {
            loadScanLogs();
        }
    }, [activeTab, filterResult]);

    const loadBatches = async () => {
        try {
            console.log('Loading batches...');
            console.log('Axios defaults:', {
                withCredentials: axios.defaults.withCredentials,
                headers: axios.defaults.headers.common
            });
            
            const response = await axios.get('/api/batch', {
                params: { per_page: 50 }
            });
            console.log('Batch API response:', response.data);
            // Handle both paginated and non-paginated responses
            const batchData = response.data.data || response.data;
            setBatches(Array.isArray(batchData) ? batchData : []);
        } catch (error: any) {
            console.error('Failed to load batches:', error);
            console.error('Error response:', error.response);
            console.error('Error response data:', error.response?.data);
            console.error('Error config:', error.config);
            
            // Try to show user-friendly error
            if (error.response?.status === 401) {
                console.error('Authentication failed. User may not be logged in properly for API requests.');
            }
        }
    };

    const loadScanLogs = async () => {
        setLoadingLogs(true);
        try {
            const response = await axios.get('/api/qr/scan-logs', {
                params: {
                    per_page: 20,
                    hasil: filterResult !== 'all' ? filterResult : undefined
                }
            });
            setScanLogs(response.data.data || []);
        } catch (error) {
            console.error('Failed to load scan logs:', error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const generateQr = async () => {
        if (!selectedBatch) return;
        
        setGeneratingQr(true);
        try {
            const response = await axios.get(`/api/qr/generate/${selectedBatch}`);
            setQrCode(response.data.qr_code);
            setQrData(response.data.qr_data);
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
        link.download = `QR-${qrData?.kode_qr || 'code'}.png`;
        link.click();
    };

    const printQr = () => {
        if (!qrCode) return;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print QR Code</title>
                        <style>
                            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; flex-direction: column; }
                            img { max-width: 400px; }
                            .info { text-align: center; margin-top: 20px; font-family: Arial; }
                            .batch { font-size: 18px; font-weight: bold; }
                            .medicine { font-size: 14px; color: #666; }
                        </style>
                    </head>
                    <body>
                        <img src="${qrCode}" />
                        <div class="info">
                            <div class="batch">${qrData?.batch?.nomor || ''}</div>
                            <div class="medicine">${qrData?.obat?.nama || ''}</div>
                            <div class="medicine">Kode: ${qrData?.kode_qr || ''}</div>
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

    const getResultBadge = (hasil: string) => {
        switch (hasil) {
            case 'success':
                return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Sukses</Badge>;
            case 'expired':
                return <Badge variant="default" className="bg-yellow-600"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>;
            case 'not_found':
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Tidak Ditemukan</Badge>;
            case 'error':
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
            default:
                return <Badge variant="secondary">{hasil}</Badge>;
        }
    };

    const filteredBatches = batches.filter(batch => 
        searchBatch === '' || 
        batch.nomor_batch.toLowerCase().includes(searchBatch.toLowerCase()) ||
        batch.obat.nama_obat.toLowerCase().includes(searchBatch.toLowerCase()) ||
        batch.kode_qr.toLowerCase().includes(searchBatch.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="QR Code" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <QrCode className="h-6 w-6" />
                            QR Code Scanner
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Scan, generate, dan kelola QR code untuk batch obat
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/qr/analytics">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                        </Link>
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="scan" className="flex items-center gap-2">
                            <Scan className="h-4 w-4" />
                            Scan QR
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Riwayat
                        </TabsTrigger>
                        <TabsTrigger value="generate" className="flex items-center gap-2">
                            <QrCode className="h-4 w-4" />
                            Generate
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="scan" className="flex-1">
                        <QrScanner />
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Riwayat Scan</CardTitle>
                                        <CardDescription>Log semua aktivitas scan QR code</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <Select value={filterResult} onValueChange={setFilterResult}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter hasil" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua</SelectItem>
                                                <SelectItem value="success">Sukses</SelectItem>
                                                <SelectItem value="expired">Expired</SelectItem>
                                                <SelectItem value="not_found">Tidak Ditemukan</SelectItem>
                                                <SelectItem value="error">Error</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loadingLogs ? (
                                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                                ) : scanLogs.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <History className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                        <p>Belum ada riwayat scan</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Waktu</TableHead>
                                                <TableHead>Kode QR</TableHead>
                                                <TableHead>Batch</TableHead>
                                                <TableHead>Obat</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>Metode</TableHead>
                                                <TableHead>Hasil</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {scanLogs.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="text-sm">
                                                        {new Date(log.waktu_scan).toLocaleString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">{log.kode_qr_scanned}</TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {log.batch?.nomor_batch || '-'}
                                                    </TableCell>
                                                    <TableCell>{log.batch?.obat?.nama_obat || '-'}</TableCell>
                                                    <TableCell>{log.user?.name || 'Guest'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="gap-1">
                                                            {log.metode_scan === 'camera' ? 
                                                                <><Camera className="h-3 w-3" />Camera</> : 
                                                                <><Search className="h-3 w-3" />Manual</>
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{getResultBadge(log.hasil_scan)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="generate" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Generate QR Code</CardTitle>
                                    <CardDescription>Pilih batch untuk generate QR code</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="search-batch">Cari Batch</Label>
                                        <Input
                                            id="search-batch"
                                            placeholder="Cari nomor batch, nama obat, atau kode QR..."
                                            value={searchBatch}
                                            onChange={(e) => setSearchBatch(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="batch-select">Pilih Batch</Label>
                                        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                                            <SelectTrigger id="batch-select">
                                                <SelectValue placeholder="Pilih batch..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredBatches.length === 0 ? (
                                                    <div className="p-4 text-sm text-muted-foreground text-center">
                                                        Tidak ada batch ditemukan
                                                    </div>
                                                ) : (
                                                    filteredBatches.map((batch) => (
                                                        <SelectItem key={batch.id} value={batch.id.toString()}>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold">{batch.obat.nama_obat}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {batch.nomor_batch} • Exp: {new Date(batch.tanggal_expired).toLocaleDateString('id-ID')}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button 
                                        onClick={generateQr} 
                                        className="w-full"
                                        disabled={!selectedBatch || generatingQr}
                                    >
                                        {generatingQr ? 'Generating...' : 'Generate QR Code'}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>QR Code Preview</CardTitle>
                                    <CardDescription>Preview dan download QR code</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {qrCode ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-center p-4 border rounded-lg bg-white">
                                                <img src={qrCode} alt="QR Code" className="max-w-[300px] w-full" />
                                            </div>
                                            
                                            {qrData && (
                                                <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                                                    <div>
                                                        <span className="text-sm text-muted-foreground">Obat:</span>
                                                        <p className="font-semibold">{qrData.obat?.nama}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm text-muted-foreground">Batch:</span>
                                                        <p className="font-mono">{qrData.batch?.nomor}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm text-muted-foreground">Kode QR:</span>
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
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <QrCode className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                            <p>Pilih batch untuk generate QR code</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
