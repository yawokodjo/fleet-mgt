<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        // Récupère la langue depuis la requête, sinon 'en' par défaut
        $locale = $request->get('lang', 'en');

        // Définit la langue pour cette requête
        App::setLocale($locale);

        return response()->json([
            'message' => __('messages.welcome'), // Va chercher dans lang/en/messages.php ou lang/fr/messages.php
        ]);
    }
}

