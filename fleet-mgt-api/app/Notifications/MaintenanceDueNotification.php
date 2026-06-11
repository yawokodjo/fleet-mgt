<?php

namespace App\Notifications;

use App\Models\Vehicle;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MaintenanceDueNotification extends Notification
{
    public function __construct(
        public Vehicle $vehicle,
        public int $kmSinceLast
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = config('app.name', 'Gestion de Flotte');
        $appUrl = config('app.frontend_url', config('app.url'));
        $plate = $this->vehicle->license_plate;
        $marque = "{$this->vehicle->marque} {$this->vehicle->model}";
        $km = number_format($this->kmSinceLast, 0, ',', ' ');
        $mileage = number_format($this->vehicle->mileage ?? 0, 0, ',', ' ');

        return (new MailMessage)
            ->subject("🔧 Maintenance requise — {$plate}")
            ->greeting('Bonjour,')
            ->line("Le véhicule **{$marque}** ({$plate}) a parcouru **{$km} km** depuis sa dernière maintenance.")
            ->line("Kilométrage actuel : **{$mileage} km**")
            ->line('Une maintenance est recommandée tous les 5 000 km. Merci de planifier une intervention.')
            ->action('Planifier la maintenance', "{$appUrl}/maintenances/create")
            ->line("— {$appName}");
    }
}
