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
        Schema::create('pemusnahan_obat', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_berita_acara', 50)->unique();
            $table->date('tanggal_pemusnahan');
            $table->foreignId('penanggung_jawab')->constrained('users')->onDelete('restrict');
            $table->string('lokasi_pemusnahan', 200)->nullable();
            $table->text('metode_pemusnahan')->nullable()->comment('Cara pemusnahan sesuai regulasi');
            $table->json('saksi')->nullable()->comment('Daftar saksi pemusnahan');
            $table->enum('alasan', ['expired', 'rusak', 'recall', 'lainnya'])->default('expired');
            $table->text('keterangan')->nullable();
            $table->string('file_berita_acara')->nullable()->comment('Upload dokumen BA');
            $table->enum('status', ['draft', 'completed', 'approved'])->default('draft');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('restrict');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('tanggal_pemusnahan');
        });

        Schema::create('pemusnahan_obat_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pemusnahan_id')->constrained('pemusnahan_obat')->onDelete('cascade');
            $table->foreignId('batch_id')->constrained('batch_obat')->onDelete('restrict');
            $table->integer('jumlah');
            $table->decimal('nilai_perolehan', 15, 2)->comment('Nilai pembelian yang dimusnahkan');
            $table->text('kondisi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemusnahan_obat_detail');
        Schema::dropIfExists('pemusnahan_obat');
    }
};
