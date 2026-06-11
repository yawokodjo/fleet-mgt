<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    private const PASSWORD = 'Password1!';

    // ─────────────────────────────────────────────────────────
    // INDEX — liste des utilisateurs
    // ─────────────────────────────────────────────────────────

    public function test_admin_can_list_users(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->count(3)->create();

        $this->actingAs($admin)
            ->getJson('/api/users')
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'total', 'by_role']);
    }

    public function test_manager_cannot_list_users(): void
    {
        $manager = User::factory()->manager()->create();

        $this->actingAs($manager)
            ->getJson('/api/users')
            ->assertStatus(403);
    }

    public function test_driver_cannot_list_users(): void
    {
        $driver = User::factory()->driver()->create();

        $this->actingAs($driver)
            ->getJson('/api/users')
            ->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_list_users(): void
    {
        $this->getJson('/api/users')->assertStatus(401);
    }

    public function test_admin_can_search_users_by_name(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['name' => 'Alice Martin']);
        User::factory()->create(['name' => 'Bob Dupont']);

        $response = $this->actingAs($admin)
            ->getJson('/api/users?search=Alice')
            ->assertStatus(200);

        $this->assertEquals(1, $response->json('total'));
    }

    // ─────────────────────────────────────────────────────────
    // STORE — création d'un utilisateur
    // ─────────────────────────────────────────────────────────

    public function test_admin_can_create_user(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->postJson('/api/users', [
                'name'                  => 'Nouveau Manager',
                'email'                 => 'manager@example.com',
                'password'              => self::PASSWORD,
                'password_confirmation' => self::PASSWORD,
                'role'                  => 'manager',
            ])->assertStatus(201)
              ->assertJsonPath('user.email', 'manager@example.com');

        $this->assertDatabaseHas('users', ['email' => 'manager@example.com']);
    }

    public function test_manager_cannot_create_user(): void
    {
        $manager = User::factory()->manager()->create();

        $this->actingAs($manager)
            ->postJson('/api/users', [
                'name'                  => 'Test',
                'email'                 => 'test@example.com',
                'password'              => self::PASSWORD,
                'password_confirmation' => self::PASSWORD,
                'role'                  => 'driver',
            ])->assertStatus(403);
    }

    public function test_store_fails_with_duplicate_email(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['email' => 'existing@example.com']);

        $this->actingAs($admin)
            ->postJson('/api/users', [
                'name'                  => 'Doublon',
                'email'                 => 'existing@example.com',
                'password'              => self::PASSWORD,
                'password_confirmation' => self::PASSWORD,
                'role'                  => 'driver',
            ])->assertStatus(422)
              ->assertJsonValidationErrors(['email']);
    }

    public function test_store_fails_with_invalid_role(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->postJson('/api/users', [
                'name'                  => 'Invalid',
                'email'                 => 'invalid@example.com',
                'password'              => self::PASSWORD,
                'password_confirmation' => self::PASSWORD,
                'role'                  => 'superuser',
            ])->assertStatus(422)
              ->assertJsonValidationErrors(['role']);
    }

    // ─────────────────────────────────────────────────────────
    // SHOW — afficher un utilisateur
    // ─────────────────────────────────────────────────────────

    public function test_admin_can_view_any_user(): void
    {
        $admin  = User::factory()->admin()->create();
        $target = User::factory()->driver()->create();

        $this->actingAs($admin)
            ->getJson("/api/users/{$target->id}")
            ->assertStatus(200)
            ->assertJsonPath('user.id', $target->id);
    }

    public function test_user_can_view_own_profile(): void
    {
        $user = User::factory()->driver()->create();

        $this->actingAs($user)
            ->getJson("/api/users/{$user->id}")
            ->assertStatus(200)
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_user_cannot_view_another_users_profile(): void
    {
        $user   = User::factory()->driver()->create();
        $other  = User::factory()->driver()->create();

        $this->actingAs($user)
            ->getJson("/api/users/{$other->id}")
            ->assertStatus(403);
    }

    // ─────────────────────────────────────────────────────────
    // UPDATE — mise à jour
    // ─────────────────────────────────────────────────────────

    public function test_user_can_update_own_name(): void
    {
        $user = User::factory()->driver()->create();

        $this->actingAs($user)
            ->putJson("/api/users/{$user->id}", ['name' => 'Nouveau Nom'])
            ->assertStatus(200)
            ->assertJsonPath('user.name', 'Nouveau Nom');
    }

    public function test_driver_cannot_change_own_role(): void
    {
        $user = User::factory()->driver()->create();

        $this->actingAs($user)
            ->putJson("/api/users/{$user->id}", ['role' => 'admin'])
            ->assertStatus(200);

        // Le rôle ne doit pas avoir changé
        $this->assertEquals('driver', $user->fresh()->role);
    }

    public function test_admin_can_change_user_role(): void
    {
        $admin  = User::factory()->admin()->create();
        $target = User::factory()->driver()->create();

        $this->actingAs($admin)
            ->putJson("/api/users/{$target->id}", ['role' => 'mechanic'])
            ->assertStatus(200);

        $this->assertEquals('mechanic', $target->fresh()->role);
    }

    // ─────────────────────────────────────────────────────────
    // DESTROY — soft delete
    // ─────────────────────────────────────────────────────────

    public function test_admin_can_soft_delete_user(): void
    {
        $admin  = User::factory()->admin()->create();
        $target = User::factory()->driver()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/users/{$target->id}")
            ->assertStatus(200);

        $this->assertSoftDeleted('users', ['id' => $target->id]);
    }

    public function test_manager_cannot_delete_user(): void
    {
        $manager = User::factory()->manager()->create();
        $target  = User::factory()->driver()->create();

        $this->actingAs($manager)
            ->deleteJson("/api/users/{$target->id}")
            ->assertStatus(403);
    }

    // ─────────────────────────────────────────────────────────
    // CHANGE PASSWORD
    // ─────────────────────────────────────────────────────────

    public function test_change_password_succeeds_with_correct_current_password(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt(self::PASSWORD),
        ]);

        $newPass = 'NewSecure99!';

        $this->actingAs($user)
            ->putJson('/api/change-password', [
                'current_password'          => self::PASSWORD,
                'new_password'              => $newPass,
                'new_password_confirmation' => $newPass,
            ])->assertStatus(200);
    }

    public function test_change_password_fails_with_wrong_current_password(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt(self::PASSWORD),
        ]);

        $this->actingAs($user)
            ->putJson('/api/change-password', [
                'current_password'          => 'WrongPass99!',
                'new_password'              => 'NewSecure99!',
                'new_password_confirmation' => 'NewSecure99!',
            ])->assertStatus(401);
    }

    public function test_change_password_fails_when_same_as_current(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt(self::PASSWORD),
        ]);

        $this->actingAs($user)
            ->putJson('/api/change-password', [
                'current_password'          => self::PASSWORD,
                'new_password'              => self::PASSWORD,
                'new_password_confirmation' => self::PASSWORD,
            ])->assertStatus(422);
    }

    // ─────────────────────────────────────────────────────────
    // DRIVERS — liste des chauffeurs
    // ─────────────────────────────────────────────────────────

    public function test_drivers_list_returns_only_drivers(): void
    {
        User::factory()->admin()->create();
        User::factory()->manager()->create();
        User::factory()->driver()->count(3)->create();

        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)
            ->getJson('/api/drivers')
            ->assertStatus(200);

        $this->assertCount(3, $response->json());
    }
}
