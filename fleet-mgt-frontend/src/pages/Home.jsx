import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Row, Col, Card } from 'react-bootstrap';

export default function Home() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('home');

    const scrollToSection = (sectionId) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{ overflowX: 'hidden' }}>
            {/* Navigation Bar */}
            <Navbar
                expand="lg"
                fixed="top"
                style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    padding: '1rem 0'
                }}
            >
                <Container>
                    <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold" style={{ fontSize: '1.5rem' }}>
                        <span style={{ fontSize: '2rem' }}>🚗</span>
                        <span style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            FleetPro
                        </span>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="navbar-nav" />

                    <Navbar.Collapse id="navbar-nav">
                        <Nav className="mx-auto">
                            <Nav.Link
                                onClick={() => scrollToSection('home')}
                                className="fw-semibold mx-2"
                                style={{ color: activeSection === 'home' ? '#667eea' : '#333' }}
                            >
                                Accueil
                            </Nav.Link>
                            <Nav.Link
                                onClick={() => scrollToSection('features')}
                                className="fw-semibold mx-2"
                                style={{ color: activeSection === 'features' ? '#667eea' : '#333' }}
                            >
                                Fonctionnalités
                            </Nav.Link>
                            <Nav.Link
                                onClick={() => scrollToSection('about')}
                                className="fw-semibold mx-2"
                                style={{ color: activeSection === 'about' ? '#667eea' : '#333' }}
                            >
                                À propos
                            </Nav.Link>
                            <Nav.Link
                                onClick={() => scrollToSection('contact')}
                                className="fw-semibold mx-2"
                                style={{ color: activeSection === 'contact' ? '#667eea' : '#333' }}
                            >
                                Contact
                            </Nav.Link>
                        </Nav>

                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-primary"
                                onClick={() => navigate('/login')}
                                style={{
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    borderWidth: '2px'
                                }}
                            >
                                🔐 Se connecter
                            </Button>
                            <Button
                                onClick={() => navigate('/register')}
                                style={{
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    fontWeight: '600'
                                }}
                            >
                                ✨ S'inscrire
                            </Button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Hero Section */}
            <section
                id="home"
                style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: '80px',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Animated circles */}
                <div style={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    top: '-100px',
                    right: '-100px'
                }} />
                <div style={{
                    position: 'absolute',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    bottom: '50px',
                    left: '50px'
                }} />

                <Container style={{ position: 'relative', zIndex: 1 }}>
                    <Row className="align-items-center">
                        <Col lg={6} className="text-white mb-5 mb-lg-0">
                            <h1 className="display-3 fw-bold mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                                Gérez votre flotte en toute simplicité
                            </h1>
                            <p className="fs-4 mb-4 opacity-90">
                                La solution complète pour optimiser la gestion de votre parc automobile.
                                Suivi en temps réel, maintenance planifiée et rapports détaillés.
                            </p>
                            <div className="d-flex gap-3 flex-wrap">
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/register')}
                                    style={{
                                        borderRadius: '12px',
                                        padding: '12px 30px',
                                        background: 'white',
                                        color: '#667eea',
                                        border: 'none',
                                        fontWeight: '600'
                                    }}
                                >
                                    🚀 Commencer gratuitement
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline-light"
                                    onClick={() => scrollToSection('features')}
                                    style={{
                                        borderRadius: '12px',
                                        padding: '12px 30px',
                                        fontWeight: '600',
                                        borderWidth: '2px'
                                    }}
                                >
                                    📖 En savoir plus
                                </Button>
                            </div>

                            {/* Stats */}
                            <Row className="mt-5">
                                <Col xs={4}>
                                    <h3 className="fw-bold">500+</h3>
                                    <p className="opacity-75">Véhicules gérés</p>
                                </Col>
                                <Col xs={4}>
                                    <h3 className="fw-bold">98%</h3>
                                    <p className="opacity-75">Satisfaction client</p>
                                </Col>
                                <Col xs={4}>
                                    <h3 className="fw-bold">24/7</h3>
                                    <p className="opacity-75">Support disponible</p>
                                </Col>
                            </Row>
                        </Col>

                        <Col lg={6} className="d-none d-lg-block">
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '20px',
                                padding: '40px',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '15px',
                                    padding: '30px',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                                }}>
                                    <div className="text-center mb-4">
                                        <span style={{ fontSize: '4rem' }}>📊</span>
                                    </div>
                                    <h4 className="text-center fw-bold mb-4">Tableau de bord intuitif</h4>
                                    <div className="d-flex flex-column gap-3">
                                        {['Suivi GPS en temps réel', 'Alertes de maintenance', 'Rapports automatiques'].map((feature, i) => (
                                            <div key={i} className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                                                <span style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ✓
                                                </span>
                                                <span className="fw-semibold">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section id="features" style={{ padding: '100px 0', background: '#f8f9fa' }}>
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="display-4 fw-bold mb-3">Fonctionnalités puissantes</h2>
                        <p className="fs-5 text-muted">Tout ce dont vous avez besoin pour gérer votre flotte efficacement</p>
                    </div>

                    <Row className="g-4">
                        {[
                            { icon: '🚗', title: 'Gestion des véhicules', desc: 'Suivez tous vos véhicules en un seul endroit avec des informations détaillées' },
                            { icon: '⛽', title: 'Suivi des consommations', desc: 'Analysez la consommation de carburant et optimisez vos coûts' },
                            { icon: '🔧', title: 'Maintenance planifiée', desc: 'Ne manquez plus jamais une révision avec nos alertes automatiques' },
                            { icon: '👥', title: 'Gestion des chauffeurs', desc: 'Assignez les véhicules et suivez les performances de vos conducteurs' },
                            { icon: '📊', title: 'Rapports détaillés', desc: 'Générez des rapports personnalisés pour une meilleure prise de décision' },
                            { icon: '🔔', title: 'Alertes en temps réel', desc: 'Recevez des notifications pour tous les événements importants' }
                        ].map((feature, index) => (
                            <Col key={index} md={6} lg={4}>
                                <Card
                                    className="h-100 border-0 shadow-sm"
                                    style={{
                                        borderRadius: '15px',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-10px)';
                                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                                    }}
                                >
                                    <Card.Body className="p-4">
                                        <div
                                            className="mb-3 d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                borderRadius: '15px',
                                                fontSize: '1.8rem'
                                            }}
                                        >
                                            {feature.icon}
                                        </div>
                                        <h5 className="fw-bold mb-3">{feature.title}</h5>
                                        <p className="text-muted mb-0">{feature.desc}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* About Section */}
            <section id="about" style={{ padding: '100px 0', background: 'white' }}>
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-5 mb-lg-0">
                            <h2 className="display-4 fw-bold mb-4">À propos de FleetPro</h2>
                            <p className="fs-5 text-muted mb-4">
                                FleetPro est la solution de gestion de flotte automobile de nouvelle génération,
                                conçue pour simplifier la vie des gestionnaires de parc automobile.
                            </p>
                            <p className="text-muted mb-4">
                                Avec des années d'expérience dans le domaine de la gestion de flotte,
                                nous avons développé une plateforme intuitive qui répond aux besoins réels
                                des entreprises modernes.
                            </p>
                            <Button
                                size="lg"
                                onClick={() => navigate('/register')}
                                style={{
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    fontWeight: '600'
                                }}
                            >
                                Rejoignez-nous maintenant
                            </Button>
                        </Col>
                        <Col lg={6}>
                            <Row className="g-4">
                                {[
                                    { number: '500+', label: 'Véhicules gérés' },
                                    { number: '100+', label: 'Entreprises clientes' },
                                    { number: '98%', label: 'Taux de satisfaction' },
                                    { number: '24/7', label: 'Support technique' }
                                ].map((stat, i) => (
                                    <Col key={i} xs={6}>
                                        <Card className="border-0 shadow-sm text-center p-4" style={{ borderRadius: '15px' }}>
                                            <h2 className="fw-bold mb-2" style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent'
                                            }}>
                                                {stat.number}
                                            </h2>
                                            <p className="text-muted mb-0">{stat.label}</p>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Contact Section */}
            <section id="contact" style={{
                padding: '100px 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <Container>
                    <div className="text-center text-white">
                        <h2 className="display-4 fw-bold mb-4">Prêt à démarrer ?</h2>
                        <p className="fs-5 mb-5 opacity-90">
                            Rejoignez des centaines d'entreprises qui font confiance à FleetPro
                        </p>
                        <div className="d-flex gap-3 justify-content-center flex-wrap">
                            <Button
                                size="lg"
                                onClick={() => navigate('/register')}
                                style={{
                                    borderRadius: '12px',
                                    padding: '15px 40px',
                                    background: 'white',
                                    color: '#667eea',
                                    border: 'none',
                                    fontWeight: '600'
                                }}
                            >
                                🚀 Commencer maintenant
                            </Button>
                            <Button
                                size="lg"
                                variant="outline-light"
                                onClick={() => navigate('/login')}
                                style={{
                                    borderRadius: '12px',
                                    padding: '15px 40px',
                                    fontWeight: '600',
                                    borderWidth: '2px'
                                }}
                            >
                                🔐 Se connecter
                            </Button>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Footer */}
            <footer style={{ background: '#1a1a1a', color: 'white', padding: '40px 0' }}>
                <Container>
                    <Row>
                        <Col md={6} className="mb-3 mb-md-0">
                            <h5 className="fw-bold mb-3">FleetPro</h5>
                            <p className="text-muted mb-0">
                                La solution complète pour la gestion de votre flotte automobile.
                            </p>
                        </Col>
                        <Col md={6} className="text-md-end">
                            <p className="text-muted mb-0">
                                © 2025 Compassion International Togo. Tous droits réservés.
                            </p>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </div>
    );
}