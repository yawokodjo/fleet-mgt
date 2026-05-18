<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vehicle extends Model
{
    protected $fillable = [
        'marque',
        'model',
        'license_plate',
        'year',
        'fuel_type',
        'fuel_card',
        'mileage',
        'status',
        'current_driver_id',
        'document_path',
        'insurance_expiry',
        'technical_inspection_expiry',
        'tvm_expiry',
    ];

    protected $casts = [
        'year'                        => 'integer',
        'insurance_expiry'            => 'date',
        'technical_inspection_expiry' => 'date',
        'tvm_expiry'                  => 'date',
    ];

    // Relation avec le conducteur actuel
    public function currentDriver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'current_driver_id');
    }

    // Relation avec les consommations
    public function consumptions()
    {
        return $this->hasMany(Consumption::class);
    }

    // Relation avec les rapports
    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    // Vérifier si le véhicule est opérationnel
    public function isOperational(): bool
    {
        return $this->status === 'operational';
    }
}
