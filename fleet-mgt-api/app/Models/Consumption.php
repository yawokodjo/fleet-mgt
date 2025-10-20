<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{
    Model,
    Relations\BelongsTo
};

/**
 *
 */
class Consumption extends Model
{
    /**
     * @var
     */
    protected $fillable = [
        'vehicle_id',
        'driver_id',
        'date',
        'fuel_volume',
        'fuel_cost',
];

    /**
     * @var
     */
    protected $casts = [
        'date' => 'datetime',
        'fuel_volume' => 'decimal:2',
        'fuel_cost' => 'decimal:2',
    ];

    // Relation avec le véhicule
    /**
     *
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    // Relation avec le conducteur
    /**
     *
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    // Calcul du coût au litre
    /**
     *
     */
    public function costPerLiter(): float
    {
        if ($this->fuel_volume > 0) {
            return $this->fuel_cost / (float) $this->fuel_volume;
        }
        return 0;
    }
}
