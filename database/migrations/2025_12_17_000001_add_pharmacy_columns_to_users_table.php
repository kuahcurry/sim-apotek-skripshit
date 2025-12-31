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
        Schema::table('users', function (Blueprint $table) {
            $table->string('nomor_str')->nullable()->after('name')->comment('Surat Tanda Registrasi - only for pharmacist');
            $table->string('no_hp', 20)->nullable()->after('email');
            $table->text('alamat')->nullable()->after('no_hp');
            $table->enum('role', ['admin', 'pharmacist', 'manager'])->default('pharmacist')->after('alamat');
            $table->boolean('is_active')->default(true)->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nomor_str', 'no_hp', 'alamat', 'role', 'is_active']);
        });
    }
};
