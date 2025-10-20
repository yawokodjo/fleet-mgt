<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        /*User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com'
        ]);*/

        Vehicle::create([
            'marque' => 'Toyota',
            'model' => 'Hilux',
            'license_plate' => 'kjdgfajfbhlka',
            'fuel_type' => 'Essence',
            'fuel_card' => 'jkgaksfa',
            'mileage' => 23456,
            'current_driver_id' =>  2
        ]);

        $this->call([
            //UserSeeder::class
        ]);
    }
}
