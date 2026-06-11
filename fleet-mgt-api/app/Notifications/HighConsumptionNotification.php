<?php

namespace App\Notifications;

use App\Models\Vehicle;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class HighConsumptionNotification extends Notification
{
    public function __construct(
        public Vehicle $vehicle,
        public float $l100,
        public int $kmDriven,
        public float $liters
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
        $l100 = number_format($this->l100, 1, ',', ' ');
        $km = number_format($this->kmDriven, 0, ',', ' ');
        $liters = number_format($this->liters, 1, ',', ' ');

        return (new MailMessage)
            ->subject("⛽ Surconsommation détectée — {$plate}")
            ->greeting('Bonjour,')
            ->line("Une consommation anormalement élevée a été détectée sur le véhicule **{$marque}** ({$plate}).")
            ->line("Consommation mesurée : **{$l100} L/100 km** (seuil : 12 L/100 km)")
            ->line("Détail : **{$liters} L** consommés sur **{$km} km**")
            ->line('Cela peut indiquer un problème mécanique, une fuite ou un usage inadapté. Merci de vérifier le véhicule.')
            ->action('Voir les consommations', "{$appUrl}/consumptions")
            ->line("— {$appName}");
    }
}
