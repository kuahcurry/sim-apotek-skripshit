import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ClipboardCheck, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Stok Opname', href: '/stok-opname' },
];

export default function StokOpnameIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stok Opname" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Stok Opname</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola stock taking dan penghitungan stok
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/stok-opname/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Stok Opname
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-1 items-center justify-center rounded-xl border border-sidebar-border/70 bg-card">
                    <div className="text-center">
                        <ClipboardCheck className="mx-auto mb-4 size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Halaman Stok Opname
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
