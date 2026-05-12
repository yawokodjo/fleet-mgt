import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

export default function Home() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('home');

    const scrollToSection = (sectionId) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    const features = [
        { icon: '🚗', title: t('home.feature_1_title'), desc: t('home.feature_1_desc') },
        { icon: '⛽', title: t('home.feature_2_title'), desc: t('home.feature_2_desc') },
        { icon: '🔧', title: t('home.feature_3_title'), desc: t('home.feature_3_desc') },
        { icon: '👥', title: t('home.feature_4_title'), desc: t('home.feature_4_desc') },
        { icon: '📊', title: t('home.feature_5_title'), desc: t('home.feature_5_desc') },
        { icon: '🔔', title: t('home.feature_6_title'), desc: t('home.feature_6_desc') },
    ];

    const aboutStats = [
        { number: '500+', label: t('home.stat_vehicles') },
        { number: '100+', label: t('home.stat_companies') },
        { number: '98%', label: t('home.stat_sat_rate') },
        { number: '24/7', label: t('home.stat_support_247') },
    ];

    const dashboardFeatures = [
        t('home.dashboard_f1'),
        t('home.dashboard_f2'),
        t('home.dashboard_f3'),
    ];

    return (
        <div style={{ overflowX: 'hidden' }}>
            <Navbar expand="lg" fixed="top" style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                padding: '1rem 0'
            }}>
                <Container>
                    <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold" style={{ fontSize: '1.5rem' }}>
                        <span style={{ fontSize: '2rem' }}>🚗</span>
                        <span style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>FleetPro</span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbar-nav" />
                    <Navbar.Collapse id="navbar-nav">
                        <Nav className="mx-auto">
                            {[
                                { id: 'home', label: t('home.nav_home') },
                                { id: 'features', label: t('home.nav_features') },
                                { id: 'about', label: t('home.nav_about') },
                                { id: 'contact', label: t('home.nav_contact') },
                            ].map(({ id, label }) => (
                                <Nav.Link key={id} onClick={() => scrollToSection(id)} className="fw-semibold mx-2"
                                    style={{ color: activeSection === id ? '#667eea' : '#333' }}>
                                    {label}
                                </Nav.Link>
                            ))}
                        </Nav>
                        <div className="d-flex gap-2">
                            <Button variant="outline-primary" onClick={() => navigate('/login')}
                                style={{ borderRadius: '10px', fontWeight: '600', borderWidth: '2px' }}>
                                {t('home.sign_in')}
                            </Button>
                            <Button onClick={() => navigate('/register')}
                                style={{
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none', fontWeight: '600'
                                }}>
                                {t('home.sign_up')}
                            </Button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Hero */}
            <section id="home" style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex', alignItems: 'center',
                paddingTop: '80px', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', top: '-100px', right: '-100px' }} />
                <div style={{ position: 'absolute', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', bottom: '50px', left: '50px' }} />
                <Container style={{ position: 'relative', zIndex: 1 }}>
                    <Row className="align-items-center">
                        <Col lg={6} className="text-white mb-5 mb-lg-0">
                            <h1 className="display-3 fw-bold mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                                {t('home.hero_title')}
                            </h1>
                            <p className="fs-4 mb-4 opacity-90">{t('home.hero_subtitle')}</p>
                            <div className="d-flex gap-3 flex-wrap">
                                <Button size="lg" onClick={() => navigate('/register')} style={{
                                    borderRadius: '12px', padding: '12px 30px',
                                    background: 'white', color: '#667eea', border: 'none', fontWeight: '600'
                                }}>{t('home.hero_start')}</Button>
                                <Button size="lg" variant="outline-light" onClick={() => scrollToSection('features')} style={{
                                    borderRadius: '12px', padding: '12px 30px', fontWeight: '600', borderWidth: '2px'
                                }}>{t('home.hero_learn')}</Button>
                            </div>
                            <Row className="mt-5">
                                <Col xs={4}><h3 className="fw-bold">500+</h3><p className="opacity-75">{t('home.stat_vehicles')}</p></Col>
                                <Col xs={4}><h3 className="fw-bold">98%</h3><p className="opacity-75">{t('home.stat_satisfaction')}</p></Col>
                                <Col xs={4}><h3 className="fw-bold">24/7</h3><p className="opacity-75">{t('home.stat_support')}</p></Col>
                            </Row>
                        </Col>
                        <Col lg={6} className="d-none d-lg-block">
                            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '40px', backdropFilter: 'blur(10px)' }}>
                                <div style={{ background: 'white', borderRadius: '15px', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                                    <div className="text-center mb-4"><span style={{ fontSize: '4rem' }}>📊</span></div>
                                    <h4 className="text-center fw-bold mb-4">{t('home.dashboard_preview')}</h4>
                                    <div className="d-flex flex-column gap-3">
                                        {dashboardFeatures.map((feature, i) => (
                                            <div key={i} className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                                                <span style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: 'white', fontWeight: 'bold', flexShrink: 0
                                                }}>✓</span>
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

            {/* Features */}
            <section id="features" style={{ padding: '100px 0', background: '#f8f9fa' }}>
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="display-4 fw-bold mb-3">{t('home.features_title')}</h2>
                        <p className="fs-5 text-muted">{t('home.features_subtitle')}</p>
                    </div>
                    <Row className="g-4">
                        {features.map((feature, index) => (
                            <Col key={index} md={6} lg={4}>
                                <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: '15px', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'; }}>
                                    <Card.Body className="p-4">
                                        <div className="mb-3 d-flex align-items-center justify-content-center" style={{
                                            width: '60px', height: '60px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: '15px', fontSize: '1.8rem'
                                        }}>{feature.icon}</div>
                                        <h5 className="fw-bold mb-3">{feature.title}</h5>
                                        <p className="text-muted mb-0">{feature.desc}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* About */}
            <section id="about" style={{ padding: '100px 0', background: 'white' }}>
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-5 mb-lg-0">
                            <h2 className="display-4 fw-bold mb-4">{t('home.about_title')}</h2>
                            <p className="fs-5 text-muted mb-4">{t('home.about_p1')}</p>
                            <p className="text-muted mb-4">{t('home.about_p2')}</p>
                            <Button size="lg" onClick={() => navigate('/register')} style={{
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none', fontWeight: '600'
                            }}>{t('home.about_join')}</Button>
                        </Col>
                        <Col lg={6}>
                            <Row className="g-4">
                                {aboutStats.map((stat, i) => (
                                    <Col key={i} xs={6}>
                                        <Card className="border-0 shadow-sm text-center p-4" style={{ borderRadius: '15px' }}>
                                            <h2 className="fw-bold mb-2" style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                            }}>{stat.number}</h2>
                                            <p className="text-muted mb-0">{stat.label}</p>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Contact */}
            <section id="contact" style={{
                padding: '100px 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <Container>
                    <div className="text-center text-white">
                        <h2 className="display-4 fw-bold mb-4">{t('home.contact_title')}</h2>
                        <p className="fs-5 mb-5 opacity-90">{t('home.contact_subtitle')}</p>
                        <div className="d-flex gap-3 justify-content-center flex-wrap">
                            <Button size="lg" onClick={() => navigate('/register')} style={{
                                borderRadius: '12px', padding: '15px 40px',
                                background: 'white', color: '#667eea', border: 'none', fontWeight: '600'
                            }}>{t('home.contact_start')}</Button>
                            <Button size="lg" variant="outline-light" onClick={() => navigate('/login')} style={{
                                borderRadius: '12px', padding: '15px 40px', fontWeight: '600', borderWidth: '2px'
                            }}>{t('home.contact_login')}</Button>
                        </div>
                    </div>
                </Container>
            </section>

            <footer style={{ background: '#1a1a1a', color: 'white', padding: '40px 0' }}>
                <Container>
                    <Row>
                        <Col md={6} className="mb-3 mb-md-0">
                            <h5 className="fw-bold mb-3">FleetPro</h5>
                            <p className="text-muted mb-0">{t('home.footer_desc')}</p>
                        </Col>
                        <Col md={6} className="text-md-end">
                            <p className="text-muted mb-0">{t('home.footer_rights')}</p>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </div>
    );
}
