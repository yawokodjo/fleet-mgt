<?php

namespace App\Http\Controllers;

use App\Models\Consumption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class ConsumptionController extends Controller
{
    public function index(Request $request)
    {
        // Autorisation: admins, managers, comptables
        /*if (!Gate::allows('admin-action') &&
            !Gate::allows('manager-action') &&
            !Gate::allows('accountant-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        } */

        $query = Consumption::with(['vehicle', 'driver']);

        // Filtre par véhicule
        if ($request->has('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        // Filtre par conducteur
        if ($request->has('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }

        // Filtre par date
        if ($request->has('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        return $query->paginate($request->per_page ?? 15);
    }

    public function store(Request $request)
    {
        // Autorisation: admins, managers, conducteurs
       /* $allowed = Gate::allows('admin-action') ||
                   Gate::allows('manager-action') ||
                   Gate::allows('driver-action');

        if (!$allowed) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }*/

        $data = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'fuel_volume' => 'required|numeric|min:0.01',
            'fuel_cost' => 'required|numeric|min:0.01'
        ]);

        $consumption = Consumption::create($data);

        return response()->json($consumption, 201);
    }

    public function show(Consumption $consumption)
    {
        // Autorisation: admins, managers, comptables, ou conducteur concerné
        /*$canView = Gate::allows('admin-action') ||
                   Gate::allows('manager-action') ||
                   Gate::allows('accountant-action') ||
                   $consumption->driver_id === auth()->id();

        if (!$canView) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }*/

        return $consumption->load(['vehicle', 'driver']);
    }

    public function update(Request $request, Consumption $consumption)
    {
        // Autorisation: admins, managers, comptables
        /*$allowed = Gate::allows('admin-action') ||
                   Gate::allows('manager-action') ||
                   Gate::allows('accountant-action');

        if (!$allowed) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }*/

        $data = $request->validate([
            'vehicle_id' => 'sometimes|exists:vehicles,id',
            'driver_id' => 'sometimes|exists:users,id',
            'date' => 'sometimes|date',
            'fuel_volume' => 'sometimes|numeric|min:0.01',
            'fuel_cost' => 'sometimes|numeric|min:0.01'
        ]);

        $consumption->update($data);

        return response()->json($consumption);
    }

    public function destroy(Consumption $consumption)
    {
        // Autorisation: admins et managers seulement
        /* if (!Gate::allows('admin-action') && !Gate::allows('manager-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }*/

        $consumption->delete();

        return response()->json(null, 204);
    }

    // Rapport de consommation pour un véhicule
    public function vehicleReport($vehicleId)
    {
       /* if (!Gate::allows('admin-action') &&
            !Gate::allows('manager-action') &&
            !Gate::allows('accountant-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        } */

        return Consumption::where('vehicle_id', $vehicleId)
        ->selectRaw('SUM(fuel_volume) as total_volume, SUM(fuel_cost) as total_cost,
                     CASE WHEN SUM(fuel_volume) > 0 THEN SUM(fuel_cost)/SUM(fuel_volume) ELSE 0 END as avg_cost_per_liter')
        ->first();

    }
}
