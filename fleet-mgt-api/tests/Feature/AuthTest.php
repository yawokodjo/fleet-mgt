<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\AccountLockedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private const VALID_PASSWORD = 'Password1!';

    // ─────────────────────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────────────────────

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Jean Dupont',
            'email'                 => 'jean@example.com',
            'password'              => self::VALID_PASSWORD,
            'password_confirmation' => self::VALID_PASSWORD,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user', 'access_token', 'token_type']);

        $this->assertDatabaseHas('users', ['email' => 'jean@example.com']);
    }

    public function test_register_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'jean@example.com']);

        $this->postJson('/api/register', [
            'name'                  => 'Autre Jean',
            'email'                 => 'jean@example.com',
            'password'              => self::VALID_PASSWORD,
            'password_confirmation' => self::VALID_PASSWORD,
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['email']);
    }

    public function test_register_fails_with_weak_password(): void
    {
        $this->postJson('/api/register', [
            'name'                  => 'Jean',
            'email'                 => 'jean@example.com',
            'password'              => 'weak',
            'password_confirmation' => 'weak',
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['password']);
    }

    public function test_register_defaults_role_to_driver(): void
    {
        $this->postJson('/api/register', [
            'name'                  => 'Chauffeur',
            'email'                 => 'driver@example.com',
            'password'              => self::VALID_PASSWORD,
            'password_confirmation' => self::VALID_PASSWORD,
        ])->assertStatus(201);

        $this->assertDatabaseHas('users', [
            'email' => 'driver@example.com',
            'role'  => 'driver',
        ]);
    }

    public function test_register_fails_when_role_is_admin(): void
    {
        $this->postJson('/api/register', [
            'name'                  => 'Faux Admin',
            'email'                 => 'fakeadmin@example.com',
            'password'              => self::VALID_PASSWORD,
            'password_confirmation' => self::VALID_PASSWORD,
            'role'                  => 'admin',
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['role']);
    }

    // ─────────────────────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────────────────────

    public function test_login_succeeds_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt(self::VALID_PASSWORD),
        ]);

        $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => self::VALID_PASSWORD,
        ])->assertStatus(200)
          ->assertJsonStructure(['user', 'access_token', 'token_type']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt(self::VALID_PASSWORD),
        ]);

        $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'WrongPass99!',
        ])->assertStatus(401)
          ->assertJson(['code' => 'INVALID_CREDENTIALS']);
    }

    public function test_login_fails_with_unknown_email(): void
    {
        $this->postJson('/api/login', [
            'email'    => 'nobody@example.com',
            'password' => self::VALID_PASSWORD,
        ])->assertStatus(401)
          ->assertJson(['code' => 'INVALID_CREDENTIALS']);
    }

    public function test_login_increments_login_attempts_on_failure(): void
    {
        $user = User::factory()->create([
            'password'       => bcrypt(self::VALID_PASSWORD),
            'login_attempts' => 0,
        ]);

        $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'WrongPass99!',
        ]);

        $this->assertEquals(1, $user->fresh()->login_attempts);
    }

    public function test_login_resets_attempts_on_success(): void
    {
        $user = User::factory()->create([
            'password'       => bcrypt(self::VALID_PASSWORD),
            'login_attempts' => 3,
        ]);

        $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => self::VALID_PASSWORD,
        ])->assertStatus(200);

        $this->assertEquals(0, $user->fresh()->login_attempts);
    }

    // ─────────────────────────────────────────────────────────
    // BRUTE-FORCE PROTECTION
    // ─────────────────────────────────────────────────────────

    public function test_account_is_blocked_after_five_failed_attempts(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'password'       => bcrypt(self::VALID_PASSWORD),
            'login_attempts' => 0,
            'block_count'    => 0,
        ]);

        for ($i = 0; $i < 4; $i++) {
            $this->postJson('/api/login', [
                'email'    => $user->email,
                'password' => 'WrongPass99!',
            ])->assertStatus(401);
        }

        // 5e tentative → blocage
        $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'WrongPass99!',
        ])->assertStatus(423)
          ->assertJson(['code' => 'ACCOUNT_BLOCKED']);

        $this->assertNotNull($user->fresh()->blocked_until);
        Notification::assertSentTo($user, AccountLockedNotification::class);
    }

    public function test_blocked_account_cannot_login_with_correct_password(): void
    {
        $user = User::factory()->blocked()->create([
            'password' => bcrypt(self::VALID_PASSWORD),
        ]);

        $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => self::VALID_PASSWORD,
        ])->assertStatus(423)
          ->assertJson(['code' => 'ACCOUNT_BLOCKED']);
    }

    public function test_blocked_account_can_login_after_block_expires(): void
    {
        $user = User::factory()->create([
            'password'       => bcrypt(self::VALID_PASSWORD),
            'login_attempts' => 0,
            'block_count'    => 1,
            'blocked_until'  => now()->subMinute(), // expiré
        ]);

        $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => self::VALID_PASSWORD,
        ])->assertStatus(200);
    }

    // ─────────────────────────────────────────────────────────
    // LOGOUT
    // ─────────────────────────────────────────────────────────

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->admin()->create();

        $tokenResult = $user->createToken('test');
        $plainToken  = $tokenResult->plainTextToken;

        $this->withHeader('Authorization', "Bearer $plainToken")
            ->postJson('/api/logout')
            ->assertStatus(200)
            ->assertJson(['message' => 'Déconnexion réussie']);

        // Le token doit être supprimé de la base de données
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $tokenResult->accessToken->id,
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // /ME
    // ─────────────────────────────────────────────────────────

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->admin()->create();

        $this->actingAs($user)
            ->getJson('/api/me')
            ->assertStatus(200)
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_me_returns_401_when_unauthenticated(): void
    {
        $this->getJson('/api/me')->assertStatus(401);
    }
}
