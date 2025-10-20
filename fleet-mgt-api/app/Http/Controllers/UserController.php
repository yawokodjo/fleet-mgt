<?php
// app/Http/Controllers/UserController.php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    // Liste des utilisateurs (Admins seulement)
    public function index(Request $request)
    {
        if (!Gate::allows('admin-action')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $per_page = $request->get('per_page', 15);
        $users = User::withTrashed()->paginate($per_page);

        return response()->json($users);
    }

    // Création d’un utilisateur (Admins seulement)
    public function store(Request $request)
    {
        if (!Gate::allows('admin-action')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,manager,driver,accountant',
        ]);

        $data['password'] = bcrypt($data['password']);

        $user = User::create($data);

        return response()->json([
            'message' => 'Utilisateur créé',
            'user' => $user
        ], 201);
    }

    // Afficher un utilisateur
    public function show($id)
    {
        $user = User::withTrashed()->findOrFail($id);

        if (!Gate::allows('access-user', $user)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json(['user' => $user->load('vehicles')]);
    }

    // Mettre à jour un utilisateur
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if (!Gate::allows('access-user', $user)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:8',
            'role' => 'sometimes|in:admin,manager,driver,accountant',
        ]);

        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        // Seuls les admins peuvent modifier le rôle
        if (isset($data['role']) && !Gate::allows('admin-action')) {
            unset($data['role']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Utilisateur mis à jour',
            'user' => $user
        ]);
    }

    // Supprimer (soft delete) un utilisateur
    public function destroy($id)
    {
        if (!Gate::allows('admin-action')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Utilisateur désactivé']);
    }

    // Restaurer un utilisateur
    public function restore($id)
    {
        if (!Gate::allows('admin-action')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return response()->json([
            'message' => 'Utilisateur réactivé',
            'user' => $user
        ]);
    }

    // Supprimer définitivement
    public function forceDelete($id)
    {
        if (!Gate::allows('admin-action')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $user = User::withTrashed()->findOrFail($id);
        $user->forceDelete();

        return response()->json(['message' => 'Utilisateur supprimé définitivement'], 200);
    }
    // Récupérer le profil de l’utilisateur connecté
public function profile(Request $request)
{
    return response()->json($request->user());
}

// Mettre à jour son profil
public function updateProfile(Request $request)
{
    $user = $request->user();

    $data = $request->validate([
        'name' => 'required|string|max:255',
        'email' => [
            'required',
            'email',
            'max:255',
            Rule::unique('users')->ignore($user->id),
        ],
        'password' => 'sometimes|string|min:8',
    ]);

    if (isset($data['password'])) {
        $data['password'] = bcrypt($data['password']);
    }

    $user->update($data);

    return response()->json([
        'message' => 'Profil mis à jour avec succès !',
        'user' => $user
    ]);
}
//Trouver un chauffeur par son ID
public function drivers()
{
    return response()->json(\App\Models\User::where('role', 'driver')->select('id', 'name')->get());
}


}
