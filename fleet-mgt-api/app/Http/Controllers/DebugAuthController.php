<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

class DebugAuthController extends Controller
{
    /**
     * Endpoint pour vérifier TOUT ce qui concerne l'authentification
     * GET /api/debug-auth
     */
    public function debugAuth(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                '❌ ERREUR' => 'Aucun utilisateur authentifié',
                'solution' => 'Vérifiez que le token Bearer est bien présent dans le header Authorization'
            ], 401);
        }

        // Récupérer les données brutes de la base de données
        $userFromDb = DB::table('users')->where('id', $user->id)->first();

        $debug = [
            '1️⃣ UTILISATEUR AUTHENTIFIÉ' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],

            '2️⃣ RÔLE DANS L\'OBJET USER' => [
                'role' => $user->role ?? '❌ NULL',
                'type' => gettype($user->role),
            ],

            '3️⃣ RÔLE DANS LA BASE DE DONNÉES' => [
                'role' => $userFromDb->role ?? '❌ NULL',
                'type' => gettype($userFromDb->role ?? null),
            ],

            '4️⃣ MÉTHODES isAdmin()' => [
                'method_exists' => method_exists($user, 'isAdmin'),
                'result' => method_exists($user, 'isAdmin') ? $user->isAdmin() : '❌ Méthode n\'existe pas',
            ],

            '5️⃣ GATES' => [
                'admin-action' => [
                    'allowed' => Gate::allows('admin-action'),
                    'denied' => Gate::denies('admin-action'),
                ],
                'manager-action' => [
                    'allowed' => Gate::allows('manager-action'),
                    'denied' => Gate::denies('manager-action'),
                ],
                'accountant-action' => [
                    'allowed' => Gate::allows('accountant-action'),
                    'denied' => Gate::denies('accountant-action'),
                ],
            ],

            '6️⃣ TOKEN SANCTUM' => [
                'token_name' => $user->currentAccessToken()?->name,
                'tokenable_type' => $user->currentAccessToken()?->tokenable_type,
                'tokenable_id' => $user->currentAccessToken()?->tokenable_id,
            ],

            '7️⃣ DIAGNOSTIC' => [],
        ];

        // Diagnostic automatique
        if (!$user->role) {
            $debug['7️⃣ DIAGNOSTIC'][] = '❌ PROBLÈME: Le champ role est NULL dans la base de données';
            $debug['7️⃣ DIAGNOSTIC'][] = '✅ SOLUTION: Exécutez GET /api/fix-admin-role pour corriger';
        } elseif ($user->role !== 'admin') {
            $debug['7️⃣ DIAGNOSTIC'][] = "⚠️ PROBLÈME: Le rôle est '{$user->role}' au lieu de 'admin'";
            $debug['7️⃣ DIAGNOSTIC'][] = '✅ SOLUTION: Exécutez GET /api/fix-admin-role pour corriger';
        } elseif (!method_exists($user, 'isAdmin')) {
            $debug['7️⃣ DIAGNOSTIC'][] = '❌ PROBLÈME: La méthode isAdmin() n\'existe pas dans le modèle User';
            $debug['7️⃣ DIAGNOSTIC'][] = '✅ SOLUTION: Ajoutez les méthodes dans app/Models/User.php';
        } elseif (!$user->isAdmin()) {
            $debug['7️⃣ DIAGNOSTIC'][] = '❌ PROBLÈME: isAdmin() retourne false';
            $debug['7️⃣ DIAGNOSTIC'][] = '✅ SOLUTION: Vérifiez la logique de la méthode isAdmin()';
        } elseif (!Gate::allows('admin-action')) {
            $debug['7️⃣ DIAGNOSTIC'][] = '❌ PROBLÈME: Le Gate admin-action refuse l\'accès';
            $debug['7️⃣ DIAGNOSTIC'][] = '✅ SOLUTION: Vérifiez app/Providers/AuthServiceProvider.php';
        } else {
            $debug['7️⃣ DIAGNOSTIC'][] = '✅ TOUT EST OK ! L\'accès devrait fonctionner';
        }

        return response()->json($debug, 200);
    }

    /**
     * Corriger automatiquement le rôle admin
     * GET /api/fix-admin-role
     */
    public function fixAdminRole(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'Non authentifié'
            ], 401);
        }

        $oldRole = $user->role;
        
        // Mettre à jour le rôle
        $user->role = 'admin';
        $user->save();

        // Rafraîchir depuis la DB
        $user->refresh();

        return response()->json([
            '✅ SUCCÈS' => 'Rôle mis à jour avec succès',
            'ancien_role' => $oldRole ?? 'NULL',
            'nouveau_role' => $user->role,
            'user_id' => $user->id,
            'user_email' => $user->email,
            'verification' => [
                'isAdmin()' => method_exists($user, 'isAdmin') ? $user->isAdmin() : 'Méthode non disponible',
                'Gate admin-action' => Gate::allows('admin-action') ? '✅ Autorisé' : '❌ Refusé',
            ],
            'next_step' => 'Reconnectez-vous pour obtenir un nouveau token avec les bonnes permissions'
        ]);
    }

    /**
     * Tester l'accès aux véhicules
     * GET /api/test-vehicle-access
     */
    public function testVehicleAccess(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $results = [
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role ?? 'NULL',
            ],
            'access_tests' => []
        ];

        // Test manager-action
        $managerAllowed = Gate::allows('manager-action');
        $results['access_tests']['manager-action'] = [
            'allowed' => $managerAllowed,
            'status' => $managerAllowed ? '✅ AUTORISÉ' : '❌ REFUSÉ',
            'explanation' => 'Requis pour accéder à GET /api/vehicles',
        ];

        // Test accountant-action
        $accountantAllowed = Gate::allows('accountant-action');
        $results['access_tests']['accountant-action'] = [
            'allowed' => $accountantAllowed,
            'status' => $accountantAllowed ? '✅ AUTORISÉ' : '❌ REFUSÉ',
            'explanation' => 'Alternative pour accéder à GET /api/vehicles',
        ];

        // Test admin-action
        $adminAllowed = Gate::allows('admin-action');
        $results['access_tests']['admin-action'] = [
            'allowed' => $adminAllowed,
            'status' => $adminAllowed ? '✅ AUTORISÉ' : '❌ REFUSÉ',
            'explanation' => 'Requis pour supprimer des véhicules',
        ];

        // Conclusion
        $canAccessVehicles = $managerAllowed || $accountantAllowed;
        $results['conclusion'] = [
            'can_access_vehicles' => $canAccessVehicles,
            'verdict' => $canAccessVehicles 
                ? '✅ Vous DEVRIEZ pouvoir accéder à /api/vehicles'
                : '❌ Accès REFUSÉ à /api/vehicles',
            'reason' => $canAccessVehicles
                ? 'Au moins un gate requis est autorisé'
                : 'Aucun des gates requis (manager-action OU accountant-action) n\'est autorisé',
        ];

        if (!$canAccessVehicles) {
            $results['solutions'] = [
                '1' => 'Exécutez GET /api/fix-admin-role',
                '2' => 'Reconnectez-vous après avoir fixé le rôle',
                '3' => 'Vérifiez que AuthServiceProvider.php est bien configuré',
            ];
        }

        return response()->json($results);
    }

    /**
     * Vérifier la structure de la table users
     * GET /api/check-user-table
     */
    public function checkUserTable()
    {
        $columns = DB::select("DESCRIBE users");
        
        $hasRoleColumn = false;
        $roleColumnInfo = null;

        foreach ($columns as $column) {
            if ($column->Field === 'role') {
                $hasRoleColumn = true;
                $roleColumnInfo = $column;
                break;
            }
        }

        return response()->json([
            'table' => 'users',
            'has_role_column' => $hasRoleColumn,
            'role_column_info' => $roleColumnInfo,
            'all_columns' => $columns,
            'diagnostic' => $hasRoleColumn 
                ? '✅ La colonne role existe'
                : '❌ La colonne role n\'existe PAS - Vous devez créer une migration',
        ]);
    }
}

