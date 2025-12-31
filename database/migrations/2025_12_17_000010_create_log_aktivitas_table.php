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
        Schema::create('log_aktivitas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('aktivitas', 255);
            $table->string('modul', 50)->nullable()->comment('Modul yang diakses: obat, transaksi, user, dll');
            $table->string('aksi', 50)->nullable()->comment('create, update, delete, view, login, logout');
            $table->morphs('loggable'); // loggable_type dan loggable_id untuk polymorphic
            $table->json('data_lama')->nullable()->comment('Data sebelum perubahan');
            $table->json('data_baru')->nullable()->comment('Data setelah perubahan');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('waktu')->useCurrent();
            $table->timestamps();

            $table->index(['user_id', 'waktu']);
            $table->index('modul');
            $table->index('aksi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_aktivitas');
    }
};
