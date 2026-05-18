<?php

namespace App\Notifications;

use Carbon\Carbon;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountLockedNotification extends Notification
{
    public function __construct(
        private readonly Carbon $blockedUntil,
        private readonly int $blockCount,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $isPermanent = $this->blockCount >= 4;

        $message = (new MailMessage)
            ->subject('Alerte sécurité : accès à votre compte bloqué')
            ->greeting("Bonjour {$notifiable->name},")
            ->line('Plusieurs tentatives de connexion échouées ont été détectées sur votre compte.');

        if ($isPermanent) {
            $message
                ->line('Votre compte a été **bloqué définitivement** après de trop nombreuses tentatives.')
                ->line('Veuillez contacter un administrateur pour débloquer votre accès.');
        } else {
            $until = $this->blockedUntil->format('H\hi (d/m/Y)');
            $message
                ->line("Votre compte est temporairement bloqué jusqu'au **{$until}**.")
                ->line("C'est votre {$this->blockCount}e blocage. Un nouveau blocage entraînera une restriction plus longue.");
        }

        return $message
            ->line("Si vous n'êtes pas à l'origine de ces tentatives, contactez immédiatement un administrateur.")
            ->salutation('L\'équipe Fleet Management');
    }
}
