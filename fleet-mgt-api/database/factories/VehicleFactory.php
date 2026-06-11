<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'marque' => fake()->randomElement(['Toyota', 'Renault', 'Peugeot', 'Ford', 'BMW']),
            'model' => fake()->word(),
            'license_plate' => strtoupper(fake()->unique()->bothify('??-###-??')),
            'year' => fake()->numberBetween(2010, 2024),
            'fuel_type' => fake()->randomElement(['essence', 'diesel', 'hybride', 'électrique', 'gpl', 'autre']),
            'fuel_card' => null,
            'mileage' => fake()->numberBetween(0, 200000),
            'status' => 'operational',
            'current_driver_id' => null,
        ];
    }

    public function operational(): static
    {
        return $this->state(['status' => 'operational']);
    }

    public function inMaintenance(): static
    {
        return $this->state(['status' => 'maintenance']);
    }

    public function outOfService(): static
    {
        return $this->state(['status' => 'out_of_service']);
    }
}
