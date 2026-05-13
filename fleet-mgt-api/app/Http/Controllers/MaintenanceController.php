<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        if (! Gate::allows('manager-action') && ! Gate::allows('mechanic-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $query = Maintenance::with(['vehicle', 'driver']);

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('maintenance_type', $request->type);
        }

        $query->orderBy('scheduled_date', 'asc');

        return $query->paginate($request->per_page ?? 15);
    }

    public function store(Request $request)
    {
        if (! Gate::allows('manager-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $data = $request->validate([
            'vehicle_id'          => 'required|exists:vehicles,id',
            'driver_id'           => 'nullable|exists:users,id',
            'maintenance_type'    => 'required|in:vidange,pneus,freins,batterie,révision,carrosserie,électricité,climatisation,autre',
            'maintenance_company' => 'required|string|max:100',
            'scheduled_date'      => 'required|date',
            'cost'                => 'required|numeric|min:0',
            'description'         => 'nullable|string',
            'mileage_at_service'  => 'nullable|integer|min:0',
            'document'            => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($request->hasFile('document')) {
            $data['document_path'] = $request->file('document')
                ->store('documents/maintenances', 'public');
        }
        unset($data['document']);

        $maintenance = Maintenance::create($data);

        return response()->json($maintenance->load(['vehicle', 'driver']), 201);
    }

    public function show(Maintenance $maintenance)
    {
        $canView = Gate::allows('manager-action') ||
                   Gate::allows('mechanic-action') ||
                   ($maintenance->driver_id && $maintenance->driver_id === auth()->id());

        if (! $canView) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $m = $maintenance->load(['vehicle', 'driver']);
        $m->document_url = $m->document_path
            ? Storage::disk('public')->url($m->document_path)
            : null;

        return $m;
    }

    public function update(Request $request, Maintenance $maintenance)
    {
        if (! Gate::allows('manager-action') && ! Gate::allows('mechanic-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $data = $request->validate([
            'vehicle_id'          => 'sometimes|exists:vehicles,id',
            'driver_id'           => 'nullable|exists:users,id',
            'maintenance_type'    => 'sometimes|in:vidange,pneus,freins,batterie,révision,carrosserie,électricité,climatisation,autre',
            'maintenance_company' => 'sometimes|string|max:100',
            'scheduled_date'      => 'sometimes|date',
            'completed_date'      => 'nullable|date',
            'cost'                => 'sometimes|numeric|min:0',
            'description'         => 'nullable|string',
            'status'              => 'sometimes|in:planned,in_progress,completed,cancelled',
            'mileage_at_service'  => 'nullable|integer|min:0',
            'document'            => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($request->hasFile('document')) {
            if ($maintenance->document_path) {
                Storage::disk('public')->delete($maintenance->document_path);
            }
            $data['document_path'] = $request->file('document')
                ->store('documents/maintenances', 'public');
        }
        unset($data['document']);

        $maintenance->update($data);

        return response()->json($maintenance->load(['vehicle', 'driver']));
    }

    public function destroy(Maintenance $maintenance)
    {
        if (! Gate::allows('manager-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        if ($maintenance->document_path) {
            Storage::disk('public')->delete($maintenance->document_path);
        }

        $maintenance->delete();

        return response()->json(null, 204);
    }

    public function markAsCompleted(Maintenance $maintenance)
    {
        if (! Gate::allows('manager-action') && ! Gate::allows('mechanic-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $maintenance->markAsCompleted();

        return response()->json([
            'message'     => 'Maintenance marquée comme complétée',
            'maintenance' => $maintenance,
        ]);
    }
}
