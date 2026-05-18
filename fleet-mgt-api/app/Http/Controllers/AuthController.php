<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\AccountLockedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    // NIST SP 800-63B : max 5 tentatives avant blocage
    private const MAX_ATTEMPTS = 5;

    // OWASP : blocage progressif (exponential backoff)
    private const BLOCK_DURATIONS = [
        1 => 5,        // 5 minutes
        2 => 30,       // 30 minutes
        3 => 120,      // 2 heures
        4 => 1440,     // 24 heures
    ];

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role'     => ['sometimes', 'in:admin,manager,driver,accountant'],
        ]);

        $user = User::create([
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'password'       => Hash::make($validated['password']),
            'role'           => $validated['role'] ?? 'driver',
            'login_attempts' => 0,
            'block_count'    => 0,
            'blocked_until'  => null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'         => $user,
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        // OWASP : message générique — ne pas révéler si l'email existe
        $user = User::where('email', $credentials['email'])->first();

        if (! $user) {
            return response()->json([
                'code'    => 'INVALID_CREDENTIALS',
                'message' => 'Email ou mot de passe incorrect.',
            ], 401);
        }

        // Compte bloqué de façon permanente (block_count >= 4)
        if ($user->block_count >= 4 && $user->blocked_until && now()->lessThan($user->blocked_until)) {
            return response()->json([
                'code'    => 'ACCOUNT_PERMANENTLY_LOCKED',
                'message' => 'Votre compte est bloqué définitivement. Contactez un administrateur.',
            ], 423);
        }

        // Compte temporairement bloqué
        if ($user->blocked_until && now()->lessThan($user->blocked_until)) {
            return response()->json([
                'code'              => 'ACCOUNT_BLOCKED',
                'message'           => 'Compte temporairement bloqué. Réessayez plus tard.',
                'blocked_until'     => $user->blocked_until,
                'remaining_seconds' => (int) now()->diffInSeconds($user->blocked_until),
            ], 423);
        }

        // Réinitialiser les tentatives si le blocage précédent a expiré
        if ($user->blocked_until && now()->greaterThanOrEqualTo($user->blocked_until)) {
            $user->login_attempts = 0;
            $user->blocked_until  = null;
        }

        if (! Hash::check($credentials['password'], $user->password)) {
            $user->login_attempts += 1;

            if ($user->login_attempts >= self::MAX_ATTEMPTS) {
                $user->block_count  += 1;
                $user->login_attempts = 0;

                $minutes = self::BLOCK_DURATIONS[$user->block_count]
                    ?? self::BLOCK_DURATIONS[4]; // permanent au-delà de 4

                $user->blocked_until = now()->addMinutes($minutes);
                $user->save();

                // OWASP : notifier l'utilisateur légitime par email
                $user->notify(new AccountLockedNotification($user->blocked_until, $user->block_count));

                $isPermanent = $user->block_count >= 4;

                return response()->json([
                    'code'              => 'ACCOUNT_BLOCKED',
                    'message'           => $isPermanent
                        ? 'Compte bloqué définitivement. Contactez un administrateur.'
                        : "Compte bloqué après {$user->block_count} blocage(s). Consultez votre email.",
                    'blocked_until'     => $isPermanent ? null : $user->blocked_until,
                    'remaining_seconds' => $isPermanent ? null : (int) now()->diffInSeconds($user->blocked_until),
                ], 423);
            }

            $user->save();

            $remaining = self::MAX_ATTEMPTS - $user->login_attempts;

            return response()->json([
                'code'               => 'INVALID_CREDENTIALS',
                'message'            => "Email ou mot de passe incorrect. Il vous reste {$remaining} tentative(s).",
                'remaining_attempts' => $remaining,
            ], 401);
        }

        // Connexion réussie — reset tentatives et blocage, block_count conservé (OWASP)
        $user->update([
            'login_attempts' => 0,
            'blocked_until'  => null,
        ]);

        Auth::login($user);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'         => $user,
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('vehicles'),
        ]);
    }
}
