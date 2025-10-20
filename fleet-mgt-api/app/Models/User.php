<?php

namespace App\Models;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory; 

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes, HasFactory; 

    protected $fillable = [
        'name',
        'email',
        'password',
        'role'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

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

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'current_driver_id');
    }
}

