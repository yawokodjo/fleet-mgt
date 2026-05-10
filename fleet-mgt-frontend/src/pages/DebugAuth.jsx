import React, { useState } from 'react';
import api from '../axios';
import { useAuth } from '../context/AuthContext';

export default function DebugAuth() {
    const [debugInfo, setDebugInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const checkAuth = async () => {
        setLoading(true);
        try {
            const response = await api.get('/debug-auth');
            setDebugInfo(response.data);
        } catch (error) {
            setDebugInfo({
                error: true,
                message: error.response?.data?.message || error.message,
                status: error.response?.status
            });
        } finally {
            setLoading(false);
        }
    };

    const fixRole = async () => {
        setLoading(true);
        try {
            const response = await api.get('/fix-admin-role');
            alert('✅ Rôle corrigé ! Reconnectez-vous maintenant.');
            setDebugInfo(response.data);
        } catch (error) {
            alert('❌ Erreur : ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const testVehicleAccess = async () => {
        setLoading(true);
        try {
            const response = await api.get('/test-vehicle-access');
            setDebugInfo(response.data);
        } catch (error) {
            setDebugInfo({
                error: true,
                message: error.response?.data?.message || error.message,
                status: error.response?.status
            });
        } finally {
            setLoading(false);
        }
    };

    const testVehiclesList = async () => {
        setLoading(true);
        try {
            const response = await api.get('/vehicles');
            alert('✅ Succès ! Vous avez accès aux véhicules');
            setDebugInfo({ success: true, data: response.data });
        } catch (error) {
            alert('❌ Erreur 403 - Accès refusé');
            setDebugInfo({
                error: true,
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
                fullError: error.response?.data
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow">
                <div className="card-header bg-warning text-dark">
                    <h3 className="mb-0">🔧 Debug Authentification</h3>
                </div>
                <div className="card-body">
                    {/* Infos utilisateur du contexte */}
                    <div className="alert alert-info mb-4">
                        <h5>👤 Utilisateur dans le Context React</h5>
                        <pre className="mb-0">{JSON.stringify(user, null, 2)}</pre>
                    </div>

                    {/* Boutons de test */}
                    <div className="d-grid gap-2 mb-4">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={checkAuth}
                            disabled={loading}
                        >
                            {loading ? 'Chargement...' : '1️⃣ Vérifier l\'authentification'}
                        </button>

                        <button
                            className="btn btn-warning btn-lg"
                            onClick={fixRole}
                            disabled={loading}
                        >
                            {loading ? 'Chargement...' : '2️⃣ Corriger le rôle en Admin'}
                        </button>

                        <button
                            className="btn btn-info btn-lg"
                            onClick={testVehicleAccess}
                            disabled={loading}
                        >
                            {loading ? 'Chargement...' : '3️⃣ Tester l\'accès Véhicules'}
                        </button>

                        <button
                            className="btn btn-success btn-lg"
                            onClick={testVehiclesList}
                            disabled={loading}
                        >
                            {loading ? 'Chargement...' : '4️⃣ GET /vehicles (Test Final)'}
                        </button>
                    </div>

                    {/* Résultats */}
                    {debugInfo && (
                        <div className="mt-4">
                            <h5>📊 Résultats :</h5>
                            <div className="bg-dark text-light p-3 rounded" style={{ maxHeight: '500px', overflow: 'auto' }}>
                                <pre className="text-light mb-0">{JSON.stringify(debugInfo, null, 2)}</pre>
                            </div>

                            {/* Analyse automatique */}
                            {debugInfo['7️⃣ DIAGNOSTIC'] && (
                                <div className="alert alert-danger mt-3">
                                    <h6>🔍 Diagnostic automatique :</h6>
                                    <ul className="mb-0">
                                        {debugInfo['7️⃣ DIAGNOSTIC'].map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Verdict pour l'accès véhicules */}
                            {debugInfo.conclusion && (
                                <div className={`alert ${debugInfo.conclusion.can_access_vehicles ? 'alert-success' : 'alert-danger'} mt-3`}>
                                    <h6>{debugInfo.conclusion.verdict}</h6>
                                    <p className="mb-0">{debugInfo.conclusion.reason}</p>
                                    {debugInfo.solutions && (
                                        <div className="mt-2">
                                            <strong>Solutions :</strong>
                                            <ul className="mb-0">
                                                {Object.entries(debugInfo.solutions).map(([key, value]) => (
                                                    <li key={key}>{value}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="alert alert-secondary mt-4">
                        <h6>📝 Instructions :</h6>
                        <ol className="mb-0">
                            <li>Cliquez sur <strong>"1️⃣ Vérifier l'authentification"</strong> pour voir tous les détails</li>
                            <li>Si le rôle n'est pas "admin", cliquez sur <strong>"2️⃣ Corriger le rôle"</strong></li>
                            <li>Déconnectez-vous puis reconnectez-vous pour obtenir un nouveau token</li>
                            <li>Cliquez sur <strong>"3️⃣ Tester l'accès"</strong> pour vérifier les Gates</li>
                            <li>Cliquez sur <strong>"4️⃣ Test Final"</strong> pour tester GET /vehicles</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}