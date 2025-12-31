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
        Schema::create('qr_scan_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->nullable()->constrained('batch_obat')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('kode_qr_scanned', 255);
            $table->enum('metode_scan', ['camera', 'scanner'])->default('camera');
            $table->enum('hasil_scan', ['success', 'not_found', 'expired', 'error'])->default('success');
            $table->text('pesan_error')->nullable();
            $table->json('data_hasil')->nullable()->comment('JSON data hasil scan');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('waktu_scan')->useCurrent();
            $table->timestamps();

            $table->index('hasil_scan');
            $table->index('waktu_scan');
            $table->index(['batch_id', 'waktu_scan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qr_scan_log');
    }
};
