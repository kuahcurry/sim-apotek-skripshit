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
        Schema::create('permintaan_unit', function (Blueprint $table) {
            $table->id();
            $table->string('kode_permintaan', 50)->unique();
            $table->foreignId('unit_id')->constrained('unit_rumah_sakit')->onDelete('restrict');
            $table->foreignId('obat_id')->constrained('obat')->onDelete('restrict');
            $table->integer('jumlah_diminta');
            $table->integer('jumlah_disetujui')->nullable()->comment('Jumlah yang diberikan');
            $table->date('tanggal_permintaan');
            $table->enum('status', ['pending', 'processed', 'completed', 'cancelled'])->default('pending');
            $table->enum('prioritas', ['normal', 'urgent', 'emergency'])->default('normal');
            $table->text('catatan')->nullable();
            $table->text('catatan_farmasi')->nullable()->comment('Catatan dari farmasi');
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('restrict');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('tanggal_permintaan');
            $table->index(['unit_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permintaan_unit');
    }
};
