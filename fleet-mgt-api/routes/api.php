<?php

use App\Http\Controllers\{
    AuthController,
    ConsumptionController,
    MaintenanceController,
    ReportController,
    UserController,
    VehicleController
};
use App\Http\Controllers\Auth\PasswordResetController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MessageController;

// Route publique simple
Route::get('/message', [MessageController::class, 'index']);

// Routes publiques pour l'authentification
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);
Route::get('/reset-password/{token}', function ($token) {
    return view('auth.reset-password', ['token' => $token]);
})->name('password.reset');

// Routes protégées (nécessitent auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Utilisateurs
    Route::apiResource('users', UserController::class);
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::get('/drivers', [UserController::class, 'drivers']); // Liste des chauffeurs seulement

    // Véhicules
    Route::apiResource('vehicles', VehicleController::class);
    Route::post('/vehicles/{vehicle}/assign-driver', [VehicleController::class, 'assignDriver']);
    Route::put('/vehicles/{vehicle}/update-mileage', [VehicleController::class, 'updateMileage']);
    Route::get('/vehicles-details/{vehicle}', [VehicleController::class, 'detailsVehicle']);
    Route::get('/vehicles-list', [VehicleController::class, 'list']); // Liste des véhicules

    // Consommations
    Route::apiResource('consumptions', ConsumptionController::class);
    Route::get('/vehicles/{vehicle}/consumption-report', [ConsumptionController::class, 'vehicleReport']);
    Route::get('/consumptions/{id}', [ConsumptionController::class, 'show']);
    Route::put('/consumptions/{id}', [ConsumptionController::class, 'update']);

    // Maintenances
    Route::apiResource('maintenances', MaintenanceController::class);
    Route::post('/maintenances/{maintenance}/complete', [MaintenanceController::class, 'markAsCompleted']);
    Route::get('/maintenances/{id}', [MaintenanceController::class, 'show']);
    Route::put('/maintenances/{id}', [MaintenanceController::class, 'update']);
    // Rapports
    Route::apiResource('reports', ReportController::class);
    Route::post('/reports/generate', [ReportController::class, 'generateReport']);
    Route::get('/reports/monthly-consumption', [ReportController::class, 'monthlyConsumptionReport']);
    Route::get('/reports/export-monthly', [ReportController::class, 'exportMonthlyReport']);
});
