<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function admin(): static
    {
        return $this->state(['role' => 'admin']);
    }

    public function manager(): static
    {
        return $this->state(['role' => 'manager']);
    }

    public function driver(): static
    {
        return $this->state(['role' => 'driver']);
    }

    public function accountant(): static
    {
        return $this->state(['role' => 'accountant']);
    }

    public function mechanic(): static
    {
        return $this->state(['role' => 'mechanic']);
    }

    public function blocked(int $minutes = 30): static
    {
        return $this->state([
            'login_attempts' => 0,
            'block_count'    => 2,
            'blocked_until'  => now()->addMinutes($minutes),
        ]);
    }
}
