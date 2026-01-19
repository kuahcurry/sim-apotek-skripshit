import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Trash2, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pemusnahan Obat', href: '/pemusnahan' },
];

export default function PemusnahanIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pemusnahan Obat" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Pemusnahan Obat</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola pemusnahan obat kadaluarsa
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/pemusnahan/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Pemusnahan
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-1 items-center justify-center rounded-xl border border-sidebar-border/70 bg-card">
                    <div className="text-center">
                        <Trash2 className="mx-auto mb-4 size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Halaman Pemusnahan Obat
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
