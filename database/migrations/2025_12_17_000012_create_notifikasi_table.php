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
        Schema::create('notifikasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade')->comment('Null = broadcast ke semua');
            $table->string('judul', 255);
            $table->text('pesan');
            $table->enum('tipe', ['info', 'warning', 'danger', 'success'])->default('info');
            $table->enum('kategori', ['stok_rendah', 'expired_soon', 'expired', 'permintaan_baru', 'sistem', 'lainnya'])->default('lainnya');
            $table->morphs('notifiable'); // notifiable_type dan notifiable_id untuk polymorphic
            $table->string('link')->nullable()->comment('Link untuk aksi');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->boolean('is_email_sent')->default(false);
            $table->timestamp('email_sent_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_read']);
            $table->index('kategori');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifikasi');
    }
};
