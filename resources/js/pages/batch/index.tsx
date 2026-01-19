import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Package, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Batch Obat', href: '/batch' },
];

export default function BatchIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Batch Obat" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Batch Obat</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola batch dan nomor lot obat
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/batch/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Batch
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-1 items-center justify-center rounded-xl border border-sidebar-border/70 bg-card">
                    <div className="text-center">
                        <Package className="mx-auto mb-4 size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Halaman Batch Obat
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
