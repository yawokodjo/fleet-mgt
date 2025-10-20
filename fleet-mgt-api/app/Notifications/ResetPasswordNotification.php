<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        $url = "{$frontendUrl}/reset-password?token={$this->token}&email={$notifiable->getEmailForPasswordReset()}";

        return (new MailMessage)
            ->subject('Réinitialisation du mot de passe')
            ->line('Vous avez demandé à réinitialiser votre mot de passe.')
            ->action('Réinitialiser le mot de passe', $url)
            ->line('Si vous n\'avez pas demandé cela, ignorez cet email.');
    }
}
