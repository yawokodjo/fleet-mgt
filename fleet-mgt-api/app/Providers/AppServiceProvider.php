<?php

namespace App\Providers;

use App\Models\Consumption;
use App\Observers\ConsumptionObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Consumption::observe(ConsumptionObserver::class);
    }
}
