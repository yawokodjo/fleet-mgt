<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Kwame Adama',     'email' => 'admin@citg.tg',      'role' => 'admin'],
            ['name' => 'Kossi Mensah',    'email' => 'mensah@citg.tg',     'role' => 'manager'],
            ['name' => 'Afi Dossou',      'email' => 'dossou@citg.tg',     'role' => 'manager'],
            ['name' => 'Edem Agbeko',     'email' => 'agbeko@citg.tg',     'role' => 'driver'],
            ['name' => 'Kodjo Attiogbe', 'email' => 'attiogbe@citg.tg',   'role' => 'driver'],
            ['name' => 'Yao Kpodzro',    'email' => 'kpodzro@citg.tg',    'role' => 'driver'],
            ['name' => 'Abla Soglo',     'email' => 'soglo@citg.tg',      'role' => 'driver'],
            ['name' => 'Mawuli Kpoti',   'email' => 'kpoti@citg.tg',      'role' => 'accountant'],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'email_verified_at' => now(),
                    'password' => Hash::make('fleet123'),
                    'role' => $data['role'],
                    'remember_token' => Str::random(10),
                ]
            );
        }
    }
}
