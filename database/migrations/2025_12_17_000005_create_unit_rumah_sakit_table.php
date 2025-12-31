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
        Schema::create('unit_rumah_sakit', function (Blueprint $table) {
            $table->id();
            $table->string('nama_unit', 100)->comment('ICU, IGD, Rawat Inap, Poli Umum, dll');
            $table->string('kode_unit', 20)->unique();
            $table->string('penanggung_jawab', 100)->nullable();
            $table->string('no_telepon', 20)->nullable();
            $table->text('lokasi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_rumah_sakit');
    }
};
