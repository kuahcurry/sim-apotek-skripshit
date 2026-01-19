import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Building2, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Unit Rumah Sakit', href: '/unit-rumah-sakit' },
];

export default function UnitRumahSakitIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unit Rumah Sakit" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Unit Rumah Sakit</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola unit dan departemen rumah sakit
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/unit-rumah-sakit/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Unit
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-1 items-center justify-center rounded-xl border border-sidebar-border/70 bg-card">
                    <div className="text-center">
                        <Building2 className="mx-auto mb-4 size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Halaman Unit Rumah Sakit
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
