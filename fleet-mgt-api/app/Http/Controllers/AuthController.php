<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\{
    Http\Request,
    Validation\Rules
};
use Illuminate\Support\Facades\{
    Auth,
    Hash
};

/**
 *
 */
class AuthController extends Controller
{
    /**
     * Enregistrer un nouvel utilisateur.
     */
    public function register(Request $request)
    {
        $validated = $request->validate(array(
                'name' => array('required', 'string', 'max:255'),
                'email' => array('required', 'email', 'max:255', 'unique:users,email'),
                'password' => array('required', 'confirmed', Rules\Password::defaults()),
                'role' => array('sometimes', 'in:admin,manager,driver,accountant'),
        ));

        $user = User::create(array(
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'] ?? 'driver',
        ));

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(array(
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ), 201);
    }

    /**
     * Authentifier un utilisateur et retourner un token.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate(array(
                'email' => array('required', 'email'),
                'password' => array('required'),
        ));

        if (!Auth::attempt($credentials)) {
            return response()->json(array('message' => 'Identifiants invalides'), 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(array(
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ));
    }

    /**
     * Déconnecter l’utilisateur (supprimer le token courant).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(array('message' => 'Déconnexion réussie'));
    }

    /**
     * Retourner les infos de l’utilisateur connecté, avec ses véhicules si besoin.
     */
    public function me(Request $request)
    {
        return response()->json(array(
                'user' => $request->user()->load('vehicles'),
            ));
    }
}
