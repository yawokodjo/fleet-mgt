<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $drivers = User::where('role', 'driver')->pluck('id')->toArray();

        $vehicles = [
            [
                'marque' => 'Toyota',
                'model' => 'Hilux',
                'license_plate' => 'TG-1234-AB',
                'year' => 2021,
                'fuel_type' => 'diesel',
                'fuel_card' => 'FC-001',
                'mileage' => 45230,
                'status' => 'operational',
            ],
            [
                'marque' => 'Toyota',
                'model' => 'Land Cruiser 200',
                'license_plate' => 'TG-5678-CD',
                'year' => 2020,
                'fuel_type' => 'diesel',
                'fuel_card' => 'FC-002',
                'mileage' => 78540,
                'status' => 'operational',
            ],
            [
                'marque' => 'Mitsubishi',
                'model' => 'Pajero',
                'license_plate' => 'TG-9012-EF',
                'year' => 2019,
                'fuel_type' => 'diesel',
                'fuel_card' => 'FC-003',
                'mileage' => 92100,
                'status' => 'maintenance',
            ],
            [
                'marque' => 'Ford',
                'model' => 'Ranger',
                'license_plate' => 'TG-3456-GH',
                'year' => 2022,
                'fuel_type' => 'diesel',
                'fuel_card' => 'FC-004',
                'mileage' => 31450,
                'status' => 'operational',
            ],
            [
                'marque' => 'Nissan',
                'model' => 'Patrol',
                'license_plate' => 'TG-7890-IJ',
                'year' => 2018,
                'fuel_type' => 'diesel',
                'fuel_card' => 'FC-005',
                'mileage' => 115600,
                'status' => 'operational',
            ],
            [
                'marque' => 'Toyota',
                'model' => 'Corolla',
                'license_plate' => 'TG-2345-KL',
                'year' => 2023,
                'fuel_type' => 'essence',
                'fuel_card' => 'FC-006',
                'mileage' => 12300,
                'status' => 'operational',
            ],
            [
                'marque' => 'Hyundai',
                'model' => 'Tucson',
                'license_plate' => 'TG-6789-MN',
                'year' => 2021,
                'fuel_type' => 'essence',
                'fuel_card' => null,
                'mileage' => 54800,
                'status' => 'operational',
            ],
            [
                'marque' => 'Renault',
                'model' => 'Duster',
                'license_plate' => 'TG-0123-OP',
                'year' => 2020,
                'fuel_type' => 'diesel',
                'fuel_card' => 'FC-007',
                'mileage' => 67200,
                'status' => 'out_of_service',
            ],
        ];

        foreach ($vehicles as $i => $data) {
            $driverId = isset($drivers[$i]) ? $drivers[$i] : null;
            Vehicle::firstOrCreate(
                ['license_plate' => $data['license_plate']],
                array_merge($data, ['current_driver_id' => $driverId])
            );
        }
    }
}
