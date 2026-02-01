import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { QrCode } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'QR Code', href: '/qr' },
];

export default function QrIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="QR Code" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">QR Code</h1>
                        <p className="text-sm text-muted-foreground">
                            Generate dan scan QR code untuk batch obat
                        </p>
                    </div>
                </div>
                <div className="flex flex-1 items-center justify-center rounded-xl border border-sidebar-border/70 bg-card">
                    <div className="text-center">
                        <QrCode className="mx-auto mb-4 size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Halaman QR Code Scanner
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
