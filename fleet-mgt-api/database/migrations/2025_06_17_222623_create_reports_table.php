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
        Schema::create('reports', function(Blueprint $table) {
                $table->id();

                // Référence au gestionnaire (créateur du rapport)
                $table->foreignId('manager_id')
                ->constrained('users')
                ->onDelete('cascade');

                // Référence optionnelle à un véhicule
                $table->foreignId('vehicle_id')
                ->nullable()
                ->constrained('vehicles')
                ->nullOnDelete();

                // Référence optionnelle à une maintenance
                $table->foreignId('maintenance_id')
                ->nullable()
                ->constrained('maintenances')
                ->nullOnDelete();

                // Référence optionnelle à une consommation
                $table->foreignId('consumption_id')
                ->nullable()
                ->constrained('consumptions')
                ->nullOnDelete();

                $table->date('date');
                $table->enum('report_type', array(
                        'monthly_summary',
                        'vehicle_performance',
                        'fuel_consumption',
                        'maintenance_costs',
                        'driver_activity',
                        'financial_report',
                        'incident_report',
                        'other',
                    ));

                $table->string('title');
                $table->longText('content');
                $table->json('metadata')->nullable()->comment('Données supplémentaires structurées');
                $table->timestamps();

                // Index pour les recherches
                $table->index('date');
                $table->index('report_type');
                $table->index('manager_id');
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
