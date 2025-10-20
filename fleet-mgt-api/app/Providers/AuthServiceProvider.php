<?php
// app/Providers/AuthServiceProvider.php
namespace App\Providers;
use Illuminate\Validation\Rules\Password;
use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
protected $policies = [];

public function boot()
{
$this->registerPolicies();

Gate::define('manager-action', fn ($user) => $user->isAdmin() || $user->isManager());
// Seuls les admins peuvent effectuer des actions administratives
Gate::define('admin-action', fn (User $user) => $user->isAdmin());

// Nouveaux rôles
Gate::define('accountant-action', fn ($user) => $user->isAdmin() || $user->isAccountant());
Gate::define('driver-action', fn ($user) => $user->isDriver());

 // Nouveau rôle pour les mécaniciens
 Gate::define('mechanic-action', fn ($user) =>
 $user->isAdmin() ||
 $user->isManager() ||
 $user->role === 'mechanic');
// L'utilisateur peut accéder/modifier son propre compte
Gate::define('access-user', fn (User $auth, User $target) =>
$auth->id === $target->id || $auth->isAdmin());
Password::defaults(function () {
    return Password::min(8)
        ->mixedCase()
        ->numbers()
        ->symbols()
        ->uncompromised(); // Vérifie contre les fuites de données connues
});


}
}
