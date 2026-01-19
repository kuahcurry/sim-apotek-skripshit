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
        Schema::create('resep', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_resep', 50)->unique();
            $table->string('nomor_rm', 50)->comment('Nomor Rekam Medis pasien');
            $table->string('nama_pasien', 200);
            $table->string('nama_dokter', 200);
            $table->foreignId('unit_id')->nullable()->constrained('unit_rumah_sakit')->onDelete('restrict');
            $table->date('tanggal_resep');
            $table->enum('jenis_pasien', ['rawat_jalan', 'rawat_inap', 'igd'])->default('rawat_jalan');
            $table->enum('cara_bayar', ['umum', 'bpjs', 'asuransi'])->default('umum');
            $table->enum('status', ['pending', 'processed', 'completed', 'cancelled'])->default('pending');
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('restrict');
            $table->timestamp('processed_at')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['nomor_rm', 'tanggal_resep']);
            $table->index('status');
        });

        Schema::create('resep_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resep_id')->constrained('resep')->onDelete('cascade');
            $table->foreignId('obat_id')->constrained('obat')->onDelete('restrict');
            $table->integer('jumlah');
            $table->string('dosis', 100)->nullable();
            $table->string('aturan_pakai', 200)->nullable();
            $table->text('catatan')->nullable();
            $table->boolean('is_dispensed')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resep_detail');
        Schema::dropIfExists('resep');
    }
};
