import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, Search, Package, Calendar, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface BatchData {
  id: number;
  nomor_batch: string;
  tanggal_expired: string;
  stok_tersedia: number;
  obat: {
    id: number;
    nama_obat: string;
    kode_obat: string;
    kategori: { nama_kategori: string };
    jenis: { nama_jenis: string };
    satuan: { nama_satuan: string };
  };
}

interface ScanResponse {
  success: boolean;
  message: string;
  severity: 'success' | 'warning' | 'error';
  batch?: BatchData;
  obat?: BatchData['obat'];
}

export function QrScanner() {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const processScan = async (kodeQr: string, metode: 'camera' | 'scanner') => {
    setLoading(true);
    try {
      const response = await axios.post<ScanResponse>('/api/qr/scan', {
        kode_qr: kodeQr,
        metode: metode,
      });
      
      setScanResult(response.data);
      setError('');
      
      // Stop scanner after successful scan
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
        setScanning(false);
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      setError(errorData?.message || 'Gagal memindai QR code');
      
      // If expired, still show batch info
      if (errorData?.batch) {
        setScanResult(errorData);
      } else {
        setScanResult(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const startCameraScanner = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Parse JSON from QR code
          try {
            const data = JSON.parse(decodedText);
            processScan(data.kode_qr, 'camera');
          } catch {
            // If not JSON, treat as plain kode_qr
            processScan(decodedText, 'camera');
          }
        },
        undefined
      );
      
      setScanning(true);
      setError('');
    } catch (err) {
      setError('Gagal mengakses kamera. Pastikan izin kamera sudah diberikan atau gunakan input manual.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      setScanning(false);
    }
  };

  const handleManualScan = () => {
    if (manualCode.trim()) {
      processScan(manualCode.trim(), 'scanner');
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            id="qr-reader" 
            className="w-full rounded-lg overflow-hidden border"
            style={{ minHeight: scanning ? '300px' : '0px' }}
          />
          
          <div className="flex gap-2">
            {!scanning ? (
              <Button onClick={startCameraScanner} className="flex-1" disabled={loading}>
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopScanner} variant="destructive" className="flex-1">
                Stop Scanner
              </Button>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Atau masukkan manual
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Masukkan kode QR (contoh: QR-20260210-A3F2)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
              disabled={loading}
            />
            <Button onClick={handleManualScan} disabled={loading || !manualCode.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {loading && (
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Memproses scan...</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Hasil Scan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && !scanResult && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {scanResult && scanResult.batch && (
            <div className="space-y-4">
              <Alert variant={
                scanResult.severity === 'error' ? 'destructive' : 
                scanResult.severity === 'warning' ? 'default' : 
                'default'
              }>
                <div className="flex items-center gap-2">
                  {getSeverityIcon(scanResult.severity)}
                  <AlertDescription>{scanResult.message}</AlertDescription>
                </div>
              </Alert>

              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Obat</span>
                    </div>
                    <p className="font-semibold text-lg">{scanResult.obat?.nama_obat}</p>
                    <p className="text-sm text-muted-foreground font-mono">{scanResult.obat?.kode_obat}</p>
                  </div>
                  <Badge variant={scanResult.severity === 'error' ? 'destructive' : 'default'}>
                    {scanResult.obat?.kategori?.nama_kategori}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                  <div>
                    <span className="text-sm text-muted-foreground">Batch</span>
                    <p className="font-mono font-semibold">{scanResult.batch.nomor_batch}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Jenis</span>
                    <p className="font-semibold">{scanResult.obat?.jenis?.nama_jenis}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">Expired</span>
                      <p className="font-semibold">
                        {new Date(scanResult.batch.tanggal_expired).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">Stok</span>
                      <p className="font-semibold">
                        {scanResult.batch.stok_tersedia} {scanResult.obat?.satuan?.nama_satuan}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full" asChild>
                <a href={`/obat/${scanResult.obat?.id}/batch/${scanResult.batch.id}`}>
                  Lihat Detail Batch
                </a>
              </Button>
            </div>
          )}

          {!scanResult && !error && !loading && (
            <div className="text-center text-muted-foreground py-12">
              <Camera className="mx-auto h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1">Belum ada hasil scan</p>
              <p className="text-sm">Scan QR code atau masukkan kode manual untuk melihat informasi batch</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
