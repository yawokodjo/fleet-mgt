import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import api from "../axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const res = await api.post("/forgot-password", { email });
      setMessage(res.data.message || "Un email de réinitialisation a été envoyé !");
      setIsError(false);
      setEmail(""); // Réinitialiser le champ
    } catch (err) {
      console.error("Erreur forgot password:", err);
      setMessage(err.response?.data?.message || "Erreur lors de l'envoi du lien");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

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
                    🔒
                  </div>
                  <h2 className="fw-bold mb-2">Mot de passe oublié ?</h2>
                  <p className="text-muted mb-0">
                    Pas de souci ! Entrez votre email et nous vous enverrons un lien de réinitialisation.
                  </p>
                </div>

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
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold d-flex align-items-center gap-2">
                      <span style={{ fontSize: '1.2rem' }}>📧</span>
                      Adresse email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                      size="lg"
                      style={{
                        borderRadius: '12px',
                        border: '2px solid #e9ecef'
                      }}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-100 mb-4"
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
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        📨 Envoyer le lien
                      </>
                    )}
                  </Button>
                </Form>

                {/* Liens */}
                <div className="text-center">
                  <hr className="my-4" />
                  <p className="text-muted mb-3">Vous vous souvenez de votre mot de passe ?</p>
                  <Link
                    to="/login"
                    className="btn btn-outline-primary w-100 mb-3"
                    style={{
                      borderRadius: '12px',
                      fontWeight: '600',
                      borderWidth: '2px'
                    }}
                  >
                    🔐 Se connecter
                  </Link>

                  <p className="text-muted mb-3">Pas encore de compte ?</p>
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
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}