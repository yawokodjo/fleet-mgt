<?php

namespace App\Http\Controllers;

use App\Models\Consumption;
use App\Models\Maintenance;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->query('query');

        $vehicles = Vehicle::where('brand', 'like', "%$query%")
            ->orWhere('plate_number', 'like', "%$query%")
            ->get(['id', 'plate_number as name'])
            ->map(fn ($v) => ['type' => 'Véhicule', 'name' => $v->name]);

        $consumptions = Consumption::where('description', 'like', "%$query%")
            ->get(['id', 'description as name'])
            ->map(fn ($c) => ['type' => 'Consommation', 'name' => $c->name]);

        $maintenances = Maintenance::where('description', 'like', "%$query%")
            ->get(['id', 'description as name'])
            ->map(fn ($m) => ['type' => 'Maintenance', 'name' => $m->name]);

        $users = User::where('name', 'like', "%$query%")
            ->get(['id', 'name'])
            ->map(fn ($u) => ['type' => 'Utilisateur', 'name' => $u->name]);

        return $vehicles
            ->merge($consumptions)
            ->merge($maintenances)
            ->merge($users)
            ->values();
    }
}
