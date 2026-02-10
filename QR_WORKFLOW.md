# QR Code System Workflow

Complete workflow documentation for the QR Code feature in SIMRS Apotek.

## Table of Contents
1. [Overview](#overview)
2. [Use Cases](#use-cases)
3. [Data Structure](#data-structure)
4. [QR Generation Workflow](#qr-generation-workflow)
5. [QR Scanning Workflow](#qr-scanning-workflow)
6. [Implementation Plan](#implementation-plan)
7. [UI/UX Design](#uiux-design)

---

## Overview

The QR Code system allows pharmacy staff to:
- **Generate QR codes** for medicine batches
- **Scan QR codes** to quickly retrieve batch information
- **Track scan logs** for audit and analytics
- **Verify batch authenticity** and expiration status

**Technology:**
- Backend: `SimpleSoftwareIO\QrCode` package
- Frontend: `html5-qrcode` or `react-qr-scanner`
- Storage: QR data stored in `batch_obat.qr_data` (JSON)

---

## Use Cases

### 1. **Batch Identification**
Staff can scan a batch's QR code to instantly view:
- Medicine name and details
- Batch number and expiration date
- Current stock availability
- Supplier information

### 2. **Quick Transaction Entry**
When processing outgoing transactions:
1. Scan QR code on medicine package
2. Auto-fill medicine and batch selection
3. Enter quantity
4. Submit transaction

### 3. **Stock Verification**
During stock opname:
1. Scan QR code on shelf
2. Verify system stock vs physical count
3. Update discrepancies directly

### 4. **Expired Batch Alert**
When scanning:
- System checks expiration date
- Shows warning if expired or expiring soon (< 30 days)
- Logs expired batch scans for reporting

### 5. **Audit Trail**
All scans logged with:
- Who scanned (user_id)
- When scanned (waktu_scan)
- Scan result (success/not_found/expired/error)
- IP address and user agent

---

## Data Structure

### BatchObat Model Fields

```php
'kode_qr' => 'string(50)'  // Unique QR identifier (e.g., "QR-20260210145623-A3F2")
'qr_data' => 'json'         // Complete batch data for QR encoding
```

### QR Data JSON Structure

```json
{
  "kode_qr": "QR-20260210145623-A3F2",
  "obat": {
    "id": 1,
    "kode": "OBT001",
    "nama": "Paracetamol 500mg",
    "nama_generik": "Acetaminophen",
    "kategori": "Analgesik",
    "jenis": "Tablet",
    "satuan": "Strip"
  },
  "batch": {
    "id": 5,
    "nomor": "BATCH-20260210145623-X3K8",
    "expired": "2027-02-10",
    "stok": 100
  },
  "generated_at": "2026-02-10T14:56:23+07:00",
  "link": "http://localhost/obat/1/batch/5"
}
```

### QR Scan Log Table

```
qr_scan_log
├── id
├── batch_id (nullable - if found)
├── user_id (nullable - if logged in)
├── kode_qr_scanned (string)
├── metode_scan (enum: 'camera', 'scanner')
├── hasil_scan (enum: 'success', 'not_found', 'expired', 'error')
├── pesan_error (text, nullable)
├── data_hasil (json, nullable - batch data)
├── ip_address (string)
├── user_agent (text)
├── waktu_scan (timestamp)
└── timestamps
```

---

## QR Generation Workflow

### Backend: BatchObat Model

**Automatic Generation on Create:**

```php
// app/Models/BatchObat.php
protected static function boot()
{
    parent::boot();
    
    static::creating(function ($batch) {
        if (empty($batch->kode_qr)) {
            $batch->kode_qr = $batch->generateQrCode();
        }
        $batch->qr_data = $batch->generateQrData();
    });
    
    static::updating(function ($batch) {
        // Regenerate QR data if key fields change
        $batch->qr_data = $batch->generateQrData();
    });
}

public function generateQrCode(): string
{
    $prefix = 'QR';
    $timestamp = now()->format('YmdHis');
    $random = strtoupper(Str::random(4));
    return "{$prefix}-{$timestamp}-{$random}";
}
```

**QR Data Generation:**

```php
public function generateQrData(): array
{
    return [
        'kode_qr' => $this->kode_qr,
        'obat' => [...medicine details...],
        'batch' => [...batch details...],
        'generated_at' => now()->toIso8601String(),
        'link' => url("/obat/{$this->obat->id}/batch/{$this->id}"),
    ];
}
```

### API Endpoint: Generate QR Image

```php
// GET /api/qr/generate/{batch}
public function generate(BatchObat $batch): JsonResponse
{
    $qrCode = QrCode::size(300)
        ->format('png')
        ->generate($batch->qr_json);
    
    $qrCodeBase64 = base64_encode($qrCode);
    
    return response()->json([
        'batch' => $batch,
        'qr_code' => 'data:image/png;base64,' . $qrCodeBase64,
        'qr_data' => $batch->qr_data,
        'kode_qr' => $batch->kode_qr,
    ]);
}
```

### Frontend: Generate & Display

**Use Case 1: View in Batch Details Page**

```tsx
// resources/js/pages/obat/batch/show.tsx
const [qrCode, setQrCode] = useState<string>('');

const generateQr = async () => {
  const response = await axios.get(`/api/qr/generate/${batch.id}`);
  setQrCode(response.data.qr_code);
};

return (
  <Button onClick={generateQr}>
    <QrCode className="mr-2" />
    Generate QR Code
  </Button>
  
  {qrCode && (
    <div>
      <img src={qrCode} alt="QR Code" />
      <Button onClick={printQr}>Print</Button>
    </div>
  )}
);
```

**Use Case 2: Bulk Generate for Batch List**

```tsx
// Generate QR for multiple batches at once
const generateBulkQr = async (batchIds: number[]) => {
  const promises = batchIds.map(id => 
    axios.get(`/api/qr/generate/${id}`)
  );
  
  const results = await Promise.all(promises);
  // Display in grid or download as ZIP
};
```

---

## QR Scanning Workflow

### Frontend: Scanner Component

**Option 1: Camera-based Scanner**

```tsx
// resources/js/components/qr-scanner.tsx
import { Html5QrcodeScanner } from "html5-qrcode";

export function QrScanner({ onScan }: Props) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: 250,
    });
    
    scanner.render(
      (decodedText) => {
        // decodedText = QR JSON string
        const data = JSON.parse(decodedText);
        onScan(data.kode_qr);
      },
      (error) => console.error(error)
    );
    
    return () => scanner.clear();
  }, []);
  
  return <div id="qr-reader"></div>;
}
```

**Option 2: Manual Input**

```tsx
// For when camera not available
<Input 
  placeholder="Masukkan kode QR manual"
  value={kodeQr}
  onChange={(e) => setKodeQr(e.target.value)}
/>
<Button onClick={() => onScan(kodeQr)}>
  Cari
</Button>
```

### Backend: Scan Processing

```php
// POST /api/qr/scan
public function scan(Request $request): JsonResponse
{
    $request->validate([
        'kode_qr' => 'required|string',
        'metode' => 'required|in:camera,scanner',
    ]);
    
    // 1. Find batch by QR code
    $batch = BatchObat::with(['obat', 'supplier'])
        ->where('kode_qr', $request->kode_qr)
        ->first();
    
    // 2. Handle not found
    if (!$batch) {
        QrScanLog::logScan(
            $request->kode_qr,
            $request->metode,
            QrScanLog::HASIL_NOT_FOUND,
            null,
            auth()->user(),
            'QR Code tidak ditemukan'
        );
        
        return response()->json([
            'success' => false,
            'message' => 'QR Code tidak ditemukan',
        ], 404);
    }
    
    // 3. Check if expired
    if ($batch->isExpired()) {
        QrScanLog::logScan(
            $request->kode_qr,
            $request->metode,
            QrScanLog::HASIL_EXPIRED,
            $batch,
            auth()->user(),
            'Batch sudah kadaluarsa',
            $batch->qr_data
        );
        
        return response()->json([
            'success' => false,
            'message' => 'Batch sudah kadaluarsa',
            'batch' => $batch,
            'severity' => 'error',
        ], 400);
    }
    
    // 4. Check if expiring soon (< 30 days)
    if ($batch->isExpiringSoon(30)) {
        $daysLeft = now()->diffInDays($batch->tanggal_expired);
        
        QrScanLog::logScan(
            $request->kode_qr,
            $request->metode,
            QrScanLog::HASIL_SUCCESS,
            $batch,
            auth()->user(),
            null,
            $batch->qr_data
        );
        
        return response()->json([
            'success' => true,
            'message' => "Batch akan expired dalam {$daysLeft} hari",
            'batch' => $batch,
            'severity' => 'warning',
        ]);
    }
    
    // 5. Success
    QrScanLog::logScan(
        $request->kode_qr,
        $request->metode,
        QrScanLog::HASIL_SUCCESS,
        $batch,
        auth()->user(),
        null,
        $batch->qr_data
    );
    
    LogAktivitas::log(
        auth()->user(),
        "Scan QR Code batch: {$batch->nomor_batch}",
        'qr_code',
        'scan',
        $batch
    );
    
    return response()->json([
        'success' => true,
        'message' => 'QR Code berhasil dipindai',
        'batch' => $batch,
        'obat' => $batch->obat,
        'severity' => 'success',
    ]);
}
```

---

## Implementation Plan

### Phase 1: QR Scanner Page (Priority: HIGH)

**Files to Create/Update:**

1. **resources/js/pages/obat/qr/index.tsx** - Main QR page
   - Tab 1: Scan QR (camera or manual input)
   - Tab 2: Scan History (logs table)
   - Tab 3: Generate QR (select batch, generate, print)

2. **resources/js/components/qr-scanner.tsx** - Scanner component
   - Camera-based QR scanner
   - Manual input fallback
   - Real-time scan result display

3. **Install npm package:**
   ```bash
   npm install html5-qrcode
   ```

### Phase 2: Batch Details QR (Priority: MEDIUM)

**Files to Update:**

1. **resources/js/pages/obat/batch/show.tsx**
   - Add "Generate QR" button
   - Display QR code image
   - Add "Print QR" function

2. **resources/js/pages/obat/batch/index.tsx**
   - Add "QR" column with icon
   - Bulk generate QR for selected batches

### Phase 3: Transaction Integration (Priority: LOW)

**Files to Update:**

1. **resources/js/pages/transaksi/barang-keluar.tsx**
   - Add "Scan QR" button above form
   - Auto-fill obat and batch when scanned
   - Show scanned batch info

2. **resources/js/pages/transaksi/penjualan.tsx**
   - Add QR scanner for quick item addition
   - Scan → add to cart with pre-filled data

### Phase 4: Analytics & Reports (Priority: LOW)

**Files to Create:**

1. **resources/js/pages/laporan/qr-analytics.tsx**
   - Total scans (success vs failed)
   - Most scanned batches
   - Scan trends (daily/weekly/monthly)
   - User scan statistics

---

## UI/UX Design

### QR Scanner Page Layout

```
┌─────────────────────────────────────────────────┐
│ QR Code Scanner                                  │
├─────────────────────────────────────────────────┤
│ [Scan QR] [History] [Generate]                  │ ← Tabs
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────────┐   ┌──────────────────┐│
│  │                     │   │ Scan Result       ││
│  │   📷 Camera View    │   │                   ││
│  │                     │   │ [Medicine Card]   ││
│  │   [Scanning...]     │   │ Nama: Paracetamol ││
│  │                     │   │ Batch: BATCH-001  ││
│  │                     │   │ Expired: 2027     ││
│  └─────────────────────┘   │ Stock: 100        ││
│                            │                   ││
│  OR Manual Input:          │ [✓] Success       ││
│  [Enter QR Code_______]    │                   ││
│  [Scan Button]             └──────────────────┘│
│                                                  │
└─────────────────────────────────────────────────┘
```

### Scan History Tab

```
┌─────────────────────────────────────────────────┐
│ Scan History                                     │
├─────────────────────────────────────────────────┤
│ Filter: [All ▼] [Success ▼] [Today ▼]          │
├──────┬───────────┬─────────┬────────┬──────────┤
│ Time │ User      │ Batch   │ Result │ Method   │
├──────┼───────────┼─────────┼────────┼──────────┤
│ 10:30│ John Doe  │ BATCH-01│ ✓      │ Camera   │
│ 10:25│ Jane Smith│ BATCH-02│ ⚠ Exp  │ Scanner  │
│ 10:20│ Bob Lee   │ QR-999  │ ✗ 404  │ Camera   │
└──────┴───────────┴─────────┴────────┴──────────┘
```

### Generate QR Tab

```
┌─────────────────────────────────────────────────┐
│ Generate QR Code                                 │
├─────────────────────────────────────────────────┤
│ Select Batch:                                    │
│ [Search batch...              ▼]                │
│                                                  │
│ Selected: BATCH-20260210145623-X3K8              │
│ Medicine: Paracetamol 500mg                      │
│ Expired: 2027-02-10                              │
│                                                  │
│ [Generate QR Code]                               │
│                                                  │
│ Generated QR Code:                               │
│  ┌─────────┐                                    │
│  │ ███████ │                                    │
│  │ █     █ │  QR-20260210145623-A3F2            │
│  │ ███████ │                                    │
│  └─────────┘                                    │
│                                                  │
│  [Download PNG] [Print] [Copy Link]             │
└─────────────────────────────────────────────────┘
```

---

## Code Examples

### Complete QR Scanner Component

```tsx
// resources/js/components/qr-scanner.tsx
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Loader2, Search } from 'lucide-react';
import axios from 'axios';

interface BatchData {
  id: number;
  nomor_batch: string;
  tanggal_expired: string;
  stok_tersedia: number;
  obat: {
    nama_obat: string;
    kode_obat: string;
    kategori: { nama_kategori: string };
  };
}

export function QrScanner() {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const processScan = async (kodeQr: string, metode: 'camera' | 'scanner') => {
    try {
      const response = await axios.post('/api/qr/scan', {
        kode_qr: kodeQr,
        metode: metode,
      });
      
      setScanResult(response.data);
      setError('');
      
      // Stop scanner after successful scan
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
        setScanning(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memindai QR code');
      setScanResult(null);
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
    } catch (err) {
      setError('Gagal mengakses kamera. Gunakan input manual.');
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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div id="qr-reader" className="w-full"></div>
          
          <div className="flex gap-2">
            {!scanning ? (
              <Button onClick={startCameraScanner} className="flex-1">
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
                Or enter manually
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Masukkan kode QR"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
            />
            <Button onClick={handleManualScan}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scan Result</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {scanResult?.success && scanResult.batch && (
            <div className="space-y-3">
              <Alert variant={scanResult.severity === 'warning' ? 'warning' : 'default'}>
                <AlertDescription>{scanResult.message}</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Medicine:</span>
                  <p className="font-semibold">{scanResult.obat.nama_obat}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Batch:</span>
                  <p className="font-mono">{scanResult.batch.nomor_batch}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Expired:</span>
                  <p>{new Date(scanResult.batch.tanggal_expired).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Stock:</span>
                  <p>{scanResult.batch.stok_tersedia} {scanResult.obat.satuan?.nama_satuan}</p>
                </div>
              </div>

              <Button className="w-full" asChild>
                <a href={`/obat/${scanResult.obat.id}/batch/${scanResult.batch.id}`}>
                  View Details
                </a>
              </Button>
            </div>
          )}

          {!scanResult && !error && (
            <div className="text-center text-muted-foreground py-8">
              <Camera className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Scan QR code atau masukkan kode manual</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Benefits

1. **Speed**: Scan QR → instant batch info (vs manual search)
2. **Accuracy**: Eliminates manual entry errors
3. **Traceability**: Complete audit trail of all scans
4. **Efficiency**: Quick transaction entry and stock verification
5. **Safety**: Expired batch detection before use

---

## Next Steps

1. ✅ Infrastructure complete (models, controllers, routes)
2. ⏳ **Install html5-qrcode package**
3. ⏳ **Create QR Scanner component**
4. ⏳ **Build QR Scanner page with tabs**
5. ⏳ **Test camera scanning**
6. ⏳ **Add QR to batch details page**
7. ⏳ **Integrate with transactions**
8. ⏳ **Create scan analytics report**

Ready to start implementing the scanner UI?
