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
        // Add resep_id to transaksi for prescription-based validation
        Schema::table('transaksi', function (Blueprint $table) {
            $table->foreignId('resep_id')->nullable()->after('unit_id')->constrained('resep')->onDelete('restrict');
        });

        // Add kode formularium and BPJS mapping
        Schema::table('obat', function (Blueprint $table) {
            $table->string('kode_formularium', 50)->nullable()->after('kode_obat')->comment('Kode formularium RS');
            $table->string('kode_bpjs', 50)->nullable()->after('kode_formularium')->comment('Kode untuk klaim BPJS');
        });

        // Add offline sync support
        Schema::create('sync_queue', function (Blueprint $table) {
            $table->id();
            $table->string('model_type', 100)->comment('Nama model yang di-sync');
            $table->unsignedBigInteger('model_id')->comment('ID record');
            $table->enum('action', ['create', 'update', 'delete'])->comment('Jenis aksi');
            $table->json('data')->comment('Data untuk sync');
            $table->enum('status', ['pending', 'synced', 'failed'])->default('pending');
            $table->integer('retry_count')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('model_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sync_queue');
        
        Schema::table('obat', function (Blueprint $table) {
            $table->dropColumn(['kode_formularium', 'kode_bpjs']);
        });

        Schema::table('transaksi', function (Blueprint $table) {
            $table->dropForeign(['resep_id']);
            $table->dropColumn('resep_id');
        });
    }
};
