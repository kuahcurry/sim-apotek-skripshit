<?php

namespace App\Events;

use App\Models\PermintaanUnit;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PermintaanCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public PermintaanUnit $permintaan;

    /**
     * Create a new event instance.
     */
    public function __construct(PermintaanUnit $permintaan)
    {
        $this->permintaan = $permintaan;
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
        $this->permintaan->load(['obat', 'unit']);

        return [
            'id' => $this->permintaan->id,
            'kode_permintaan' => $this->permintaan->kode_permintaan,
            'status' => $this->permintaan->status,
            'prioritas' => $this->permintaan->prioritas,
            'jumlah_diminta' => $this->permintaan->jumlah_diminta,
            'obat' => [
                'id' => $this->permintaan->obat->id,
                'nama' => $this->permintaan->obat->nama_obat,
            ],
            'unit' => [
                'id' => $this->permintaan->unit->id,
                'nama' => $this->permintaan->unit->nama_unit,
            ],
            'is_urgent' => $this->permintaan->isUrgent(),
            'timestamp' => now()->toIso8601String(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'permintaan.created';
    }
}
