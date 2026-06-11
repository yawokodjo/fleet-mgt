<?php

namespace Tests\Unit;

use App\Models\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    private function makeUser(string $role): User
    {
        $user = new User;
        $user->role = $role;

        return $user;
    }

    // ── isAdmin ──────────────────────────────────────────────
    public function test_is_admin_returns_true_for_admin_role(): void
    {
        $this->assertTrue($this->makeUser('admin')->isAdmin());
    }

    public function test_is_admin_returns_false_for_other_roles(): void
    {
        foreach (['manager', 'driver', 'accountant', 'mechanic'] as $role) {
            $this->assertFalse($this->makeUser($role)->isAdmin(), "Failed for role: $role");
        }
    }

    // ── isManager ────────────────────────────────────────────
    public function test_is_manager_returns_true_for_manager_role(): void
    {
        $this->assertTrue($this->makeUser('manager')->isManager());
    }

    public function test_is_manager_returns_false_for_other_roles(): void
    {
        foreach (['admin', 'driver', 'accountant', 'mechanic'] as $role) {
            $this->assertFalse($this->makeUser($role)->isManager(), "Failed for role: $role");
        }
    }

    // ── isDriver ─────────────────────────────────────────────
    public function test_is_driver_returns_true_for_driver_role(): void
    {
        $this->assertTrue($this->makeUser('driver')->isDriver());
    }

    public function test_is_driver_returns_false_for_other_roles(): void
    {
        foreach (['admin', 'manager', 'accountant', 'mechanic'] as $role) {
            $this->assertFalse($this->makeUser($role)->isDriver(), "Failed for role: $role");
        }
    }

    // ── isAccountant ─────────────────────────────────────────
    public function test_is_accountant_returns_true_for_accountant_role(): void
    {
        $this->assertTrue($this->makeUser('accountant')->isAccountant());
    }

    public function test_is_accountant_returns_false_for_other_roles(): void
    {
        foreach (['admin', 'manager', 'driver', 'mechanic'] as $role) {
            $this->assertFalse($this->makeUser($role)->isAccountant(), "Failed for role: $role");
        }
    }

    // ── isMechanic ───────────────────────────────────────────
    public function test_is_mechanic_returns_true_for_mechanic_role(): void
    {
        $this->assertTrue($this->makeUser('mechanic')->isMechanic());
    }

    public function test_is_mechanic_returns_false_for_other_roles(): void
    {
        foreach (['admin', 'manager', 'driver', 'accountant'] as $role) {
            $this->assertFalse($this->makeUser($role)->isMechanic(), "Failed for role: $role");
        }
    }

    // ── hasRole ──────────────────────────────────────────────
    public function test_has_role_with_single_string_match(): void
    {
        $this->assertTrue($this->makeUser('admin')->hasRole('admin'));
    }

    public function test_has_role_with_single_string_no_match(): void
    {
        $this->assertFalse($this->makeUser('driver')->hasRole('admin'));
    }

    public function test_has_role_with_array_match(): void
    {
        $this->assertTrue($this->makeUser('manager')->hasRole(['admin', 'manager']));
    }

    public function test_has_role_with_array_no_match(): void
    {
        $this->assertFalse($this->makeUser('driver')->hasRole(['admin', 'manager', 'accountant']));
    }

    public function test_has_role_with_empty_array_returns_false(): void
    {
        $this->assertFalse($this->makeUser('admin')->hasRole([]));
    }
}
