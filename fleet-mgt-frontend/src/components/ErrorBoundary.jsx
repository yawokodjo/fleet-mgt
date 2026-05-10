import React from 'react';
import { Container, Card, Button, Badge } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Animated background circles */}
          <div style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            top: '-200px',
            right: '-200px',
            animation: 'pulse 3s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            bottom: '-150px',
            left: '-150px',
            animation: 'pulse 4s ease-in-out infinite'
          }} />

          <Container style={{ position: 'relative', zIndex: 1 }}>
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-7 col-xl-6">
                <Card
                  className="border-0 shadow-lg"
                  style={{
                    borderRadius: '25px',
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header with gradient */}
                  <div
                    className="text-center p-5"
                    style={{
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                      position: 'relative'
                    }}
                  >
                    <div
                      className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: '120px',
                        height: '120px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        fontSize: '4rem',
                        backdropFilter: 'blur(10px)',
                        animation: 'bounce 2s ease-in-out infinite'
                      }}
                    >
                      😕
                    </div>
                    <h2 className="fw-bold mb-2 text-white">Oups ! Une erreur est survenue</h2>
                    <p className="text-white opacity-90 mb-0">
                      Quelque chose s'est mal passé, mais nous sommes là pour vous aider
                    </p>

                    {/* Decorative wave */}
                    <svg
                      style={{
                        position: 'absolute',
                        bottom: '-1px',
                        left: 0,
                        width: '100%',
                        height: '30px'
                      }}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 1440 320"
                      preserveAspectRatio="none"
                    >
                      <path
                        fill="rgba(255, 255, 255, 0.98)"
                        fillOpacity="1"
                        d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                      />
                    </svg>
                  </div>

                  <Card.Body className="p-5 pt-4">
                    {/* Error badge */}
                    <div className="text-center mb-4">
                      <Badge
                        bg="danger"
                        className="px-4 py-2"
                        style={{
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        🚨 Erreur détectée
                      </Badge>
                    </div>

                    {/* Détails de l'erreur (en développement) */}
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                      <div className="mb-4">
                        <details className="bg-light p-4 rounded-3 border">
                          <summary
                            className="fw-bold mb-0"
                            style={{
                              cursor: 'pointer',
                              color: '#667eea',
                              userSelect: 'none'
                            }}
                          >
                            🔍 Détails techniques (développement)
                          </summary>
                          <div className="mt-3">
                            <div className="mb-3">
                              <Badge bg="secondary" className="mb-2">Erreur</Badge>
                              <pre
                                className="bg-white p-3 rounded border"
                                style={{
                                  fontSize: '0.85rem',
                                  overflow: 'auto',
                                  maxHeight: '150px'
                                }}
                              >
                                {this.state.error.toString()}
                              </pre>
                            </div>
                            {this.state.errorInfo && (
                              <div>
                                <Badge bg="secondary" className="mb-2">Stack trace</Badge>
                                <pre
                                  className="bg-white p-3 rounded border"
                                  style={{
                                    fontSize: '0.75rem',
                                    overflow: 'auto',
                                    maxHeight: '200px'
                                  }}
                                >
                                  {this.state.errorInfo.componentStack}
                                </pre>
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    )}

                    {/* Quick actions */}
                    <div className="mb-4">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <Button
                            variant="light"
                            className="w-100 py-3 border-2"
                            onClick={this.handleRefresh}
                            style={{
                              borderRadius: '15px',
                              fontWeight: '600',
                              borderColor: '#e9ecef'
                            }}
                          >
                            <div style={{ fontSize: '1.5rem' }}>🔄</div>
                            <small className="d-block mt-1">Rafraîchir</small>
                          </Button>
                        </div>
                        <div className="col-md-4">
                          <Button
                            variant="light"
                            className="w-100 py-3 border-2"
                            onClick={this.handleGoBack}
                            style={{
                              borderRadius: '15px',
                              fontWeight: '600',
                              borderColor: '#e9ecef'
                            }}
                          >
                            <div style={{ fontSize: '1.5rem' }}>←</div>
                            <small className="d-block mt-1">Retour</small>
                          </Button>
                        </div>
                        <div className="col-md-4">
                          <Button
                            variant="light"
                            className="w-100 py-3 border-2"
                            onClick={this.handleReload}
                            style={{
                              borderRadius: '15px',
                              fontWeight: '600',
                              borderColor: '#e9ecef'
                            }}
                          >
                            <div style={{ fontSize: '1.5rem' }}>🏠</div>
                            <small className="d-block mt-1">Accueil</small>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Main action button */}
                    <Button
                      size="lg"
                      className="w-100 mb-4"
                      onClick={this.handleReload}
                      style={{
                        borderRadius: '15px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        fontWeight: '600',
                        padding: '15px'
                      }}
                    >
                      ✨ Retourner à la page d'accueil
                    </Button>

                    {/* Helpful suggestions */}
                    <div
                      className="p-4 rounded-3"
                      style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                      }}
                    >
                      <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.3rem' }}>💡</span>
                        Suggestions pour résoudre le problème
                      </h6>
                      <div className="d-flex flex-column gap-2">
                        {[
                          { icon: '🔄', text: 'Rafraîchir la page (F5 ou Ctrl+R)' },
                          { icon: '🧹', text: 'Vider le cache du navigateur' },
                          { icon: '🌐', text: 'Vérifier votre connexion internet' },
                          { icon: '⏰', text: 'Réessayer dans quelques instants' }
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="d-flex align-items-center gap-2 p-2 bg-white rounded"
                          >
                            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                            <span className="small">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-4">
                      <p className="text-muted small mb-2">
                        Le problème persiste ?
                      </p>
                      <a
                        href="mailto:support@votresite.com"
                        className="text-decoration-none fw-semibold"
                        style={{ color: '#667eea' }}
                      >
                        📧 Contactez le support technique
                      </a>
                    </div>
                  </Card.Body>
                </Card>

                {/* Additional info */}
                <p className="text-center text-white mt-4 mb-0 opacity-75 small">
                  © 2025 Compassion International Togo - FleetPro
                </p>
              </div>
            </div>
          </Container>

          {/* CSS Animations */}
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(1.1); opacity: 0.3; }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;