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
        Schema::create('batch_obat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('obat_id')->constrained('obat')->onDelete('cascade');
            $table->string('nomor_batch', 100);
            $table->date('tanggal_produksi')->nullable();
            $table->date('tanggal_expired');
            $table->date('tanggal_masuk')->comment('Tanggal batch masuk ke apotek');
            $table->integer('stok_awal')->default(0);
            $table->integer('stok_tersedia')->default(0)->comment('Stok yang masih tersedia');
            $table->decimal('harga_beli', 15, 2)->default(0);
            $table->string('kode_qr')->unique()->nullable()->comment('QR Code untuk batch ini');
            $table->text('qr_data')->nullable()->comment('JSON data untuk QR Code');
            $table->enum('status', ['active', 'expired', 'empty', 'recalled'])->default('active');
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['obat_id', 'nomor_batch']);
            $table->index('tanggal_expired');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_obat');
    }
};
