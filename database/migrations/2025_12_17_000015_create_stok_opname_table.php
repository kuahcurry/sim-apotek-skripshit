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
        Schema::create('stok_opname', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_opname', 50)->unique();
            $table->date('tanggal_opname');
            $table->foreignId('penanggung_jawab')->constrained('users')->onDelete('restrict')->comment('Apoteker PJ');
            $table->foreignId('unit_id')->nullable()->constrained('unit_rumah_sakit')->onDelete('restrict');
            $table->enum('status', ['draft', 'in_progress', 'completed', 'approved'])->default('draft');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('restrict');
            $table->timestamp('approved_at')->nullable();
            $table->text('catatan')->nullable();
            $table->text('berita_acara')->nullable()->comment('Berita acara selisih stok');
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('tanggal_opname');
        });

        Schema::create('stok_opname_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stok_opname_id')->constrained('stok_opname')->onDelete('cascade');
            $table->foreignId('batch_id')->constrained('batch_obat')->onDelete('restrict');
            $table->integer('stok_sistem')->comment('Stok di sistem sebelum opname');
            $table->integer('stok_fisik')->comment('Stok hasil penghitungan fisik');
            $table->integer('selisih')->comment('Selisih = stok_fisik - stok_sistem');
            $table->text('keterangan_selisih')->nullable();
            $table->timestamps();

            $table->index('batch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stok_opname_detail');
        Schema::dropIfExists('stok_opname');
    }
};
