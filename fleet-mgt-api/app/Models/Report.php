<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{
    Model,
    Relations\BelongsTo
};

/**
 *
 */
class Report extends Model
{
    /**
     * @var
     */
    protected $fillable = array(
        'manager_id',
        'vehicle_id',
        'maintenance_id',
        'consumption_id',
        'date',
        'report_type',
        'title',
        'content',
        'metadata',
    );

    /**
     * @var
     */
    protected $casts = array(
        'date' => 'date',
        'metadata' => 'array',
    );

    // Relation avec le gestionnaire
    /**
     *
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    // Relation avec le véhicule
    /**
     *
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    // Relation avec la maintenance
    /**
     *
     */
    public function maintenance(): BelongsTo
    {
        return $this->belongsTo(Maintenance::class);
    }

    // Relation avec la consommation
    /**
     *
     */
    public function consumption(): BelongsTo
    {
        return $this->belongsTo(Consumption::class);
    }

    // Formater le type de rapport
    /**
     *
     */
    public function getReportTypeNameAttribute(): string
    {
        return match($this->report_type) {
            'monthly_summary' => 'Résumé Mensuel',
            'vehicle_performance' => 'Performance des Véhicules',
            'fuel_consumption' => 'Consommation de Carburant',
            'maintenance_costs' => 'Coûts de Maintenance',
            'driver_activity' => 'Activité des Conducteurs',
            'financial_report' => 'Rapport Financier',
            'incident_report' => 'Rapport d\'Incident',
            default => 'Autre Rapport'
        };
    }
}
