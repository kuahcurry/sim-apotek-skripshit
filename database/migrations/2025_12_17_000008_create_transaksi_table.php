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
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id();
            $table->string('kode_transaksi', 50)->unique();
            $table->foreignId('obat_id')->constrained('obat')->onDelete('restrict');
            $table->foreignId('batch_id')->nullable()->constrained('batch_obat')->onDelete('restrict');
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict')->comment('User yang melakukan transaksi');
            $table->foreignId('unit_id')->nullable()->constrained('unit_rumah_sakit')->onDelete('restrict')->comment('Unit tujuan jika keluar');
            $table->enum('jenis_transaksi', ['masuk', 'keluar', 'penjualan'])->comment('masuk: restocking, keluar: dispensing ke unit, penjualan: penjualan langsung');
            $table->integer('jumlah');
            $table->decimal('harga_satuan', 15, 2)->default(0);
            $table->decimal('total_harga', 15, 2)->default(0);
            $table->date('tanggal_transaksi');
            $table->time('waktu_transaksi');
            $table->text('keterangan')->nullable();
            $table->string('nomor_referensi')->nullable()->comment('Nomor faktur/referensi eksternal');
            $table->timestamps();
            $table->softDeletes();

            $table->index('jenis_transaksi');
            $table->index('tanggal_transaksi');
            $table->index(['obat_id', 'tanggal_transaksi']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi');
    }
};
