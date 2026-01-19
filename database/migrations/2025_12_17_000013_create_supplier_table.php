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
        Schema::create('supplier', function (Blueprint $table) {
            $table->id();
            $table->string('kode_supplier', 50)->unique();
            $table->string('nama_supplier', 200);
            $table->text('alamat')->nullable();
            $table->string('no_telepon', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('kontak_person', 100)->nullable();
            $table->string('no_hp_kontak', 20)->nullable();
            $table->string('npwp', 30)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Add supplier_id to batch_obat
        Schema::table('batch_obat', function (Blueprint $table) {
            $table->foreignId('supplier_id')->nullable()->after('obat_id')->constrained('supplier')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batch_obat', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropColumn('supplier_id');
        });
        
        Schema::dropIfExists('supplier');
    }
};
