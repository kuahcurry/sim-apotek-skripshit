<?php

namespace App\Events;

use App\Models\Transaksi;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TransaksiCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Transaksi $transaksi;

    /**
     * Create a new event instance.
     */
    public function __construct(Transaksi $transaksi)
    {
        $this->transaksi = $transaksi;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('pharmacy'),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $this->transaksi->load(['obat', 'batch', 'user', 'unit']);

        return [
            'id' => $this->transaksi->id,
            'kode_transaksi' => $this->transaksi->kode_transaksi,
            'jenis' => $this->transaksi->jenis_transaksi,
            'jumlah' => $this->transaksi->jumlah,
            'total_harga' => $this->transaksi->total_harga,
            'obat' => [
                'id' => $this->transaksi->obat->id,
                'nama' => $this->transaksi->obat->nama_obat,
                'stok_total' => $this->transaksi->obat->stok_total,
            ],
            'batch' => $this->transaksi->batch ? [
                'id' => $this->transaksi->batch->id,
                'nomor' => $this->transaksi->batch->nomor_batch,
            ] : null,
            'user' => [
                'id' => $this->transaksi->user->id,
                'name' => $this->transaksi->user->name,
            ],
            'unit' => $this->transaksi->unit ? [
                'id' => $this->transaksi->unit->id,
                'nama' => $this->transaksi->unit->nama_unit,
            ] : null,
            'timestamp' => now()->toIso8601String(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'transaksi.created';
    }
}
