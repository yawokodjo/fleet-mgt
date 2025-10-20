<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class VehicleController extends Controller
{
    public function index()
    {
       /* if (!Gate::allows('admin-action') && !Gate::allows('manager-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        } */
        $vehicles = Vehicle::with('currentDriver')->paginate(10);

        return response()->json($vehicles);
    }

    public function store(Request $request)
    {
       /* if (!Gate::allows('admin-action') && !Gate::allows('manager-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        } */

        $data = $request->validate([
            'marque' => 'required|string|max:50',
            'model' => 'required|string|max:50',
            'license_plate' => 'required|string|unique:vehicles|max:20',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'fuel_type' => ['required', Rule::in(['essence', 'diesel', 'hybride', 'électrique', 'gpl', 'autre'])],
            'fuel_card' => 'nullable|string|max:50',
            'mileage' => 'required|integer|min:0',
            'status' => ['required', Rule::in(['operational', 'maintenance', 'out_of_service'])],
            'current_driver_id' => 'nullable|exists:users,id'
        ]);

        $vehicle = Vehicle::create($data);

        return response()->json($vehicle, 201);
    }

    // Méthode show() standard pour apiResource
   public function show(Vehicle $vehicle): \Illuminate\Http\JsonResponse
   {
    // Retourne le véhicule en JSON
    return response()->json($vehicle);
  }

    public function update(Request $request, Vehicle $vehicle)
    {
        /*if (!Gate::allows('admin-action') && !Gate::allows('manager-action')) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }*/

        $data = $request->validate([
            'marque' => 'sometimes|string|max:50',
            'model' => 'sometimes|string|max:50',
            'license_plate' => 'sometimes|string|unique:vehicles,license_plate,' . $vehicle->id . '|max:20',
            'year' => 'sometimes|integer|min:1900|max:' . (date('Y') + 1),
            'fuel_type' => ['sometimes', Rule::in(['essence', 'diesel', 'hybride', 'électrique', 'gpl', 'autre'])],
            'fuel_card' => 'nullable|string|max:50',
            'mileage' => 'sometimes|integer|min:0',
            'status' => ['sometimes', Rule::in(['operational', 'maintenance', 'out_of_service'])],
            'current_driver_id' => 'nullable|exists:users,id'
        ]);

        $vehicle->update($data);

        return response()->json($vehicle);
    }

   public function destroy(Vehicle $vehicle)
{
    // Optionnel : contrôle d'accès
    // if (!Gate::allows('admin-action')) {
    //     return response()->json(['message' => 'Accès non autorisé'], 403);
    // }

    $vehicle->delete();

    // Renvoie un message pour le frontend
    return response()->json([
        'message' => 'Véhicule supprimé avec succès'
    ], 200);
}


    // Dans VehicleController.php

public function assignDriver(Request $request, Vehicle $vehicle)
{
    if (!Gate::allows('admin-action') && !Gate::allows('manager-action')) {
        return response()->json(['message' => 'Accès non autorisé'], 403);
    }

    $data = $request->validate([
        'driver_id' => 'required|exists:users,id'
    ]);

    $vehicle->update(['current_driver_id' => $data['driver_id']]);

    return response()->json($vehicle);
}

public function updateMileage(Request $request, Vehicle $vehicle)
{
    $canUpdate = Gate::allows('admin-action') ||
                 Gate::allows('manager-action') ||
                 $vehicle->current_driver_id === auth()->id();

    if (!$canUpdate) {
        return response()->json(['message' => 'Accès non autorisé'], 403);
    }

    $data = $request->validate([
        'mileage' => 'required|integer|min:' . $vehicle->mileage
    ]);

    $vehicle->update(['mileage' => $data['mileage']]);

    return response()->json($vehicle);
}

// Liste vehicules pour consommation
public function list()
{
    return response()->json(\App\Models\Vehicle::select('id', 'license_plate')->get());
}


}
