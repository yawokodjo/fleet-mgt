import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import api from '../axios';
import ChangePassword from '../components/ChangePassword';
import Dashboard from './Dashboard';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Le nom est requis');
      return;
    }

    if (!formData.email.trim()) {
      setError('L\'email est requis');
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await api.put('/profile', formData);
      setSuccess('✅ Profil mis à jour avec succès !');
      setUser(response.data.user || response.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur mise à jour profil:', err);

      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(errorMessages);
      } else if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: 'danger', icon: '👑', label: 'Administrateur' },
      manager: { bg: 'primary', icon: '👨‍💼', label: 'Gestionnaire' },
      driver: { bg: 'success', icon: '🚗', label: 'Chauffeur' },
      accountant: { bg: 'info', icon: '📊', label: 'Comptable' }
    };

    const config = roleConfig[role?.toLowerCase()] || { bg: 'secondary', icon: '👤', label: role };
    return <Badge bg={config.bg} className="px-3 py-2">{config.icon} {config.label}</Badge>;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      paddingTop: '2rem',
      paddingBottom: '3rem'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            {/* Header avec retour */}
            <div className="mb-4">
              <Button
                variant="light"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="mb-3 shadow-sm"
                style={{ borderRadius: '20px' }}
              >
                <span className="me-2">←</span>
                Retour au tableau de bord
              </Button>
            </div>

            {/* Carte principale avec effet glassmorphism */}
            <Card
              className="border-0 shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                overflow: 'hidden'
              }}
            >
              {/* En-tête avec gradient */}
              <div
                className="text-white p-5 position-relative"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        fontSize: '2.5rem',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      👤
                    </div>
                    <div>
                      <h2 className="fw-bold mb-1">Mon Profil</h2>
                      <p className="mb-0 opacity-75">Gérez vos informations personnelles</p>
                    </div>
                  </div>
                  {user?.role && getRoleBadge(user.role)}
                </div>

                {/* Décoration */}
                <div
                  className="position-absolute"
                  style={{
                    bottom: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                  }}
                />
              </div>

              <Card.Body className="p-5">
                {/* Messages de succès/erreur */}
                {success && (
                  <Alert
                    variant="success"
                    dismissible
                    onClose={() => setSuccess('')}
                    className="border-0 shadow-sm"
                    style={{ borderRadius: '15px' }}
                  >
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
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setError('')}
                    className="border-0 shadow-sm"
                    style={{ borderRadius: '15px' }}
                  >
                    <div className="d-flex align-items-center">
                      <span className="fs-4 me-3">❌</span>
                      <div>
                        <strong>Erreur</strong>
                        <p className="mb-0 small">{error}</p>
                      </div>
                    </div>
                  </Alert>
                )}

                {/* Formulaire */}
                <Form onSubmit={handleSubmit}>
                  <Row className="g-4">
                    {/* Nom complet */}
                    <Col md={6}>
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
                          placeholder="Entrez votre nom complet"
                          disabled={loading}
                          required
                          size="lg"
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e9ecef'
                          }}
                          className="shadow-sm"
                        />
                      </Form.Group>
                    </Col>

                    {/* Email */}
                    <Col md={6}>
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
                          required
                          size="lg"
                          style={{
                            borderRadius: '12px',
                            border: '2px solid #e9ecef'
                          }}
                          className="shadow-sm"
                        />
                        <Form.Text className="text-muted d-flex align-items-center gap-1 mt-2">
                          <span style={{ fontSize: '0.9rem' }}>ℹ️</span>
                          Utilisé pour la connexion et les notifications
                        </Form.Text>
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
                          💾 Enregistrer les modifications
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      size="lg"
                      variant="outline-secondary"
                      onClick={() => {
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || ''
                        });
                        setSuccess('');
                        setError('');
                        navigate('/');
                      }}
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

            {/* Cartes d'informations en dessous */}
            <Row className="g-4 mt-3">
              {/* Informations du compte */}
              <Col md={6}>
                <Card
                  className="border-0 shadow h-100"
                  style={{
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.95)'
                  }}
                >
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                      <span style={{ fontSize: '1.3rem' }}>ℹ️</span>
                      Informations du compte
                    </h6>
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <small className="text-muted d-block mb-1">📅 Date de création</small>
                        <span className="fw-semibold">
                          {user?.created_at
                            ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                            : 'Non disponible'
                          }
                        </span>
                      </div>
                      <div>
                        <small className="text-muted d-block mb-1">🔄 Dernière mise à jour</small>
                        <span className="fw-semibold">
                          {user?.updated_at
                            ? new Date(user.updated_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                            : 'Non disponible'
                          }
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Sécurité */}
              <Col md={6}>
                <Card
                  className="border-0 shadow h-100"
                  style={{
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  }}
                >
                  <Card.Body className="p-4 text-white">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                      <span style={{ fontSize: '1.3rem' }}>🔒</span>
                      Sécurité du compte
                    </h6>
                    <p className="mb-4 opacity-75">
                      Protégez votre compte avec un mot de passe fort et unique
                    </p>
                    <Button
                      variant="light"
                      onClick={() => setShowChangePassword(true)}
                      style={{
                        borderRadius: '12px',
                        fontWeight: '600'
                      }}
                      className="shadow-sm"
                    >
                      🔑 Changer le mot de passe
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Modal changement de mot de passe */}
      <ChangePassword
        show={showChangePassword}
        onHide={() => setShowChangePassword(false)}
      />
    </div>
  );
}