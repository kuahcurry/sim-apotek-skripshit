# API Endpoints Reference

## 📊 Complete API Endpoint List

### Authentication
- POST `/login` - User login
- POST `/register` - User registration
- POST `/logout` - User logout

### Dashboard (Analytics)
- GET `/api/dashboard/stats` - Overall statistics
- GET `/api/dashboard/stock-levels` - Stock level overview
- GET `/api/dashboard/transaction-trends` - Transaction trends chart data
- GET `/api/dashboard/expiring-soon` - Medicines expiring soon
- GET `/api/dashboard/low-stock` - Low stock medicines
- GET `/api/dashboard/top-medicines` - Most used medicines
- GET `/api/dashboard/recent-transactions` - Recent transactions
- GET `/api/dashboard/unit-requests` - Unit request summary

### Medicine Management (Obat)
- GET `/api/obat` - List all medicines (with pagination, search, filters)
- POST `/api/obat` - Create new medicine
- GET `/api/obat/{id}` - Get medicine details
- PUT `/api/obat/{id}` - Update medicine
- DELETE `/api/obat/{id}` - Delete medicine
- GET `/api/obat/search?q={query}` - Search medicines
- GET `/api/obat/low-stock` - Get low stock medicines
- GET `/api/obat/{id}/batches` - Get medicine batches
- POST `/api/obat/{id}/recalculate-stock` - Recalculate total stock

### Batch Management (FEFO)
- GET `/api/batch` - List all batches
- GET `/api/batch/{id}` - Get batch details
- GET `/api/batch/expiring-soon?days=30` - Batches expiring soon
- GET `/api/batch/expired` - Expired batches
- POST `/api/batch/{id}/update-status` - Update batch status (quarantine, expired, etc.)

### Transactions
- GET `/api/transaksi` - List transactions
- POST `/api/transaksi/masuk` - Record incoming stock
- POST `/api/transaksi/keluar` - Record outgoing stock (FEFO)
- POST `/api/transaksi/penjualan` - Record sales
- GET `/api/transaksi/today` - Today's transactions
- GET `/api/transaksi/by-type/{type}` - Filter by transaction type
- GET `/api/transaksi/{id}` - Transaction details

### QR Code System
- GET `/api/qr/generate/{batch_id}` - Generate QR code for batch
- POST `/api/qr/scan` - Scan QR code and log
- GET `/api/qr/scan-logs` - QR scan history

### Unit Requests (Pharmacy to Departments)
- GET `/api/permintaan` - List all requests
- POST `/api/permintaan` - Create new request
- GET `/api/permintaan/pending` - Pending requests
- GET `/api/permintaan/urgent` - Urgent requests
- POST `/api/permintaan/{id}/process` - Process request
- POST `/api/permintaan/{id}/complete` - Complete request
- POST `/api/permintaan/{id}/cancel` - Cancel request
- GET `/api/permintaan/{id}` - Request details

### Notifications (Real-time)
- GET `/api/notifikasi` - List notifications
- GET `/api/notifikasi/unread` - Unread notifications
- GET `/api/notifikasi/unread-count` - Count unread
- POST `/api/notifikasi/{id}/read` - Mark as read
- POST `/api/notifikasi/read-all` - Mark all as read

### Prescriptions (Resep)
- GET `/api/resep` - List prescriptions
- POST `/api/resep` - Create prescription
- GET `/api/resep/pending` - Pending prescriptions
- POST `/api/resep/{id}/process` - Validate stock before dispensing
- POST `/api/resep/{id}/complete` - Mark as dispensed
- GET `/api/resep/{id}` - Prescription details

### Stock Opname (Physical Count)
- GET `/api/stok-opname` - List stock opname records
- POST `/api/stok-opname` - Create stock opname
- GET `/api/stok-opname/pending-approval` - Pending approvals
- POST `/api/stok-opname/{id}/complete` - Complete opname
- POST `/api/stok-opname/{id}/approve` - Approve & adjust stock
- GET `/api/stok-opname/{id}` - Opname details

