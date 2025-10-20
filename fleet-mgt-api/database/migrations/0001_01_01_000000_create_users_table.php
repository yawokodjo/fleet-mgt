<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_users_table.php
use Illuminate\Database\{
    Migrations\Migration,
    Schema\Blueprint
};
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     *
     */
    public function up(): void
    {
        Schema::create('users', function(Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->enum('role', array('admin', 'manager', 'driver', 'accountant'))->default('driver');
                $table->rememberToken();
                $table->timestamps();
                $table->softDeletes(); // Suppression douce
            });
    }

    /**
     *
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};