<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeUserAdmin extends Command
{
    protected $signature = 'user:make-admin {email}';

    protected $description = 'Passe un utilisateur en rôle admin';

    public function handle(): int
    {
        $email = $this->argument('email');

        $user = User::withTrashed()->where('email', $email)->first();

        if (! $user) {
            $this->error("Aucun utilisateur trouvé avec l'email : {$email}");
            return 1;
        }

        if ($user->trashed()) {
            $user->restore();
            $this->info("Compte restauré (il était soft-deleted).");
        }

        $user->role = 'admin';
        $user->login_attempts = 0;
        $user->blocked_until = null;
        $user->block_count = 0;
        $user->save();

        $this->info("✅ {$user->name} ({$email}) est maintenant admin.");
        return 0;
    }
}