### Drug Destruction (Pemusnahan Obat)
- GET `/api/pemusnahan` - List destruction records
- POST `/api/pemusnahan` - Create destruction record
- GET `/api/pemusnahan/eligible` - Eligible batches for destruction
- GET `/api/pemusnahan/pending-approval` - Pending approvals
- POST `/api/pemusnahan/{id}/upload-ba` - Upload berita acara PDF
- POST `/api/pemusnahan/{id}/approve` - Approve & adjust stock
- GET `/api/pemusnahan/{id}` - Destruction details

### Master Data - Kategori Obat (Medicine Category)
- GET `/api/kategori` - List categories
- GET `/api/kategori/active` - Active categories (for dropdown)
- POST `/api/kategori` - Create category
- GET `/api/kategori/{id}` - Category details
- PUT `/api/kategori/{id}` - Update category
- DELETE `/api/kategori/{id}` - Delete category
- POST `/api/kategori/{id}/toggle-status` - Activate/deactivate

### Master Data - Jenis Obat (Medicine Form)
- GET `/api/jenis` - List forms (tablet, syrup, injection, etc.)
- GET `/api/jenis/active` - Active forms (for dropdown)
- POST `/api/jenis` - Create form
- GET `/api/jenis/{id}` - Form details
- PUT `/api/jenis/{id}` - Update form
- DELETE `/api/jenis/{id}` - Delete form
- POST `/api/jenis/{id}/toggle-status` - Activate/deactivate

### Master Data - Satuan Obat (Unit of Measure)
- GET `/api/satuan` - List units
- GET `/api/satuan/active` - Active units (for dropdown)
- POST `/api/satuan` - Create unit
- GET `/api/satuan/{id}` - Unit details
- PUT `/api/satuan/{id}` - Update unit
- DELETE `/api/satuan/{id}` - Delete unit
- POST `/api/satuan/{id}/toggle-status` - Activate/deactivate

### Master Data - Unit Rumah Sakit (Hospital Department)
- GET `/api/unit` - List departments
- GET `/api/unit/active` - Active departments (for dropdown)
- POST `/api/unit` - Create department
- GET `/api/unit/{id}` - Department details
- GET `/api/unit/{id}/statistics` - Department request stats
- PUT `/api/unit/{id}` - Update department
- DELETE `/api/unit/{id}` - Delete department
- POST `/api/unit/{id}/toggle-status` - Activate/deactivate

### Supplier Management
- GET `/api/supplier` - List suppliers
- GET `/api/supplier/active` - Active suppliers (for dropdown)
- POST `/api/supplier` - Create supplier
- GET `/api/supplier/{id}` - Supplier details
- GET `/api/supplier/{id}/statistics` - Purchase history stats
- PUT `/api/supplier/{id}` - Update supplier
- DELETE `/api/supplier/{id}` - Delete supplier
- POST `/api/supplier/{id}/toggle-status` - Activate/deactivate

### User Management (Admin Only)
- GET `/api/users` - List users
- POST `/api/users` - Create user
- GET `/api/users/{id}` - User details
- PUT `/api/users/{id}` - Update user
- DELETE `/api/users/{id}` - Delete user
- POST `/api/users/{id}/toggle-active` - Activate/deactivate user

### Activity Logs (Admin Only)
- GET `/api/log-aktivitas` - List activity logs
- GET `/api/log-aktivitas/{id}` - Log details
- GET `/api/log-aktivitas/user/{user_id}` - Logs by specific user

### Reports (Manager & Admin)
- GET `/api/reports/stock` - Stock report
- GET `/api/reports/transactions` - Transaction report
- GET `/api/reports/expiry` - Expiry report
- GET `/api/reports/unit-requests` - Unit request report
- GET `/api/reports/export/{type}` - Export to PDF/Excel (requires additional packages)


## 🎯 Next Steps

1. ✅ Backend API complete
2. ⏳ Install QR package: `composer require simplesoftwareio/simple-qrcode`
3. ⏳ Install real-time: `npm install laravel-echo pusher-js`
4. ⏳ Create React frontend components
5. ⏳ Setup Laravel Echo for WebSocket
6. ⏳ Build dashboard with visualizations
7. ⏳ Create QR scanner page
8. ⏳ Implement role-based middleware
