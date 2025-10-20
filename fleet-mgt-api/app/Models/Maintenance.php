<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Maintenance extends Model
{
    protected $fillable = [
        'vehicle_id',
        'driver_id',
        'maintenance_type',
        'maintenance_company',
        'scheduled_date',
        'completed_date',
        'cost',
        'description',
        'status'
    ];

    protected $casts = [
        'scheduled_date' => 'datetime',
        'completed_date' => 'datetime',
        'cost' => 'decimal:2',
    ];

    // Relation avec le véhicule
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    // Relation avec le conducteur
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    // Vérifier si la maintenance est en retard
    public function isOverdue(): bool
    {
        return $this->status === 'planned' &&
               now()->gt($this->scheduled_date);
    }

    // Marquer comme complétée
    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'completed_date' => now()
        ]);
    }
}
