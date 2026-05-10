<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rules\Password;

class AuthServiceProvider extends ServiceProvider
{
    // À utiliser plus tard si tu passes aux Policies
    protected $policies = [];

    public function boot(): void
    {
        $this->registerPolicies();

        /*
        |--------------------------------------------------------------------------
        | Gates par rôle
        |--------------------------------------------------------------------------
        */

        // ADMIN uniquement
        Gate::define('admin-action', function (User $user) {
            return $user->isAdmin();
        });

        // MANAGER (admin inclus)
        Gate::define('manager-action', function (User $user) {
            return $user->isAdmin() || $user->isManager();
        });

        // ACCOUNTANT (admin inclus)
        Gate::define('accountant-action', function (User $user) {
            return $user->isAdmin() || $user->isAccountant();
        });

        // DRIVER uniquement
        Gate::define('driver-action', function (User $user) {
            return $user->isDriver();
        });

        // MECHANIC (admin + manager + mechanic)
        Gate::define('mechanic-action', function (User $user) {
            return $user->isAdmin()
                || $user->isManager()
                || $user->role === 'mechanic';
        });

        // Accès à son propre compte OU admin
        Gate::define('access-user', function (User $auth, User $target) {
            return $auth->id === $target->id || $auth->isAdmin();
        });

        /*
        |--------------------------------------------------------------------------
        | Politique globale de mot de passe (TRÈS BIEN 👍)
        |--------------------------------------------------------------------------
        */

        Password::defaults(function () {
            return Password::min(8)
                ->mixedCase()     // majuscule + minuscule
                ->numbers()       // chiffre
                ->symbols()       // caractère spécial
                ->uncompromised(); // pas dans les bases de mots de passe piratés
        });
    }
}
