<?php

use Illuminate\Database\{
    Migrations\Migration,
    Schema\Blueprint
};
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('consumptions', function(Blueprint $table) {
                $table->id();

                // Référence au véhicule
                $table->foreignId('vehicle_id')
                ->nullable()
                ->constrained('vehicles')
                ->nullOnDelete();

                // Référence au conducteur
                $table->foreignId('driver_id')
                ->nullable()

                ->constrained('users')  // Utilisation de la table 'users'
                ->nullOnDelete();

                $table->dateTime('date');         // Date du plein
                $table->decimal('fuel_volume', 8, 2);  // Volume en litres (précision: 8 chiffres au total, 2 décimales)
                $table->decimal('fuel_cost', 10, 2);   // Coût en FCFA (précision: 10 chiffres au total, 2 décimales)
                $table->timestamps();

                // Index pour améliorer les performances
                $table->index('date');
                $table->index('vehicle_id');
                $table->index('driver_id');
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consumptions');
    }
};
