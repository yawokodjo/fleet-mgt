<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'role' => 'admin',
            ],
            [
                'name' => 'Manager User',
                'email' => 'manager@example.com',
                'role' => 'manager',
            ],
            [
                'name' => 'Driver User',
                'email' => 'driver@example.com',
                'role' => 'driver',
            ],
            [
                'name' => 'Accountant User',
                'email' => 'accountant@example.com',
                'role' => 'accountant',
            ],
        ];

        foreach ($users as $user) {
            User::create([
                'name' => $user['name'],
                'email' => $user['email'],
                'email_verified_at' => now(),
                'password' => Hash::make('password'), // mot de passe par défaut
                'role' => $user['role'],
                'remember_token' => Str::random(10),
            ]);
        }
    }
}
