<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('marque'); 
            $table->string('model'); 
            $table->string('license_plate')->unique(); 
            $table->year('year'); 
            $table->enum('fuel_type', ['essence','diesel','hybride','électrique','gpl','autre']); 
            $table->string('fuel_card')->nullable(); 
            $table->unsignedInteger('mileage')->default(0); 
            $table->enum('status', ['operational','maintenance','out_of_service'])->default('operational'); 
            $table->foreignId('current_driver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
