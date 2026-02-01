import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { TrendingUp, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transaksi', href: '/transaksi' },
    { title: 'Semua Transaksi', href: '/transaksi' },
];

export default function SemuaTransaksi() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Semua Transaksi" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Semua Transaksi</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola semua transaksi barang masuk dan keluar
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/transaksi/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Transaksi
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-1 items-center justify-center rounded-xl border border-sidebar-border/70 bg-card">
                    <div className="text-center">
                        <TrendingUp className="mx-auto mb-4 size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Halaman Semua Transaksi
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
