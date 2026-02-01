import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Database, Tags, Box, Scale, Truck, Plus, Pencil, Trash2 } from 'lucide-react';
import { useState, FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Master Data Obat', href: '/masterdata' },
];

interface KategoriObat {
    id: number;
    nama_kategori: string;
    deskripsi?: string;
    is_active: boolean;
    created_at: string;
}

interface JenisObat {
    id: number;
    nama_jenis: string;
    deskripsi?: string;
    is_active: boolean;
    created_at: string;
}

interface SatuanObat {
    id: number;
    nama_satuan: string;
    singkatan: string;
    is_active: boolean;
    created_at: string;
}

interface Supplier {
    id: number;
    kode_supplier: string;
    nama_supplier: string;
    alamat?: string;
    no_telepon?: string;
    email?: string;
    kontak_person?: string;
    status: string;
    created_at: string;
}

interface Props {
    kategori: KategoriObat[];
    jenis: JenisObat[];
    satuan: SatuanObat[];
    supplier: Supplier[];
}

export default function MasterDataObat({ kategori, jenis, satuan, supplier }: Props) {
    const [openKategori, setOpenKategori] = useState(false);
    const [openJenis, setOpenJenis] = useState(false);
    const [openSatuan, setOpenSatuan] = useState(false);
    const [openSupplier, setOpenSupplier] = useState(false);

    const kategoriForm = useForm({
        nama_kategori: '',
        deskripsi: '',
        is_active: true,
    });

    const jenisForm = useForm({
        nama_jenis: '',
        deskripsi: '',
        is_active: true,
    });

    const satuanForm = useForm({
        nama_satuan: '',
        singkatan: '',
        is_active: true,
    });

    const supplierForm = useForm({
        kode_supplier: '',
        nama_supplier: '',
        alamat: '',
        no_telepon: '',
        email: '',
        kontak_person: '',
        no_hp_kontak: '',
        npwp: '',
        status: 'active' as 'active' | 'inactive',
        catatan: '',
    });

    const handleKategoriSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        kategoriForm.post('/kategori-obat', {
            onSuccess: () => {
                kategoriForm.reset();
                setOpenKategori(false);
            },
        });
    };

    const handleJenisSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        jenisForm.post('/jenis-obat', {
            onSuccess: () => {
                jenisForm.reset();
                setOpenJenis(false);
            },
        });
    };

    const handleSatuanSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        satuanForm.post('/satuan-obat', {
            onSuccess: () => {
                satuanForm.reset();
                setOpenSatuan(false);
            },
        });
    };

    const handleSupplierSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        supplierForm.post('/supplier', {
            onSuccess: () => {
                supplierForm.reset();
                setOpenSupplier(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Data Obat" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Master Data Obat</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola data master kategori, jenis, satuan obat, dan supplier
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="kategori" className="flex-1 flex flex-col">
                    <TabsList className="grid w-full max-w-2xl grid-cols-4">
                        <TabsTrigger value="kategori">
                            <Tags className="mr-2 size-4" />
                            Kategori
                        </TabsTrigger>
                        <TabsTrigger value="jenis">
                            <Box className="mr-2 size-4" />
                            Jenis
                        </TabsTrigger>
                        <TabsTrigger value="satuan">
                            <Scale className="mr-2 size-4" />
                            Satuan
                        </TabsTrigger>
                        <TabsTrigger value="supplier">
                            <Truck className="mr-2 size-4" />
                            Supplier
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="kategori" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Kategori Obat</h2>
                                <p className="text-sm text-muted-foreground">
                                    Kelola kategori obat
                                </p>
                            </div>
                            <Dialog open={openKategori} onOpenChange={setOpenKategori}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 size-4" />
                                        Tambah Kategori
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleKategoriSubmit}>
                                        <DialogHeader>
                                            <DialogTitle>Tambah Kategori Obat</DialogTitle>
                                            <DialogDescription>
                                                Tambahkan kategori obat baru ke dalam sistem
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="nama_kategori">Nama Kategori *</Label>
                                                <Input
                                                    id="nama_kategori"
                                                    value={kategoriForm.data.nama_kategori}
                                                    onChange={(e) => kategoriForm.setData('nama_kategori', e.target.value)}
                                                    placeholder="Contoh: Antibiotik"
                                                    required
                                                />
                                                {kategoriForm.errors.nama_kategori && (
                                                    <p className="text-sm text-destructive">{kategoriForm.errors.nama_kategori}</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="deskripsi_kategori">Deskripsi</Label>
                                                <Textarea
                                                    id="deskripsi_kategori"
                                                    value={kategoriForm.data.deskripsi}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => kategoriForm.setData('deskripsi', e.target.value)}
                                                    placeholder="Deskripsi kategori (opsional)"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="is_active_kategori">Status</Label>
                                                <Select
                                                    value={kategoriForm.data.is_active ? 'true' : 'false'}
                                                    onValueChange={(value) => kategoriForm.setData('is_active', value === 'true')}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">Aktif</SelectItem>
                                                        <SelectItem value="false">Tidak Aktif</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setOpenKategori(false)}>
                                                Batal
                                            </Button>
                                            <Button type="submit" disabled={kategoriForm.processing}>
                                                {kategoriForm.processing ? 'Menyimpan...' : 'Simpan'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="rounded-xl border border-sidebar-border/70 bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Kategori</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {kategori.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                Belum ada data kategori obat
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        kategori.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.nama_kategori}</TableCell>
                                                <TableCell>{item.deskripsi || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                                        {item.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/kategori-obat/${item.id}/edit`}>
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="jenis" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Jenis Obat</h2>
                                <p className="text-sm text-muted-foreground">
                                    Kelola jenis obat
                                </p>
                            </div>
                            <Dialog open={openJenis} onOpenChange={setOpenJenis}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 size-4" />
                                        Tambah Jenis
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleJenisSubmit}>
                                        <DialogHeader>
                                            <DialogTitle>Tambah Jenis Obat</DialogTitle>
                                            <DialogDescription>
                                                Tambahkan jenis obat baru ke dalam sistem
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="nama_jenis">Nama Jenis *</Label>
                                                <Input
                                                    id="nama_jenis"
                                                    value={jenisForm.data.nama_jenis}
                                                    onChange={(e) => jenisForm.setData('nama_jenis', e.target.value)}
                                                    placeholder="Contoh: Generik"
                                                    required
                                                />
                                                {jenisForm.errors.nama_jenis && (
                                                    <p className="text-sm text-destructive">{jenisForm.errors.nama_jenis}</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="deskripsi_jenis">Deskripsi</Label>
                                                <Textarea
                                                    id="deskripsi_jenis"
                                                    value={jenisForm.data.deskripsi}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => jenisForm.setData('deskripsi', e.target.value)}
                                                    placeholder="Deskripsi jenis (opsional)"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="is_active_jenis">Status</Label>
                                                <Select
                                                    value={jenisForm.data.is_active ? 'true' : 'false'}
                                                    onValueChange={(value) => jenisForm.setData('is_active', value === 'true')}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">Aktif</SelectItem>
                                                        <SelectItem value="false">Tidak Aktif</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setOpenJenis(false)}>
                                                Batal
                                            </Button>
                                            <Button type="submit" disabled={jenisForm.processing}>
                                                {jenisForm.processing ? 'Menyimpan...' : 'Simpan'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="rounded-xl border border-sidebar-border/70 bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Jenis</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jenis.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                Belum ada data jenis obat
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        jenis.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.nama_jenis}</TableCell>
                                                <TableCell>{item.deskripsi || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                                        {item.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/jenis-obat/${item.id}/edit`}>
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="satuan" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Satuan Obat</h2>
                                <p className="text-sm text-muted-foreground">
                                    Kelola satuan obat (tablet, kapsul, botol, dll)
                                </p>
                            </div>
                            <Dialog open={openSatuan} onOpenChange={setOpenSatuan}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 size-4" />
                                        Tambah Satuan
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleSatuanSubmit}>
                                        <DialogHeader>
                                            <DialogTitle>Tambah Satuan Obat</DialogTitle>
                                            <DialogDescription>
                                                Tambahkan satuan obat baru ke dalam sistem
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="nama_satuan">Nama Satuan *</Label>
                                                <Input
                                                    id="nama_satuan"
                                                    value={satuanForm.data.nama_satuan}
                                                    onChange={(e) => satuanForm.setData('nama_satuan', e.target.value)}
                                                    placeholder="Contoh: Tablet"
                                                    required
                                                />
                                                {satuanForm.errors.nama_satuan && (
                                                    <p className="text-sm text-destructive">{satuanForm.errors.nama_satuan}</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="singkatan">Singkatan *</Label>
                                                <Input
                                                    id="singkatan"
                                                    value={satuanForm.data.singkatan}
                                                    onChange={(e) => satuanForm.setData('singkatan', e.target.value)}
                                                    placeholder="Contoh: tab"
                                                    required
                                                />
                                                {satuanForm.errors.singkatan && (
                                                    <p className="text-sm text-destructive">{satuanForm.errors.singkatan}</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="is_active_satuan">Status</Label>
                                                <Select
                                                    value={satuanForm.data.is_active ? 'true' : 'false'}
                                                    onValueChange={(value) => satuanForm.setData('is_active', value === 'true')}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="true">Aktif</SelectItem>
                                                        <SelectItem value="false">Tidak Aktif</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setOpenSatuan(false)}>
                                                Batal
                                            </Button>
                                            <Button type="submit" disabled={satuanForm.processing}>
                                                {satuanForm.processing ? 'Menyimpan...' : 'Simpan'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="rounded-xl border border-sidebar-border/70 bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Satuan</TableHead>
                                        <TableHead>Singkatan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {satuan.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                Belum ada data satuan obat
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        satuan.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.nama_satuan}</TableCell>
                                                <TableCell>{item.singkatan}</TableCell>
                                                <TableCell>
                                                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                                        {item.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/satuan-obat/${item.id}/edit`}>
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="supplier" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Supplier</h2>
                                <p className="text-sm text-muted-foreground">
                                    Kelola data supplier obat
                                </p>
                            </div>
                            <Dialog open={openSupplier} onOpenChange={setOpenSupplier}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 size-4" />
                                        Tambah Supplier
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <form onSubmit={handleSupplierSubmit}>
                                        <DialogHeader>
                                            <DialogTitle>Tambah Supplier</DialogTitle>
                                            <DialogDescription>
                                                Tambahkan supplier obat baru ke dalam sistem
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="kode_supplier">Kode Supplier *</Label>
                                                    <Input
                                                        id="kode_supplier"
                                                        value={supplierForm.data.kode_supplier}
                                                        onChange={(e) => supplierForm.setData('kode_supplier', e.target.value)}
                                                        placeholder="Contoh: SUP001"
                                                        required
                                                    />
                                                    {supplierForm.errors.kode_supplier && (
                                                        <p className="text-sm text-destructive">{supplierForm.errors.kode_supplier}</p>
                                                    )}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="nama_supplier">Nama Supplier *</Label>
                                                    <Input
                                                        id="nama_supplier"
                                                        value={supplierForm.data.nama_supplier}
                                                        onChange={(e) => supplierForm.setData('nama_supplier', e.target.value)}
                                                        placeholder="Nama perusahaan"
                                                        required
                                                    />
                                                    {supplierForm.errors.nama_supplier && (
                                                        <p className="text-sm text-destructive">{supplierForm.errors.nama_supplier}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="alamat">Alamat</Label>
                                                <Textarea
                                                    id="alamat"
                                                    value={supplierForm.data.alamat}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => supplierForm.setData('alamat', e.target.value)}
                                                    placeholder="Alamat lengkap supplier"
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="no_telepon">No. Telepon</Label>
                                                    <Input
                                                        id="no_telepon"
                                                        value={supplierForm.data.no_telepon}
                                                        onChange={(e) => supplierForm.setData('no_telepon', e.target.value)}
                                                        placeholder="021-1234567"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={supplierForm.data.email}
                                                        onChange={(e) => supplierForm.setData('email', e.target.value)}
                                                        placeholder="email@supplier.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="kontak_person">Kontak Person</Label>
                                                    <Input
                                                        id="kontak_person"
                                                        value={supplierForm.data.kontak_person}
                                                        onChange={(e) => supplierForm.setData('kontak_person', e.target.value)}
                                                        placeholder="Nama PIC"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="no_hp_kontak">No. HP Kontak</Label>
                                                    <Input
                                                        id="no_hp_kontak"
                                                        value={supplierForm.data.no_hp_kontak}
                                                        onChange={(e) => supplierForm.setData('no_hp_kontak', e.target.value)}
                                                        placeholder="08123456789"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="npwp">NPWP</Label>
                                                    <Input
                                                        id="npwp"
                                                        value={supplierForm.data.npwp}
                                                        onChange={(e) => supplierForm.setData('npwp', e.target.value)}
                                                        placeholder="00.000.000.0-000.000"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="status_supplier">Status</Label>
                                                    <Select
                                                        value={supplierForm.data.status}
                                                        onValueChange={(value: 'active' | 'inactive') => supplierForm.setData('status', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="active">Aktif</SelectItem>
                                                            <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="catatan">Catatan</Label>
                                                <Textarea
                                                    id="catatan"
                                                    value={supplierForm.data.catatan}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => supplierForm.setData('catatan', e.target.value)}
                                                    placeholder="Catatan tambahan (opsional)"
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setOpenSupplier(false)}>
                                                Batal
                                            </Button>
                                            <Button type="submit" disabled={supplierForm.processing}>
                                                {supplierForm.processing ? 'Menyimpan...' : 'Simpan'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="rounded-xl border border-sidebar-border/70 bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Nama Supplier</TableHead>
                                        <TableHead>Kontak</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {supplier.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                Belum ada data supplier
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        supplier.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.kode_supplier}</TableCell>
                                                <TableCell>{item.nama_supplier}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {item.no_telepon && <div>{item.no_telepon}</div>}
                                                        {item.email && <div className="text-muted-foreground">{item.email}</div>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                                        {item.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/supplier/${item.id}/edit`}>
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="size-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
