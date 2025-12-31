<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('obat', function (Blueprint $table) {
            $table->id();
            $table->string('kode_obat', 50)->unique()->comment('Kode unik obat');
            $table->string('nama_obat', 200);
            $table->string('nama_generik', 200)->nullable();
            $table->string('nama_brand', 200)->nullable();
            $table->foreignId('kategori_id')->constrained('kategori_obat')->onDelete('restrict');
            $table->foreignId('jenis_id')->constrained('jenis_obat')->onDelete('restrict');
            $table->foreignId('satuan_id')->constrained('satuan_obat')->onDelete('restrict');
            $table->integer('stok_total')->default(0)->comment('Total stok dari semua batch');
            $table->integer('stok_minimum')->default(10)->comment('Threshold untuk alert stok rendah');
            $table->decimal('harga_beli', 15, 2)->default(0)->comment('Harga beli per satuan');
            $table->decimal('harga_jual', 15, 2)->default(0)->comment('Harga jual per satuan');
            $table->string('lokasi_penyimpanan', 100)->nullable()->comment('Rak/lokasi di apotek');
            $table->text('deskripsi')->nullable();
            $table->text('efek_samping')->nullable();
            $table->text('indikasi')->nullable();
            $table->text('kontraindikasi')->nullable();
            $table->string('gambar')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['nama_obat', 'nama_generik']);
            $table->index('stok_total');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('obat');
    }
};
