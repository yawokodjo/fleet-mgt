import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import api from '../axios';

export default function ChangePassword({ show, onHide }) {
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError('');
        setSuccess('');
    };

    const validateForm = () => {
        if (!formData.current_password) {
            setError('Le mot de passe actuel est requis');
            return false;
        }

        if (!formData.new_password) {
            setError('Le nouveau mot de passe est requis');
            return false;
        }

        if (formData.new_password.length < 8) {
            setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
            return false;
        }

        if (formData.new_password !== formData.new_password_confirmation) {
            setError('Les mots de passe ne correspondent pas');
            return false;
        }

        if (formData.current_password === formData.new_password) {
            setError('Le nouveau mot de passe doit être différent de l\'ancien');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.put('/change-password', formData);
            setSuccess('✅ Mot de passe modifié avec succès !');

            // Réinitialiser le formulaire
            setFormData({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });

            // Fermer la modal après 2 secondes
            setTimeout(() => {
                onHide();
                setSuccess('');
            }, 2000);

        } catch (err) {
            console.error('Erreur changement mot de passe:', err);

            if (err.response?.status === 422) {
                const errors = err.response.data.errors;
                const errorMessages = Object.values(errors).flat().join(', ');
                setError(errorMessages);
            } else if (err.response?.status === 401) {
                setError('Mot de passe actuel incorrect');
            } else {
                setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            current_password: '',
            new_password: '',
            new_password_confirmation: ''
        });
        setError('');
        setSuccess('');
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <Modal.Title className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: '1.5rem' }}>🔑</span>
                    Changer le mot de passe
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4 py-4">
                {success && (
                    <Alert variant="success" className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-center">
                            <span className="fs-4 me-3">✅</span>
                            <div>
                                <strong>Succès !</strong>
                                <p className="mb-0 small">{success}</p>
                            </div>
                        </div>
                    </Alert>
                )}

                {error && (
                    <Alert variant="danger" className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                        <div className="d-flex align-items-center">
                            <span className="fs-4 me-3">❌</span>
                            <div>
                                <strong>Erreur</strong>
                                <p className="mb-0 small">{error}</p>
                            </div>
                        </div>
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    {/* Mot de passe actuel */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                            Mot de passe actuel <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showCurrentPassword ? "text" : "password"}
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleChange}
                                placeholder="Entrez votre mot de passe actuel"
                                disabled={loading}
                                required
                                style={{
                                    borderRadius: '12px 0 0 12px',
                                    border: '2px solid #e9ecef',
                                    borderRight: 'none'
                                }}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                style={{
                                    borderRadius: '0 12px 12px 0',
                                    border: '2px solid #e9ecef',
                                    borderLeft: 'none'
                                }}
                            >
                                {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                            </Button>
                        </InputGroup>
                    </Form.Group>

                    {/* Nouveau mot de passe */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                            Nouveau mot de passe <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showNewPassword ? "text" : "password"}
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                                placeholder="Entrez votre nouveau mot de passe"
                                disabled={loading}
                                required
                                minLength={8}
                                style={{
                                    borderRadius: '12px 0 0 12px',
                                    border: '2px solid #e9ecef',
                                    borderRight: 'none'
                                }}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                style={{
                                    borderRadius: '0 12px 12px 0',
                                    border: '2px solid #e9ecef',
                                    borderLeft: 'none'
                                }}
                            >
                                {showNewPassword ? '👁️' : '👁️‍🗨️'}
                            </Button>
                        </InputGroup>
                        <Form.Text className="text-muted">
                            Minimum 8 caractères
                        </Form.Text>
                    </Form.Group>

                    {/* Confirmation du nouveau mot de passe */}
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                            Confirmer le nouveau mot de passe <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showConfirmPassword ? "text" : "password"}
                                name="new_password_confirmation"
                                value={formData.new_password_confirmation}
                                onChange={handleChange}
                                placeholder="Confirmez votre nouveau mot de passe"
                                disabled={loading}
                                required
                                style={{
                                    borderRadius: '12px 0 0 12px',
                                    border: '2px solid #e9ecef',
                                    borderRight: 'none'
                                }}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    borderRadius: '0 12px 12px 0',
                                    border: '2px solid #e9ecef',
                                    borderLeft: 'none'
                                }}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </Button>
                        </InputGroup>
                    </Form.Group>

                    {/* Conseils de sécurité */}
                    <Alert variant="info" className="border-0" style={{ borderRadius: '12px', backgroundColor: '#e7f3ff' }}>
                        <div style={{ fontSize: '0.9rem' }}>
                            <strong>💡 Conseils pour un mot de passe sécurisé :</strong>
                            <ul className="mb-0 mt-2 ps-3">
                                <li>Au moins 8 caractères</li>
                                <li>Mélange de majuscules et minuscules</li>
                                <li>Inclure des chiffres et des caractères spéciaux</li>
                                <li>Ne pas utiliser d'informations personnelles</li>
                            </ul>
                        </div>
                    </Alert>
                </Form>
            </Modal.Body>

            <Modal.Footer style={{ borderTop: 'none' }}>
                <Button
                    variant="outline-secondary"
                    onClick={handleClose}
                    disabled={loading}
                    style={{ borderRadius: '12px', fontWeight: '600' }}
                >
                    Annuler
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        fontWeight: '600'
                    }}
                >
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                className="me-2"
                            />
                            Changement en cours...
                        </>
                    ) : (
                        <>
                            🔒 Changer le mot de passe
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}