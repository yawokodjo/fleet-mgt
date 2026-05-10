import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../axios';

export default function UserForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'driver'
    });

    const [loading, setLoading] = useState(false);
    const [loadingUser, setLoadingUser] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});

    // Charger les données de l'utilisateur en mode édition
    useEffect(() => {
        if (isEditMode) {
            fetchUser();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchUser = async () => {
        setLoadingUser(true);
        try {
            const response = await api.get(`/users/${id}`);
            const user = response.data.data || response.data.user || response.data;
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                password_confirmation: '',
                role: user.role || 'driver'
            });
        } catch (err) {
            console.error('Erreur chargement utilisateur:', err);
            setError('Erreur lors du chargement des données utilisateur');
        } finally {
            setLoadingUser(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Effacer l'erreur du champ modifié
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Le nom est requis';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format d\'email invalide';
        }

        if (!isEditMode) {
            // Mot de passe obligatoire en création
            if (!formData.password) {
                newErrors.password = 'Le mot de passe est requis';
            } else if (formData.password.length < 8) {
                newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
            }

            if (formData.password !== formData.password_confirmation) {
                newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
            }
        } else {
            // En édition, vérifier seulement si un mot de passe est fourni
            if (formData.password && formData.password.length < 8) {
                newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
            }

            if (formData.password && formData.password !== formData.password_confirmation) {
                newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
            }
        }

        if (!formData.role) {
            newErrors.role = 'Le rôle est requis';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setSuccess('');
        setError('');

        try {
            // Préparer les données à envoyer
            const dataToSend = { ...formData };

            // En mode édition, ne pas envoyer le mot de passe s'il est vide
            if (isEditMode && !dataToSend.password) {
                delete dataToSend.password;
                delete dataToSend.password_confirmation;
            }

            if (isEditMode) {
                await api.put(`/users/${id}`, dataToSend);
                setSuccess('✅ Utilisateur modifié avec succès !');
            } else {
                await api.post('/users', dataToSend);
                setSuccess('✅ Utilisateur créé avec succès !');
            }

            setTimeout(() => {
                navigate('/users');
            }, 1500);
        } catch (err) {
            console.error('Erreur:', err);

            if (err.response?.status === 422) {
                // Erreurs de validation Laravel
                const backendErrors = err.response.data.errors || {};
                setErrors(backendErrors);
                setError('Veuillez corriger les erreurs dans le formulaire');
            } else if (err.response?.status === 403) {
                setError('Vous n\'avez pas les permissions nécessaires');
            } else {
                setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
            }
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { value: 'admin', label: '👑 Administrateur', icon: '👑', color: '#dc3545' },
        { value: 'manager', label: '👨‍💼 Gestionnaire', icon: '👨‍💼', color: '#0d6efd' },
        { value: 'driver', label: '🚗 Chauffeur', icon: '🚗', color: '#198754' },
        { value: 'accountant', label: '📊 Comptable', icon: '📊', color: '#0dcaf0' }
    ];

    if (loadingUser) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            paddingTop: '2rem',
            paddingBottom: '3rem'
        }}>
            <Container>
                <Row className="justify-content-center">
                    <Col lg={8} xl={6}>
                        {/* En-tête */}
                        <div className="mb-4">
                            <Button
                                variant="light"
                                size="sm"
                                onClick={() => navigate('/users')}
                                className="mb-3 shadow-sm"
                                style={{ borderRadius: '20px' }}
                            >
                                <span className="me-2">←</span>
                                Retour à la liste
                            </Button>
                            <h1 className="text-white fw-bold mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                                {isEditMode ? '✏️ Modifier l\'utilisateur' : '➕ Nouvel utilisateur'}
                            </h1>
                            <p className="text-white opacity-75 mb-0">
                                {isEditMode ? 'Modifiez les informations de l\'utilisateur' : 'Créez un nouveau compte utilisateur'}
                            </p>
                        </div>

                        {/* Messages */}
                        {success && (
                            <Alert variant="success" className="shadow-sm" style={{ borderRadius: '15px' }}>
                                {success}
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="danger" className="shadow-sm" style={{ borderRadius: '15px' }}>
                                ❌ {error}
                            </Alert>
                        )}

                        {/* Formulaire */}
                        <Card
                            className="border-0 shadow-lg"
                            style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '20px'
                            }}
                        >
                            <Card.Body className="p-5">
                                <Form onSubmit={handleSubmit}>
                                    <Row className="g-4">
                                        {/* Nom complet */}
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                                                    <span style={{ fontSize: '1.2rem' }}>👤</span>
                                                    Nom complet <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Ex: Jean Dupont"
                                                    disabled={loading}
                                                    isInvalid={!!errors.name}
                                                    size="lg"
                                                    style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.name}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                        {/* Email */}
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                                                    <span style={{ fontSize: '1.2rem' }}>📧</span>
                                                    Adresse email <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="exemple@email.com"
                                                    disabled={loading}
                                                    isInvalid={!!errors.email}
                                                    size="lg"
                                                    style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                                <Form.Text className="text-muted d-flex align-items-center gap-1 mt-2">
                                                    <span>ℹ️</span>
                                                    Utilisé pour la connexion au système
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        {/* Rôle */}
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                                                    <span style={{ fontSize: '1.2rem' }}>🎭</span>
                                                    Rôle <span className="text-danger">*</span>
                                                </Form.Label>
                                                <div className="d-flex flex-column gap-2">
                                                    {roles.map((role) => (
                                                        <div
                                                            key={role.value}
                                                            className="p-3 rounded"
                                                            style={{
                                                                border: formData.role === role.value
                                                                    ? `2px solid ${role.color}`
                                                                    : '2px solid #e9ecef',
                                                                background: formData.role === role.value
                                                                    ? `${role.color}15`
                                                                    : 'white',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                                                        >
                                                            <Form.Check
                                                                type="radio"
                                                                name="role"
                                                                id={`role-${role.value}`}
                                                                label={role.label}
                                                                value={role.value}
                                                                checked={formData.role === role.value}
                                                                onChange={handleChange}
                                                                disabled={loading}
                                                                className="fw-semibold"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                {errors.role && (
                                                    <div className="text-danger small mt-2">{errors.role}</div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        {/* Mot de passe */}
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                                                    <span style={{ fontSize: '1.2rem' }}>🔒</span>
                                                    Mot de passe {!isEditMode && <span className="text-danger">*</span>}
                                                </Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    placeholder={isEditMode ? "Laisser vide pour ne pas changer" : "Minimum 8 caractères"}
                                                    disabled={loading}
                                                    isInvalid={!!errors.password}
                                                    size="lg"
                                                    style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.password}
                                                </Form.Control.Feedback>
                                                {isEditMode && (
                                                    <Form.Text className="text-muted d-flex align-items-center gap-1 mt-2">
                                                        <span>ℹ️</span>
                                                        Laissez vide si vous ne souhaitez pas modifier le mot de passe
                                                    </Form.Text>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        {/* Confirmation mot de passe */}
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                                                    <span style={{ fontSize: '1.2rem' }}>🔒</span>
                                                    Confirmer le mot de passe {!isEditMode && <span className="text-danger">*</span>}
                                                </Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    name="password_confirmation"
                                                    value={formData.password_confirmation}
                                                    onChange={handleChange}
                                                    placeholder="Retapez le mot de passe"
                                                    disabled={loading}
                                                    isInvalid={!!errors.password_confirmation}
                                                    size="lg"
                                                    style={{ borderRadius: '12px', border: '2px solid #e9ecef' }}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.password_confirmation}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Boutons d'action */}
                                    <div className="d-flex gap-3 mt-5 flex-wrap">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={loading}
                                            style={{
                                                borderRadius: '12px',
                                                padding: '12px 30px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none',
                                                fontWeight: '600'
                                            }}
                                            className="shadow-sm"
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                        className="me-2"
                                                    />
                                                    Enregistrement...
                                                </>
                                            ) : (
                                                <>
                                                    {isEditMode ? '💾 Enregistrer les modifications' : '✅ Créer l\'utilisateur'}
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            type="button"
                                            size="lg"
                                            variant="outline-secondary"
                                            onClick={() => navigate('/users')}
                                            disabled={loading}
                                            style={{
                                                borderRadius: '12px',
                                                padding: '12px 30px',
                                                fontWeight: '600',
                                                borderWidth: '2px'
                                            }}
                                        >
                                            ↩️ Annuler
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* Informations de sécurité */}
                        <Card
                            className="mt-4 border-0"
                            style={{
                                background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.9) 0%, rgba(245, 87, 108, 0.9) 100%)',
                                borderRadius: '20px'
                            }}
                        >
                            <Card.Body className="p-4 text-white">
                                <h6 className="fw-bold mb-3">🔐 Conseils de sécurité</h6>
                                <ul className="mb-0 small">
                                    <li>Utilisez un mot de passe d'au moins 8 caractères</li>
                                    <li>Mélangez majuscules, minuscules, chiffres et symboles</li>
                                    <li>Ne partagez jamais vos identifiants</li>
                                    <li>Changez régulièrement votre mot de passe</li>
                                </ul>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}