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
        Schema::create('maintenances', function(Blueprint $table) {
                $table->id();

                // Référence au véhicule
                $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete();

                // Référence au conducteur (optionnelle)
                $table->foreignId('driver_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

                $table->enum('maintenance_type', array(
                        'vidange',
                        'pneus',
                        'freins',
                        'batterie',
                        'révision',
                        'carrosserie',
                        'électricité',
                        'climatisation',
                        'autre',
                    ));

                $table->string('maintenance_company');
                $table->dateTime('scheduled_date')->comment('Date prévue');
                $table->dateTime('completed_date')->nullable()->comment('Date réalisée');
                $table->decimal('cost', 10, 2)->comment('Coût en FCFA');
                $table->text('description')->nullable();
                $table->enum('status', array('planned', 'in_progress', 'completed', 'cancelled'))->default('planned');
                $table->timestamps();

                // Index pour les recherches
                $table->index('scheduled_date');
                $table->index('status');
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenances');
    }
};
