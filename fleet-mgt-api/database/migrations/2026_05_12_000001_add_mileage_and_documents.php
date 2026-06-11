<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consumptions', function (Blueprint $table) {
            $table->unsignedInteger('mileage')->nullable()->after('fuel_cost')
                ->comment('Kilométrage compteur au moment du plein');
            $table->string('document_path')->nullable()->after('mileage')
                ->comment('Reçu de carburant (chemin fichier)');
        });

        Schema::table('maintenances', function (Blueprint $table) {
            $table->unsignedInteger('mileage_at_service')->nullable()->after('cost')
                ->comment('Kilométrage compteur au moment de l\'entretien');
            $table->string('document_path')->nullable()->after('mileage_at_service')
                ->comment('Facture proforma/reçu (chemin fichier)');
        });

        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('document_path')->nullable()->after('mileage')
                ->comment('Facture d\'achat (chemin fichier)');
        });
    }

    public function down(): void
    {
        Schema::table('consumptions', function (Blueprint $table) {
            $table->dropColumn(['mileage', 'document_path']);
        });
        Schema::table('maintenances', function (Blueprint $table) {
            $table->dropColumn(['mileage_at_service', 'document_path']);
        });
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn('document_path');
        });
    }
};
