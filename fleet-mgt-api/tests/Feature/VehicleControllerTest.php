<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleControllerTest extends TestCase
{
    use RefreshDatabase;

    private function vehiclePayload(array $overrides = []): array
    {
        return array_merge([
            'marque'        => 'Toyota',
            'model'         => 'Corolla',
            'license_plate' => 'AB-123-CD',
            'year'          => 2022,
            'fuel_type'     => 'essence',
            'mileage'       => 15000,
            'status'        => 'operational',
        ], $overrides);
    }

    // ─────────────────────────────────────────────────────────
    // INDEX
    // ─────────────────────────────────────────────────────────

    public function test_admin_can_list_vehicles(): void
    {
        $admin = User::factory()->admin()->create();
        Vehicle::factory()->count(3)->create();

        $this->actingAs($admin)
            ->getJson('/api/vehicles')
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'total']);
    }

    public function test_manager_can_list_vehicles(): void
    {
        $manager = User::factory()->manager()->create();

        $this->actingAs($manager)
            ->getJson('/api/vehicles')
            ->assertStatus(200);
    }

    public function test_accountant_can_list_vehicles(): void
    {
        $accountant = User::factory()->accountant()->create();

        $this->actingAs($accountant)
            ->getJson('/api/vehicles')
            ->assertStatus(200);
    }

    public function test_driver_cannot_list_vehicles(): void
    {
        $driver = User::factory()->driver()->create();

        $this->actingAs($driver)
            ->getJson('/api/vehicles')
            ->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_list_vehicles(): void
    {
        $this->getJson('/api/vehicles')->assertStatus(401);
    }

    // ─────────────────────────────────────────────────────────
    // STORE
    // ─────────────────────────────────────────────────────────

    public function test_admin_can_create_vehicle(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->postJson('/api/vehicles', $this->vehiclePayload())
            ->assertStatus(201)
            ->assertJsonPath('vehicle.license_plate', 'AB-123-CD');

        $this->assertDatabaseHas('vehicles', ['license_plate' => 'AB-123-CD']);
    }

    public function test_manager_can_create_vehicle(): void
    {
        $manager = User::factory()->manager()->create();

        $this->actingAs($manager)
            ->postJson('/api/vehicles', $this->vehiclePayload(['license_plate' => 'XY-456-ZZ']))
            ->assertStatus(201);
    }

    public function test_accountant_cannot_create_vehicle(): void
    {
        $accountant = User::factory()->accountant()->create();

        $this->actingAs($accountant)
            ->postJson('/api/vehicles', $this->vehiclePayload())
            ->assertStatus(403);
    }

    public function test_driver_cannot_create_vehicle(): void
    {
        $driver = User::factory()->driver()->create();

        $this->actingAs($driver)
            ->postJson('/api/vehicles', $this->vehiclePayload())
            ->assertStatus(403);
    }

    public function test_store_fails_with_duplicate_license_plate(): void
    {
        $admin = User::factory()->admin()->create();
        Vehicle::factory()->create(['license_plate' => 'AB-123-CD']);

        $this->actingAs($admin)
            ->postJson('/api/vehicles', $this->vehiclePayload(['license_plate' => 'AB-123-CD']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['license_plate']);
    }

    public function test_store_fails_with_invalid_fuel_type(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->postJson('/api/vehicles', $this->vehiclePayload(['fuel_type' => 'nuclear']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['fuel_type']);
    }

    public function test_store_fails_with_negative_mileage(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->postJson('/api/vehicles', $this->vehiclePayload(['mileage' => -1]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['mileage']);
    }

    // ─────────────────────────────────────────────────────────
    // SHOW
    // ─────────────────────────────────────────────────────────

    public function test_authenticated_user_can_view_vehicle(): void
    {
        $driver  = User::factory()->driver()->create();
        $vehicle = Vehicle::factory()->create();

        $this->actingAs($driver)
            ->getJson("/api/vehicles/{$vehicle->id}")
            ->assertStatus(200)
            ->assertJsonPath('license_plate', $vehicle->license_plate);
    }

    // ─────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────

    public function test_admin_can_update_vehicle(): void
    {
        $admin   = User::factory()->admin()->create();
        $vehicle = Vehicle::factory()->create();

        $this->actingAs($admin)
            ->putJson("/api/vehicles/{$vehicle->id}", ['mileage' => 99999])
            ->assertStatus(200)
            ->assertJsonPath('vehicle.mileage', 99999);
    }

    public function test_manager_can_update_vehicle(): void
    {
        $manager = User::factory()->manager()->create();
        $vehicle = Vehicle::factory()->create();

        $this->actingAs($manager)
            ->putJson("/api/vehicles/{$vehicle->id}", ['status' => 'maintenance'])
            ->assertStatus(200);
    }

    public function test_driver_cannot_update_vehicle(): void
    {
        $driver  = User::factory()->driver()->create();
        $vehicle = Vehicle::factory()->create();

        $this->actingAs($driver)
            ->putJson("/api/vehicles/{$vehicle->id}", ['mileage' => 99999])
            ->assertStatus(403);
    }

    // ─────────────────────────────────────────────────────────
    // DESTROY
    // ─────────────────────────────────────────────────────────

    public function test_admin_can_delete_vehicle(): void
    {
        $admin   = User::factory()->admin()->create();
        $vehicle = Vehicle::factory()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/vehicles/{$vehicle->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('vehicles', ['id' => $vehicle->id]);
    }

    public function test_manager_cannot_delete_vehicle(): void
    {
        $manager = User::factory()->manager()->create();
        $vehicle = Vehicle::factory()->create();

        $this->actingAs($manager)
            ->deleteJson("/api/vehicles/{$vehicle->id}")
            ->assertStatus(403);
    }

    // ─────────────────────────────────────────────────────────
    // ASSIGN DRIVER
    // ─────────────────────────────────────────────────────────

    public function test_admin_can_assign_driver_to_vehicle(): void
    {
        $admin   = User::factory()->admin()->create();
        $driver  = User::factory()->driver()->create();
        $vehicle = Vehicle::factory()->create();

        $this->actingAs($admin)
            ->postJson("/api/vehicles/{$vehicle->id}/assign-driver", [
                'driver_id' => $driver->id,
            ])->assertStatus(200)
              ->assertJsonPath('vehicle.current_driver_id', $driver->id);
    }

    public function test_cannot_assign_non_driver_role_to_vehicle(): void
    {
        $admin   = User::factory()->admin()->create();
        $manager = User::factory()->manager()->create();
        $vehicle = Vehicle::factory()->create();

        $this->actingAs($admin)
            ->postJson("/api/vehicles/{$vehicle->id}/assign-driver", [
                'driver_id' => $manager->id,
            ])->assertStatus(422);
    }

    public function test_cannot_assign_driver_already_assigned_to_another_vehicle(): void
    {
        $admin        = User::factory()->admin()->create();
        $driver       = User::factory()->driver()->create();
        $vehicleA     = Vehicle::factory()->create(['current_driver_id' => $driver->id]);
        $vehicleB     = Vehicle::factory()->create();

        $this->actingAs($admin)
            ->postJson("/api/vehicles/{$vehicleB->id}/assign-driver", [
                'driver_id' => $driver->id,
            ])->assertStatus(422);
    }

    public function test_driver_cannot_assign_driver(): void
    {
        $driver  = User::factory()->driver()->create();
        $vehicle = Vehicle::factory()->create();
        $other   = User::factory()->driver()->create();

        $this->actingAs($driver)
            ->postJson("/api/vehicles/{$vehicle->id}/assign-driver", [
                'driver_id' => $other->id,
            ])->assertStatus(403);
    }

    // ─────────────────────────────────────────────────────────
    // UPDATE MILEAGE
    // ─────────────────────────────────────────────────────────

    public function test_assigned_driver_can_update_mileage(): void
    {
        $driver  = User::factory()->driver()->create();
        $vehicle = Vehicle::factory()->create([
            'mileage'           => 10000,
            'current_driver_id' => $driver->id,
        ]);

        $this->actingAs($driver)
            ->putJson("/api/vehicles/{$vehicle->id}/update-mileage", ['mileage' => 10500])
            ->assertStatus(200)
            ->assertJsonPath('new_mileage', 10500);
    }

    public function test_mileage_cannot_decrease(): void
    {
        $admin   = User::factory()->admin()->create();
        $vehicle = Vehicle::factory()->create(['mileage' => 10000]);

        $this->actingAs($admin)
            ->putJson("/api/vehicles/{$vehicle->id}/update-mileage", ['mileage' => 5000])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['mileage']);
    }

    public function test_unassigned_driver_cannot_update_mileage(): void
    {
        $driver  = User::factory()->driver()->create();
        $vehicle = Vehicle::factory()->create(['mileage' => 10000, 'current_driver_id' => null]);

        $this->actingAs($driver)
            ->putJson("/api/vehicles/{$vehicle->id}/update-mileage", ['mileage' => 11000])
            ->assertStatus(403);
    }

    // ─────────────────────────────────────────────────────────
    // EXPIRING DOCUMENTS
    // ─────────────────────────────────────────────────────────

    public function test_returns_vehicles_with_expiring_documents(): void
    {
        $admin = User::factory()->admin()->create();

        Vehicle::factory()->create([
            'insurance_expiry' => now()->addDays(10),
        ]);
        Vehicle::factory()->create([
            'insurance_expiry' => now()->addDays(60), // pas encore
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/vehicles/expiring-documents')
            ->assertStatus(200);

        $this->assertCount(1, $response->json());
    }
}
