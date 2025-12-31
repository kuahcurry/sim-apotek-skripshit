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
        Schema::create('satuan_obat', function (Blueprint $table) {
            $table->id();
            $table->string('nama_satuan', 50)->comment('Tablet, Botol, Ampul, Tube, Box, Strip, Sachet, dll');
            $table->string('singkatan', 10)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('satuan_obat');
    }
};
