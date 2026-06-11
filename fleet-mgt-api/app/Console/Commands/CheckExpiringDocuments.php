<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Vehicle;
use App\Notifications\DocumentExpiringNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckExpiringDocuments extends Command
{
    protected $signature = 'vehicles:check-documents {--days=30 : Nombre de jours avant expiration}';

    protected $description = 'Envoie un email pour chaque véhicule avec un document expirant dans les N jours';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $today = now()->startOfDay();
        $threshold = now()->addDays($days)->endOfDay();

        $vehicles = Vehicle::whereNotNull('license_plate')->get();

        $docFields = [
            'insurance_expiry' => 'Assurance',
            'technical_inspection_expiry' => 'Visite technique',
            'tvm_expiry' => 'TVM',
        ];

        $recipients = User::whereIn('role', ['admin', 'manager'])
            ->whereNotNull('email')
            ->get();

        if ($recipients->isEmpty()) {
            $this->warn('Aucun administrateur ou manager trouvé.');

            return self::SUCCESS;
        }

        $sent = 0;

        foreach ($vehicles as $vehicle) {
            $expiring = [];

            foreach ($docFields as $field => $label) {
                $expiry = $vehicle->$field;

                if (! $expiry) {
                    continue;
                }

                // Expiré ou expire dans les N jours
                if ($expiry->lte($threshold)) {
                    $daysLeft = (int) $today->diffInDays($expiry, false);
                    $expiring[] = [
                        'label' => $label,
                        'expiry' => $expiry->format('d/m/Y'),
                        'days' => $daysLeft,
                    ];
                }
            }

            if (empty($expiring)) {
                continue;
            }

            $notification = new DocumentExpiringNotification($vehicle, $expiring);

            foreach ($recipients as $user) {
                try {
                    $user->notify($notification);
                    $sent++;
                } catch (\Exception $e) {
                    Log::error("Document expiry notification failed for user {$user->id}: ".$e->getMessage());
                }
            }

            $plate = $vehicle->license_plate;
            $labels = implode(', ', array_column($expiring, 'label'));
            $this->line("  ✓ {$plate} — {$labels}");
        }

        $this->info("Terminé. {$sent} email(s) envoyé(s).");

        return self::SUCCESS;
    }
}
