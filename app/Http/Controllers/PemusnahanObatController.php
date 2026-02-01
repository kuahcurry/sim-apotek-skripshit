<?php

namespace App\Http\Controllers;

use App\Models\PemusnahanObat;
use App\Models\BatchObat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PemusnahanObatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $pemusnahan = PemusnahanObat::with(['penanggungJawab', 'approvedBy', 'details'])
            ->latest()
            ->paginate(20);

        return Inertia::render('obat/pemusnahan/index', [
            'pemusnahan' => $pemusnahan,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get expired or empty batches
        $batches = BatchObat::with(['obat.satuan'])
            ->whereIn('status', ['expired', 'active'])
            ->where('stok_tersedia', '>', 0)
            ->get();

        $users = User::orderBy('name')->get();

        return Inertia::render('obat/pemusnahan/create', [
            'batches' => $batches,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal_pemusnahan' => 'required|date',
            'penanggung_jawab' => 'required|exists:users,id',
            'lokasi_pemusnahan' => 'nullable|string|max:200',
            'metode_pemusnahan' => 'nullable|string',
            'saksi' => 'nullable|array',
            'alasan' => 'required|in:expired,rusak,recall,lainnya',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:draft,completed',
            'details' => 'required|array|min:1',
            'details.*.batch_id' => 'required|exists:batch_obat,id',
            'details.*.jumlah' => 'required|integer|min:1',
            'details.*.nilai_perolehan' => 'required|numeric|min:0',
            'details.*.kondisi' => 'nullable|string',
        ]);

        // Validate stock availability
        foreach ($validated['details'] as $detail) {
            $batch = BatchObat::find($detail['batch_id']);
            if ($batch->stok_tersedia < $detail['jumlah']) {
                return back()->withErrors([
                    'details' => "Stok batch {$batch->nomor_batch} tidak mencukupi. Tersedia: {$batch->stok_tersedia}"
                ]);
            }
        }

        $pemusnahan = PemusnahanObat::create($validated);

        // Create details
        foreach ($validated['details'] as $detail) {
            $pemusnahan->details()->create($detail);
        }

        return redirect()->route('pemusnahan.index')
            ->with('success', 'Data pemusnahan berhasil dibuat');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $pemusnahan = PemusnahanObat::with([
            'penanggungJawab',
            'approvedBy',
            'details.batch.obat.satuan'
        ])->findOrFail($id);

        return Inertia::render('obat/pemusnahan/show', [
            'pemusnahan' => $pemusnahan,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $pemusnahan = PemusnahanObat::with(['details'])->findOrFail($id);

        // Only allow editing draft
        if ($pemusnahan->status !== 'draft') {
            return redirect()->route('pemusnahan.show', $id)
                ->with('error', 'Hanya pemusnahan dengan status draft yang dapat diedit');
        }

        $batches = BatchObat::with(['obat.satuan'])
            ->whereIn('status', ['expired', 'active'])
            ->where('stok_tersedia', '>', 0)
            ->get();

        $users = User::orderBy('name')->get();

        return Inertia::render('obat/pemusnahan/edit', [
            'pemusnahan' => $pemusnahan,
            'batches' => $batches,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $pemusnahan = PemusnahanObat::findOrFail($id);

        // Only allow updating draft
        if ($pemusnahan->status !== 'draft') {
            return redirect()->route('pemusnahan.show', $id)
                ->with('error', 'Hanya pemusnahan dengan status draft yang dapat diupdate');
        }

        $validated = $request->validate([
            'tanggal_pemusnahan' => 'required|date',
            'penanggung_jawab' => 'required|exists:users,id',
            'lokasi_pemusnahan' => 'nullable|string|max:200',
            'metode_pemusnahan' => 'nullable|string',
            'saksi' => 'nullable|array',
            'alasan' => 'required|in:expired,rusak,recall,lainnya',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:draft,completed',
            'details' => 'required|array|min:1',
            'details.*.batch_id' => 'required|exists:batch_obat,id',
            'details.*.jumlah' => 'required|integer|min:1',
            'details.*.nilai_perolehan' => 'required|numeric|min:0',
            'details.*.kondisi' => 'nullable|string',
        ]);

        // Validate stock availability
        foreach ($validated['details'] as $detail) {
            $batch = BatchObat::find($detail['batch_id']);
            if ($batch->stok_tersedia < $detail['jumlah']) {
                return back()->withErrors([
                    'details' => "Stok batch {$batch->nomor_batch} tidak mencukupi. Tersedia: {$batch->stok_tersedia}"
                ]);
            }
        }

        $pemusnahan->update($validated);

        // Delete old details and create new ones
        $pemusnahan->details()->delete();
        foreach ($validated['details'] as $detail) {
            $pemusnahan->details()->create($detail);
        }

        return redirect()->route('pemusnahan.index')
            ->with('success', 'Data pemusnahan berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $pemusnahan = PemusnahanObat::findOrFail($id);

        // Only allow deleting draft
        if ($pemusnahan->status !== 'draft') {
            return redirect()->route('pemusnahan.index')
                ->with('error', 'Hanya pemusnahan dengan status draft yang dapat dihapus');
        }

        $pemusnahan->delete();

        return redirect()->route('pemusnahan.index')
            ->with('success', 'Data pemusnahan berhasil dihapus');
    }

    /**
     * Approve destruction
     */
    public function approve(string $id)
    {
        $pemusnahan = PemusnahanObat::findOrFail($id);

        if ($pemusnahan->status !== 'completed') {
            return redirect()->route('pemusnahan.show', $id)
                ->with('error', 'Hanya pemusnahan dengan status completed yang dapat disetujui');
        }

        $pemusnahan->approve(Auth::user());

        return redirect()->route('pemusnahan.show', $id)
            ->with('success', 'Pemusnahan berhasil disetujui dan stok telah diupdate');
    }
}
