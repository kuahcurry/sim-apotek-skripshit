import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Calendar, AlertTriangle, Package, Clock, Filter, Download, Search } from 'lucide-react';
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

interface BatchObat {
  id: number;
  nomor_batch: string;
  obat: {
    nama_obat: string;
    kode_obat: string;
    kategori: {
      nama_kategori: string;
    };
  };
  tanggal_expired: string;
  stok_tersedia: number;
  harga_beli: number;
  status: string;
  days_until_expiry: number;
}

interface Stats {
  expired: number;
  expiring_this_month: number;
  expiring_next_month: number;
  total_batches: number;
  total_value_at_risk: number;
}

interface Kategori {
  id: number;
  nama_kategori: string;
}

interface Filters {
  search?: string;
  kategori_id?: string;
  months_ahead?: string;
  status?: string;
}

interface PaginatedData {
  data: BatchObat[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface Props {
  batches: PaginatedData;
  stats: Stats;
  kategori: Kategori[];
  filters: Filters;
}

export default function LaporanKadaluarsa({ batches, stats, kategori, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [kategoriId, setKategoriId] = useState(filters.kategori_id || '');
  const [monthsAhead, setMonthsAhead] = useState(filters.months_ahead || '3');
  const [status, setStatus] = useState(filters.status || '');

  const handleFilter = () => {
    router.get(
      '/reports/expiry',
      {
        search: search || undefined,
        kategori_id: kategoriId || undefined,
        months_ahead: monthsAhead || undefined,
        status: status || undefined,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  const handleReset = () => {
    setSearch('');
    setKategoriId('');
    setMonthsAhead('3');
    setStatus('');
    router.get('/reports/expiry');
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (kategoriId) params.append('kategori_id', kategoriId);
    if (monthsAhead) params.append('months_ahead', monthsAhead);
    if (status) params.append('status', status);
    
    window.location.href = `/reports/expiry/export?${params.toString()}`;
  };

  const getExpiryBadge = (daysUntilExpiry: number) => {
    if (daysUntilExpiry < 0) {
      return <Badge className="bg-red-600 text-white">Kadaluarsa</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge className="bg-red-100 text-red-800">≤ 30 Hari</Badge>;
    } else if (daysUntilExpiry <= 90) {
      return <Badge className="bg-yellow-100 text-yellow-800">≤ 90 Hari</Badge>;
    } else if (daysUntilExpiry <= 180) {
      return <Badge className="bg-orange-100 text-orange-800">≤ 180 Hari</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">&gt; 180 Hari</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AppLayout>
      <Head title="Laporan Kadaluarsa" />
      
      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Kadaluarsa</h2>
          <p className="text-muted-foreground">
            Monitor obat yang akan dan sudah kadaluarsa
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sudah Kadaluarsa</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bulan Ini</p>
                <p className="text-2xl font-bold text-orange-600">{stats.expiring_this_month}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bulan Depan</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.expiring_next_month}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Batch</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total_batches}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nilai Berisiko</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(stats.total_value_at_risk)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-purple-500" />
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
                placeholder="Cari batch/obat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={kategoriId || undefined} onValueChange={setKategoriId}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                {kategori.map((kat) => (
                  <SelectItem key={kat.id} value={kat.id.toString()}>
                    {kat.nama_kategori}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={monthsAhead} onValueChange={setMonthsAhead}>
              <SelectTrigger>
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Bulan</SelectItem>
                <SelectItem value="3">3 Bulan</SelectItem>
                <SelectItem value="6">6 Bulan</SelectItem>
                <SelectItem value="12">12 Bulan</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status || undefined} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expired">Sudah Kadaluarsa</SelectItem>
                <SelectItem value="expiring_soon">Akan Kadaluarsa</SelectItem>
              </SelectContent>
            </Select>

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
                <TableHead>Nomor Batch</TableHead>
                <TableHead>Obat</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tanggal Kadaluarsa</TableHead>
                <TableHead className="text-right">Sisa Hari</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="text-right">Harga Beli</TableHead>
                <TableHead className="text-right">Total Nilai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.data.length > 0 ? (
                batches.data.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-mono text-sm">
                      {batch.nomor_batch}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{batch.obat.nama_obat}</p>
                        <p className="text-xs text-muted-foreground">
                          {batch.obat.kode_obat}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{batch.obat.kategori.nama_kategori}</TableCell>
                    <TableCell>
                      <span className={batch.days_until_expiry < 0 ? 'text-red-600 font-semibold' : ''}>
                        {formatDate(batch.tanggal_expired)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={batch.days_until_expiry < 0 ? 'text-red-600 font-bold' : 'font-medium'}>
                        {batch.days_until_expiry < 0 
                          ? `${Math.abs(batch.days_until_expiry)} hari lalu`
                          : `${batch.days_until_expiry} hari`
                        }
                      </span>
                    </TableCell>
                    <TableCell>{getExpiryBadge(batch.days_until_expiry)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {batch.stok_tersedia}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(batch.harga_beli)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(batch.stok_tersedia * batch.harga_beli)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    Tidak ada data batch kadaluarsa
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {batches.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {batches.from} - {batches.to} dari {batches.total} batch
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.get(`/reports/expiry?page=${batches.current_page - 1}`)}
                disabled={batches.current_page === 1}
              >
                Sebelumnya
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: batches.last_page }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === batches.current_page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => router.get(`/reports/expiry?page=${page}`)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => router.get(`/reports/expiry?page=${batches.current_page + 1}`)}
                disabled={batches.current_page === batches.last_page}
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
