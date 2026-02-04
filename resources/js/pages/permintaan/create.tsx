import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Obat {
    id: number;
    nama_obat: string;
    kode_obat: string;
    satuan?: {
        nama_satuan: string;
    };
    kategori?: {
        nama_kategori: string;
    };
}

interface Unit {
    id: number;
    nama_unit: string;
    kode_unit: string;
}

interface Props {
    obat: Obat[];
    units: Unit[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Permintaan Unit', href: '/permintaan' },
    { title: 'Buat Permintaan', href: '/permintaan/create' },
];

export default function PermintaanCreate({ obat, units }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        unit_id: '',
        obat_id: '',
        jumlah_diminta: '',
        prioritas: 'normal',
        catatan: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/permintaan');
    };

    const selectedObat = obat.find(o => o.id.toString() === data.obat_id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Permintaan Unit" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/permintaan">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Buat Permintaan Unit</h1>
                        <p className="text-sm text-muted-foreground">
                            Buat permintaan obat baru dari unit rumah sakit
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="rounded-lg border bg-card">
                        <div className="p-6 space-y-6">
                            {/* Unit Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="unit_id">
                                    Unit Rumah Sakit <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.unit_id}
                                    onValueChange={(value) => setData('unit_id', value)}
                                >
                                    <SelectTrigger className={errors.unit_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Pilih unit rumah sakit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                <div>
                                                    <p className="font-medium">{unit.nama_unit}</p>
                                                    <p className="text-xs text-muted-foreground">{unit.kode_unit}</p>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit_id && (
                                    <p className="text-sm text-destructive">{errors.unit_id}</p>
                                )}
                            </div>

                            {/* Obat Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="obat_id">
                                    Obat <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.obat_id}
                                    onValueChange={(value) => setData('obat_id', value)}
                                >
                                    <SelectTrigger className={errors.obat_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Pilih obat yang diminta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {obat.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                <div>
                                                    <p className="font-medium">{item.nama_obat}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.kode_obat} • {item.kategori?.nama_kategori || 'Tanpa Kategori'} • {item.satuan?.nama_satuan || 'unit'}
                                                    </p>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.obat_id && (
                                    <p className="text-sm text-destructive">{errors.obat_id}</p>
                                )}
                                {selectedObat && (
                                    <div className="rounded-lg bg-muted p-4 mt-2">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Kode Obat</p>
                                                <p className="font-medium">{selectedObat.kode_obat}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Kategori</p>
                                                <p className="font-medium">{selectedObat.kategori?.nama_kategori || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Satuan</p>
                                                <p className="font-medium">{selectedObat.satuan?.nama_satuan || 'unit'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Jumlah Diminta */}
                                <div className="space-y-2">
                                    <Label htmlFor="jumlah_diminta">
                                        Jumlah Diminta <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="jumlah_diminta"
                                        type="number"
                                        min="1"
                                        value={data.jumlah_diminta}
                                        onChange={(e) => setData('jumlah_diminta', e.target.value)}
                                        placeholder="Masukkan jumlah yang diminta"
                                        className={errors.jumlah_diminta ? 'border-destructive' : ''}
                                    />
                                    {errors.jumlah_diminta && (
                                        <p className="text-sm text-destructive">{errors.jumlah_diminta}</p>
                                    )}
                                    {selectedObat && (
                                        <p className="text-xs text-muted-foreground">
                                            Satuan: {selectedObat.satuan?.nama_satuan || 'unit'}
                                        </p>
                                    )}
                                </div>

                                {/* Prioritas */}
                                <div className="space-y-2">
                                    <Label htmlFor="prioritas">
                                        Prioritas <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.prioritas}
                                        onValueChange={(value) => setData('prioritas', value)}
                                    >
                                        <SelectTrigger className={errors.prioritas ? 'border-destructive' : ''}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-2 rounded-full bg-gray-500" />
                                                    <span>Normal</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="urgent">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-2 rounded-full bg-orange-500" />
                                                    <span>Urgent</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="emergency">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-2 rounded-full bg-red-500" />
                                                    <span>Emergency</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.prioritas && (
                                        <p className="text-sm text-destructive">{errors.prioritas}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Tentukan tingkat urgensi permintaan
                                    </p>
                                </div>
                            </div>

                            {/* Catatan */}
                            <div className="space-y-2">
                                <Label htmlFor="catatan">Catatan</Label>
                                <Textarea
                                    id="catatan"
                                    value={data.catatan}
                                    onChange={(e) => setData('catatan', e.target.value)}
                                    placeholder="Tambahkan catatan atau keterangan tambahan..."
                                    rows={4}
                                    className={errors.catatan ? 'border-destructive' : ''}
                                />
                                {errors.catatan && (
                                    <p className="text-sm text-destructive">{errors.catatan}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Opsional: Informasi tambahan terkait permintaan ini
                                </p>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-4 border-t px-6 py-4 bg-muted/50">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/permintaan">Batal</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 size-4" />
                                {processing ? 'Menyimpan...' : 'Simpan Permintaan'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
