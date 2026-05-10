<?php

use App\Http\Controllers\{
    AuthController,
    ConsumptionController,
    MaintenanceController,
    ReportController,
    UserController,
    VehicleController,
    SearchController,
    MessageController
};
use App\Http\Controllers\Auth\PasswordResetController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ============================================================================
// ROUTES PUBLIQUES
// ============================================================================

// Messages et recherche
Route::get('/message', [MessageController::class, 'index']);
Route::get('/search', [SearchController::class, 'search']);

// Authentification
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);
Route::get('/reset-password/{token}', function ($token) {
    return view('auth.reset-password', ['token' => $token]);
})->name('password.reset');

// ============================================================================
// ROUTES PROTÉGÉES (Authentification requise)
// ============================================================================

Route::middleware('auth:sanctum')->group(function () {
    // ------------------------------------------------------------------------
    // Auth & Profil
    // ------------------------------------------------------------------------
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::put('/change-password', [UserController::class, 'changePassword']);
    // ------------------------------------------------------------------------
    // Utilisateurs
    // ------------------------------------------------------------------------
    Route::apiResource('users', UserController::class);
    Route::get('/drivers', [UserController::class, 'drivers']); // Liste des chauffeurs uniquement

    // ------------------------------------------------------------------------
    // Véhicules
    // ------------------------------------------------------------------------
    Route::apiResource('vehicles', VehicleController::class);
    Route::get('/vehicles-list', [VehicleController::class, 'list']); // Liste simple
    Route::get('/vehicles-details/{vehicle}', [VehicleController::class, 'detailsVehicle']); // Détails complets
    Route::post('/vehicles/{vehicle}/assign-driver', [VehicleController::class, 'assignDriver']);
    Route::put('/vehicles/{vehicle}/update-mileage', [VehicleController::class, 'updateMileage']);

    // ------------------------------------------------------------------------
    // Consommations
    // ------------------------------------------------------------------------
    Route::apiResource('consumptions', ConsumptionController::class);
    Route::get('/vehicles/{vehicle}/consumption-report', [ConsumptionController::class, 'vehicleReport']);

    // ------------------------------------------------------------------------
    // Maintenances
    // ------------------------------------------------------------------------
    Route::apiResource('maintenances', MaintenanceController::class);
    Route::post('/maintenances/{maintenance}/complete', [MaintenanceController::class, 'markAsCompleted']);

    // ------------------------------------------------------------------------
    // Rapports
    // ------------------------------------------------------------------------
    
    // Routes spécifiques AVANT apiResource pour éviter les conflits
    Route::prefix('reports')->group(function () {
        // Génération automatique de rapports
        Route::post('/generate', [ReportController::class, 'generateReport']);
        
        // Export de consommation (entre 2 dates)
        Route::get('/exportBetweenDates', [ReportController::class, 'exportBetweenDates']);
        
        // Export de maintenance (entre 2 dates)
        Route::get('/maintenanceBetweenDates', [ReportController::class, 'maintenanceBetweenDates']);
        
        // Routes héritées (à vérifier si utilisées)
        // Route::get('/monthly-consumption', [ReportController::class, 'monthlyConsumptionReport']);
        // Route::get('/export-monthly', [ReportController::class, 'exportMonthlyReport']);
    });
    
    // CRUD standard des rapports
    Route::apiResource('reports', ReportController::class);
});