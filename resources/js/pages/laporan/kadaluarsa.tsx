import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar, Download } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan', href: '/reports/expiry' },
    { title: 'Laporan Kadaluarsa', href: '/reports/expiry' },
];

export default function ReportExpiry() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Kadaluarsa" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Laporan Kadaluarsa</h1>
                        <p className="text-sm text-muted-foreground">
                            Laporan obat yang akan dan sudah kadaluarsa
                        </p>
                    </div>
                    <Button>
                        <Download className="mr-2 size-4" />
                        Export Excel
                    </Button>
                </div>
                <div className="flex flex-1 items-center justify-center rounded-xl border border-sidebar-border/70 bg-card">
                    <div className="text-center">
                        <Calendar className="mx-auto mb-4 size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Halaman Laporan Kadaluarsa
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
