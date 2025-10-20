<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{
    Model,
    Relations\BelongsTo
};

/**
 *
 */
class Vehicle extends Model
{
    /**
     * @var
     */
    protected $fillable = array(
        'marque',
        'model',
        'license_plate',
        'year',
        'fuel_type',
        'fuel_card',
        'mileage',
        'status',
        'current_driver_id',
    );

    /**
     * @var
     */
    protected $casts = array(
        'year' => 'integer',
    );

    // Relation avec le conducteur actuel
    /**
     *
     */
    public function currentDriver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'current_driver_id');
    }

    // Relation avec les consommations
    /**
     *
     */
    public function consumptions()
    {
        return $this->hasMany(Consumption::class);
    }

    // Relation avec les rapports
    /**
     *
     */
    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    // Vérifier si le véhicule est opérationnel
    /**
     *
     */
    public function isOperational(): bool
    {
        return $this->status === 'operational';
    }
}
