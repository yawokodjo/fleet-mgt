import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import api from '../axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Récupérer le token et l'email depuis l'URL
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setMessage('');
    setIsError(false);
  };

  const validateForm = () => {
    if (!formData.password) {
      setMessage('Le mot de passe est requis');
      setIsError(true);
      return false;
    }

    if (formData.password.length < 8) {
      setMessage('Le mot de passe doit contenir au moins 8 caractères');
      setIsError(true);
      return false;
    }

    if (formData.password !== formData.password_confirmation) {
      setMessage('Les mots de passe ne correspondent pas');
      setIsError(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const res = await api.post('/reset-password', {
        token,
        email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      setMessage(res.data.message || 'Mot de passe réinitialisé avec succès !');
      setIsError(false);

      // Redirection vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('Erreur reset password:', err);
      setMessage(err.response?.data?.message || 'Erreur lors de la réinitialisation');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si le token et l'email sont présents
  if (!token || !email) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <Container>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <Alert variant="danger" className="text-center">
                <h4>❌ Lien invalide</h4>
                <p>Le lien de réinitialisation est invalide ou a expiré.</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/forgot-password')}
                >
                  Demander un nouveau lien
                </Button>
              </Alert>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Container>
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <Card
              className="border-0 shadow-lg"
              style={{
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Card.Body className="p-5">
                {/* En-tête */}
                <div className="text-center mb-4">
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
                    🔑
                  </div>
                  <h2 className="fw-bold mb-2">Nouveau mot de passe</h2>
                  <p className="text-muted mb-0">
                    Créez un nouveau mot de passe sécurisé pour votre compte
                  </p>
                </div>

                {/* Email */}
                <Alert variant="info" className="border-0" style={{ borderRadius: '12px' }}>
                  <small>
                    <strong>📧 Compte :</strong> {email}
                  </small>
                </Alert>

                {/* Message de succès/erreur */}
                {message && (
                  <Alert
                    variant={isError ? "danger" : "success"}
                    className="border-0 shadow-sm"
                    style={{ borderRadius: '12px' }}
                  >
                    <div className="d-flex align-items-center">
                      <span className="fs-4 me-3">{isError ? '❌' : '✅'}</span>
                      <div>
                        <strong>{isError ? 'Erreur' : 'Succès !'}</strong>
                        <p className="mb-0 small">{message}</p>
                      </div>
                    </div>
                  </Alert>
                )}

                {/* Formulaire */}
                <Form onSubmit={handleSubmit}>
                  {/* Nouveau mot de passe */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      Nouveau mot de passe <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
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
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          borderRadius: '0 12px 12px 0',
                          border: '2px solid #e9ecef',
                          borderLeft: 'none'
                        }}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </Button>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Minimum 8 caractères
                    </Form.Text>
                  </Form.Group>

                  {/* Confirmation */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      Confirmer le mot de passe <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="password_confirmation"
                        value={formData.password_confirmation}
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
                  <Alert variant="info" className="border-0 mb-4" style={{ borderRadius: '12px', backgroundColor: '#e7f3ff' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>💡 Conseils :</strong>
                      <ul className="mb-0 mt-2 ps-3">
                        <li>Au moins 8 caractères</li>
                        <li>Majuscules et minuscules</li>
                        <li>Chiffres et caractères spéciaux</li>
                      </ul>
                    </div>
                  </Alert>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-100"
                    disabled={loading}
                    style={{
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontWeight: '600',
                      padding: '12px'
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
                        Réinitialisation...
                      </>
                    ) : (
                      <>
                        🔒 Réinitialiser le mot de passe
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}