import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function ReportsDashboard() {
    const navigate = useNavigate();

    const reports = [
        {
            id: 1,
            title: "Rapport de Consommation",
            icon: "⛽",
            description: "Analysez la consommation de carburant des véhicules par période avec filtres avancés.",
            color: "success",
            gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            route: "/reports/consumption",
            features: ["Filtrage par véhicule", "Export Excel/PDF", "Calcul automatique des totaux"],
            stats: { label: "Données", value: "Carburant" }
        },
        {
            id: 2,
            title: "Rapport de Maintenance",
            icon: "🔧",
            description: "Consultez l'historique complet des maintenances et réparations effectuées.",
            color: "primary",
            gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            route: "/reports/maintenance",
            features: ["Suivi des coûts", "Filtrage par période", "Export multi-format"],
            stats: { label: "Type", value: "Entretien" }
        }
    ];

    return (
        <Container fluid className="py-5 bg-light min-vh-100">
            {/* En-tête avec animation */}
            <Row className="mb-5">
                <Col>
                    <div className="text-center">
                        <h1 className="display-4 fw-bold text-primary mb-3">
                            📊 Tableau de Bord des Rapports
                        </h1>
                        <p className="lead text-muted">
                            Générez et exportez vos rapports de gestion de flotte
                        </p>
                        <Badge bg="info" className="px-3 py-2 fs-6">
                            Données en temps réel
                        </Badge>
                    </div>
                </Col>
            </Row>

            {/* Cartes des rapports */}
            <Row className="g-4 mb-5">
                {reports.map((report) => (
                    <Col key={report.id} lg={6}>
                        <Card
                            className="h-100 border-0 shadow-lg hover-lift"
                            style={{
                                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                cursor: "pointer"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-10px)";
                                e.currentTarget.style.boxShadow = "0 1rem 3rem rgba(0,0,0,.175)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,.15)";
                            }}
                        >
                            {/* En-tête avec gradient */}
                            <div
                                className="p-4 text-white position-relative overflow-hidden"
                                style={{
                                    background: report.gradient,
                                    borderTopLeftRadius: "0.375rem",
                                    borderTopRightRadius: "0.375rem"
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div
                                            className="d-inline-flex align-items-center justify-content-center mb-3"
                                            style={{
                                                fontSize: "3rem",
                                                width: "80px",
                                                height: "80px",
                                                background: "rgba(255,255,255,0.2)",
                                                borderRadius: "50%",
                                                backdropFilter: "blur(10px)"
                                            }}
                                        >
                                            {report.icon}
                                        </div>
                                        <h3 className="fw-bold mb-0">{report.title}</h3>
                                    </div>
                                    <Badge
                                        bg="light"
                                        text="dark"
                                        className="px-3 py-2"
                                    >
                                        {report.stats.value}
                                    </Badge>
                                </div>

                                {/* Effet de décoration */}
                                <div
                                    className="position-absolute"
                                    style={{
                                        bottom: "-50px",
                                        right: "-50px",
                                        width: "200px",
                                        height: "200px",
                                        background: "rgba(255,255,255,0.1)",
                                        borderRadius: "50%"
                                    }}
                                />
                            </div>

                            <Card.Body className="p-4">
                                <Card.Text className="text-muted mb-4">
                                    {report.description}
                                </Card.Text>

                                {/* Fonctionnalités */}
                                <div className="mb-4">
                                    <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: "0.75rem" }}>
                                        Fonctionnalités
                                    </h6>
                                    <div className="d-flex flex-column gap-2">
                                        {report.features.map((feature, index) => (
                                            <div key={index} className="d-flex align-items-center">
                                                <span className="text-success me-2">✓</span>
                                                <small className="text-muted">{feature}</small>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bouton d'action */}
                                <div className="d-grid">
                                    <Button
                                        variant={report.color}
                                        size="lg"
                                        onClick={() => navigate(report.route)}
                                        className="fw-semibold"
                                    >
                                        Consulter le rapport
                                        <span className="ms-2">→</span>
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Section informations */}
            <Row>
                <Col lg={12}>
                    <Card className="border-0 shadow-sm bg-white">
                        <Card.Body className="p-4">
                            <Row className="g-4">
                                <Col md={12} className="mb-3">
                                    <h5 className="fw-bold text-primary mb-4">
                                        📈 Fonctionnalités des Rapports
                                    </h5>
                                </Col>

                                <Col md={4}>
                                    <div className="d-flex align-items-start">
                                        <div
                                            className="flex-shrink-0 me-3"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                borderRadius: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "1.5rem"
                                            }}
                                        >
                                            🔍
                                        </div>
                                        <div>
                                            <h6 className="fw-semibold mb-2">Filtrage Avancé</h6>
                                            <p className="text-muted small mb-0">
                                                Filtrez par véhicule, période et ordre de tri pour des analyses précises
                                            </p>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={4}>
                                    <div className="d-flex align-items-start">
                                        <div
                                            className="flex-shrink-0 me-3"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                                borderRadius: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "1.5rem"
                                            }}
                                        >
                                            📊
                                        </div>
                                        <div>
                                            <h6 className="fw-semibold mb-2">Visualisation Claire</h6>
                                            <p className="text-muted small mb-0">
                                                Tableaux détaillés avec totaux automatiques et mise en forme professionnelle
                                            </p>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={4}>
                                    <div className="d-flex align-items-start">
                                        <div
                                            className="flex-shrink-0 me-3"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                                                borderRadius: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "1.5rem"
                                            }}
                                        >
                                            📥
                                        </div>
                                        <div>
                                            <h6 className="fw-semibold mb-2">Export Flexible</h6>
                                            <p className="text-muted small mb-0">
                                                Téléchargez vos rapports en format Excel ou PDF en un clic
                                            </p>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Section d'aide */}
            <Row className="mt-4">
                <Col>
                    <Card className="border-0 bg-primary bg-opacity-10">
                        <Card.Body className="text-center py-4">
                            <h6 className="text-primary mb-2">💡 Conseil</h6>
                            <p className="text-muted small mb-0">
                                Pour de meilleurs résultats, sélectionnez une période d'au moins 30 jours
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}