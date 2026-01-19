import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Users, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pengguna', href: '/users' },
];

export default function UsersIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengguna" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola pengguna sistem apotek
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/users/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Pengguna
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-1 items-center justify-center rounded-xl border border-sidebar-border/70 bg-card">
                    <div className="text-center">
                        <Users className="mx-auto mb-4 size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Halaman Manajemen Pengguna
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
