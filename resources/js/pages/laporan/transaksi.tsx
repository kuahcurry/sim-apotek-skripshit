import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Package, TrendingUp, TrendingDown, DollarSign, Filter, Download, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface Transaksi {
  id: number;
  kode_transaksi: string;
  obat: {
    nama_obat: string;
    kode_obat: string;
  };
  batch: {
    nomor_batch: string;
  };
  user: {
    name: string;
  };
  jenis_transaksi: 'masuk' | 'keluar' | 'penjualan';
  jumlah: number;
  harga_satuan: number;
  total_harga: number;
  tanggal_transaksi: string;
  waktu_transaksi: string;
  keterangan?: string;
}

interface Stats {
  total_transaksi: number;
  total_masuk: number;
  total_keluar: number;
  total_value: number;
}

interface Filters {
  search?: string;
  jenis?: string;
  tanggal_dari?: string;
  tanggal_sampai?: string;
}

interface PaginatedData {
  data: Transaksi[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface Props {
  transaksi: PaginatedData;
  stats: Stats;
  filters: Filters;
}

export default function LaporanTransaksi({ transaksi, stats, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [jenis, setJenis] = useState(filters.jenis || '');
  const [tanggalDari, setTanggalDari] = useState(filters.tanggal_dari || '');
  const [tanggalSampai, setTanggalSampai] = useState(filters.tanggal_sampai || '');

  const handleFilter = () => {
    router.get(
      '/reports/transactions',
      {
        search: search || undefined,
        jenis: jenis || undefined,
        tanggal_dari: tanggalDari || undefined,
        tanggal_sampai: tanggalSampai || undefined,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const handleReset = () => {
    setSearch('');
    setJenis('');
    setTanggalDari('');
    setTanggalSampai('');
    router.get('/reports/transactions');
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (jenis) params.append('jenis', jenis);
    if (tanggalDari) params.append('tanggal_dari', tanggalDari);
    if (tanggalSampai) params.append('tanggal_sampai', tanggalSampai);
    
    window.location.href = `/reports/transactions/export?${params.toString()}`;
  };

  const getJenisBadge = (jenis: string) => {
    switch (jenis) {
      case 'masuk':
        return <Badge className="bg-green-100 text-green-800">Masuk</Badge>;
      case 'keluar':
        return <Badge className="bg-red-100 text-red-800">Keluar</Badge>;
      case 'penjualan':
        return <Badge className="bg-blue-100 text-blue-800">Penjualan</Badge>;
      default:
        return <Badge>{jenis}</Badge>;
    }
  };

  return (
    <AppLayout>
      <Head title="Laporan Transaksi" />
      
      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Transaksi</h2>
          <p className="text-muted-foreground">
            Monitor dan analisis semua transaksi obat
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transaksi</p>
                <p className="text-2xl font-bold">{stats.total_transaksi}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaksi Masuk</p>
                <p className="text-2xl font-bold text-green-600">{stats.total_masuk}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaksi Keluar</p>
                <p className="text-2xl font-bold text-red-600">{stats.total_keluar}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Nilai</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.total_value)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Filter</h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari kode/obat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={jenis || undefined} onValueChange={setJenis}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masuk">Masuk</SelectItem>
                <SelectItem value="keluar">Keluar</SelectItem>
                <SelectItem value="penjualan">Penjualan</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Dari Tanggal"
              value={tanggalDari}
              onChange={(e) => setTanggalDari(e.target.value)}
            />

            <Input
              type="date"
              placeholder="Sampai Tanggal"
              value={tanggalSampai}
              onChange={(e) => setTanggalSampai(e.target.value)}
            />

            <div className="flex gap-2">
              <Button onClick={handleFilter} className="flex-1">
                Terapkan
              </Button>
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Kode Transaksi</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Obat</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Total Harga</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaksi.data.length > 0 ? (
                transaksi.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {new Date(item.tanggal_transaksi).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>{item.waktu_transaksi}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.kode_transaksi}
                    </TableCell>
                    <TableCell>{getJenisBadge(item.jenis_transaksi)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.obat.nama_obat}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.obat.kode_obat}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.batch.nomor_batch}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.jumlah}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.harga_satuan)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.total_harga)}
                    </TableCell>
                    <TableCell>{item.user.name}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    Tidak ada data transaksi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {transaksi.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {transaksi.from} - {transaksi.to} dari {transaksi.total} transaksi
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.get(`/reports/transactions?page=${transaksi.current_page - 1}`)}
                disabled={transaksi.current_page === 1}
              >
                Sebelumnya
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: transaksi.last_page }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === transaksi.current_page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => router.get(`/reports/transactions?page=${page}`)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => router.get(`/reports/transactions?page=${transaksi.current_page + 1}`)}
                disabled={transaksi.current_page === transaksi.last_page}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
