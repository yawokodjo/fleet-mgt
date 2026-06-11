<?php

namespace App\Notifications;

use App\Models\Vehicle;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentExpiringNotification extends Notification
{
    /** @param array<array{label: string, expiry: string, days: int}> $documents */
    public function __construct(
        public Vehicle $vehicle,
        public array $documents
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

        $mail = (new MailMessage)
            ->subject("⚠️ Document(s) expirant bientôt — {$plate}")
            ->greeting('Bonjour,')
            ->line("Les documents suivants du véhicule **{$marque}** ({$plate}) arrivent à expiration :");

        foreach ($this->documents as $doc) {
            $urgence = $doc['days'] <= 0
                ? "❌ **EXPIRÉ** le {$doc['expiry']}"
                : "⚠️ Expire dans **{$doc['days']} jour(s)** ({$doc['expiry']})";
            $mail->line("• **{$doc['label']}** — {$urgence}");
        }

        return $mail
            ->action('Voir le véhicule', "{$appUrl}/vehicles/{$this->vehicle->id}")
            ->line('Merci de renouveler ces documents au plus vite.')
            ->line("— {$appName}");
    }
}
