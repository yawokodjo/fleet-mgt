<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
       Schema::table('vehicles', function (Blueprint $table) {
    if (!Schema::hasColumn('vehicles', 'year')) {
        $table->year('year')->nullable()->after('license_plate');
    }
});

    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn('year');
        });
    }
};
