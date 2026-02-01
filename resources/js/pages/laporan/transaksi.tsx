import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { LineChart, Download } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan', href: '/reports/transactions' },
    { title: 'Laporan Transaksi', href: '/reports/transactions' },
];

export default function ReportTransactions() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Transaksi" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Laporan Transaksi</h1>
                        <p className="text-sm text-muted-foreground">
                            Laporan transaksi masuk dan keluar
                        </p>
                    </div>
                    <Button>
                        <Download className="mr-2 size-4" />
                        Export Excel
                    </Button>
                </div>
                <div className="flex flex-1 items-center justify-center rounded-xl border border-sidebar-border/70 bg-card">
                    <div className="text-center">
                        <LineChart className="mx-auto mb-4 size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Halaman Laporan Transaksi
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
