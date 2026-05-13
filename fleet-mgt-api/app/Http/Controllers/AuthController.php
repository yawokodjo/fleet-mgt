<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    /**
     * Enregistrer un nouvel utilisateur
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['sometimes', 'in:admin,manager,driver,accountant'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? 'driver',
            'login_attempts' => 0,
            'block_count' => 0,
            'blocked_until' => null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Connexion avec sécurité renforcée
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        /** ❌ Utilisateur inexistant */
        if (! $user) {
            return response()->json([
                'code' => 'INVALID_PASSWORD',
                'message' => 'Email ou mot de passe incorrect',
            ], 401);
        }

        /** 🔒 Compte temporairement bloqué */
        if ($user->blocked_until && now()->lessThan($user->blocked_until)) {
            return response()->json([
                'code' => 'ACCOUNT_BLOCKED',
                'message' => 'Compte temporairement bloqué',
                'blocked_until' => $user->blocked_until,
                'remaining_seconds' => now()->diffInSeconds($user->blocked_until),
            ], 423);
        }

        /** ❌ Mauvais mot de passe */
        if (! Hash::check($credentials['password'], $user->password)) {

            $user->login_attempts += 1;

            // 🔴 3e tentative → blocage immédiat
            if ($user->login_attempts >= 3) {
                $user->blocked_until  = now()->addMinutes(5);
                $user->login_attempts = 0;
                $user->block_count   += 1;

                // 💣 2e blocage → suppression définitive du compte
                if ($user->block_count >= 2) {
                    $user->save();
                    $user->delete();

                    return response()->json([
                        'code'    => 'ACCOUNT_DELETED',
                        'message' => 'Votre compte a été désactivé suite à de trop nombreuses tentatives de connexion échouées. Veuillez contacter l\'administrateur.',
                    ], 403);
                }

                $user->save();

                return response()->json([
                    'code'              => 'ACCOUNT_BLOCKED',
                    'message'           => 'Compte temporairement bloqué après 3 tentatives échouées. Réessayez dans 5 minutes.',
                    'blocked_until'     => $user->blocked_until,
                    'remaining_seconds' => (int) now()->diffInSeconds($user->blocked_until),
                ], 423);
            }

            $user->save();

            $remaining = 3 - $user->login_attempts;

            return response()->json([
                'code'               => 'INVALID_PASSWORD',
                'message'            => "Mot de passe incorrect. Il vous reste {$remaining} tentative(s) avant le blocage du compte.",
                'remaining_attempts' => $remaining,
            ], 401);
        }

        /** ✅ Connexion réussie → reset sécurité */
        $user->update([
            'login_attempts' => 0,
            'blocked_until' => null,
            'block_count' => 0,
        ]);

        Auth::login($user);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie',
        ]);
    }

    /**
     * Infos utilisateur connecté
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('vehicles'),
        ]);
    }
}
