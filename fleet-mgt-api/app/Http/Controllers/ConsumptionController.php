<?php

namespace App\Http\Controllers;

use App\Models\Consumption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class ConsumptionController extends Controller
{
    public function index(Request $request)
    {
        if (! Gate::allows('manager-action') && ! Gate::allows('accountant-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $query = Consumption::with(['vehicle', 'driver']);

        if ($request->has('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        if ($request->has('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }

        if ($request->has('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        if ($request->filled('search')) {
            $s = $request->get('search');
            $query->where(function ($q) use ($s) {
                $q->whereHas('vehicle', fn ($v) => $v->where('license_plate', 'like', "%{$s}%")
                    ->orWhere('marque', 'like', "%{$s}%"))
                    ->orWhereHas('driver', fn ($d) => $d->where('name', 'like', "%{$s}%"));
            });
        }

        $allowed = ['date', 'fuel_volume', 'fuel_cost', 'mileage'];
        $sortBy = in_array($request->get('sort_by'), $allowed) ? $request->get('sort_by') : 'date';
        $sortDir = $request->get('sort_dir') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($request->per_page ?? 15);
    }

    public function store(Request $request)
    {
        $allowed = Gate::allows('manager-action') || Gate::allows('driver-action');

        if (! $allowed) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $data = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'fuel_volume' => 'required|numeric|min:0.01',
            'fuel_cost' => 'required|numeric|min:0.01',
            'mileage' => 'nullable|integer|min:0',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($request->hasFile('document')) {
            $data['document_path'] = $request->file('document')
                ->store('documents/consumptions', 'public');
        }
        unset($data['document']);

        $consumption = Consumption::create($data);

        return response()->json($consumption->load(['vehicle', 'driver']), 201);
    }

    public function show(Consumption $consumption)
    {
        $canView = Gate::allows('manager-action') ||
                   Gate::allows('accountant-action') ||
                   $consumption->driver_id === auth()->id();

        if (! $canView) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $c = $consumption->load(['vehicle', 'driver']);
        $c->document_url = $c->document_path
            ? Storage::disk('public')->url($c->document_path)
            : null;

        return $c;
    }

    public function update(Request $request, Consumption $consumption)
    {
        if (! Gate::allows('manager-action') && ! Gate::allows('accountant-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $data = $request->validate([
            'vehicle_id' => 'sometimes|exists:vehicles,id',
            'driver_id' => 'sometimes|exists:users,id',
            'date' => 'sometimes|date',
            'fuel_volume' => 'sometimes|numeric|min:0.01',
            'fuel_cost' => 'sometimes|numeric|min:0.01',
            'mileage' => 'nullable|integer|min:0',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($request->hasFile('document')) {
            if ($consumption->document_path) {
                Storage::disk('public')->delete($consumption->document_path);
            }
            $data['document_path'] = $request->file('document')
                ->store('documents/consumptions', 'public');
        }
        unset($data['document']);

        $consumption->update($data);

        return response()->json($consumption->load(['vehicle', 'driver']));
    }

    public function destroy(Consumption $consumption)
    {
        if (! Gate::allows('manager-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        if ($consumption->document_path) {
            Storage::disk('public')->delete($consumption->document_path);
        }

        $consumption->delete();

        return response()->json(null, 204);
    }

    public function vehicleReport($vehicleId)
    {
        if (! Gate::allows('manager-action') && ! Gate::allows('accountant-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        return Consumption::where('vehicle_id', $vehicleId)
            ->selectRaw('SUM(fuel_volume) as total_volume, SUM(fuel_cost) as total_cost,
                     CASE WHEN SUM(fuel_volume) > 0 THEN SUM(fuel_cost)/SUM(fuel_volume) ELSE 0 END as avg_cost_per_liter')
            ->first();
    }
}
