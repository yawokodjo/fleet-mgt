<?php

namespace Database\Seeders;

use App\Models\Maintenance;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class MaintenanceSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = Vehicle::all();
        $drivers  = User::where('role', 'driver')->get();

        if ($vehicles->isEmpty()) return;

        /*
         * Format :
         * [vehicle_idx, driver_idx, type, company, scheduled_days_ago, completed_days_ago|null,
         *  cost, status, description, mileage_at_service|null]
         *
         * mileage_at_service : kilométrage au compteur au moment de l'entretien
         * null pour les maintenances non encore réalisées (planned / in_progress sans date réalisée)
         */
        $records = [
            // Toyota Hilux
            [0, 0, 'vidange',    'Auto Service Lomé',     90, 88,  25000, 'completed',    'Vidange huile moteur + filtre',          41400],
            [0, 0, 'pneus',      'Pneus Express TG',      60, 58,  80000, 'completed',    'Remplacement 4 pneus avant/arrière',     42700],
            [0, 0, 'révision',   'Toyota Center TG',      30, 28, 120000, 'completed',    'Révision 45 000 km complète',            44100],
            [0, 0, 'vidange',    'Auto Service Lomé',      7,  null, 25000, 'planned',    'Vidange prévue 50 000 km',               null],

            // Toyota Land Cruiser 200
            [1, 1, 'freins',     'Garage Mécanique Plus', 75, 73,  65000, 'completed',    'Remplacement plaquettes + disques avant', 75760],
            [1, 1, 'batterie',   'Electro Auto TG',       45, 43,  35000, 'completed',    'Remplacement batterie 80Ah',             76900],
            [1, 1, 'révision',   'Toyota Center TG',      14,  null, 130000, 'in_progress','Révision 80 000 km en cours',           78080],

            // Mitsubishi Pajero
            [2, 2, 'carrosserie','Carrosserie Nationale',  50, 47, 150000, 'completed',   'Réparation choc avant + peinture',       90400],
            [2, 2, 'freins',     'Garage Mécanique Plus',  20,  null, 70000, 'in_progress','Remplacement freins arrière',           91540],

            // Ford Ranger
            [3, 3, 'vidange',    'Auto Service Lomé',      80, 78,  25000, 'completed',   'Vidange huile moteur',                   28900],
            [3, 3, 'pneus',      'Pneus Express TG',       40, 38,  90000, 'completed',   'Remplacement 4 pneus',                   30250],
            [3, 3, 'révision',   'Ford Dealer TG',          10, null, 110000, 'planned',  'Révision 30 000 km',                     null],

            // Nissan Patrol
            [4, 0, 'vidange',    'Auto Service Lomé',     100, 98,  28000, 'completed',   'Vidange + filtre à huile',               111850],
            [4, 0, 'batterie',   'Electro Auto TG',        70, 68,  40000, 'completed',   'Batterie HS, remplacement 90Ah',         113050],
            [4, 0, 'autre',      'Garage Central',         35, 32,  55000, 'completed',   'Remplacement courroie distribution',     114450],
            [4, 0, 'révision',   'Nissan Service TG',       5,  null, 125000, 'planned',  'Grande révision 120 000 km',             null],

            // Toyota Corolla
            [5, 1, 'vidange',    'Auto Service Lomé',      50, 48,  22000, 'completed',   'Première vidange véhicule neuf',         10960],
            [5, 1, 'révision',   'Toyota Center TG',       15,  null, 95000, 'planned',   'Révision 15 000 km',                     null],

            // Hyundai Tucson
            [6, 2, 'freins',     'Garage Mécanique Plus',  65, 63,  60000, 'completed',  'Plaquettes avant usées',                  53130],
            [6, 2, 'pneus',      'Pneus Express TG',       25, 23,  85000, 'completed',  '2 pneus arrière remplacés',               54250],
            [6, 2, 'vidange',    'Auto Service Lomé',       8,  null, 25000, 'planned',  'Vidange 55 000 km',                       null],
        ];

        // Ne pas insérer si des données existent déjà
        if (Maintenance::count() > 0) return;

        foreach ($records as [$vi, $di, $type, $company, $schedDaysAgo, $compDaysAgo, $cost, $status, $desc, $mileage]) {
            $vehicle = $vehicles->values()->get($vi % $vehicles->count());
            $driver  = $drivers->values()->get($di % $drivers->count());
            if (!$vehicle) continue;

            Maintenance::create([
                'vehicle_id'          => $vehicle->id,
                'driver_id'           => $driver?->id,
                'maintenance_type'    => $type,
                'maintenance_company' => $company,
                'scheduled_date'      => now()->subDays($schedDaysAgo)->toDateTimeString(),
                'completed_date'      => $compDaysAgo !== null ? now()->subDays($compDaysAgo)->toDateTimeString() : null,
                'cost'                => $cost,
                'status'              => $status,
                'description'         => $desc,
                'mileage_at_service'  => $mileage,
            ]);
        }
    }
}
