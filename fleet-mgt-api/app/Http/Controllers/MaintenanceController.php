<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        // Autorisation: admins, managers, mécaniciens
        /*if (!Gate::allows('admin-action') &&
            !Gate::allows('manager-action') &&
            !Gate::allows('mechanic-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }  */

        $query = Maintenance::with(['vehicle', 'driver']);

        // Filtres
        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('maintenance_type', $request->type);
        }

        // Tri par défaut
        $query->orderBy('scheduled_date', 'asc');

        return $query->paginate($request->per_page ?? 15);
    }

    public function store(Request $request)
    {
        // Autorisation: admins, managers
        /*if (!Gate::allows('admin-action') && !Gate::allows('manager-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }*/

        $data = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id' => 'nullable|exists:users,id',
            'maintenance_type' => 'required|in:vidange,pneus,freins,batterie,révision,carrosserie,électricité,climatisation,autre',
            'maintenance_company' => 'required|string|max:100',
            'scheduled_date' => 'required|date',
            'cost' => 'required|numeric|min:0',
            'description' => 'nullable|string'
        ]);

        $maintenance = Maintenance::create($data);

        return response()->json($maintenance, 201);
    }

    public function show(Maintenance $maintenance)
    {
        // Autorisation: admins, managers, mécaniciens, conducteur concerné
      /*  $canView = Gate::allows('admin-action') ||
                   Gate::allows('manager-action') ||
                   Gate::allows('mechanic-action') ||
                   ($maintenance->driver_id && $maintenance->driver_id === auth()->id());

        if (!$canView) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }*/

        return $maintenance->load(['vehicle', 'driver']);
    }

    public function update(Request $request, Maintenance $maintenance)
    {
        // Autorisation: admins, managers, mécaniciens
       /* $allowed = Gate::allows('admin-action') ||
                   Gate::allows('manager-action') ||
                   Gate::allows('mechanic-action');

        if (!$allowed) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        } */

        $data = $request->validate([
            'vehicle_id' => 'sometimes|exists:vehicles,id',
            'driver_id' => 'nullable|exists:users,id',
            'maintenance_type' => 'sometimes|in:vidange,pneus,freins,batterie,révision,carrosserie,électricité,climatisation,autre',
            'maintenance_company' => 'sometimes|string|max:100',
            'scheduled_date' => 'sometimes|date',
            'completed_date' => 'nullable|date',
            'cost' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:planned,in_progress,completed,cancelled'
        ]);

        $maintenance->update($data);

        return response()->json($maintenance);
    }

    public function destroy(Maintenance $maintenance)
    {
        // Autorisation: admins et managers seulement
       /* if (!Gate::allows('admin-action') && !Gate::allows('manager-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        } */

        $maintenance->delete();

        return response()->json(null, 204);
    }

    // Marquer une maintenance comme complétée
    public function markAsCompleted(Maintenance $maintenance)
    {
        // Autorisation: mécaniciens, managers, admins
        /*$allowed = Gate::allows('admin-action') ||
                   Gate::allows('manager-action') ||
                   Gate::allows('mechanic-action');

        if (!$allowed) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }*/

        $maintenance->markAsCompleted();

        return response()->json([
            'message' => 'Maintenance marquée comme complétée',
            'maintenance' => $maintenance
        ]);
    }
}
