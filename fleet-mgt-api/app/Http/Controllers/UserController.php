<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * Liste des utilisateurs (Admin uniquement)
     */
    public function index(Request $request)
    {
        Gate::authorize('admin-action');

        $perPage = $request->get('per_page', 15);
        $search  = $request->get('search', '');
        $role    = $request->get('role', '');

        $query = User::withTrashed();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role && $role !== 'all') {
            $query->where('role', $role);
        }

        return response()->json($query->paginate($perPage));
    }

    /**
     * Créer un utilisateur (Admin uniquement)
     */
    public function store(Request $request)
    {
        Gate::authorize('admin-action');

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => 'required|in:admin,manager,driver,accountant,mechanic',
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => $user,
        ], 201);
    }

    /**
     * Afficher un utilisateur
     */
    public function show($id)
    {
        $user = User::withTrashed()->findOrFail($id);

        Gate::authorize('access-user', $user);

        return response()->json([
            'user' => $user->load('vehicles'),
        ]);
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        Gate::authorize('access-user', $user);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => ['sometimes', 'confirmed', Password::defaults()],
            'role' => 'sometimes|in:admin,manager,driver,accountant,mechanic',
        ]);

        // Seul l'admin peut modifier le rôle
        if (isset($data['role']) && ! Gate::allows('admin-action')) {
            unset($data['role']);
        }

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Utilisateur mis à jour',
            'user' => $user,
        ]);
    }

    /**
     * Supprimer (soft delete) un utilisateur
     */
    public function destroy($id)
    {
        Gate::authorize('admin-action');

        User::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Utilisateur désactivé',
        ]);
    }

    /**
     * Restaurer un utilisateur supprimé
     */
    public function restore($id)
    {
        Gate::authorize('admin-action');

        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return response()->json([
            'message' => 'Utilisateur réactivé',
            'user' => $user,
        ]);
    }

    /**
     * Suppression définitive
     */
    public function forceDelete($id)
    {
        Gate::authorize('admin-action');

        User::withTrashed()->findOrFail($id)->forceDelete();

        return response()->json([
            'message' => 'Utilisateur supprimé définitivement',
        ]);
    }

    /**
     * Profil de l'utilisateur connecté
     */
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Mise à jour du profil personnel
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => ['sometimes', 'confirmed', Password::defaults()],
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => $user,
        ]);
    }

    /**
     * Changer le mot de passe
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Mot de passe actuel incorrect',
            ], 401);
        }

        if (Hash::check($request->new_password, $user->password)) {
            return response()->json([
                'message' => 'Le nouveau mot de passe doit être différent',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Mot de passe modifié avec succès',
        ]);
    }

    /**
     * Liste des chauffeurs
     */
    public function drivers()
    {
        return response()->json(
            User::where('role', 'driver')
                ->select('id', 'name')
                ->get()
        );
    }
}
