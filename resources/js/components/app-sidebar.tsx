import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    BookOpen, 
    Folder, 
    LayoutGrid,
    Pill,
    Package,
    TrendingUp,
    TrendingDown,
    Clipboard,
    ClipboardCheck,
    Trash2,
    QrCode,
    FileText,
    Users,
    Building2,
    Truck,
    Tags,
    Box,
    MessageCircleQuestion
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Obat',
        href: '#',
        icon: Pill,
        items: [
            {
                title: 'Data Obat',
                href: '/obat',
            },
            {
                title: 'Batch Obat',
                href: '/batch',
            },
            {
                title: 'Resep',
                href: '/resep',
            },
            {
                title: 'Pemusnahan',
                href: '/pemusnahan',
            },
            {
                title: 'QR Code',
                href: '/qr',
            },
        ],
    },
    {
        title: 'Transaksi',
        href: '/transaksi',
        icon: TrendingUp,
        items: [
            {
                title: 'Semua Transaksi',
                href: '/transaksi',
            },
            {
                title: 'Barang Masuk',
                href: '/transaksi/masuk',
            },
            {
                title: 'Barang Keluar',
                href: '/transaksi/keluar',
            },
        ],
    },
    {
        title: 'Permintaan Unit',
        href: '/permintaan',
        icon: Clipboard,
    },
    {
        title: 'Stok Opname',
        href: '/stok-opname',
        icon: ClipboardCheck,
    },
    {
        title: 'Master Data',
        href: '#',
        icon: Box,
        items: [
            {
                title: 'Kategori Obat',
                href: '/kategori-obat',
            },
            {
                title: 'Jenis Obat',
                href: '/jenis-obat',
            },
            {
                title: 'Satuan Obat',
                href: '/satuan-obat',
            },
            {
                title: 'Unit Rumah Sakit',
                href: '/unit-rumah-sakit',
            },
            {
                title: 'Supplier',
                href: '/supplier',
            },
        ],
    },
    {
        title: 'Laporan',
        href: '/reports',
        icon: FileText,
        items: [
            {
                title: 'Laporan Stok',
                href: '/reports/stock',
            },
            {
                title: 'Laporan Transaksi',
                href: '/reports/transactions',
            },
            {
                title: 'Laporan Kadaluarsa',
                href: '/reports/expiry',
            },
        ],
    }
];

const footerNavItems: NavItem[] = [
    {
        title: 'FAQ',
        href: '/faq',
        icon: MessageCircleQuestion,
    },
    {
        title: 'Dokumentasi',
        href: '/dokumentasi',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
