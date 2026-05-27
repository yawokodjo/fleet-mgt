<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Vérification quotidienne des documents expirants (assurance, visite technique, TVM)
Schedule::command('vehicles:check-documents --days=30')->dailyAt('08:00');
