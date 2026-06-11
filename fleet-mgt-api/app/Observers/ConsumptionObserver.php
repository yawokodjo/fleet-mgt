<?php

namespace App\Observers;

use App\Models\Consumption;
use App\Models\User;
use App\Notifications\HighConsumptionNotification;
use App\Notifications\MaintenanceDueNotification;
use Illuminate\Support\Facades\Log;

class ConsumptionObserver
{
    /**
     * Appelé après chaque création d'une entrée de consommation.
     */
    public function created(Consumption $consumption): void
    {
        if (! $consumption->mileage || ! $consumption->vehicle_id) {
            return;
        }

        $this->checkHighConsumption($consumption);
        $this->checkMaintenanceDue($consumption);
    }

    // ── Surconsommation > 12 L/100 km ────────────────────────────────────────

    private function checkHighConsumption(Consumption $consumption): void
    {
        if (! $consumption->fuel_volume || $consumption->fuel_volume <= 0) {
            return;
        }

        // Consommation précédente du même véhicule (par kilométrage)
        $previous = Consumption::where('vehicle_id', $consumption->vehicle_id)
            ->where('mileage', '<', $consumption->mileage)
            ->whereNotNull('mileage')
            ->orderByDesc('mileage')
            ->first();

        if (! $previous || ! $previous->mileage) {
            return;
        }

        $kmDriven = $consumption->mileage - $previous->mileage;

        if ($kmDriven <= 0) {
            return;
        }

        $l100 = ((float) $consumption->fuel_volume / $kmDriven) * 100;

        if ($l100 > 12) {
            $this->notifyManagers(
                new HighConsumptionNotification(
                    $consumption->vehicle,
                    $l100,
                    $kmDriven,
                    (float) $consumption->fuel_volume
                )
            );
        }
    }

    // ── Maintenance tous les 5 000 km ─────────────────────────────────────────

    private function checkMaintenanceDue(Consumption $consumption): void
    {
        $vehicle = $consumption->vehicle;

        if (! $vehicle) {
            return;
        }

        // Dernière maintenance complète avec kilométrage enregistré
        $lastMaintenance = $vehicle->maintenances()
            ->where('status', 'completed')
            ->whereNotNull('mileage_at_service')
            ->orderByDesc('mileage_at_service')
            ->first();

        $baseKm = $lastMaintenance?->mileage_at_service ?? 0;
        $kmSinceLast = $consumption->mileage - $baseKm;

        if ($kmSinceLast < 5000) {
            return;
        }

        // Ne pas notifier s'il y a déjà une maintenance planifiée ou en cours
        $hasPending = $vehicle->maintenances()
            ->whereIn('status', ['planned', 'in_progress'])
            ->exists();

        if ($hasPending) {
            return;
        }

        $this->notifyManagers(
            new MaintenanceDueNotification($vehicle, $kmSinceLast)
        );
    }

    // ── Envoi aux admins + managers ───────────────────────────────────────────

    private function notifyManagers(object $notification): void
    {
        $recipients = User::whereIn('role', ['admin', 'manager'])
            ->whereNotNull('email')
            ->get();

        foreach ($recipients as $user) {
            try {
                $user->notify($notification);
            } catch (\Exception $e) {
                Log::error("Notification failed for user {$user->id}: ".$e->getMessage());
            }
        }
    }
}