/**
 * ========================================
 * AJOUTEZ CES ROUTES DANS routes/api.php
 * ========================================
 */

/*

Route::middleware('auth:sanctum')->group(function () {
    // Routes de débogage
    Route::get('/debug-auth', [App\Http\Controllers\DebugAuthController::class, 'debugAuth']);
    Route::get('/fix-admin-role', [App\Http\Controllers\DebugAuthController::class, 'fixAdminRole']);
    Route::get('/test-vehicle-access', [App\Http\Controllers\DebugAuthController::class, 'testVehicleAccess']);
    Route::get('/check-user-table', [App\Http\Controllers\DebugAuthController::class, 'checkUserTable']);
});

*/

/**
 * ========================================
 * INSTRUCTIONS D'UTILISATION
 * ========================================
 * 
 * 1. Créez le fichier app/Http/Controllers/DebugAuthController.php
 * 2. Ajoutez les routes ci-dessus dans routes/api.php
 * 3. Connectez-vous normalement pour obtenir un token
 * 4. Testez ces endpoints dans l'ordre :
 * 
 *    GET /api/check-user-table
 *    → Vérifier que la colonne 'role' existe
 * 
 *    GET /api/debug-auth
 *    → Voir tous les détails de l'authentification
 * 
 *    GET /api/fix-admin-role
 *    → Corriger automatiquement le rôle en 'admin'
 * 
 *    POST /api/logout puis POST /api/login
 *    → Se reconnecter pour obtenir un nouveau token
 * 
 *    GET /api/test-vehicle-access
 *    → Vérifier que l'accès est maintenant autorisé
 * 
 *    GET /api/vehicles
 *    → Devrait maintenant fonctionner !
 */