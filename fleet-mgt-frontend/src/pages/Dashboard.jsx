import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import api from "../axios";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
  const [stats, setStats] = useState({
    vehicles: 0,
    maintenances: 0,
    consumptions: 0,
    drivers: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Temps d'inactivité en millisecondes (5 minutes)
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  const WARNING_TIME = 60 * 1000; // 1 minute avant déconnexion

  useEffect(() => {
    fetchStats();
    fetchWeather();

    // Met à jour l'heure chaque seconde
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Gestion de l'inactivité
    let inactivityTimer;
    let warningTimer;
    let countdownTimer;

    const resetInactivityTimer = () => {
      // Annuler les timers existants
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownTimer);
      setShowInactivityWarning(false);
      setCountdown(60);

      // Timer d'avertissement (4 minutes)
      warningTimer = setTimeout(() => {
        setShowInactivityWarning(true);

        // Compte à rebours
        let seconds = 60;
        countdownTimer = setInterval(() => {
          seconds--;
          setCountdown(seconds);
          if (seconds <= 0) {
            clearInterval(countdownTimer);
          }
        }, 1000);
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Timer de déconnexion (5 minutes)
      inactivityTimer = setTimeout(() => {
        console.log('⏰ Déconnexion pour inactivité');
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    // Événements qui réinitialisent le timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer);
    });

    // Initialiser le timer
    resetInactivityTimer();

    return () => {
      clearInterval(timer);
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      clearInterval(countdownTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logout]);

  const fetchWeather = async () => {
    try {
      // Utilise l'API OpenWeatherMap pour Lomé, Togo
      const response = await fetch(
        'https://api.openweathermap.org/data/2.5/weather?q=Lome,TG&units=metric&appid=YOUR_API_KEY'
      );

      if (response.ok) {
        const data = await response.json();
        setWeather({
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          humidity: data.main.humidity,
          feelsLike: Math.round(data.main.feels_like)
        });
      } else {
        // Données de fallback si l'API échoue
        setWeather({
          temp: 28,
          description: 'ensoleillé',
          icon: '01d',
          humidity: 75,
          feelsLike: 30
        });
      }
    } catch (err) {
      console.error('Erreur météo:', err);
      // Données de fallback
      setWeather({
        temp: 28,
        description: 'ensoleillé',
        icon: '01d',
        humidity: 75,
        feelsLike: 30
      });
    }
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString(locale, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString(locale, {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getWeatherIcon = () => {
    if (!weather) return '🌡️';
    const temp = weather.temp;
    if (temp >= 30) return '☀️';
    if (temp >= 25) return '🌤️';
    if (temp >= 20) return '⛅';
    return '🌥️';
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [vehiclesRes, maintenancesRes, consumptionsRes, driversRes] = await Promise.all([
        api.get('/vehicles-list', { headers }).catch(() => ({ data: [] })),
        api.get('/maintenances', { headers }).catch(() => ({ data: [] })),
        api.get('/consumptions', { headers }).catch(() => ({ data: [] })),
        api.get('/drivers', { headers }).catch(() => ({ data: [] }))
      ]);

      setStats({
        vehicles: Array.isArray(vehiclesRes.data) ? vehiclesRes.data.length : (vehiclesRes.data.data?.length || 0),
        maintenances: Array.isArray(maintenancesRes.data) ? maintenancesRes.data.length : (maintenancesRes.data.data?.length || 0),
        consumptions: Array.isArray(consumptionsRes.data) ? consumptionsRes.data.length : (consumptionsRes.data.data?.length || 0),
        drivers: Array.isArray(driversRes.data) ? driversRes.data.length : (driversRes.data.data?.length || 0)
      });
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: t('dashboard.vehicles'), value: stats.vehicles, icon: '🚗', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', route: '/vehicles' },
    { title: t('dashboard.maintenances'), value: stats.maintenances, icon: '🔧', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', route: '/maintenances' },
    { title: t('dashboard.consumptions'), value: stats.consumptions, icon: '⛽', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', route: '/consumptions' },
    { title: t('dashboard.drivers'), value: stats.drivers, icon: '👥', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', route: '/users' },
  ];

  const quickActions = [
    { title: t('dashboard.add_vehicle'), icon: '🚗', route: '/vehicles/create', color: '#667eea' },
    { title: t('dashboard.new_maintenance'), icon: '🔧', route: '/maintenances/create', color: '#f5576c' },
    { title: t('dashboard.new_consumption'), icon: '⛽', route: '/consumptions/create', color: '#00f2fe' },
    { title: t('dashboard.view_reports'), icon: '📊', route: '/reports', color: '#43e97b' },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '2rem',
        paddingBottom: '3rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Image de fond animée */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          right: '-10%',
          bottom: '-10%',
          backgroundImage: 'url("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2070")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'slowZoom 20s ease-in-out infinite alternate',
          zIndex: 0
        }}
      />

      {/* Overlay gradient pour meilleure lisibilité */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.92) 0%, rgba(118, 75, 162, 0.92) 100%)',
          zIndex: 1
        }}
      />

      <Container fluid className="px-4" style={{ position: 'relative', zIndex: 2 }}>
        {/* Avertissement d'inactivité */}
        {showInactivityWarning && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              animation: 'slideIn 0.5s ease-out'
            }}
          >
            <Card
              className="border-0 shadow-lg"
              style={{
                borderRadius: '15px',
                background: 'rgba(255, 87, 51, 0.95)',
                backdropFilter: 'blur(10px)',
                minWidth: '350px'
              }}
            >
              <Card.Body className="p-4 text-white">
                <div className="d-flex align-items-start gap-3">
                  <div style={{ fontSize: '2rem' }}>⏰</div>
                  <div className="flex-grow-1">
                    <h5 className="fw-bold mb-2">{t('dashboard.inactivity_title')}</h5>
                    <p className="mb-3">
                      {t('dashboard.inactivity_msg_1')} <strong>{countdown}</strong> {t('dashboard.inactivity_msg_2')}
                    </p>
                    <button
                      className="btn btn-light w-100 fw-bold"
                      onClick={() => { setShowInactivityWarning(false); setCountdown(60); }}
                    >
                      {t('dashboard.still_here')}
                    </button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
        {/* Header avec Date, Heure et Météo */}
        <Row className="mb-4">
          <Col lg={8}>
            <div className="text-white">
              <h2 className="fw-bold mb-2">
                {t('dashboard.welcome', { name: user?.name || '' })}
              </h2>
              <p className="opacity-75 mb-0">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </Col>
          <Col lg={4}>
            <Card
              className="border-0 shadow-lg"
              style={{
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Card.Body className="p-3">
                <div className="text-white">
                  {/* Date et Heure */}
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div>
                      <div className="fw-bold" style={{ fontSize: '1.5rem' }}>
                        {formatTime()}
                      </div>
                      <small className="opacity-75">
                        {formatDate()}
                      </small>
                    </div>
                    <div style={{ fontSize: '2rem' }}>
                      🕐
                    </div>
                  </div>

                  {/* Météo */}
                  {weather && (
                    <>
                      <hr className="my-2" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <div className="fw-bold" style={{ fontSize: '1.3rem' }}>
                            {weather.temp}°C
                          </div>
                          <small className="opacity-75 text-capitalize">
                            {weather.description}
                          </small>
                        </div>
                        <div style={{ fontSize: '2.5rem' }}>
                          {getWeatherIcon()}
                        </div>
                      </div>
                      <div className="mt-2 d-flex gap-3">
                        <small className="opacity-75">
                          💧 {weather.humidity}%
                        </small>
                        <small className="opacity-75">
                          🌡️ {t('dashboard.feels_like')} {weather.feelsLike}°C
                        </small>
                      </div>
                    </>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          {statCards.map((card, index) => (
            <Col key={index} xs={12} sm={6} lg={3}>
              <Card
                className="border-0 shadow-lg h-100"
                style={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                onClick={() => navigate(card.route)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '60px',
                        height: '60px',
                        background: card.color,
                        borderRadius: '15px',
                        fontSize: '1.8rem'
                      }}
                    >
                      {card.icon}
                    </div>
                    <span className="badge bg-light text-dark">
                      {t('common.see_all')}
                    </span>
                  </div>
                  <h3 className="fw-bold mb-2">{card.value}</h3>
                  <p className="text-muted mb-0">{card.title}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col>
            <Card
              className="border-0 shadow-lg"
              style={{
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">{t('dashboard.quick_actions')}</h5>
                <Row className="g-3">
                  {quickActions.map((action, index) => (
                    <Col key={index} xs={12} sm={6} md={3}>
                      <div
                        className="p-4 text-center rounded-3"
                        style={{
                          background: `${action.color}15`,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          border: `2px solid ${action.color}30`
                        }}
                        onClick={() => navigate(action.route)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${action.color}25`;
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = `${action.color}15`;
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                          {action.icon}
                        </div>
                        <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                          {action.title}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity */}
        <Row>
          <Col lg={6} className="mb-4">
            <Card
              className="border-0 shadow-lg h-100"
              style={{
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">{t('dashboard.recent_activity')}</h5>
                  <span className="badge bg-primary">{t('common.new')}</span>
                </div>
                <div className="d-flex flex-column gap-3">
                  {[
                    { icon: '🚗', grad: '#667eea 0%, #764ba2 100%', label: t('dashboard.vehicle_added'), time: t('dashboard.hours_ago_2') },
                    { icon: '🔧', grad: '#f093fb 0%, #f5576c 100%', label: t('dashboard.maintenance_scheduled'), time: t('dashboard.hours_ago_5') },
                    { icon: '⛽', grad: '#4facfe 0%, #00f2fe 100%', label: t('dashboard.consumption_recorded'), time: t('dashboard.yesterday') },
                  ].map((item, i) => (
                    <div key={i} className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                      <div className="d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', background: `linear-gradient(135deg, ${item.grad})`, borderRadius: '10px', fontSize: '1.2rem' }}>
                        {item.icon}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{item.label}</div>
                        <small className="text-muted">{item.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} className="mb-4">
            <Card
              className="border-0 shadow-lg h-100"
              style={{
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">{t('dashboard.monthly_stats')}</h5>
                <div className="d-flex flex-column gap-4">
                  <div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">{t('dashboard.utilization_rate')}</span>
                      <span className="fw-bold">75%</span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        background: '#e9ecef',
                        borderRadius: '10px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: '75%',
                          height: '100%',
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">{t('dashboard.maintenances_done')}</span>
                      <span className="fw-bold">60%</span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        background: '#e9ecef',
                        borderRadius: '10px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: '60%',
                          height: '100%',
                          background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">{t('dashboard.fuel_consumption')}</span>
                      <span className="fw-bold">82%</span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        background: '#e9ecef',
                        borderRadius: '10px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: '82%',
                          height: '100%',
                          background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* CSS Animations */}
      <style>{`
        @keyframes slowZoom {
          0% {
            transform: scale(1) translateX(0);
          }
          50% {
            transform: scale(1.1) translateX(-2%);
          }
          100% {
            transform: scale(1) translateX(0);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}