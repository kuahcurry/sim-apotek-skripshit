# Function Relationships & Dependencies

This document maps how different functions, models, controllers, and events are tied together in the SIMRS Apotek system.

## Table of Contents
1. [Medicine Management Flow](#medicine-management-flow)
2. [Transaction Flow](#transaction-flow)
3. [Stock Opname Flow](#stock-opname-flow)
4. [Prescription Flow](#prescription-flow)
5. [Notification System](#notification-system)
6. [Event-Driven Architecture](#event-driven-architecture)

---

## Medicine Management Flow

### Obat (Medicine) → BatchObat (Batch) → Transaksi (Transaction)

```
ObatController
├── index() → Obat Model → with(['kategori', 'jenis', 'satuan', 'batches'])
├── store() → validates → creates Obat → fires StokUpdated Event
├── update() → updates Obat → recalculates stok_total → fires StokUpdated Event
└── destroy() → soft deletes Obat

Obat Model
├── kategori() → belongsTo(KategoriObat)
├── jenis() → belongsTo(JenisObat)
├── satuan() → belongsTo(SatuanObat)
├── batches() → hasMany(BatchObat)
├── transaksi() → hasMany(Transaksi)
├── permintaan() → hasMany(PermintaanUnit)
└── stokOpnameDetails() → hasMany(StokOpnameDetail)

BatchObat Model
├── obat() → belongsTo(Obat)
├── supplier() → belongsTo(Supplier)
├── transaksi() → hasMany(Transaksi)
└── boot() → generates nomor_batch automatically
```

**Key Relationships:**
- Creating/updating a batch automatically updates `Obat.stok_total`
- Deleting a medicine cascades to its batches
- Medicine stock is the sum of all active batches

---

## Transaction Flow

### TransaksiController → Obat → BatchObat → Events

```
TransaksiController
├── storeKeluar() (OUT transaction)
│   ├── validates request
│   ├── finds BatchObat by ID
│   ├── checks stok_tersedia >= jumlah
│   ├── creates Transaksi record
│   ├── reduces batch.stok_tersedia
│   ├── recalculates obat.stok_total
│   ├── creates LogAktivitas
│   └── fires TransaksiCreated Event
│
└── storePenjualan() (SALES transaction)
    ├── validates request
    ├── loops through items[]
    ├── for each item:
    │   ├── finds BatchObat
    │   ├── reduces stok_tersedia
    │   ├── creates Transaksi record
    │   └── recalculates obat.stok_total
    ├── creates LogAktivitas
    └── fires TransaksiCreated Event

Transaksi Model
├── obat() → belongsTo(Obat)
├── batch() → belongsTo(BatchObat)
├── user() → belongsTo(User)
├── unit() → belongsTo(UnitRumahSakit)
└── boot() → generates nomor_transaksi automatically
```

**Key Dependencies:**
- Transaction creation depends on available batch stock
- Uses FEFO (First Expired First Out) logic for batch selection
- Each transaction logs activity and triggers events

---

## Stock Opname Flow

### StokOpnameController → StokOpnameDetail → Obat

```
StokOpnameController
├── store() (Create opname)
│   ├── creates StokOpname record (status: draft)
│   └── generates nomor_opname
│
├── startOpname() (Start counting)
│   ├── updates status to 'in_progress'
│   └── creates StokOpnameDetail for each obat
│
├── completeOpname() (Finish counting)
│   ├── validates all details have stok_fisik
│   ├── calculates selisih = stok_fisik - stok_sistem
│   ├── updates status to 'completed'
│   └── generates berita_acara
│
└── approve() (Approve & apply adjustments)
    ├── checks user has permission
    ├── for each detail with selisih != 0:
    │   ├── creates Transaksi (type: adjustment)
    │   ├── updates Obat.stok_total
    │   └── creates LogAktivitas
    ├── updates status to 'approved'
    ├── sets approved_by and approved_at
    └── fires StokUpdated Event

StokOpname Model
├── penanggungJawab() → belongsTo(User)
├── approvedBy() → belongsTo(User)
├── unit() → belongsTo(UnitRumahSakit)
├── details() → hasMany(StokOpnameDetail)
└── boot() → generates nomor_opname

StokOpnameDetail Model
├── stokOpname() → belongsTo(StokOpname)
├── obat() → belongsTo(Obat)
└── batch() → belongsTo(BatchObat)
```

**Workflow:**
1. Create opname (draft)
2. Start opname (in_progress) → creates details
3. Count physical stock → update stok_fisik
4. Complete opname → calculates differences
5. Approve → applies adjustments to actual stock

---

## Prescription Flow

### ResepController → ResepDetail → Obat → PermintaanUnit

```
ResepController
├── store() (Create prescription)
│   ├── validates resep data
│   ├── creates Resep record
│   ├── for each detail:
│   │   └── creates ResepDetail
│   └── fires PermintaanCreated Event
│
├── process() (Start processing)
│   ├── checks obat availability
│   ├── for each detail:
│   │   ├── finds available batch (FEFO)
│   │   ├── reduces batch.stok_tersedia
│   │   └── marks detail.is_dispensed = true
│   ├── updates resep.status = 'processed'
│   ├── creates Transaksi records
│   └── creates LogAktivitas
│
└── complete() (Complete prescription)
    ├── updates resep.status = 'completed'
    ├── sets processed_by and processed_at
    └── creates Notifikasi to requesting unit

Resep Model
├── unit() → belongsTo(UnitRumahSakit)
├── processedBy() → belongsTo(User)
├── details() → hasMany(ResepDetail)
└── boot() → generates nomor_resep

ResepDetail Model
├── resep() → belongsTo(Resep)
├── obat() → belongsTo(Obat)
└── markAsDispensed() → updates is_dispensed
```

**Integration with PermintaanUnit:**
- When unit requests medicines → creates PermintaanUnit
- Pharmacy can convert PermintaanUnit → Resep
- Processing resep reduces stock like transactions

---

## Notification System

### Events → Listeners → Notifikasi Model

```
NotifikasiCreated Event
├── triggered by: manual notification creation
└── data: user_id, title, message, type, link

PermintaanCreated Event
├── triggered by: PermintaanUnitController@store()
├── creates Notifikasi for pharmacy staff
└── data: permintaan details

StokUpdated Event
├── triggered by: Obat updates, Transaksi
├── checks if stok_total <= stok_minimum
├── if yes: creates Notifikasi for admin
└── data: obat_id, old_stock, new_stock

TransaksiCreated Event
├── triggered by: TransaksiController@store()
├── creates LogAktivitas
└── data: transaksi details

Notifikasi Model
├── user() → belongsTo(User)
├── markAsRead() → updates read_at
└── scopeUnread() → where('read_at', null)
```

**Notification Flow:**
1. Action occurs (stock update, request created, etc.)
2. Event is fired
3. Listener creates Notifikasi record
4. User sees notification in UI
5. User clicks → marks as read

---

## Event-Driven Architecture

### Event → Listener Mapping

```
app/Events/
├── NotifikasiCreated.php
├── PermintaanCreated.php → notifies pharmacy staff
├── StokUpdated.php → checks low stock, creates notification
└── TransaksiCreated.php → logs activity

app/Listeners/ (implicit - auto-discovered)
├── CreateLowStockNotification (for StokUpdated)
├── CreateRequestNotification (for PermintaanCreated)
└── LogTransactionActivity (for TransaksiCreated)
```

### Model Observers

```
Obat Model
├── creating → validates stok_minimum
├── updated → fires StokUpdated if stok_total changed
└── deleting → checks if has active batches

BatchObat Model
├── creating → generates nomor_batch
├── saved → recalculates Obat.stok_total
└── deleting → recalculates parent Obat.stok_total

Transaksi Model
├── creating → generates nomor_transaksi
├── created → fires TransaksiCreated Event
└── created → updates batch and obat stock
```

---

## API vs Web Controllers

### API Controllers (routes/api.php)
Used for AJAX requests from React frontend:

```
Api\ObatController
├── index() → returns paginated obat JSON
├── lowStock() → returns obat with stok <= stok_minimum
├── expiringSoon() → returns batches expiring in 30 days
└── checkAvailability() → checks if quantity available

Api\TransaksiController
├── storeKeluar() → creates OUT transaction
├── storePenjualan() → creates SALES transaction (multiple items)
└── statistics() → returns transaction stats

Api\DashboardController
├── stats() → returns dashboard statistics
└── recentActivity() → returns recent transactions
```

### Web Controllers (routes/web.php)
Used for rendering Inertia.js pages:

```
ObatController
├── index() → Inertia::render('obat/index')
├── create() → Inertia::render('obat/create')
└── show() → Inertia::render('obat/show')

TransaksiController
├── barangMasuk() → Inertia::render('transaksi/barang-masuk')
├── barangKeluar() → Inertia::render('transaksi/barang-keluar')
└── penjualan() → Inertia::render('transaksi/penjualan')
```

---

## Frontend → Backend Integration

### React Component → API Call → Controller → Model

```tsx
// Frontend: resources/js/pages/obat/index.tsx
import { router } from '@inertiajs/react';

function deleteObat(id: number) {
  router.delete(`/obat/${id}`, {
    onSuccess: () => alert('Deleted!'),
  });
}

// Routes: routes/web.php
Route::delete('/obat/{obat}', [ObatController::class, 'destroy']);

// Controller: app/Http/Controllers/ObatController.php
public function destroy(Obat $obat) {
  $obat->delete(); // Soft delete
  return redirect()->route('obat.index');
}

// Model: app/Models/Obat.php
use SoftDeletes;
```

### AJAX API Calls

```tsx
// Frontend: resources/js/pages/transaksi/barang-keluar.tsx
import axios from 'axios';

async function createTransaksi(data) {
  const response = await axios.post('/api/transaksi/keluar', data);
  return response.data;
}

// Routes: routes/api.php
Route::post('/transaksi/keluar', [TransaksiController::class, 'storeKeluar']);

// Controller: app/Http/Controllers/Api/TransaksiController.php
public function storeKeluar(Request $request): JsonResponse {
  // validation
  // create transaction
  // update stock
  // fire event
  return response()->json(['success' => true]);
}
```

---

## Database Relationships Summary

### One-to-Many Relationships

```
User
├── hasMany → Transaksi (user_id)
├── hasMany → LogAktivitas (user_id)
├── hasMany → Notifikasi (user_id)
├── hasMany → StokOpname (penanggung_jawab)
└── hasMany → PermintaanUnit (processed_by)

Obat
├── hasMany → BatchObat (obat_id)
├── hasMany → Transaksi (obat_id)
├── hasMany → PermintaanUnit (obat_id)
└── hasMany → ResepDetail (obat_id)

KategoriObat
└── hasMany → Obat (kategori_id)

JenisObat
└── hasMany → Obat (jenis_id)

SatuanObat
└── hasMany → Obat (satuan_id)

Supplier
└── hasMany → BatchObat (supplier_id)

UnitRumahSakit
├── hasMany → Transaksi (unit_id)
├── hasMany → PermintaanUnit (unit_id)
└── hasMany → Resep (unit_id)
```

### Belongs-To Relationships

```
BatchObat
├── belongsTo → Obat (obat_id)
└── belongsTo → Supplier (supplier_id)

Transaksi
├── belongsTo → Obat (obat_id)
├── belongsTo → BatchObat (batch_id)
├── belongsTo → User (user_id)
└── belongsTo → UnitRumahSakit (unit_id)

PermintaanUnit
├── belongsTo → UnitRumahSakit (unit_id)
├── belongsTo → Obat (obat_id)
└── belongsTo → User (processed_by)

Resep
├── belongsTo → UnitRumahSakit (unit_id)
└── belongsTo → User (processed_by)

ResepDetail
├── belongsTo → Resep (resep_id)
└── belongsTo → Obat (obat_id)

StokOpname
├── belongsTo → User (penanggung_jawab)
├── belongsTo → User (approved_by)
└── belongsTo → UnitRumahSakit (unit_id)

StokOpnameDetail
├── belongsTo → StokOpname (stok_opname_id)
├── belongsTo → Obat (obat_id)
└── belongsTo → BatchObat (batch_id)

PemusnahanObat
├── belongsTo → User (penanggung_jawab)
└── belongsTo → User (approved_by)

PemusnahanObatDetail
├── belongsTo → PemusnahanObat (pemusnahan_id)
├── belongsTo → Obat (obat_id)
└── belongsTo → BatchObat (batch_id)
```

---

## Key Function Dependencies

### Creating a Transaction
1. **Frontend** calls API with obat_id, batch_id, jumlah
2. **TransaksiController** validates request
3. **BatchObat::find()** retrieves batch
4. **Check** if stok_tersedia >= jumlah
5. **Transaksi::create()** creates record
6. **BatchObat::update()** reduces stok_tersedia
7. **Obat::recalculateStock()** updates stok_total
8. **Event::fire(TransaksiCreated)** triggers notification
9. **LogAktivitas::create()** logs action
10. **Return** JSON response

### Processing a Stock Opname
1. **Create** StokOpname (status: draft)
2. **Start** opname → creates StokOpnameDetail for all medicines
3. **Count** physical stock → update each detail.stok_fisik
4. **Complete** → calculate selisih for each item
5. **Approve** → for each item with difference:
   - Create adjustment Transaksi
   - Update Obat.stok_total
   - Log activity
6. **Fire** StokUpdated Event
7. **Notify** responsible user

### Processing a Prescription
1. **Unit** creates PermintaanUnit
2. **Pharmacy** receives notification (PermintaanCreated)
3. **Pharmacy** converts to Resep or processes directly
4. **For each ResepDetail:**
   - Find available batch (FEFO)
   - Check stock availability
   - Create Transaksi (OUT)
   - Reduce batch stock
   - Mark detail as dispensed
5. **Update** Resep status to 'processed'
6. **Notify** requesting unit
7. **Log** activity

---

## Middleware & Guards

### Authentication Flow

```
Request → web middleware
├── EncryptCookies
├── VerifyCsrfToken
├── StartSession
├── ShareErrorsFromSession
└── HandleInertiaRequests

Authenticated Routes → auth middleware
├── Checks if user logged in
├── Redirects to /login if not
└── Injects user data to Inertia

API Routes → auth:sanctum middleware
├── Checks Bearer token
└── Returns 401 if invalid
```

### Role-Based Access Control (RBAC)

```
User Model
├── role: 'admin', 'apoteker', 'staff', 'viewer'
└── isAdmin(), isApoteker(), hasRole() methods

Controllers use:
├── $this->authorize('view', $obat)
├── Gate::allows('approve', $stokOpname)
└── @can('delete', $obat) in views
```

---

## Conclusion

This system follows Laravel best practices:
- **MVC Architecture**: Models handle business logic, Controllers orchestrate, Views (Inertia) render UI
- **Event-Driven**: Stock updates trigger notifications automatically
- **RESTful API**: Consistent endpoint structure
- **Eloquent ORM**: Relationships defined at model level
- **Service Layer**: Complex operations in dedicated services (if needed)
- **Repository Pattern**: Models act as repositories

**Key Dependencies to Remember:**
1. Stock changes → Always update both BatchObat and Obat
2. Transactions → Always create LogAktivitas
3. Approvals → Check user permissions first
4. Events → Fire after successful database commits
5. Notifications → Create for relevant users automatically
