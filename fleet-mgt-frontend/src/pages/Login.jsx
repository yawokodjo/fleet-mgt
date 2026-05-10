import React, { useState, useEffect } from 'react';
import api from '../axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, ProgressBar, Modal } from 'react-bootstrap';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // États pour la gestion de sécurité
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Timer pour le compte à rebours du blocage
  useEffect(() => {
    if (isBlocked && blockEndTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = Math.max(0, Math.floor((blockEndTime - now) / 1000));
        setRemainingTime(diff);

        if (diff === 0) {
          setIsBlocked(false);
          setBlockEndTime(null);
          setRemainingAttempts(3);
          setError('');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isBlocked, blockEndTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = e => {
    setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) {
      setError('');
    }
  };

  // Calcul de la force du mot de passe
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '', variant: '' };

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    if (strength < 40) {
      return { strength, label: 'Faible', color: '#dc3545', variant: 'danger' };
    } else if (strength < 70) {
      return { strength, label: 'Moyen', color: '#ffc107', variant: 'warning' };
    } else {
      return { strength, label: 'Fort', color: '#28a745', variant: 'success' };
    }
  };

  const passwordStrength = getPasswordStrength(credentials.password);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/login', credentials);

      // Connexion réussie
      login(res.data.user, res.data.access_token);
      setRemainingAttempts(3);

    } catch (err) {
      const errorData = err.response?.data;
      const errorCode = errorData?.code;

      if (errorCode === 'ACCOUNT_BLOCKED') {
        // Compte bloqué temporairement
        setIsBlocked(true);
        const blockedUntil = new Date(errorData.blocked_until || Date.now() + 300000);
        setBlockEndTime(blockedUntil);
        setRemainingTime(errorData.remaining_seconds || 300);
        setError(errorData.message || 'Compte temporairement bloqué.');

      } else if (errorCode === 'ACCOUNT_DELETED') {
        // Compte supprimé après 2 blocages
        setShowDeleteModal(true);
        setError('');

      } else if (errorCode === 'INVALID_PASSWORD') {
        // Mot de passe incorrect
        const remaining = errorData.remaining_attempts || 0;
        setRemainingAttempts(remaining);
        setError(errorData.message || `Mot de passe incorrect. ${remaining} tentative(s) restante(s).`);

      } else {
        // Erreur générique
        setError(errorData?.message || 'Email ou mot de passe invalide.');
        setRemainingAttempts(3);
      }

    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToRegister = () => {
    setShowDeleteModal(false);
    navigate('/register');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f0f2f5'
      }}
    >
      <Container fluid>
        <Row style={{ minHeight: '100vh' }}>
          {/* Partie gauche - Image */}
          <Col
            lg={7}
            className="d-none d-lg-block p-0"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem'
              }}
            >
              <div className="text-white">
                <h1 className="display-3 fw-bold mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  🚗 Gestion de Flotte
                </h1>
                <p className="fs-4 mb-4" style={{ maxWidth: '500px' }}>
                  Simplifiez la gestion de votre parc automobile avec notre solution complète et intuitive.
                </p>
                <div className="d-flex flex-column gap-3" style={{ maxWidth: '400px' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                      }}
                    >
                      📊
                    </div>
                    <div>
                      <strong className="d-block">Suivi en temps réel</strong>
                      <small className="opacity-75">Suivez vos véhicules et consommations</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                      }}
                    >
                      🔧
                    </div>
                    <div>
                      <strong className="d-block">Maintenance planifiée</strong>
                      <small className="opacity-75">Ne manquez plus aucune révision</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                      }}
                    >
                      📈
                    </div>
                    <div>
                      <strong className="d-block">Rapports détaillés</strong>
                      <small className="opacity-75">Analysez vos données efficacement</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Partie droite - Formulaire */}
          <Col
            lg={5}
            className="d-flex align-items-center justify-content-center p-4"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div style={{ width: '100%', maxWidth: '450px' }}>
              {/* Logo mobile */}
              <div className="text-center mb-4 d-lg-none">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    fontSize: '2.5rem'
                  }}
                >
                  🚗
                </div>
              </div>

              <div className="mb-5">
                <h2 className="fw-bold mb-2">Bienvenue !</h2>
                <p className="text-muted mb-0">Connectez-vous pour accéder à votre compte</p>
              </div>

              {/* Message de blocage */}
              {isBlocked && (
                <Alert
                  variant="danger"
                  className="border-0 shadow-sm mb-4"
                  style={{ borderRadius: '12px' }}
                >
                  <div className="text-center">
                    <div className="fs-1 mb-3">🔒</div>
                    <strong className="d-block mb-2">Compte temporairement bloqué</strong>
                    <p className="mb-2">Trop de tentatives échouées</p>
                    <div className="fs-3 fw-bold text-danger mb-2">
                      {formatTime(remainingTime)}
                    </div>
                    <small className="text-muted">Temps restant avant déblocage</small>
                  </div>
                </Alert>
              )}

              {/* Message d'erreur */}
              {error && !isBlocked && (
                <Alert
                  variant="danger"
                  className="border-0 shadow-sm mb-4"
                  style={{ borderRadius: '12px' }}
                >
                  <div className="d-flex align-items-center">
                    <span className="fs-4 me-3">❌</span>
                    <div className="flex-grow-1">
                      <strong>Erreur</strong>
                      <p className="mb-0 small">{error}</p>
                    </div>
                  </div>
                  {remainingAttempts < 3 && remainingAttempts > 0 && (
                    <div className="mt-2 pt-2 border-top">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="fw-bold">Tentatives restantes:</small>
                        <div className="d-flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: i < remainingAttempts ? '#28a745' : '#dc3545'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Alert>
              )}

              {/* Formulaire */}
              <Form onSubmit={handleSubmit}>
                {/* Email */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    📧 Adresse email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="exemple@email.com"
                    disabled={loading || isBlocked}
                    required
                    size="lg"
                    style={{
                      borderRadius: '12px',
                      border: '2px solid #e9ecef'
                    }}
                  />
                </Form.Group>

                {/* Mot de passe */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    🔒 Mot de passe
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder="Entrez votre mot de passe"
                      disabled={loading || isBlocked}
                      required
                      size="lg"
                      style={{
                        borderRadius: '12px 0 0 12px',
                        border: '2px solid #e9ecef',
                        borderRight: 'none'
                      }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading || isBlocked}
                      style={{
                        borderRadius: '0 12px 12px 0',
                        border: '2px solid #e9ecef',
                        borderLeft: 'none'
                      }}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Button>
                  </InputGroup>
                </Form.Group>

                {/* Indicateur de force du mot de passe */}
                {credentials.password && (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">Force du mot de passe</small>
                      <small
                        className="fw-bold"
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.label}
                      </small>
                    </div>
                    <ProgressBar
                      now={passwordStrength.strength}
                      variant={passwordStrength.variant}
                      style={{ height: '6px', borderRadius: '10px' }}
                    />
                  </div>
                )}

                {/* Bouton de connexion */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-100 mb-3"
                  disabled={loading || isBlocked}
                  style={{
                    borderRadius: '12px',
                    background: isBlocked ? '#6c757d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: '600',
                    padding: '12px'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Connexion...
                    </>
                  ) : isBlocked ? (
                    '🔒 Compte bloqué'
                  ) : (
                    '🔐 Se connecter'
                  )}
                </Button>

                {/* Lien mot de passe oublié */}
                <div className="text-center mb-4">
                  <Link
                    to="/forgot-password"
                    className="text-decoration-none"
                    style={{ color: '#667eea', fontWeight: '600' }}
                  >
                    🔑 Mot de passe oublié ?
                  </Link>
                </div>

                <hr className="my-4" />

                {/* Lien inscription */}
                <div className="text-center">
                  <p className="text-muted mb-2">Pas encore de compte ?</p>
                  <Link
                    to="/register"
                    className="btn btn-outline-secondary w-100"
                    style={{
                      borderRadius: '12px',
                      fontWeight: '600',
                      borderWidth: '2px'
                    }}
                  >
                    ✨ Créer un compte
                  </Link>
                </div>
              </Form>

              {/* Copyright */}
              <p className="text-center text-muted mt-4 mb-2 small">
                © 2025 Compassion International Togo
              </p>

              {/* Note de sécurité */}
              <div
                className="text-center p-3 rounded-3"
                style={{
                  background: '#f8f9fa',
                  border: '1px dashed #dee2e6'
                }}
              >
                <small className="text-muted d-flex align-items-center justify-content-center gap-2">
                  <span style={{ fontSize: '1rem' }}>🔒</span>
                  <span>
                    Sécurité renforcée : <strong>3 tentatives maximum</strong>
                  </span>
                </small>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modal de suppression de compte */}
      <Modal show={showDeleteModal} onHide={() => { }} centered backdrop="static">
        <Modal.Body className="text-center p-5">
          <div className="fs-1 mb-3">⚠️</div>
          <h4 className="fw-bold mb-3">Compte supprimé</h4>
          <p className="text-muted mb-4">
            Votre compte a été bloqué après 2 tentatives de connexion échouées consécutives.
            Pour des raisons de sécurité, vous devez créer un nouveau compte.
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-100"
            onClick={handleRedirectToRegister}
            style={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              fontWeight: '600'
            }}
          >
            Créer un nouveau compte
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}