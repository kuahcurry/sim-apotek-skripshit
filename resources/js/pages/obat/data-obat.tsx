import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Package, Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Data Obat',
        href: '/obat',
    },
];

interface Obat {
    id: number;
    kode_obat: string;
    nama_obat: string;
    stok_total: number;
    stok_minimum: number;
    kategori: { nama_kategori: string };
    jenis: { nama_jenis: string };
    satuan: { nama_satuan: string };
}

interface ObatIndexProps {
    obats: {
        data: Obat[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function ObatIndex({ obats, filters }: ObatIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/obat', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Obat" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Data Obat</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola data obat dan stok
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/obat/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Obat
                        </Link>
                    </Button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari obat..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-sidebar-border bg-card py-2 pl-10 pr-4 text-sm"
                        />
                    </div>
                    <Button type="submit">Cari</Button>
                </form>

                {/* Table */}
                <div className="rounded-xl border border-sidebar-border/70 bg-card dark:border-sidebar-border">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-sidebar-border/70">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold">
                                        Kode
                                    </th>
                                    <th className="p-4 text-left text-sm font-semibold">
                                        Nama Obat
                                    </th>
                                    <th className="p-4 text-left text-sm font-semibold">
                                        Kategori
                                    </th>
                                    <th className="p-4 text-left text-sm font-semibold">
                                        Jenis
                                    </th>
                                    <th className="p-4 text-left text-sm font-semibold">
                                        Stok
                                    </th>
                                    <th className="p-4 text-left text-sm font-semibold">
                                        Min. Stok
                                    </th>
                                    <th className="p-4 text-right text-sm font-semibold">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {obats.data.length > 0 ? (
                                    obats.data.map((obat) => (
                                        <tr
                                            key={obat.id}
                                            className="border-b border-sidebar-border/50 last:border-0"
                                        >
                                            <td className="p-4 text-sm">
                                                {obat.kode_obat}
                                            </td>
                                            <td className="p-4 text-sm font-medium">
                                                {obat.nama_obat}
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {obat.kategori.nama_kategori}
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {obat.jenis.nama_jenis}
                                            </td>
                                            <td className="p-4 text-sm">
                                                <span
                                                    className={
                                                        obat.stok_total <=
                                                        obat.stok_minimum
                                                            ? 'font-semibold text-red-600'
                                                            : ''
                                                    }
                                                >
                                                    {obat.stok_total}{' '}
                                                    {obat.satuan.nama_satuan}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {obat.stok_minimum}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        asChild
                                                    >
                                                        <Link href={`/obat/${obat.id}/edit`}>
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            if (confirm('Apakah Anda yakin ingin menghapus obat ini?')) {
                                                                router.delete(`/obat/${obat.id}`);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="size-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="p-8 text-center text-sm text-muted-foreground"
                                        >
                                            <Package className="mx-auto mb-2 size-8" />
                                            Tidak ada data obat
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {obats.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-sidebar-border/70 p-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {obats.data.length} of {obats.total}{' '}
                                results
                            </p>
                            <div className="flex gap-2">
                                {Array.from(
                                    { length: obats.last_page },
                                    (_, i) => i + 1
                                ).map((page) => (
                                    <Button
                                        key={page}
                                        size="sm"
                                        variant={
                                            page === obats.current_page
                                                ? 'default'
                                                : 'outline'
                                        }
                                        onClick={() =>
                                            router.get(`/obat?page=${page}`)
                                        }
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
