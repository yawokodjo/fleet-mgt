<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class VehicleController extends Controller
{
    /**
     * Liste tous les véhicules (avec pagination)
     * Route: GET /api/vehicles
     * Accessible par : admin, manager, accountant
     */
    public function index(Request $request)
    {
        if (! Gate::allows('manager-action') && ! Gate::allows('accountant-action')) {
            return response()->json([
                'message' => 'Accès non autorisé. Seuls les administrateurs, managers et comptables peuvent accéder à cette ressource.',
            ], 403);
        }

        $perPage = (int) $request->get('per_page', 10);

        $query = Vehicle::with('currentDriver');

        if ($request->filled('status')) {
            $statuses = explode(',', $request->get('status'));
            $query->whereIn('status', $statuses);
        }

        if ($request->filled('search')) {
            $s = $request->get('search');
            $query->where(function ($q) use ($s) {
                $q->where('marque', 'like', "%{$s}%")
                    ->orWhere('model', 'like', "%{$s}%")
                    ->orWhere('license_plate', 'like', "%{$s}%");
            });
        }

        if ($request->filled('year_from')) {
            $query->where('year', '>=', (int) $request->get('year_from'));
        }

        if ($request->filled('year_to')) {
            $query->where('year', '<=', (int) $request->get('year_to'));
        }

        $allowed = ['marque', 'model', 'license_plate', 'status', 'year', 'mileage'];
        $sortBy = in_array($request->get('sort_by'), $allowed) ? $request->get('sort_by') : 'license_plate';
        $sortDir = $request->get('sort_dir') === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortBy, $sortDir);

        $vehicles = $query->paginate($perPage);

        return response()->json($vehicles);
    }

    /**
     * Créer un nouveau véhicule
     * Route: POST /api/vehicles
     * Accessible par : admin, manager
     */
    public function store(Request $request)
    {
        if (! Gate::allows('manager-action')) {
            return response()->json([
                'message' => 'Accès non autorisé. Seuls les administrateurs et managers peuvent créer des véhicules.',
            ], 403);
        }

        $data = $request->validate([
            'marque' => 'required|string|max:50',
            'model' => 'required|string|max:50',
            'license_plate' => 'required|string|unique:vehicles|max:20',
            'year' => 'required|integer|min:1900|max:'.(date('Y') + 1),
            'fuel_type' => ['required', Rule::in(['essence', 'diesel', 'hybride', 'électrique', 'gpl', 'autre'])],
            'fuel_card' => 'nullable|string|max:50',
            'mileage' => 'required|integer|min:0',
            'status' => ['required', Rule::in(['operational', 'maintenance', 'out_of_service'])],
            'current_driver_id' => 'nullable|exists:users,id',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'insurance_expiry' => 'nullable|date',
            'technical_inspection_expiry' => 'nullable|date',
            'tvm_expiry' => 'nullable|date',
        ]);

        if ($request->hasFile('document')) {
            $data['document_path'] = $request->file('document')
                ->store('documents/vehicles', 'public');
        }
        unset($data['document']);

        $vehicle = Vehicle::create($data);

        return response()->json([
            'message' => 'Véhicule créé avec succès',
            'vehicle' => $vehicle,
        ], 201);
    }

    /**
     * Afficher les détails d'un véhicule (simple)
     * Route: GET /api/vehicles/{vehicle}
     * Accessible par : tous les utilisateurs authentifiés
     */
    public function show(Vehicle $vehicle)
    {
        $vehicle->load('currentDriver');

        return response()->json($vehicle);
    }

    /**
     * Mettre à jour un véhicule
     * Route: PUT /api/vehicles/{vehicle}
     * Accessible par : admin, manager
     */
    public function update(Request $request, Vehicle $vehicle)
    {
        if (! Gate::allows('manager-action')) {
            return response()->json([
                'message' => 'Accès non autorisé. Seuls les administrateurs et managers peuvent modifier des véhicules.',
            ], 403);
        }

        $data = $request->validate([
            'marque' => 'sometimes|string|max:50',
            'model' => 'sometimes|string|max:50',
            'license_plate' => 'sometimes|string|unique:vehicles,license_plate,'.$vehicle->id.'|max:20',
            'year' => 'sometimes|integer|min:1900|max:'.(date('Y') + 1),
            'fuel_type' => ['sometimes', Rule::in(['essence', 'diesel', 'hybride', 'électrique', 'gpl', 'autre'])],
            'fuel_card' => 'nullable|string|max:50',
            'mileage' => 'sometimes|integer|min:0',
            'status' => ['sometimes', Rule::in(['operational', 'maintenance', 'out_of_service'])],
            'current_driver_id' => 'nullable|exists:users,id',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'insurance_expiry' => 'nullable|date',
            'technical_inspection_expiry' => 'nullable|date',
            'tvm_expiry' => 'nullable|date',
        ]);

        if ($request->hasFile('document')) {
            if ($vehicle->document_path) {
                Storage::disk('public')->delete($vehicle->document_path);
            }
            $data['document_path'] = $request->file('document')
                ->store('documents/vehicles', 'public');
        }
        unset($data['document']);

        $vehicle->update($data);

        return response()->json([
            'message' => 'Véhicule mis à jour avec succès',
            'vehicle' => $vehicle,
        ]);
    }

    /**
     * Supprimer un véhicule
     * Route: DELETE /api/vehicles/{vehicle}
     * Accessible par : admin uniquement
     */
    public function destroy(Vehicle $vehicle)
    {
        if (! Gate::allows('admin-action')) {
            return response()->json([
                'message' => 'Accès non autorisé. Seuls les administrateurs peuvent supprimer des véhicules.',
            ], 403);
        }

        $vehicle->delete();

        return response()->json([
            'message' => 'Véhicule supprimé avec succès',
        ], 200);
    }

    /**
     * Liste simplifiée des véhicules (pour dropdowns)
     * Route: GET /api/vehicles-list
     * Accessible par : tous les utilisateurs authentifiés
     */
    public function list()
    {
        return response()->json(
            Vehicle::select('id', 'license_plate', 'marque', 'model', 'status', 'current_driver_id')
                ->with('currentDriver:id,name')
                ->orderBy('license_plate')
                ->get()
        );
    }

    /**
     * Détails complets d'un véhicule avec toutes les relations
     * Route: GET /api/vehicles-details/{vehicle}
     * Accessible par : admin, manager, accountant
     */
    public function detailsVehicle(Vehicle $vehicle)
    {
        if (! Gate::allows('manager-action') && ! Gate::allows('accountant-action')) {
            return response()->json([
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        // Charger toutes les relations utiles
        $vehicle->load([
            'currentDriver',
            'consumptions' => function ($query) {
                $query->latest()->limit(10);
            },
            'maintenances' => function ($query) {
                $query->latest()->limit(10);
            },
        ]);

        // Statistiques supplémentaires
        $stats = [
            'total_consumptions' => $vehicle->consumptions()->count(),
            'total_fuel_cost' => $vehicle->consumptions()->sum('fuel_cost'),
            'total_fuel_volume' => $vehicle->consumptions()->sum('fuel_volume'),
            'total_maintenances' => $vehicle->maintenances()->count(),
            'total_maintenance_cost' => $vehicle->maintenances()->sum('cost'),
            'average_consumption' => $vehicle->consumptions()->avg('fuel_volume'),
        ];

        return response()->json([
            'vehicle' => $vehicle,
            'stats' => $stats,
        ]);
    }

    /**
     * Assigner un chauffeur à un véhicule
     * Route: POST /api/vehicles/{vehicle}/assign-driver
     * Accessible par : admin, manager
     */
    public function assignDriver(Request $request, Vehicle $vehicle)
    {
        if (! Gate::allows('manager-action')) {
            return response()->json([
                'message' => 'Accès non autorisé. Seuls les administrateurs et managers peuvent assigner des chauffeurs.',
            ], 403);
        }

        $data = $request->validate([
            'driver_id' => 'required|exists:users,id',
        ]);

        // Vérifier que l'utilisateur est bien un chauffeur
        $driver = \App\Models\User::find($data['driver_id']);
        if (! $driver->isDriver()) {
            return response()->json([
                'message' => 'L\'utilisateur sélectionné n\'est pas un chauffeur.',
            ], 422);
        }

        // Vérifier si le chauffeur n'est pas déjà assigné à un autre véhicule
        $existingAssignment = Vehicle::where('current_driver_id', $data['driver_id'])
            ->where('id', '!=', $vehicle->id)
            ->first();

        if ($existingAssignment) {
            return response()->json([
                'message' => 'Ce chauffeur est déjà assigné au véhicule '.$existingAssignment->license_plate,
            ], 422);
        }

        $vehicle->update(['current_driver_id' => $data['driver_id']]);

        return response()->json([
            'message' => 'Chauffeur assigné avec succès',
            'vehicle' => $vehicle->load('currentDriver'),
        ]);
    }

    /**
     * Mettre à jour le kilométrage
     * Route: PUT /api/vehicles/{vehicle}/update-mileage
     * Accessible par : admin, manager, mechanic OU le chauffeur assigné
     */
    public function updateMileage(Request $request, Vehicle $vehicle)
    {
        $canUpdate = Gate::allows('admin-action') ||
                     Gate::allows('manager-action') ||
                     Gate::allows('mechanic-action') ||
                     ($vehicle->current_driver_id === auth()->id() && Gate::allows('driver-action'));

        if (! $canUpdate) {
            return response()->json([
                'message' => 'Accès non autorisé. Seul le chauffeur assigné, un mécanicien ou un administrateur peut modifier le kilométrage.',
            ], 403);
        }

        $data = $request->validate([
            'mileage' => 'required|integer|min:'.$vehicle->mileage,
        ]);

        $oldMileage = $vehicle->mileage;
        $vehicle->update(['mileage' => $data['mileage']]);

        return response()->json([
            'message' => 'Kilométrage mis à jour avec succès',
            'vehicle' => $vehicle,
            'old_mileage' => $oldMileage,
            'new_mileage' => $data['mileage'],
            'difference' => $data['mileage'] - $oldMileage,
        ]);
    }

    /**
     * Obtenir les véhicules disponibles (non assignés)
     * Accessible par : admin, manager
     */
    public function available()
    {
        if (! Gate::allows('manager-action')) {
            return response()->json([
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        $vehicles = Vehicle::where('status', 'operational')
            ->whereNull('current_driver_id')
            ->select('id', 'license_plate', 'marque', 'model')
            ->orderBy('license_plate')
            ->get();

        return response()->json($vehicles);
    }

    /**
     * Obtenir les véhicules en maintenance
     * Accessible par : admin, manager, mechanic
     */
    public function inMaintenance()
    {
        if (! Gate::allows('manager-action') && ! Gate::allows('mechanic-action')) {
            return response()->json([
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        $vehicles = Vehicle::where('status', 'maintenance')
            ->with('currentDriver:id,name')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($vehicles);
    }

    /**
     * Retourne les véhicules dont au moins un document expire dans les 30 jours (ou est expiré)
     * Route: GET /api/vehicles/expiring-documents
     */
    public function expiringDocuments()
    {
        if (! Gate::allows('manager-action') && ! Gate::allows('accountant-action')) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $threshold = Carbon::now()->addDays(30);

        $vehicles = Vehicle::select('id', 'license_plate', 'marque', 'model', 'insurance_expiry', 'technical_inspection_expiry', 'tvm_expiry')
            ->where(function ($q) use ($threshold) {
                $q->where(function ($q2) use ($threshold) {
                    $q2->whereNotNull('insurance_expiry')->where('insurance_expiry', '<=', $threshold);
                })->orWhere(function ($q2) use ($threshold) {
                    $q2->whereNotNull('technical_inspection_expiry')->where('technical_inspection_expiry', '<=', $threshold);
                })->orWhere(function ($q2) use ($threshold) {
                    $q2->whereNotNull('tvm_expiry')->where('tvm_expiry', '<=', $threshold);
                });
            })
            ->orderByRaw("LEAST(
                COALESCE(insurance_expiry, '9999-12-31'),
                COALESCE(technical_inspection_expiry, '9999-12-31'),
                COALESCE(tvm_expiry, '9999-12-31')
            ) ASC")
            ->get()
            ->map(function ($v) {
                $today = Carbon::today();
                $fmt = fn ($d) => $d ? [
                    'date' => $d->format('Y-m-d'),
                    'days_left' => $today->diffInDays($d, false),
                    'expired' => $d->lt($today),
                ] : null;

                return [
                    'id' => $v->id,
                    'license_plate' => $v->license_plate,
                    'marque' => $v->marque,
                    'model' => $v->model,
                    'insurance' => $fmt($v->insurance_expiry),
                    'inspection' => $fmt($v->technical_inspection_expiry),
                    'tvm' => $fmt($v->tvm_expiry),
                ];
            });

        return response()->json($vehicles);
    }
}
