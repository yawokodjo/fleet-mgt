<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modèle Report - Gestion des rapports du système
 *
 * @property int $id
 * @property int $manager_id
 * @property int|null $vehicle_id
 * @property int|null $maintenance_id
 * @property int|null $consumption_id
 * @property string $date
 * @property string $report_type
 * @property string $title
 * @property string $content
 * @property array|null $metadata
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Report extends Model
{
    use HasFactory;

    /**
     * Les attributs assignables en masse
     *
     * @var array<string>
     */
    protected $fillable = [
        'manager_id',
        'vehicle_id',
        'maintenance_id',
        'consumption_id',
        'date',
        'report_type',
        'title',
        'content',
        'metadata',
    ];

    /**
     * Les attributs qui doivent être castés
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Types de rapports disponibles
     *
     * @var array<string, string>
     */
    public const REPORT_TYPES = [
        'monthly_summary' => 'Résumé Mensuel',
        'vehicle_performance' => 'Performance des Véhicules',
        'fuel_consumption' => 'Consommation de Carburant',
        'maintenance_costs' => 'Coûts de Maintenance',
        'driver_activity' => 'Activité des Conducteurs',
        'financial_report' => 'Rapport Financier',
        'incident_report' => 'Rapport d\'Incident',
        'custom' => 'Rapport Personnalisé',
    ];

    /**
     * Relation avec le gestionnaire (User)
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Relation avec le véhicule
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Relation avec la maintenance
     */
    public function maintenance(): BelongsTo
    {
        return $this->belongsTo(Maintenance::class);
    }

    /**
     * Relation avec la consommation
     */
    public function consumption(): BelongsTo
    {
        return $this->belongsTo(Consumption::class);
    }

    /**
     * Obtenir le nom formaté du type de rapport
     */
    public function getReportTypeNameAttribute(): string
    {
        return self::REPORT_TYPES[$this->report_type] ?? 'Autre Rapport';
    }

    /**
     * Vérifier si le rapport appartient à un gestionnaire spécifique
     */
    public function belongsToManager(int $managerId): bool
    {
        return $this->manager_id === $managerId;
    }

    /**
     * Vérifier si le rapport concerne un véhicule spécifique
     */
    public function isForVehicle(int $vehicleId): bool
    {
        return $this->vehicle_id === $vehicleId;
    }

    /**
     * Scope pour filtrer par type de rapport
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('report_type', $type);
    }

    /**
     * Scope pour filtrer par plage de dates
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeBetweenDates($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope pour les rapports récents (30 derniers jours)
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRecent($query)
    {
        return $query->where('date', '>=', now()->subDays(30));
    }

    /**
     * Scope pour les rapports d'un gestionnaire
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByManager($query, int $managerId)
    {
        return $query->where('manager_id', $managerId);
    }

    /**
     * Obtenir tous les types de rapports disponibles
     *
     * @return array<string, string>
     */
    public static function getAvailableTypes(): array
    {
        return self::REPORT_TYPES;
    }

    /**
     * Formater la date pour l'affichage
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->date->format('d/m/Y');
    }

    /**
     * Vérifier si le rapport a des métadonnées
     */
    public function hasMetadata(): bool
    {
        return ! empty($this->metadata);
    }

    /**
     * Obtenir une valeur spécifique des métadonnées
     *
     * @param  mixed  $default
     * @return mixed
     */
    public function getMetadata(string $key, $default = null)
    {
        return $this->metadata[$key] ?? $default;
    }

    /**
     * Définir une valeur dans les métadonnées
     *
     * @param  mixed  $value
     */
    public function setMetadata(string $key, $value): void
    {
        $metadata = $this->metadata ?? [];
        $metadata[$key] = $value;
        $this->metadata = $metadata;
    }
}
