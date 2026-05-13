<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * Champs modifiables en masse
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'login_attempts',
        'block_count',
        'blocked_until',
    ];

    /**
     * Champs cachés dans les réponses JSON
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts automatiques
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'blocked_until'     => 'datetime',
        'password'          => 'hashed',
    ];

    /* =====================================================
     |  MÉTHODES DE RÔLES (UTILISÉES PAR LES GATES)
     ===================================================== */

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isManager(): bool
    {
        return $this->role === 'manager';
    }

    public function isDriver(): bool
    {
        return $this->role === 'driver';
    }

    public function isAccountant(): bool
    {
        return $this->role === 'accountant';
    }

    public function isMechanic(): bool
    {
        return $this->role === 'mechanic';
    }

    /**
     * Vérifie si l'utilisateur a l'un des rôles donnés
     */
    public function hasRole(array|string $roles): bool
    {
        return in_array($this->role, (array) $roles, true);
    }

    /* =====================================================
     |  NOTIFICATIONS
     ===================================================== */

    /**
     * Envoi de notification de réinitialisation du mot de passe
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /* =====================================================
     |  RELATIONS
     ===================================================== */

    /**
     * Véhicules assignés au chauffeur
     */
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'current_driver_id');
    }
}
