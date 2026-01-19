import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Truck, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Supplier', href: '/supplier' },
];

export default function SupplierIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supplier" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Supplier</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola data supplier obat
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/supplier/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Supplier
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-1 items-center justify-center rounded-xl border border-sidebar-border/70 bg-card">
                    <div className="text-center">
                        <Truck className="mx-auto mb-4 size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Halaman Supplier
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
