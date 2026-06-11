<?php

namespace Database\Seeders;

use App\Models\Consumption;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class ConsumptionSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = Vehicle::all();
        $drivers = User::where('role', 'driver')->get();

        if ($vehicles->isEmpty() || $drivers->isEmpty()) {
            return;
        }

        /*
         * Format : [vehicle_index, driver_index, days_ago, litres, cout_total, mileage]
         *
         * Mileages calculated backwards from current vehicle odometer using consumption rate:
         * - Hilux / Ranger: ~12 L/100km  →  ~45 km/day
         * - Land Cruiser / Pajero: ~13-14 L/100km  →  ~38 km/day
         * - Patrol: ~15 L/100km  →  ~40 km/day
         * - Corolla: ~8 L/100km  →  ~28 km/day
         * - Tucson: ~9 L/100km   →  ~28 km/day
         *
         * Distance between consecutive fills = mileage[i] - mileage[i-1]
         * Taux = volume / distance * 100
         */
        $records = [
            // Vehicle 0 — Toyota Hilux (current: 45 230 km)
            [0, 0,  5,  60.0,  84000, 45200],
            [0, 0, 12,  55.5,  77700, 44700],
            [0, 0, 26,  62.0,  86800, 44238],
            [0, 0, 40,  58.0,  81200, 43721],
            [0, 0, 55,  65.0,  91000, 43237],
            [0, 0, 70,  53.0,  74200, 42696],

            // Vehicle 1 — Toyota Land Cruiser 200 (current: 78 540 km)
            [1, 1,  3,  80.0, 112000, 78500],
            [1, 1, 18,  75.5, 105700, 77929],
            [1, 1, 35,  82.0, 114800, 77391],
            [1, 1, 50,  78.0, 109200, 76805],
            [1, 1, 68,  85.0, 119000, 76241],
            [1, 1, 90,  70.0,  98000, 75634],

            // Vehicle 2 — Mitsubishi Pajero (current: 92 100 km)
            [2, 2,  8,  70.0,  98000, 92000],
            [2, 2, 22,  68.0,  95200, 91462],
            [2, 2, 45,  72.0, 100800, 90939],
            [2, 2, 75,  66.0,  92400, 90385],

            // Vehicle 3 — Ford Ranger (current: 31 450 km)
            [3, 3,  6,  50.0,  70000, 31400],
            [3, 3, 20,  52.0,  72800, 30983],
            [3, 3, 38,  48.0,  67200, 30550],
            [3, 3, 60,  55.0,  77000, 30150],
            [3, 3, 85,  51.0,  71400, 29650],

            // Vehicle 4 — Nissan Patrol (current: 115 600 km)
            [4, 0,  9,  90.0, 126000, 115500],
            [4, 0, 25,  88.0, 123200, 114900],
            [4, 0, 42,  92.0, 128800, 114313],
            [4, 0, 65,  86.0, 120400, 113700],
            [4, 0, 95,  94.0, 131600, 113127],

            // Vehicle 5 — Toyota Corolla (current: 12 300 km)
            [5, 1,  4,  40.0,  56000, 12250],
            [5, 1, 15,  42.0,  58800, 11750],
            [5, 1, 30,  38.0,  53200, 11225],
            [5, 1, 55,  44.0,  61600, 10750],

            // Vehicle 6 — Hyundai Tucson (current: 54 800 km)
            [6, 2,  7,  45.0,  63000, 54750],
            [6, 2, 28,  47.0,  65800, 54250],
            [6, 2, 50,  43.0,  60200, 53728],
            [6, 2, 80,  46.0,  64400, 53250],
        ];

        // Ne pas insérer si des données existent déjà
        if (Consumption::count() > 0) {
            return;
        }

        foreach ($records as [$vi, $di, $daysAgo, $litres, $cout, $mileage]) {
            $vehicle = $vehicles->values()->get($vi % $vehicles->count());
            $driver = $drivers->values()->get($di % $drivers->count());
            if (! $vehicle || ! $driver) {
                continue;
            }

            Consumption::create([
                'vehicle_id' => $vehicle->id,
                'driver_id' => $driver->id,
                'date' => now()->subDays($daysAgo)->toDateTimeString(),
                'fuel_volume' => $litres,
                'fuel_cost' => $cout,
                'mileage' => $mileage,
            ]);
        }
    }
}
