<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->date('insurance_expiry')->nullable()->after('document_path');
            $table->date('technical_inspection_expiry')->nullable()->after('insurance_expiry');
            $table->date('tvm_expiry')->nullable()->after('technical_inspection_expiry');
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn(['insurance_expiry', 'technical_inspection_expiry', 'tvm_expiry']);
        });
    }
};
