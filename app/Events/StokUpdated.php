<?php

namespace App\Events;

use App\Models\Obat;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StokUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Obat $obat;
    public string $action;
    public int $oldStok;
    public int $newStok;

    /**
     * Create a new event instance.
     */
    public function __construct(Obat $obat, string $action, int $oldStok, int $newStok)
    {
        $this->obat = $obat;
        $this->action = $action;
        $this->oldStok = $oldStok;
        $this->newStok = $newStok;
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
        return [
            'obat_id' => $this->obat->id,
            'kode_obat' => $this->obat->kode_obat,
            'nama_obat' => $this->obat->nama_obat,
            'action' => $this->action,
            'old_stok' => $this->oldStok,
            'new_stok' => $this->newStok,
            'stok_minimum' => $this->obat->stok_minimum,
            'is_low_stock' => $this->newStok <= $this->obat->stok_minimum,
            'timestamp' => now()->toIso8601String(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'stok.updated';
    }
}
